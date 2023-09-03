'use strict';

const { v4: uuidgen } = require('uuid');
const { FSOP } = require('./fsop');


class KVD {
    constructor(kvdDir) {
        this.fsop = new FSOP(kvdDir);
    }

    async init() {
        await this.fsop.init('value');
        await this.fsop.init('write');
        await this.fsop.init('read');
    }

    async newValue() {
        const valueKey = uuidgen(); 
        await this.fsop.newValue('value', valueKey);
        return valueKey;
    }

    async newRead(valueKey) {
        const readKey = uuidgen();
        await this.fsop.link('value', valueKey, ['read'], readKey);
        return readKey;
    }

    async newWrite(valueKey) {
        const writeKey = uuidgen();
        await this.fsop.link('value', valueKey, ['read', 'write'], writeKey);
        return writeKey;
    }

    async write(writeKey, value) {
        await this.fsop.write('write', writeKey, value);
    }

    async read(readKey) {
        return await this.fsop.read('read', readKey);
    }
}

module.exports = {
    default: KVD,
    KVD,
};
