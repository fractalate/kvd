'use strict';

const DEFAULT__KVD_DIR = './data/';
const DEFAULT__KVD_HTTP_HOST = '127.0.0.1';
const DEFAULT__KVD_HTTP_PORT = '8364';

module.exports = {
    KVD_DIR: process.env.KVD_DIR == null ? DEFAULT__KVD_DIR : process.env.KVD_DIR,
    KVD_HTTP_HOST: process.env.KVD_HTTP_HOST == null ? DEFAULT__KVD_HTTP_HOST : process.env.KVD_HTTP_HOST,
    KVD_HTTP_PORT: process.env.KVD_HTTP_PORT == null ? DEFAULT__KVD_HTTP_PORT : process.env.KVD_HTTP_PORT,
};
