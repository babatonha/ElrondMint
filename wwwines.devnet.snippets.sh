# This is the a way to load json keystore but you can also use PEM file
#PRIVATE_KEY=(--keyfile=erd1gjnve0g52gmjyhp2yt0cwz8kln4lfqr58j6xvfv47q6xwtd3808q8adcww.json --passfile=.passfile)
#echo "mypassword" >.passfile
KEYSTORE=erd1zr4jv6agtrl4c43qd7p9nd4mf37xfzhpa0p4xz9uuajpegcq4t2qg4ch5k.json
PASSFILE=.passfile
# NFT owner address (same has the key we use to mint)
OWNER_ADDRESS="erd1zr4jv6agtrl4c43qd7p9nd4mf37xfzhpa0p4xz9uuajpegcq4t2qg4ch5k"
# Devnet configuration
PROXY=https://devnet-gateway.elrond.com
CHAIN_ID=D
# WWWINES attributes file in csv comma separated
WWWINES=./wwwines-sample.csv
WWWINES_COLLECTION="WWWINE-3d2012"
WWWINES_ROYATIES=500
INTERACTIONS_FOLDER="./interactions"

createallwwwines() {
  echo "create wwwines from attributes $WWWINES"
  if [ ! -f "${WWWINES}" ]; then
    echo "File not found : ${WWWINES}"
    exit 1
  fi
  if [ ! -d "${INTERACTIONS_FOLDER}" ]; then
    mkdir -p "${INTERACTIONS_FOLDER}"
  fi

  NONCE=$(erdpy account get --nonce --address="${OWNER_ADDRESS}" --proxy="$PROXY")
  OLDIFS=$IFS
  IFS=','
  first=true
  while read url id region aoc quality color year background
  do
    if [ "$first" = true ]; then
     first=false
     continue
    fi
  	echo "Url : $url"
  	echo "id : $id"
  	echo "Region : $region"
  	echo "AOC : $aoc"
  	echo "Wine quality : $quality"
  	echo "Color : $color"
  	echo "Year : $year"
  	echo "Background : $background"

  	wwwine_attributes="region:${region},aoc:${aoc},quality:${quality},color:${color},year:${year},background:${background}"
  	interaction_file="${INTERACTIONS_FOLDER}/wwwine-${id}.interaction.json"

  	token_identifier="0x$(echo -n "${WWWINES_COLLECTION}" | xxd -p -u | tr -d '\n')"
    # Quantity 1 as this is NFT
    supply=1
    # Human readable name
    token_name="0x$(echo -n "${aoc}" | xxd -p -u | tr -d '\n')"
    # Royalties
    royalties=${WWWINES_ROYATIES}
    # TODO: Hash often picture hash to verified ownership
    hash="0x$(echo -n "ahash" | xxd -p -u | tr -d '\n')"
    # Attributes of NFT (there is no norm at the moment. You can use this format : {key}:{value},{key}:{value}...
    attributes="0x$(echo -n "${wwwine_attributes}" | xxd -p -u | tr -d '\n')"
    # Uri (picture or something else) you can add more of it
    uri="0x$(echo -n "${url}" | xxd -p -u | tr -d '\n')"

    erdpy --verbose contract call ${OWNER_ADDRESS} \
          --nonce=${NONCE} \
          --keyfile=${KEYSTORE} \
          --passfile=${PASSFILE} \
          --gas-limit=5000000 \
          --proxy=${PROXY} --chain=${CHAIN_ID} \
          --function="ESDTNFTCreate" \
          --arguments ${token_identifier} ${supply} ${token_name} ${royalties} ${hash} ${attributes} ${uri} \
          --send \
          --outfile="${interaction_file}" || return
    (( NONCE++ ))
  done < $WWWINES
  IFS=$OLDIFS

  #TODO Check interactions and transactions result with Elrond API
}
