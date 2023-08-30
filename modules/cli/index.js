'use strict';

const env = require('./env');
const { KVD } = require('../../lib/kvd');

const kvd = new KVD(env.KVD_DIR);

let kvdInitCalled = false;
function autoinit(handler) {
    return async (...args) => {
        if (!kvdInitCalled) {
            await kvd.init();
            kvdInitCalled = true;
        }
        await handler(...args);
    };
}

async function mkvalue(...argv) {
    if (argv.length > 0) {
        die('mkvalue: too many arguments');
    }
    const valueKey = await kvd.newValue();
    console.log('OK ' + valueKey);
}

async function mkread(valueKey, ...argv) {
    if (valueKey == null) {
        die('mkread: missing value key');
    }
    if (argv.length > 0) {
        die('mkread: too many arguments');
    }
    const readKey = await kvd.newRead(valueKey);
    console.log('OK ' + readKey);
}

async function mkwrite(valueKey, ...argv) {
    if (valueKey == null) {
        die('mkwrite: missing value key');
    }
    if (argv.length > 0) {
        die('mkwrite: too many arguments');
    }
    const writeKey = await kvd.newWrite(valueKey);
    console.log('OK ' + writeKey);
}

function die(message) {
    console.error(message);
    process.exit(1);
}

module.exports = {
    mkvalue: autoinit(mkvalue),
    mkread: autoinit(mkread),
    mkwrite: autoinit(mkwrite),
    die,
};
