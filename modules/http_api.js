'use strict';

const fsop = require('../lib/fsop');
const { KVD } = require('../lib/kvd');

function readBody(req) {
    return new Promise((resolve, reject) => {
        const parts = [];
        req.on('data', (data) => parts.push(data));
        req.on('end', () => resolve(Buffer.concat(parts)));
        req.on('err', (err => reject(err)));
    });
}

function setup(app, kvdDir) {
    const kvd = new KVD(kvdDir);

    app.get('/read/:readKey', async (req, res, next) => {
        try {
            const data = await kvd.read(req.params.readKey);
            res.send(data);
        } catch (err) {
            next(err);
        }
    });

    app.post('/write/:writeKey', async (req, res, next) => {
        try {
            const body = await readBody(req);
            await kvd.write(req.params.writeKey, body);
            res.send();
        } catch (err) {
            next(err);
        }
    });

    app.use((err, _req, res, _next) => {
        if (err instanceof fsop.InvalidKeyError) {
            res.status(400).send();
        } else if (err instanceof fsop.ValueNotFoundError) {
            res.status(404).send();
        } else {
            console.error(err);
            res.status(500).send();
        }
    });
}

module.exports = setup;
