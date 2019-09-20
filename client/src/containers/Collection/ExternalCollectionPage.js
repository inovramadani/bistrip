import React, { Component, Fragment } from 'react'
import Form from 'react-jsonschema-form'
import M from 'materialize-css/dist/js/materialize.min.js'
import axios from 'axios'
import { isEmpty } from 'lodash'

import API_URL from '../../utils/api_url'
import './ExternalCollectionPage.css'

class ExternalCollectionPage extends Component {
	constructor(props) {
    super(props)

    this.state = {
      collectionName: 'External Content',
      column: ['name', 'subject', 'description', 'created', 'status', 'workflow'],
    	record: null,
      formSchema: { title: '', type: "object", properties: {} },
      uiSchema: {},
      actionMessage: ''
    }
  }

  render() {
    const { 
      collectionName, 
      column, 
      record,
      formSchema, 
      uiSchema,
      actionMessage
    } = this.state

    return (
      <div className="collection-page center">
        <div className="row">
        	<h5 className="collection-title">/ {collectionName}</h5>
        </div>
        <div className="row">
        { 
          !record && <p> loading .... </p>
        }
        {
          record &&
          <Fragment>
            <div className="col s12">
              <table className="table-collection">
                <thead>
                  <tr>
                    { !isEmpty(column) && column.map((c, i) => <th key={i}>{c}</th>) }
                  </tr>
                </thead>

                <tbody>
                  { 
                    record.map((r,i) => (
                      <tr key={i}>
                        {
                          Object.keys(r).filter(k => column.indexOf(k) >= 0) // filter data based on column
                          .sort((a, b) => (column.indexOf(a) - column.indexOf(b))) // sort data based on column order
                          .map((k, i_2) => (
                            <td key={i_2}>{r[k]}</td>
                          ))
                        }
                        <td>
                          <a className="modal-trigger" href="#modal-edit-record" onClick={e => this.handleEditRecord(i)}>
                            <i className="small material-icons btn-action-icon">local_post_office</i>
                          </a> 
                        </td>
                      </tr>
                    )) 
                  }
                </tbody>
              </table>
            </div>
          </Fragment>
        }
        </div>
        <div id="modal-edit-record" className="modal">
          <div className="modal-content">
            <h5 className="title"><strong>Action on record</strong></h5>
            <div className="row">
              <div className="json-form">
                <Form 
                  uiSchema={uiSchema}
                  schema={formSchema}
                >
                  <div className="btn-action-container">
                    <button className="btn btn-approve" type="button" onClick={this.onApprove}>Approve</button>
                    <button className="btn btn-reject" type="button" onClick={this.onReject}>Reject</button>
                  </div>
                </Form>
              </div>
            </div>
          </div>
        </div>
        <div id="modal-post-action-message" className="modal">
          <div className="modal-content">
            <h5 className="title"><strong>{actionMessage}</strong></h5>
            <span className="waves-effect waves-light btn btn-close" onClick={this.handleClickClose}>
              Close
            </span>
          </div>
        </div>
      </div>
    )
  }

  componentWillMount() {
    this.loadExternalRecords()
  }

  componentDidMount() {
    // materialize css initialization
    M.AutoInit()
  }

  loadExternalRecords() {
    axios.get(`${API_URL}/external-content`)
      .then(res => {
        const record = res.data.data.tasks
        // map keys in returned data to form schema properties
        let properties = Object.keys(record[0]).reduce((obj, key) => {
          return {...obj, [key] : {type: 'string', title: key, default: '' }}
        }, {})
        // add comment field in the form schema
        properties.comment = {type: 'string', title: 'comment'}

        const schema = {...this.state.formSchema, properties}

        this.setState({ 
          record,
          formSchema: schema
        })
      })
      .catch(err => console.log(err))
  }

  handleEditRecord = (index) => {
    const { formSchema, record } = this.state
    const selectedRecord = record[index]
    const properties = formSchema.properties

    // add default value to show fields value in the form based on selected record
    const newProperties = Object.keys(properties).reduce((obj, key) => {
      if (key !== 'comment') {
        return {...obj, [key]: {...properties[key], default: selectedRecord[key] }}
      } else {
        return {...obj, [key]: {...properties[key] }}
      }
    }, {})

    // set UI schema for those fields to read-only
    const uiSchema = Object.keys(properties).reduce((obj, key) => {
      if (key !== 'comment') {
        /* eslint-disable-next-line */
        return {...obj, [key] : { ["ui:readonly"]: true }}
      } else {
        return obj
      }
    }, {})

    this.setState({
      formSchema: {...formSchema, properties: newProperties},
      uiSchema
    })
  }

  onApprove = () => {
    const { formSchema } = this.state
    const id = formSchema.properties.id.default

    axios.patch(`${API_URL}/external-content?task_id=${id}`, {outcome: 'Approve'})
      .then(res => {
        const { result } = res.data
        let actionMessage

        this.openModalPostActionMessage()

        if (result.error) {
          actionMessage = `Fail to approve task\n${result.error}`
        } else {
          actionMessage = 'The task has been approved'
        }

        this.setState({ actionMessage })
      })
      .catch(e => console.error(e))
  }

  onReject = () => {
    const { formSchema } = this.state
    const id = formSchema.properties.id.default

    axios.patch(`${API_URL}/external-content?task_id=${id}`, {outcome: 'Reject'})
      .then(res => {
        const { result } = res.data
        let actionMessage

        this.openModalPostActionMessage()

        if (result.error) {
          actionMessage = `Fail to reject task\n${result.error}`
        } else {
          actionMessage = 'The task has been rejected'
        }

        this.setState({ actionMessage })
      })
      .catch(e => console.error(e))
  }

  openModalPostActionMessage = (message) => {
    const elem = document.getElementById('modal-post-action-message')
    const modal = M.Modal.getInstance(elem)
    modal.open()
  }

  handleClickClose = () => {
    const elem1 = document.getElementById('modal-post-action-message')
    const elem2 = document.getElementById('modal-edit-record')
    M.Modal.getInstance(elem1).close()
    M.Modal.getInstance(elem2).close()
    
    this.loadExternalRecords()
  }
}

export default ExternalCollectionPage
