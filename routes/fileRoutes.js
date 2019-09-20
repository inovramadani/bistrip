const cors = require('cors')
const URL = require('url')
const multer = require('multer')

const mongoUtil = require( '../services/mongoUtil' )
const db = mongoUtil.getDB()

module.exports = (app, gfs, upload) => {	  
  app.use(cors());

  // download file from file collection in database
  app.get('/api/file-download', (req, res) => {
  	const fileCollection = db.collection('file')
    const url = URL.parse(req.url, true)
    const { filename } = url.query

  	fileCollection.findOne({filename}, (err, data) => {
  		if (!err && data != null) {
  		  res.json({ data })
      }
  	})
  })

  // upload file to file collection in database 
  app.post('/api/file-upload', (req, res) => {
    const fileCollection = db.collection('file')

    fileCollection.insertOne(req.body, (err, obj) => {
      if (!err && obj.insertedCount === 1) {
        res.json({ message: 'Success upload'})
      }
    })
  })

  app.post('/api/upload', upload.single('file'), (req, res) => {
    const { filename, id, contentType, size } = req.file
    res.json({ message: 'File uploaded', filename, fileId: id, contentType, size })
  })

  app.get('/api/download', (req, res) => {
    const url = URL.parse(req.url, true)
    const { filename } = url.query

    gfs.files.findOne({ filename: filename }, (err, file) => {
      // Check if file
      if (!file || file.length === 0) {
        return res.status(404).json({
          err: 'No file exists'
        });
      }
      
      const readstream = gfs.createReadStream(file.filename)
      readstream.pipe(res)
    })
  })

  app.get('/api/files', (req, res) => {
    gfs.files.find().toArray((err, files) => {
      // Check if files
      if (!files || files.length === 0) {
        return res.status(404).json({
          err: 'No files exist'
        });
      }

      // Files exist
      return res.json(files)
    })
  })

  // display single file object
  app.get('/api/files/:filename', (req, res) => {
    gfs.files.findOne({ filename: req.params.filename }, (err, file) => {
      // Check if file
      if (!file || file.length === 0) {
        return res.status(404).json({
          err: 'No file exists'
        });
      }
      // File exists
      return res.json(file)
    })
  })

  // delete file in 'file' gridFS
  app.delete('/api/files/:id', (req, res) => {
    gfs.remove({ _id: req.params.id, root: 'file' }, (err, gridStore) => {
      if (err) {
        return res.status(404).json({ err: err })
      } else {
        return res.json({ success: true })
      }
    })
  })
}