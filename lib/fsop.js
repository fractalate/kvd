'use strict';

const fs = require('fs/promises');
const path = require('path');

class InvalidKeyError extends Error {}
class ValueNotFoundError extends Error {}
class InitError extends Error {}

function checkKind(kind) {
    if (!/^[a-zA-Z0-9]{1,32}$/.test(kind)) {
        throw new Error('Invalid kind ' + JSON.stringify(kind));
    }
}

function checkKey(key) {
    // The key just needs to be non-empty and sensical on the file system.
    // This is just alphanumeric and dashes to support UUID keys that are currently used. 
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
            if (err.code === 'ENOENT') {
                await this._init(dir);
//          } else if (err.code === '???') { // Error handling for known init error cases.
//              throw new InitError(err.message);
            } else {
                throw err; // Other, unexpected errors pass through.
            }
        }
        if (stat != null && !stat.isDirectory()) {
            throw new InitError('Not a directory ' + JSON.stringify(dir));
        }
    }

    async _init(dir) {
        try {
            await fs.mkdir(dir);
        } catch (err) {
//          if (err.code === '???') { // Error handling for known init error cases.
//              throw new InitError(err.message);
//          } else {
                throw err; // Other, unexpected errors pass through.
//          }
        }
    }

    async newValue(kind, key) {
        checkKind(kind);

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

    async link(kind, key, asKinds, asKey) {
        checkKind(kind);
        checkKey(key);
        for (const asKind of asKinds) {
            checkKind(asKind);
        }
        checkKey(asKey);
        
        const created = [];
        try {
            const valueDirRelative = this._getValueDirRelative(kind, key);
            for (const asKind of asKinds) {
                const asValueDir = this._getValueDir(asKind, asKey);
                await fs.symlink(valueDirRelative, asValueDir);
                created.push(asValueDir);
            }
        } catch (err) {
            for (const dir of created) {
                fs.unlink(dir); // NO AWAIT!
            }
            throw err;
        }
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
    InitError,
    InvalidKeyError,
    ValueNotFoundError,
};
