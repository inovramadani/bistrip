const mongodb = require('mongodb')
const keys = require('../config/keys')
const mongoClient = mongodb.MongoClient

const dbName = 'flowngin-dev'
var _db

module.exports = {
  connectToDB: (callback) => {
    mongoClient.connect(keys.mongoURI, { useNewUrlParser: true }, (err, client) => {
    	_db = client.db(dbName)
    	return callback(err)
    })
  },

  getDB: () => {
    return _db;
  }
}