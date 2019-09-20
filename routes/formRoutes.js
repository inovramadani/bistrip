const lodash = require('lodash')
const cors = require('cors')
const URL = require('url')
const mongodb = require('mongodb')
const { isEmpty } = lodash

const user = require( '../services/user' )
const mongoUtil = require( '../services/mongoUtil' )
const db = mongoUtil.getDB()

module.exports = (app) => {	  
  app.use(cors());

  // save record in a form colletion
  app.post('/api/record', (req, res) => {
  	const url = URL.parse(req.url, true)
  	const formId = url.query.id
  	const collection = db.collection(`${formId}`)
    const newDate = new Date().toISOString()
    // const userId = req.user._id
    const userId = user._id

    const data = { 
      formId, 
      createdTime: newDate,
      createdBy: userId,
      modifiedTime: newDate,
      modifiedBy: userId,
      ...req.body 
    }

  	collection.insertOne(data, (err, result) => {
  		if (err) console.error(err)
  		res.send({ 
        success: true,
  			message: 'success add data'
  		})
  	})
  })

  // update record in a form collection
  app.post('/api/update-record', (req, res) => {
    const url = URL.parse(req.url, true)
    const { form_id, record_id } = url.query
    const collection = db.collection(`${form_id}`)
    const newDate = new Date().toISOString()
    const userId = user._id
    // const userId = req.user._id

    let updatedData = { 
      ...req.body,
      modifiedTime: newDate,
      modifiedBy: userId,
    }
    updatedData = lodash.omit(updatedData, ['_id'])

    let operation = { $set: updatedData }
    if (updatedData.file == null) {
      operation = { ...operation, $unset: { file: '' } }
    }

    collection.updateOne({ _id: mongodb.ObjectID(record_id) }, operation, (err, obj) => {
      if (err) {
        res.send({ success: false, message: `fail to update record ${record_id}` })
      } else {
        res.send({ success: true, message: `record ${record_id} updated` })
      }
    })
  })

  // get the record of form instance by form id & record id from DB
  app.get('/api/record', (req, res) => {
  	const url = URL.parse(req.url, true)
  	const formId = url.query.id
    const recordId = url.query.record_id
  	const collection = db.collection(`${formId}`)

  	if (!isEmpty(recordId)) {
	  	collection.findOne({ _id: mongodb.ObjectID(recordId) }, (err, data) => {
	  		if (err) console.error(err)
	  		res.send(data)
	  	})
  	} else {
  		collection.find({}).toArray((err, data) => {
	  		if (err) console.error(err)
	  		res.send({ data })
	  	})
  	}
  })

  // get all pair of record value and id based on specific field
  app.get('/api/record-value-id', (req, res) => {
    const url = URL.parse(req.url, true)
    const { collection_id, field } = url.query
    const collection = db.collection(`${collection_id}`)

    collection.find({}).toArray((err, data) => {
      const result = data.map(d => ({ 
        id: d._id,
        name: d[field]
      }))

      res.send(result)
    })
  })

  // delete record from a form collection
  app.delete('/api/record', (req, res) => {
    const url = URL.parse(req.url, true)
    const formId = url.query.form_id
    const recordId = url.query.record_id
    const collection = db.collection(`${formId}`)

    collection.deleteOne({ _id: mongodb.ObjectId(recordId) }, (err, obj) => {
      if (err) console.error(err)

      if (obj.result.n > 0) {
        res.send({ message: `success delete record ${recordId}` })
      } else {
        res.send({ message: `failed to delete record ${recordId}` })
      }
    })
  })

  // check if collection name already exist in database
  app.get('/api/check-collection-name', (req, res) => {
    const formCollection = db.collection('form')
    const url = URL.parse(req.url, true)
    const name = url.query.name.toLowerCase()
    const id = url.query.id

    formCollection.find({collectionName: name}).toArray((err, result) => {
      if (err) console.error(err)
      if (result.length === 0) {
        res.send({ isFound: false, message: 'not found' })
      } else {
        formCollection.findOne({_id: mongodb.ObjectID(id)}, (err2, form) => {
          if (err2) console.error(err2)
          if (form !== null) {
            res.send({ isFound: true, currentName: form.collectionName, message: 'found' })
          } else {
            res.send({ isFound: true, message: 'found' })
          }
        })
      }
    })
  })

  // create/update and save the form to database
  app.post('/api/create-form', (req, res) => {
  	const formCollection = db.collection('form')
  	const url = URL.parse(req.url, true)
  	const formId = url.query.id
    const collectionName = req.body.collectionName.toLowerCase()
    const { 
      appName,
      collectionDescription, 
      tableColumns,
      isAllowAttachment,
      formStructure, 
      formFields,
      viewConfig: currentTableViewConfig
    } = req.body

    let formData = {
      appName,
      icon: 'format_list_bulleted',
      collectionName,
      collectionDescription,
      formFields,
      formStructure,
      isAllowAttachment,
      tableColumns,
      formStyle: {
        theme: ''
      }
    }

    // generate tableViewConfig field for new collection
    if (formId === 'new') {
      let lastOrder
      let tableViewConfig = formFields.reduce((obj, field, index) => {
        lastOrder = index + 1
        return {
          ...obj,
          [field.fieldName] : {
            displayName: field.fieldName,
            order: index + 1,
            showInTable: field.showInTable
          }
        }
      }, {})

      if (isAllowAttachment) {
        tableViewConfig = {
          ...tableViewConfig,
          file: {
            displayName: "Attachment",
            order: lastOrder + 1,
            showInTable: true
          }
        }
      }

      formData = {...formData, tableViewConfig}
    } 
    else {
      let tableViewConfig = currentTableViewConfig

      if (isAllowAttachment) {
        const lastOrder = Object.keys(tableViewConfig).reduce((order, item) => { 
          if (tableViewConfig[item].order > order) {
            return tableViewConfig[item].order
          }
          return order
        }, 0)

        tableViewConfig = {
          ...tableViewConfig,
          file: {
            displayName: "Attachment",
            order: lastOrder + 1,
            showInTable: true
          }
        }
      } 
      else if (!isAllowAttachment && tableViewConfig.file) {
        delete tableViewConfig.file
      }

      formData = {...formData, tableViewConfig}
    }

  	formCollection.find({}).toArray((err, result) => {
      if (err) console.error(err)
      if (formId === 'new' || result.length < 0) {
        formCollection.insertOne(formData, (err2, obj2) => {
          if (err) console.error(err)
          else {
            const unique_id = obj2.ops[0]._id
            const updatedFields = {name: `${unique_id}`}
            formCollection.updateOne({_id: mongodb.ObjectID(unique_id)}, {$set: updatedFields})
          }
        })
        res.send({ message: `${collectionName} schema created`})
      } else if (result.length > 0 ) {
    		formCollection.findOne({_id: mongodb.ObjectID(formId)}, (err2, result2) => {
          if (result2 != null) {
            formCollection.updateOne({_id: mongodb.ObjectID(formId)}, {$set: formData}, (err3, obj3) => {
              if (!err3) res.send({ message: `${collectionName} schema updated`})
            })
      		} else {
      			formCollection.insertOne(formData, (err3, obj3) => {
    		  		if (err3) console.error(err3)
              const unique_id = obj3.ops[0]._id
              const updatedFields = {name: `${unique_id}`}
              formCollection.updateOne({_id: mongodb.ObjectID(unique_id)}, {$set: updatedFields})
    		  	})

    		  	res.send({ message: `${collectionName} schema created` })
      		}
        })
      }

  	}) 
  })

  app.patch('/api/update-form-schema', (req, res) => {
    const formCollection = db.collection('form')
    const url = URL.parse(req.url, true)
    const id = url.query.id
    const schema = req.body
    
    const updateFields = {
      $set: { 
        formStructure: schema.JSON,
        uiSchema: schema.UI
      }
    }

    formCollection.updateOne({_id: mongodb.ObjectID(id)}, updateFields, (err, obj) => {
      if (err) console.error(err)
        
      if (obj.result.n === 1) {
        res.send({ message: 'schema updated'})
      } else {
        res.send({ message: 'fail to update schema'})
      }
    })
  })

  app.patch('/api/update-form-style', (req, res) => {
    const formCollection = db.collection('form')
    const url = URL.parse(req.url, true)
    const { id } = url.query
    
    const updatedFields = {
      $set: { 
        formStyle: req.body
      }
    }

    formCollection.updateOne({_id: mongodb.ObjectID(id)}, updatedFields, (err, obj) => {
      if (err) console.error(err)
        
      if (obj.result.n === 1) {
        res.send({ message: 'form style updated'})
      } else {
        res.send({ message: 'fail to update form style'})
      }
    })
  })

  // get form schema to be rendered in jsonschema-form
  app.get('/api/form', (req, res) => {
  	const formCollection = db.collection('form')
  	const url = URL.parse(req.url, true)
  	const formId = url.query.id

  	formCollection.findOne({_id: mongodb.ObjectID(formId)}, (err, form) => {
  		if (form !== null) {
        if (form.formStructure !== null) {
  				res.send({
            formId: form._id,
            collectionId: form._id,
            collectionName: form.name,
            collectionDisplayName: form.collectionName,
            collectionDescription: form.collectionDescription,
            formFields: form.formFields,
            column: form.tableColumns, 
            data: form.formStructure,
            isAllowAttachment: form.isAllowAttachment,
            uiSchema: form.uiSchema,
            createdActionAPI: form.createdActionAPI,
            modifiedActionAPI: form.modifiedActionAPI,
            formStyle: form.formStyle
          })
    		} else {
          res.send({ message: 'form structure not found'})
        }
      } else {
        res.send({ message: 'form not found'})
      }
  	})
  })

  // get all type of forms in DB
  app.get('/api/collection-list', (req, res) => {
  	const formCollection = db.collection('form')
    const url = URL.parse(req.url, true)
    const { appName } = url.query

  	formCollection.find({appName}).toArray((err, result) => {
  		const data = result.map(r => {
  			return { 
  				id: r._id,
  				name: r.collectionName,
          fields: r.formFields,
  				urlDesigner: `/create-form?id=${r._id}`,
          urlForm: `/data-input?id=${r._id}`,
  				urlCollection: `/collection?id=${r._id}`
  			}
  		})
  		res.send({ data })
  	})
  })

  // save form table view config
  app.post('/api/save-table-view-config', (req, res) => {
    const formCollection = db.collection('form')
    const url = URL.parse(req.url, true)
    const id = url.query.form_id
    const { tableViewConfig, formFields } = req.body

    const newFormFields = formFields.map(field => {
      return { ...field, showInTable: tableViewConfig[field.fieldName].showInTable }
    })

    const updatedField = { 
      tableViewConfig,
      formFields: newFormFields
    }

    formCollection.updateOne(
      {_id: mongodb.ObjectID(id)}, 
      {$set: updatedField}, 
      (err, obj) => {
        if (err) console.error(err)
        else {
          res.send({ message: `table view configuration for form-${id} updated` })
        }
      }
    )
  })

  // retrieve form table view config
  app.get('/api/retrieve-table-view-config', (req, res) => {
    const formCollection = db.collection('form')
    const url = URL.parse(req.url, true)
    const id = url.query.form_id

    formCollection.findOne({_id: mongodb.ObjectID(id)}, (err, result) => {
      if (err) console.error(err)
      else if (result != null) {
        if (result.tableViewConfig) {
          res.send({ 
            message: `table view configuration form ${id} found`,
            data: result.tableViewConfig
          })
        } else {
          res.send({ message: `table view configuration not found in form ${id}` })
        }
      } else {
        res.send({ message: `form ${id} not found` })
      }
    })
  })

  // check if template name already existed in database
  app.get('/api/check-template-name', (req, res) => {
    const collection = db.collection('template')
    const url = URL.parse(req.url, true)
    const name = url.query.name.toLowerCase()
    const formId = url.query.form_id

    collection.findOne({ name }, (err, template) => {
      if (!err) {
        if (template == null) {
          res.send({ isFound: false })
        } else {
          if (template.formId === formId) {
            res.send({ isFound: true, isCurrent: true })
          } else {
            res.send({ isFound: true, isCurrent: false })
          }
        }
      }
    })
  })

  // save form fields and form structure to template collection
  app.post('/api/save-template', (req, res) => {
    const collection = db.collection('template')
    const name = req.body.name.toLowerCase()
    const updateField = { $set: req.body }
    const options = { upsert: true } // create new document if doesn't find document with queried name

    collection.updateOne({ name }, updateField, options, (err, result) => {
      if (!err) {
        res.send({ message: 'template saved'})
      } else {
        res.send({ message: 'fail to save template'})
      }
    })
  })

  // retrieve all templates from template collection
  app.get('/api/templates', (req, res) => {
    const collection = db.collection('template')

    collection.find({}).toArray((err, templates) => {
      if (!err) {
        res.send({ templates })
      }
    })
  })

  // retrieve a template by name from template collection
  app.get('/api/template', (req, res) => {
    const collection = db.collection('template')
    const url = URL.parse(req.url, true)
    const name = url.query.name.toLowerCase()

    collection.findOne({name}, (err, template) => {
      if (!err && template != null) {
        res.send(template)
      } else {
        res.status(404).send({ message: 'template not found'})
      }
    })
  })

  // get(`${API_URL}/record?id=${collection}&lookup_field=${itemField}&lookup_value=${lookupValue}&lookup_target_field=${field}`)
  app.get('/api/record-lookup', (req, res) => {
    const url = URL.parse(req.url, true)
    const { 
      collection_id, 
      lookup_field, 
      lookup_value, 
      lookup_target_field 
    } = url.query
    const collection = db.collection(collection_id)
    const dbQuery = { [lookup_field] : lookup_value }

    collection.findOne(dbQuery, (err, result) => {
      if (!err && result != null) {
        res.send({ 
          data: result[lookup_target_field],
          message: `Updated ${lookup_target_field} for ${lookup_field} ${lookup_value} = ${result[lookup_target_field]}`
        })
      }
    })
  })
}