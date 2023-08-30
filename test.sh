#!/bin/bash

set -e
set -o pipefail

# This finds a random "port". It might not be open...
function randport() {
    node -e "console.log(Math.floor(Math.random() * 20000 + 8000))"
}

function mkvalue() {
    ../bin/kvd mkvalue "${@}" | sed 's/^OK //'
}

function mkread() {
    ../bin/kvd mkread "${@}" | sed 's/^OK //'
}

function mkwrite() {
    ../bin/kvd mkwrite "${@}" | sed 's/^OK //'
}

TESTDIR=$( mktemp -d test-run-XXXXXX )
cd "${TESTDIR}"

export KVD_DIR=./data/
export KVD_HTTP_PORT=$( randport )

mkdir "${KVD_DIR}"

VALUE_KEY=$( mkvalue )
READ_KEY=$( mkread "${VALUE_KEY}" )
WRITE_KEY=$( mkwrite "${VALUE_KEY}" )

node ../index.js &
SERVER_PID=$!
sleep 1

INPUT="Hello, KVD!"
curl --silent -X POST "http://localhost:${KVD_HTTP_PORT}/write/${WRITE_KEY}" --data "${INPUT}"
OUTPUT=$( curl --silent "http://localhost:${KVD_HTTP_PORT}/read/${READ_KEY}" )

# These erroneous requests should produce no output here or on the server.
curl http://localhost:${KVD_HTTP_PORT}/read/..%2Fvalue
curl -X POST http://localhost:${KVD_HTTP_PORT}/write/..%2Fvalue

EXIT_CODE=0
if [ "${INPUT}" == "${OUTPUT}" ]; then
    echo "OK"
else
    find data # Show resulting file structure.
    find data/read -type l -exec cat "{}/data" \;
    echo

    echo "Expected: $INPUT" 1>&2
    echo "Received: $OUTPUT" 1>&2
    EXIT_CODE=1
fi

set +e
kill $SERVER_PID
wait $SERVER_PID

cd ..
rm -r "${TESTDIR}"

exit $EXIT_CODE

