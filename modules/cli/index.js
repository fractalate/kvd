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
    console.log(argv);
    if (argv.length > 0) {
        throw new Error('Too many arguments.');
    }
    const valueKey = await kvd.newValue();
    console.log('OK ' + valueKey);
}

async function mkread(valueKey, ...argv) {
    if (valueKey == null) {
        throw new Error('Missing value key.');
    }
    if (argv.length > 0) {
        throw new Error('Too many arguments.');
    }
    const readKey = await kvd.newRead(valueKey);
    console.log('OK ' + readKey);
}

async function mkwrite(valueKey, ...argv) {
    if (valueKey == null) {
        throw new Error('Missing value key.');
    }
    if (argv.length > 0) {
        throw new Error('Too many arguments.');
    }
    const writeKey = await kvd.newWrite(valueKey);
    console.log('OK ' + writeKey);
}

module.exports = {
    mkvalue: autoinit(mkvalue),
    mkread: autoinit(mkread),
    mkwrite: autoinit(mkwrite),
};
