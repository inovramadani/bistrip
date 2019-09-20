const mongodb = require('mongodb')
const request = require('request')
const cors = require('cors')
const URL = require('url')

const mongoUtil = require( '../services/mongoUtil' );
const db = mongoUtil.getDB();

module.exports = (app) => {	  
  app.use(cors());

  // ping the connection to open api url
  app.get('/api/ping-open-api', (req, res) => {
    const url = URL.parse(req.url, true)
    const openApiUrl = url.query.url

    request(openApiUrl, (error, response, body) => {
      if (error) {
        console.error(error)
        res.send({ success: false, message: 'URL error'})
      }

      if (response.statusCode >= 400) {
        res.send({ success: false, message: 'Fail to connect to URL'})
      } else if (response.statusCode === 200) {
        res.send({ success: true, message: 'Success connect to URL'})
      }
    })
  })

  // retrieve external open API first endpoint
  // then retrieve the parameters
  app.get('/api/retrieve-external-workflow-parameters', (req, res) => {
    const url = URL.parse(req.url, true)
    const openApiUrl = url.query.url

    request(openApiUrl, (error, response, body) => {
      if (error) console.error(error)
      
      const openApiData = JSON.parse(body)

      // extract the api url, http method, and parameters (in query and body)
      const firstPath = Object.keys(openApiData.paths)[0]
      const openApiTitle = openApiData.info.title
      const apiUrl = `https://${openApiData.host}${openApiData.basePath}${firstPath}`
      const apiMethod = Object.keys(openApiData.paths[firstPath])[0]
      const api = openApiData.paths[firstPath][apiMethod]
      const apiQuery = `?${api.parameters[1].name}=${api.parameters[1].default}`
      const apiCompleteUrl = apiUrl + apiQuery
      const apiBodySchema = api.parameters[0].schema.properties

      const apiBodyProperties = Object.keys(apiBodySchema).reduce((obj, key) => {
        return {
          ...obj, 
          [key] : Object.keys(apiBodySchema[key].properties).reduce((obj2, key2) => {
                    return { ...obj2, [key2] : '' }
                  }, {})
        }
      }, {})

      // adjust api parameters data to fit rendering purpose in frontend
      const apiParameters = Object.keys(apiBodyProperties).reduce((arr, key) => {
        return [
          ...arr, 
          { 
            name: key,
            properties: Object.keys(apiBodyProperties[key]).reduce((arr2, key2) => {
              return [
                ...arr2,
                {
                  name: key2,
                  type: apiBodySchema[key].properties[key2].type
                }
              ]
            }, []) 
          }
        ]
      }, [])

      res.send({ openApiTitle, apiBody: apiBodyProperties, apiParameters })
    })
  })

  // retrieve external open API first endpoint to be used
  // every time a document is saved/modified, then
  // save the API data to corresponding form collection
  app.post('/api/save-external-workflow', (req, res) => {
    const formCollection = db.collection('form')
    const url = URL.parse(req.url, true)
    const actionType = url.query.action_type

    const { openApiTitle, openApiUrl, formId, apiBody } = req.body

    request(openApiUrl, (error, response, body) => {
      if (error) console.error(error)

      const openApiData = JSON.parse(body)

      // extract the api url, http method, and parameters (in query and body)
      const firstPath = Object.keys(openApiData.paths)[0]
      const apiUrl = `https://${openApiData.host}${openApiData.basePath}${firstPath}`
      const apiMethod = Object.keys(openApiData.paths[firstPath])[0]
      const api = openApiData.paths[firstPath][apiMethod]
      const apiQuery = `?${api.parameters[1].name}=${api.parameters[1].default}`
      const apiCompleteUrl = apiUrl + apiQuery
      const apiBodySchema = api.parameters[0].schema.properties

      // save parameters input from user inside api schema to DB
      const apiBodyProperties = Object.keys(apiBodySchema).reduce((obj, key) => {
        return {
          ...obj, 
          [key] : Object.keys(apiBodySchema[key].properties).reduce((obj2, key2) => {
                    return {...obj2, [key2] : apiBody[key][key2]}
                  }, {})
        }
      }, {})

      // adjust api parameters data to fit rendering purpose in frontend
      const apiParameters = Object.keys(apiBodyProperties).reduce((arr, key) => {
        return [
          ...arr, 
          { 
            name: key,
            properties: Object.keys(apiBodyProperties[key]).reduce((arr2, key2) => {
              return [
                ...arr2,
                {
                  name: key2,
                  type: apiBodySchema[key].properties[key2].type
                }
              ]
            }, []) 
          }
        ]
      }, [])

      let actionAPI = {}

      
      actionAPI = { 
        [`${actionType}ActionAPI`]: { 
          openApiTitle,
          openApiUrl,
          url: apiCompleteUrl, 
          method: apiMethod, 
          body: apiBodyProperties,
          parameters: apiParameters,
          isActive: true
        }
      }

      formCollection.updateOne({_id: mongodb.ObjectID(formId)}, {$set: actionAPI}, (err, obj) => {
        if (err) console.error(err)
        res.send({ message: `API saved in form${formId} database`, [`${actionType}ActionAPI`]: actionAPI[`${actionType}ActionAPI`] })
      })
    })
  })

  app.patch('/api/toggle-external-api', (req, res) => {
    const formCollection = db.collection('form')
    const url = URL.parse(req.url, true)
    const { formId, actionType } = url.query
    const { isActive } = req.body

    const updatedField = {
      [`${actionType}ActionAPI.isActive`] : isActive
    }

    formCollection.updateOne({_id: mongodb.ObjectID(formId)}, {$set: updatedField}, (err, obj) => {
      if (err) console.error(err)
      else {
        const message = `${actionType} action api is ` + (isActive ? 'activated' : 'deactivated')
        res.send({ message })
      }
    })
  })

  // update the body contents of external api call
  app.post('/api/update-external-api-body', (req, res) => {
    const formCollection = db.collection('form')
    const url = URL.parse(req.url, true)
    const formId = url.query.form_id
    const { body } = req.body

    formCollection.updateOne({_id: mongodb.ObjectID(formId)}, {$set: {'actionAPI.body': body}}, (err, obj) => {
      if (err) console.error(err)
      res.send({ message: `API body saved in form${formId} database` })
    })
  })

  // call external api upon creating/updating a form document
  app.post('/api/call-events-api', (req, res) => {
    const formCollection = db.collection('form')
    const url = URL.parse(req.url, true)
    const formId = url.query.form_id
    const actionType = url.query.action_type

    formCollection.findOne({_id: mongodb.ObjectID(formId)}, (err, form) => {
      if (err) console.error(err)

      if (form != null) {
        if (form[`${actionType}ActionAPI`]) {
          const { url, method, body } = form[`${actionType}ActionAPI`]
          const formData = req.body
          
          const newBody = Object.keys(body).reduce((obj, parameter) => {
            return {
              ...obj,
              [parameter] : Object.keys(body[parameter]).reduce((obj2, property) => {
                // pattern to check double angle brackets string 
                // to be replaced by form input value
                const pattern = /^<<\w+>>$/
                const value = body[parameter][property]

                // if the value of the property is string with pattern: <<field_name>>
                // replace the pattern with form input value
                if (pattern.test(value)) {
                  const fieldName = value.slice(2, value.length - 2)

                  return {
                    ...obj2,
                    [property] : formData[fieldName]
                  }
                } else { // use value if it is normal string (without pattern: <<value>>)                  
                  return {
                    ...obj2, 
                    [property] : value
                  }
                }
              }, {})
            }
          }, {})

          const requestOptions = {
            method, 
            uri: url, 
            body: JSON.stringify(newBody)
          }
          
          request(requestOptions, (error, response, responseBody) => {
            if (error) console.error(error)
            res.send({ message: `${actionType} action API called`, data: responseBody })
          })
        } else {
          res.send({ message: `${actionType} action API not found in form${formId} database`})
        }
      } else {
        res.send({ message: `form${formId} not found in database`})
      }
    })
  })
}