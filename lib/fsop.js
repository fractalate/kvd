'use strict';

const fs = require('fs/promises');
const path = require('path');
const { v4: uuidgen } = require('uuid');

class InvalidKeyError extends Error {}
class ValueNotFoundError extends Error {}

function checkKind(kind) {
    if (!/^[a-zA-Z0-9]{1,32}$/.test(kind)) {
        throw new Error('Invalid kind ' + JSON.stringify(kind));
    }
}

function checkKey(key) {
    // This should be a UUID, but really it just needs to be friendly on the file system,
    // so the check is relaxed. Alphanumeric and dashes are okay.
    if (!/^[a-zA-Z0-9-]+$/.test(key)) {
        throw new InvalidKeyError('Invalid key ' + JSON.stringify(key));
    }
}

class FSOP {
    constructor(kvdDir) {
        this.kvdDir = kvdDir;
    }

    _getDir(kind) {
        return path.join(this.kvdDir, kind);
    }

    _getValueDir(kind, key) {
        return path.join(this.kvdDir, kind, key);
    }

    _getValueDirRelative(kind, key) {
        return path.join('..', kind, key);
    }

    _getValueDataFilePath(kind, key) {
        return path.join(this.kvdDir, kind, key, 'data');
    }

    async init(kind) {
        checkKind(kind);
        const dir = this._getDir(kind);
        let stat = null;
        try {
            stat = await fs.lstat(dir);
        } catch (err) {
            if (err.code !== 'ENOENT') {
                throw err;
            }
            await fs.mkdir(dir);
        }
        if (stat != null && !stat.isDirectory()) {
            throw new Error('init(): not a directory: ' + dir);
        }
    }

    async newValue(kind) {
        checkKind(kind);
        const key = uuidgen();
        await this._newValue(kind, key);
        return key;
    }

    async _newValue(kind, key) {
        const valueDir = this._getValueDir(kind, key);
        try {
            await fs.mkdir(valueDir);
            await this._newValueDataFile(kind, key);
        } catch (err) {
            fs.rmdir(valueDir); // NO AWAIT!
            throw err;
        }
    }

    async _newValueDataFile(kind, key) {
        const valueDataFilePath = this._getValueDataFilePath(kind, key);
        try {
            const fout = await fs.open(valueDataFilePath, 'w');
            await fout.close();
        } catch (err) {
            fs.rm(valueDataFilePath, {
                force: true, // Override everything; don't complain if the file isn't there.
            }); // NO AWAIT!
            throw err;
        }
    }

    async link(kind, key, asKind) {
        checkKind(kind);
        checkKey(key);
        checkKind(asKind);
        const asKey = uuidgen();
        await this._link(kind, key, asKind, asKey);
        return asKey;
    }

    async _link(kind, key, asKind, asKey) {
        const valueDirRelative = this._getValueDirRelative(kind, key);
        const asValueDir = this._getValueDir(asKind, asKey);
        await fs.symlink(valueDirRelative, asValueDir);        
    }

    async write(kind, key, value) {
        checkKind(kind);
        checkKey(key);
        const valueDataFilePath = this._getValueDataFilePath(kind, key);
        return await fs.writeFile(valueDataFilePath, value);
    }

    async read(kind, key) {
        checkKind(kind);
        checkKey(key);
        const valueDataFilePath = this._getValueDataFilePath(kind, key);
        return await fs.readFile(valueDataFilePath);
    }
}

module.exports = {
    default: FSOP,
    FSOP,
    InvalidKeyError,
    ValueNotFoundError,
};
