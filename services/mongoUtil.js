const mongodb = require('mongodb')
const keys = require('../config/keys')
const mongoClient = mongodb.MongoClient

const dbName = 'flowngin-dev'
var _db

module.exports = {
  connectToDB: (callback) => {
    console.log('keys: ', keys)
    console.log('mongoURI: ', keys.mongoURI)
    mongoClient.connect(keys.mongoURI, { useNewUrlParser: true }, (err, client) => {
    	_db = client.db(dbName)
    	return callback(err)
    })
  },

  getDB: () => {
    return _db;
  }
}