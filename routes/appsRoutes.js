const cors = require('cors')
const URL = require('url')
const mongodb = require('mongodb')

const user = require('../services/user');
const mongoUtil = require( '../services/mongoUtil' )
const db = mongoUtil.getDB()

module.exports = (app) => {	  
  app.use(cors())

  // get all users from collection
  app.get('/api/users', (req, res) => {
  	const collection = db.collection('users')

    collection.find({}).toArray((err, result) => {
      if (err) {
        res.status(404).send()
      } else {
        res.send(result)
      }
    })
  })

  // check if app name existed in db
  app.get('/api/check-app-name', (req, res) => {
    const collection = db.collection('app')
    const url = URL.parse(req.url, true)
    const { name, id } = url.query

    collection.findOne({ name }, (err, app) => {
      if (!err) {
        if (app == null) {
          res.send({ isFound: false })
        } else if (id) {
          collection.findOne({ _id: mongodb.ObjectID(id) }, (err2, currentApp) => {
            if (!err2) {
              if (currentApp != null) {
                res.send({ isFound: true, currentName: currentApp.name })
              } else {
                res.send({ isFound: true })
              }
            } else {
              res.status(404).send({ message: 'fail to check current app name' })
            }
          })
        } else {
          res.send({ isFound: true })
        }
      } else {
        res.status(404).send({ message: 'fail to check app name'})
      }
    })
  })

  // store new app in db
  app.post('/api/create-app', (req, res) => {
    const collection = db.collection('app')
    const { appName } = req.body

    collection.updateOne({ name: appName }, { $set: req.body }, { upsert: true }, (err, result) => {
      if (err) {
        res.status(404).send({ message: 'fail to create app' })
      } else {
        res.send({ message: 'app created' })
      }
    })
  })

  // update settings of existing app 
  app.patch('/api/update-app', (req, res) => {
    const collection = db.collection('app')
    const url = URL.parse(req.url, true)
    const { id } = url.query
    const { name } = req.body

    collection.updateOne({ _id: mongodb.ObjectID(id) }, { $set: req.body }, { upsert: true }, (err, result) => {
      if (err) {
        res.status(404).send({ message: 'fail to update app' })
      } else {
        res.send({ message: `${name} app updated` })
      }
    })
  })

  // get all apps from collection
  app.get('/api/apps', (req, res) => {
    const collection = db.collection('app')
    // const user = req.user
    const query = { 
      $or: [
        { 'owner._id': user._id.toString() }, 
        { userList: { $elemMatch: { _id: user._id.toString() } } }
      ]
    }

    collection.find(query).toArray((err, result) => {
      if (err) {
        res.status(404).send()
      } else {
        const apps = result.map(app => ({
          name: app.name,
          icon: app.icon,
          link: `/apps/${app.name}`
        }))

        res.send({ apps })
      }
    })
  })

  // get an app by app name
  app.get('/api/app', (req, res) => {
    const collection = db.collection('app')
    const url = URL.parse(req.url, true)
    const { app_name: name } = url.query

    collection.findOne({name}, (err, app) => {
      if (!err && app != null) {
        res.send({ app })
      } else {
        res.status(404).send()
      }
    })
  })

  app.delete('/api/app', (req, res) => {
    const collection = db.collection('app')
    const url = URL.parse(req.url, true)
    const { id } = url.query

    collection.deleteOne({ _id: mongodb.ObjectId(id) }, (err, obj) => {
      if (!err && obj.result.n > 0) {
        res.send({ message: 'App deleted' })
      } else {
        res.status(404).send({ message: 'Fail to delete app' })
      }
    })
  })
}