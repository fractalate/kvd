'use strict';

const express = require('express');
const conf = require('./lib/conf');

// XXX: Delete this eventually. Helps as an illustration of how to use this.
(async () => {
    const { KVD } = require('./lib/kvd');

    // Setup and initialization of the KVD directory.
    const kvd = new KVD(conf.KVD_DIR);
    await kvd.init();

    // Create a value to hold the data.
    const valueKey = await kvd.newValue();
    // Create a write access to the value.
    const writeKey = await kvd.newWrite(valueKey);
    // Create a read access to the value.
    const readKey = await kvd.newRead(valueKey);

    // Exercise the read and write access.
    await kvd.write(writeKey, 'Hello, KVD!');
    await kvd.read(readKey);

    // Show some ways to use the API.
    const writeUrl = 'http://localhost:' + conf.KVD_HTTP_PORT + '/write/' + encodeURIComponent(writeKey);
    const readUrl = 'http://localhost:' + conf.KVD_HTTP_PORT + '/read/' + encodeURIComponent(readKey);
    console.log('Try these commands to exercise the API:')
    console.log(`    curl -X POST ${ writeUrl } --data HELLO`);
    console.log(`    curl ${ readUrl } && echo`);
})();

const app = express();

require('./modules/http_api')(app, conf.KVD_DIR);

app.listen(conf.KVD_HTTP_PORT, () => {
    console.log('Listening on port ' + conf.KVD_HTTP_PORT);
});
