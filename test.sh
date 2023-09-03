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

echo "Creating new value..."
VALUE_KEY=$( mkvalue )
echo "Value key ${VALUE_KEY}"
echo "Creating new read key..."
READ_KEY=$( mkread "${VALUE_KEY}" )
echo "Read key ${READ_KEY}"
echo "Creating new write key..."
WRITE_KEY=$( mkwrite "${VALUE_KEY}" )
echo "Write key ${WRITE_KEY}"

echo "Starting API..."
node ../index.js &
SERVER_PID=$!
sleep 1
echo "Done."

INPUT="Hello, KVD!"
echo "Performing API POST on write key..."
curl --silent -X POST "http://localhost:${KVD_HTTP_PORT}/write/${WRITE_KEY}" --data "${INPUT}"
echo "Performing API GET on write key..."
OUTPUT_W=$( curl --silent "http://localhost:${KVD_HTTP_PORT}/write/${WRITE_KEY}" )
echo "Performing API GET on read key..."
OUTPUT_R=$( curl --silent "http://localhost:${KVD_HTTP_PORT}/read/${READ_KEY}" )

# These erroneous requests should produce no output here or on the server.
curl http://localhost:${KVD_HTTP_PORT}/read/..%2Fvalue
curl -X POST http://localhost:${KVD_HTTP_PORT}/write/..%2Fvalue

EXIT_CODE=0
if [ "${INPUT}" == "${OUTPUT_W}" -a "${INPUT}" == "${OUTPUT_R}" ]; then
    echo "OK"
else
    echo "TEST FAILED!"
    echo
    echo "Directory Structure:"
    find data # Show resulting file structure.
    echo
    echo -n "Data Contents: "
    find data/read -type l -exec cat "{}/data" \;
    echo
    echo

    echo "Expected: $INPUT" 1>&2
    echo "Retrieved via Write URL: $OUTPUT_W" 1>&2
    echo "Retrieved via Read URL: $OUTPUT_R" 1>&2
    EXIT_CODE=1
fi

set +e
kill $SERVER_PID
wait $SERVER_PID

cd ..
rm -r "${TESTDIR}"

exit $EXIT_CODE

