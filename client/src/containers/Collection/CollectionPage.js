import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import { isEmpty } from 'lodash'
import queryString from 'query-string'
import M from 'materialize-css/dist/js/materialize.min.js'

import API_URL from '../../utils/api_url'
import { downloadURI } from '../../utils/helperFunctions'
import './CollectionPage.css'

export default class CollectionPage extends Component {
	constructor(props) {
    super(props)

    this.state = {
      id: undefined,
      collectionName: '',
      column: [],
    	record: null,
      downloadProgress: 0,
    }
  }

  render() {
    const { 
      id,
      collectionName, 
      column, 
      record, 
      tableViewConfig,
      downloadProgress
    } = this.state

    return (
      <div className="collection-page center">
        <div className="row">
        	<h5 className="collection-title">/ {collectionName}</h5>
          <span className="button-new">
            <Link className="waves-effect waves-light btn" to={`/data-input?id=${id}`}>New</Link>
          </span>
        </div>
        <div className="row">
        { 
          !record && <p> loading .... </p>
        }
        {
          record &&
          <div className="col s12 table-container zero-padding">
            <table className="table-collection">
              <thead>
                <tr>
                  { 
                    !isEmpty(column) && 
                    !isEmpty(tableViewConfig) &&
                    column.map((c, i) => <th key={i}>{tableViewConfig[c].displayName}</th>) 
                  }
                </tr>
              </thead>

              <tbody>
                { 
                  record.map((r,i) => (
                    <tr key={i}>
                      {
                        // show only columns that exists in 'column' variable
                        column.map((col, idx) => {
                          const value = r[col]
                          let content = typeof(value) === 'string' ? value : JSON.stringify(value)
                          const config = tableViewConfig[col]

                          // replace with icon if specified on valueToIcon field
                          if (config.valueToIcon && Object.keys(config.valueToIcon).indexOf(content) > -1) {
                            content = <i className="material-icons">{config.valueToIcon[content]}</i>
                          } else {
                            // limit characters up to maxLength if field showSummary true
                            content = config.showSummary && content.length > config.maxLength ? 
                              content.slice(0, config.maxLength) + ' ...' :
                              content
                          }

                          if (col === 'file' && r.filename && r.contentType) {
                            return (
                              <td>
                                <span
                                  className="download-link"
                                  onClick={e => this.downloadFile(r.filename, r.contentType, r.size)}>
                                  {r.filename.slice(33)}
                                </span>
                              </td>
                            )
                          }

                          return <td key={idx}>{content}</td>
                        })
                      }
                      <td className="cell-action-btn-container">
                        <span className="waves-effect waves-light btn-floating orange" 
                           onClick={e => this.openRecord(i)}>
                          <i className="small material-icons">folder_open</i>
                        </span>
                        <span className="waves-effect waves-light btn-floating red" 
                           onClick={e => this.deleteRecord(i)}>
                          <i className="small material-icons">delete</i>
                        </span>
                      </td>
                    </tr>
                  ))
                }
              </tbody>
            </table>
          </div>
        }
        </div>

        <div id="modal-download-progress" className="modal">
          <div className="modal-content">
            <h4>Download progress</h4>
            <div>
              <p>Downloading: {downloadProgress}%</p>
              <p>Please wait until download completed and this modal will close automatically</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  componentWillMount() {
    const { id } = queryString.parse(this.props.location.search)

    this.setState({ id })
    this.loadCollectionName(id)
    this.loadRecord(id)
    this.loadTableViewConfig(id)
  }

  componentDidMount() {
    M.AutoInit()
  }

  componentDidUpdate(prevProps, prevState) {
    const { id } = queryString.parse(this.props.location.search)

    if (id !== this.state.id) {
      this.setState({ id })
      this.loadCollectionName(id)
      this.loadRecord(id)
      this.loadTableViewConfig(id)
    }
  }

  loadCollectionName(id) {
    axios.get(`${API_URL}/form/?id=${id}`)
      .then(response => {
        this.setState({ 
          collectionName: response.data.data.title 
        })
      })
      .catch(error => console.log(error))
  }

  loadRecord(id) {
    axios.get(`${API_URL}/record/?id=${id}`)
      .then(response => {
        this.setState({ 
          record: response.data.data
        })
      })
      .catch(error => console.log(error))
  }

  loadTableViewConfig(id) {
    axios.get(`${API_URL}/retrieve-table-view-config?form_id=${id}`)
      .then(response => {
        const tableViewConfig = response.data.data
        const filteredColumn = Object.keys(tableViewConfig).filter(key => tableViewConfig[key].showInTable)
        const sortedColumn = filteredColumn.sort((a, b) => tableViewConfig[a].order - tableViewConfig[b].order)
        
        this.setState({
          tableViewConfig,
          column: sortedColumn
        })
      })
      .catch(error => console.error(error))
  }

  downloadFile = (filename, contentType, size) => {
    // open progress modal
    let modal = document.getElementById('modal-download-progress')
    M.Modal.getInstance(modal).open()

    const config = {
      responseType: 'arraybuffer',
      onDownloadProgress: progressEvent => {
        const progress = Math.round(progressEvent.loaded / size * 100)
        this.setState({ downloadProgress: progress })
      }
    }

    axios.get(`${API_URL}/download?filename=${filename}`, config)
      .then(res => {
        const file = new Blob([res.data], { type: contentType });
        const fileURL = URL.createObjectURL(file);
        const originalName = filename.slice(33)

        downloadURI(fileURL, originalName)

        // close modal dowload progress and reset value
        let modal = document.getElementById('modal-download-progress')
        M.Modal.getInstance(modal).close()
        this.setState({ downloadProgress: 0 })
      })
      .catch(err => console.log(err))
  }

  deleteRecord = (index) => {
    const { record } = this.state
    const { formId, _id: recordId } = record[index]

    axios.delete(`${API_URL}/record?form_id=${formId}&record_id=${recordId}`)
      .then(response => {
        this.loadRecord(formId)
      })
      .catch(error => console.error(error))
  }

  openRecord = (index) => {
    const { record } = this.state
    const { formId, _id: recordId } = record[index]

    this.props.history.push(`/record?form_id=${formId}&record_id=${recordId}`)
  }
}
