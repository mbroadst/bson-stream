'use strict';
const BSONStream = require('./index');
const fs = require('fs');

const bsonStream = new BSONStream();
const stream = fs.createReadStream('./oplog.bson').pipe(bsonStream);
stream.on('data', doc => {
  console.dir(doc, { depth: null });
});
