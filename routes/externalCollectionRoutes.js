const request = require('request')
const cors = require('cors')
const URL = require('url')

const mongoUtil = require( '../services/mongoUtil' );
const db = mongoUtil.getDB();

module.exports = (app) => {	  
  app.use(cors());

  app.get('/api/external-content', (req, res) => {
    const authorization = {
      authorization: 'Bearer tSTsMNItVWUsFQJRJF2MtUsQ2K2O2FsIP2HtSVsLtUsP2EsItPsRPtR2etUsK2gtVUsJ2bsMtTsKtWsFtSsItWxqDsMIORRtTsNJtRsOtV'
    }

    request('https://app.taskngin.com/api/v1/tasks?from=2018-11-01', { headers: authorization }, (error, response, body) => {
      if (error) console.error(error)
      if (response.statusCode === 200) {
        res.send({ data: JSON.parse(body) })
      }
    })
  })

  app.patch('/api/external-content', (req, res) => {
    const url = URL.parse(req.url, true)
    const taskId = url.query.task_id
    const headers = {
      authorization: 'Bearer tSTsMNItVWUsFQJRJF2MtUsQ2K2O2FsIP2HtSVsLtUsP2EsItPsRPtR2etUsK2gtVUsJ2bsMtTsKtWsFtSsItWxqDsMIORRtTsNJtRsOtV'
    }

    const requestOptions = {
      method: 'PATCH', 
      uri: `https://app.taskngin.com/api/v1/tasks/${taskId}`, 
      body: JSON.stringify(req.body), 
      headers
    }

    request(requestOptions, (error, response, body) => {
        if (error) console.error(error)
        if (response.statusCode === 200) {
          let result
          try {
            result = JSON.parse(body)          
          } catch (err) {
            if (err) result = body
          }

          res.send({ result })
        } else {
          res.send({ result: 'request is not valid'})
        }
      }
    )
  })
}