const express = require('express')
const mongoUtil = require( './services/mongoUtil' )
const cookieSession = require('cookie-session')
// const passport = require('passport')
const bodyParser = require('body-parser')
const path = require('path')
const crypto = require('crypto')
const multer = require('multer')
const GridFsStorage = require('multer-gridfs-storage')
const Grid = require('gridfs-stream')
const mongodb = require('mongodb')

const keys = require('./config/keys')

mongoUtil.connectToDB(err => {
  if (!err) console.log('Connected to MongoDB successfully')
  else console.log('Fail to connect to MongoDB\nError: ', err)
    
  const app = express()
  
  app.use(bodyParser.json({limit: '16000kb'}))
  
  app.use(
    cookieSession({
      maxAge: 30 * 24 * 60 * 60 * 1000,
      keys: [keys.cookieKey]
    })
  );
  
  // app.use(passport.initialize())
  // app.use(passport.session())
  // require('./services/passport')

  require('./routes/authRoutes')(app)
  require('./routes/billingRoutes')(app)
  require('./routes/formRoutes')(app)
  require('./routes/sidenavRoutes')(app)
  require('./routes/externalCollectionRoutes')(app)
  require('./routes/eventApiRoutes')(app)
  require('./routes/appsRoutes')(app)
  require('./routes/mongodbUtilityRoutes')(app)

  // init GridFS stream
  const db = mongoUtil.getDB()
  let gfs = Grid(db, mongodb)
  gfs.collection('file')

  // Create storage engine
  const storage = new GridFsStorage({
    // url: keys.mongoURI, // if db object is not accessible, use url
    db: db,
    file: (req, file) => {
      return new Promise((resolve, reject) => {
        crypto.randomBytes(16, (err, buf) => {
          if (err) {
            return reject(err)
          }
          const filename = buf.toString('hex') + '-' + file.originalname;
          const fileInfo = {
            filename: filename,
            bucketName: 'file',
            // metadata: {random: 'iqbal test'} //add additional information to metadata field
          }
          resolve(fileInfo)
        })
      })
    }
  })
  const upload = multer({ storage })
  require('./routes/fileRoutes')(app, gfs, upload)

  if (process.env.NODE_ENV === 'production') {
    // Express will serve up production assets
    // like our main.js file, or main.css file!
    app.use(express.static('client/build'))

    // Express will serve up the index.html profile
    // if it doesn't recognize the route
    const path = require('path')
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'))
    })
  }

  const PORT = process.env.PORT || 5000
  
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`)
  })
})


