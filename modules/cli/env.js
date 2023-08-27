'use strict';

const path = require('path');

function isRunningFromProjectRoot() {
    try {
        const isInModulesCli = __dirname.endsWith('modules/cli');
        const hasGitDir = isInModulesCli && require('fs').statSync('.git').isDirectory();
        return hasGitDir;
    } catch (err) {
        if (err.code === 'ENOENT') {
            return false;
        }
        throw err;
    }
}

const DEFAULT__KVD_DIR = isRunningFromProjectRoot() ? './data/' : path.join(process.env.HOME, '.kvd');

module.exports = {
    KVD_DIR: process.env.KVD_DIR == null ? DEFAULT__KVD_DIR : process.env.KVD_DIR,
};
