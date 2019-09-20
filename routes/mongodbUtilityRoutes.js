const cors = require('cors')
const URL = require('url')
const mongodb = require('mongodb')

const mongoUtil = require( '../services/mongoUtil' );
const db = mongoUtil.getDB();

module.exports = (app) => {	  
  app.use(cors());

  // delete a document in a collection
  app.delete('/api/delete-document', (req, res) => {
    const url = URL.parse(req.url, true)
    const { value, table, field } = url.query
    const collection = db.collection(table)
    const data = { [field] : value }

    collection.deleteOne(data, (err, obj) => {
      if (err) console.error(err)
      if (obj.result.n > 0) {
        res.send({ message: `success delete document with ${field} = ${value} from ${table} collection` })
      } else {
        res.send({ message: `no document with ${field} = ${value} in ${table} collection` })
      }
    })
  })

  // clear collection
  app.get('/api/delete-all-documents', (req, res) => {
    const url = URL.parse(req.url, true)
    const { form } = url.query
  	const formCollection = db.collection(form)

  	formCollection.deleteMany({}, (err, result) => {
  		if (err) console.error(err)
  		res.send({ message: `success delete forms on DB` })
  	})
  })

  // delete collection
  app.delete('/api/delete-collection', (req, res) => {
  	const url = URL.parse(req.url, true)
  	const name = url.query.name
  	const collection = db.collection(name)

  	collection.drop((err, result) => {
  		if (err) console.error(err)
  		res.send({ result })
  	})
  })

  // get the all collections
  app.get('/api/all-collection', (req, res) => {
  	db.listCollections().toArray((err, result) => {
  		res.send({ result })
  	})
  })

  // find collection by name
  app.get('/api/collection', (req, res) => {
  	const url = URL.parse(req.url, true)
  	const name = url.query.name
  	const collection = db.collection(name)

  	collection.find({}).toArray((err, result) => {
  		res.send({ result })
  	})
  })

  // example for inline (non-nested) mongodb query call
  app.get('/api/test-collection', async (req, res) => {
    const url = URL.parse(req.url, true)
    const name = url.query.name
    const collection = db.collection(name)

    const promise = new Promise((resolve, reject) => {
      collection.find({}).toArray((err, result) => {
        resolve(result)
      })
    })

    const result = await promise.then(res => res)
    res.send(result)
  })

  // api for testing
  app.patch('/api/test-change-user-role-id', async (req, res) => {
    const url = URL.parse(req.url, true)
    const { id, role_id } = url.query
    const collection = db.collection('users')

    const promise = new Promise((resolve, reject) => {
      collection.updateOne({_id: mongodb.ObjectID(id)}, {$set: {role_id: Number(role_id)}}, (err, result) => {
        resolve(result)
      })
    })

    const result = await promise.then(res => res)
    res.send(result)
  })
}