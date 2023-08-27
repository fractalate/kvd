'use strict';

const DEFAULT__KVD_HTTP_PORT = '8364';
const DEFAULT__KVD_DIR = './data/';

module.exports = {
    KVD_DIR: process.env.KVD_DIR == null ? DEFAULT__KVD_DIR : process.env.KVD_DIR,
    KVD_HTTP_PORT: process.env.KVD_HTTP_PORT == null ? DEFAULT__KVD_HTTP_PORT : process.env.KVD_HTTP_PORT,
};
