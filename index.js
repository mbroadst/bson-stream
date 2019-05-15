'use strict';
const { Transform } = require('stream');
const BSON = require('bson');
const BufferList = require('bl');

class BSONStream extends Transform {
  constructor() {
    super({ readableObjectMode: true });
    this._bytesNeeded = null;
    this._buffer = new BufferList();
  }

  _transform(chunk, encoding, callback) {
    this._buffer.append(chunk);

    while (true) {
      if (this._buffer.length === 0) {
        callback();
        return;
      }

      if (this._bytesNeeded == null) {
        const size = this._buffer.readInt32LE(0);
        if (size <= 0) {
          // invalid BSON document size, probably a corrupt stream
          callback(new Error(`invalid BSON size ${size} specified`), null);
          return;
        }

        this._bytesNeeded = size;
      }

      if (this._buffer.length >= this._bytesNeeded) {
        const data = this._buffer.slice(0, this._bytesNeeded);
        this._buffer.consume(this._bytesNeeded);

        const doc = BSON.deserialize(data);
        this._bytesNeeded = null;
        this.push(doc);
      } else {
        callback();
      }
    }
  }
}

module.exports = BSONStream;
