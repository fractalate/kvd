# KVD

KVD is a Key/Value Datastore

## Overview

Do you want an auth-free value storage solution for the web with some light read/write access controls? Then KVD might be just what you are looking for.

To grant read access to your data to an application you trust, you only need to give the app a read URL. To grant write access, it's another URL.

## KVD Service

* KVD uses the following environment variables as configuration:
  - Set `KVD_DIR` should point to the directory to hold KVD data. This should exist before starting the service. Default `./data/` which is useful for development.
  - Set `KVD_HTTP_PORT` should be the HTTP port that the service will listen for requests on. Default `8364`.
* Install dependencies: `npm install`.
* Run the API server: `npm run start`.

## Usage

### CLI

With the CLI interface, you may:

* Create "values" which hold the data: `kvd mkvalue` which will generate a value key used in next steps.
* Create "read" access to the data: `kvd mkread ${value_key}` which will generate a read key used in `curl` requests.
* Create "write" access to the data: `kvd mkwrite ${value_key}` which will generate a write key used in `curl` requests.

A user can use these commands to manage thier datastore.

### API Server

* Write a value: `curl -X POST http://localhost:8364/write/${write_key} --data HELLO`
* Read a value: `curl http://localhost:8364/read/${read_key}`

A web application can use these API calls to save/recall data.

## Development

* Install dependencies: `npm install`.
* Create the development data directory: `mkdir data`.
* Run the API server: `npm run start`.
