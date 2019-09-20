const cors = require('cors')
const URL = require('url')

const mongoUtil = require( '../services/mongoUtil' );
const db = mongoUtil.getDB();

module.exports = (app) => {	  
  app.use(cors());

  // get dynamic sidenav links based on created collection
  app.get('/api/sidenav-links', (req, res) => {
  	const formCollection = db.collection('form')
  	formCollection.find({}).toArray((err, result) => {
  		const data = result.map(r => 
  			{
          // send Pascalcase collection name
          let { collectionName } = r
          collectionName = collectionName.charAt(0).toUpperCase() + collectionName.slice(1)

          return { 
    				name: collectionName,
            route: `/collection?id=${r._id}`,
    				icon: r.icon,
    				text: collectionName
    			}
        }
  		)
  		res.send({ data })
  	})
  })

  // store sidenav links configuration to database
  app.post('/api/sidenav-config', (req, res) => {
    const sidenavCollection = db.collection('sidenav')
    const { appName, groupLinks } = req.body

    sidenavCollection.findOne({appName}, (err, config) => {
      if (err) console.error(err)
      if (config != null) {
        sidenavCollection.updateOne({appName}, {$set: { groupLinks }})
        res.send({ 
          message: 'updated existing sidenav config'
        })
      } else {
        sidenavCollection.insertOne(req.body, (err, result) => {
          if (err) console.error(err)
          res.send({ 
            message: 'success add sidenav config'
          })
        })
      }
    })
  })

  // get sidenav config based on app name from DB
  app.get('/api/sidenav-config', (req, res) => {
    const url = URL.parse(req.url, true)
    const appName = url.query.app_name
    const sidenavCollection = db.collection('sidenav') 

    if (appName) {
      sidenavCollection.findOne({appName}, (err, sidenav) => {
        if (err) console.error(err)
        if (sidenav != null) {
          res.send({ data: sidenav })
        } else {
          res.send({ data: {}, message: `config for ${appName} is not found in database` })
        }
      })
    } else {
      sidenavCollection.find({}).toArray((err, result) => {
        if (err) console.error(err)

        if (result.length === 0) {
          res.send({ message: 'no sidenav config record in database'})
        } else if (result.length > 0) {
          res.send({ data: result })
        }
      })
    }
  })
}