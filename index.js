'use strict';

const express = require('express');
const conf = require('./lib/conf');

const app = express();

require('./modules/http_api')(app, conf.KVD_DIR);

app.listen(conf.KVD_HTTP_PORT, () => {
    console.log('Listening on port ' + conf.KVD_HTTP_PORT);
});
