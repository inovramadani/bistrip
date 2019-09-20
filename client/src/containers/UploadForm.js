import React, { Component } from 'react'
import axios from 'axios'
import Form from 'react-jsonschema-form'
import M from 'materialize-css/dist/js/materialize.min.js'

import { arrayFieldTemplate } from '../utils/jsonSchemaFormUITemplate'
import fields from '../utils/RJSFCustomFields'
import API_URL from '../utils/api_url'
import { 
	// dataURLtoBlob, 
	downloadURI, 
	computeValueByFormula } from '../utils/helperFunctions'
import './UploadForm.css'


const uiSchema = {
  title: { column: '12' },
  firstname: { column: '6' },
  lastname: { column: '6' }
}

class UploadForm extends Component {
	constructor(props) {
		super(props)

		this.state = {
			files: undefined,
			formData: {},
			formStructure: {
				title: 'Form Upload Title', 
				type: "object", 
				properties: {
					"title": {
              "title": "Title",
              "type": "string",
              enum: ['Mr.', 'Mrs.', 'Ms.'],
              "default": ""
          },
					"firstname": {
              "title": "firstname",
              "type": "string",
              "default": ""
          },
          "lastname": {
              "title": "lastname",
              "type": "string",
              "default": ""
          },
          "fullname": {
              "title": "fullname",
              "type": "string",
              "formula": "firstname+lastname"
          },
          "completename": {
              "title": "completename",
              "type": "string",
              "formula": "title+firstname+lastname"
          },
          "order": {
              "title": "order",
              "type": "array",
              "items": {
                  "title": "order-items",
                  "type": "object",
                  "properties": {
                      "item": {
                          "title": "item",
                          "type": "string",
                          "default": ""
                      },
                      "price": {
                          "title": "price",
                          "type": "number",
                          "default": ""
                      },
                      "quantity": {
                          "title": "quantity",
                          "type": "number",
                          "default": ""
                      },
                      "totalPrice": {
                          "title": "totalPrice",
                          "type": "number",
                          "formula": "price*quantity"
                      },
                      "processTime": {
                          "title": "processTime",
                          "type": "number",
                          "default": ""
                      },
                      "deliveryTime": {
                          "title": "deliveryTime",
                          "type": "number",
                          "default": ""
                      },
                      "totalTime": {
                          "title": "totalTime",
                          "type": "number",
                          "formula": "processTime+deliveryTime"
                      },
                      "timeDifference": {
                          "title": "timeDifference",
                          "type": "number",
                          "formula": "processTime-deliveryTime"
                      },
                      "unitPrice": {
                          "title": "unitPrice",
                          "type": "number",
                          "formula": "price/quantity"
                      }
                  }
              }
          }
				}
			}
		}
	}	

	render() {
		const { files, formStructure, formData } = this.state
		console.log('state formdata = ', formData)
		return (
			<div className="form-input">
				<h5>Input form</h5>
				<div className="json-form">
					<Form 
						schema={formStructure}
						uiSchema={uiSchema}
						fields={fields}
						ArrayFieldTemplate={arrayFieldTemplate}
						formData={formData}
						onChange={this.onChange}
	        	onSubmit={this.onSubmit.bind(this)}
	        	onError={this.log("errors")} />
	      </div>
	      {
	      	files &&
	      	files.map((file, index) => (
			      <p>
			      	<span
				      	onClick={e => this.downloadFile(file.filename, file.contentType)}>
				      	download {file.filename.slice(33)}
				      </span>
			      </p>
	      	))
	      }
			</div>
		)
	}

	downloadFile = (filename, contentType) => {
		axios.get(`${API_URL}/download?filename=${filename}`, {responseType: 'arraybuffer'})
			.then(res => {
				const file = new Blob([res.data], { type: contentType });
      	const fileURL = URL.createObjectURL(file);
      	const originalName = filename.slice(33)

      	downloadURI(fileURL, originalName)
			})
			.catch(err => console.log(err))
	}

	componentWillMount() {
		// download all file list stored in mongodb
		// axios.get(`${API_URL}/files`)
		// 	.then(res => {
		// 		console.log('res = ', res)
		// 		this.setState({ files: res.data })
		// 	})
		// 	.catch(err => console.log(err))
	}

	componentDidMount() {
		M.AutoInit()
	}
	 
	log = (type) => console.log.bind(console, type)

	onChange = (props) => {
		const { schema, formData } = props
		const newFormData = computeValueByFormula(schema.properties, formData)
		this.setState({ formData: newFormData })
	}

	onSubmit = ({ formData }) => {
		console.log('formData = ', formData)
		// const file = formData.file
		// const nameStartIdx = file.indexOf(';name=') + 6
		// const nameEndIdx = file.indexOf(';base64,')
		// const filename = file.slice(nameStartIdx, nameEndIdx)
		// // const filetype = file.slice(5, nameStartIdx - 6)

		// const sBoundary = "---------------------------" + Date.now().toString(16)

		// const fd = new FormData()
		// fd.append("file", dataURLtoBlob(file), filename)

		// axios.post(`${API_URL}/upload`, fd, {headers: {'content-type': `multipart/form-data; boundary=${sBoundary}`}})
		// 	.then(res => {
		// 		M.toast({ html: res.data.message })
		// 	})
		// 	.catch(err => console.log(err))
	}
}

export default UploadForm;


/* 
// formStructure for testing form style (with array items)
formStructure: { 
				title: 'Form', 
				type: "object", 
				properties: {
					"Claimant": {
              "title": "Claimant",
              "type": "string",
              "default": "<<user.user.fullname>>"
          },
          jobTitle: {
          	title: "Job title",
          	type: "string",
          	enum: ['frontend', 'backend', 'fullstack'],
          	default: 'fullstack'
          },
          "Department": {
              "title": "Department",
              "type": "string",
              "default": "<<user.user.department>>"
          },
          "Manager": {
              "title": "Manager",
              "type": "string",
              "default": "<<user.user.manager>>"
          },
          "Date": {
              "title": "Date",
              "type": "string",
              "format": "date",
              "default": "<<date.today:0>>"
          },
          "Expenses": {
              "title": "Expenses",
              "type": "array",
              "items": {
                  "title": "Expenses-items",
                  "type": "object",
                  "properties": {
                      "Date": {
                          "title": "Date",
                          "type": "string",
                          "format": "date",
                          "default": "<<date.today:-10>>"
                      },
                      "Description": {
                          "title": "Description",
                          "type": "string",
                          "default": ""
                      },
                      "Type": {
                          "title": "Type",
                          "type": "number",
                          enum: [1, 2, 3],
                          "default": 1
                      },
                      "Amount": {
                          "title": "Amount",
                          "type": "number",
                          "default": ""
                      }
                  }
              }
          },
					file: {
			      type: "string",
			      format: "data-url",
			      title: "Single file"
			    }
				}
			}
		}
*/