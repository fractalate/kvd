'use strict';

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
        return await this.fsop.newValue('value');
    }

    async newRead(valueKey) {
        return await this.fsop.link('value', valueKey, 'read');
    }

    async newWrite(valueKey) {
        return await this.fsop.link('value', valueKey, 'write');
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
