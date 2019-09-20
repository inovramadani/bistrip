import React from 'react'

const ModalUploadProgress = (props) => (
	<div id="modal-upload-progress" className="modal">
    <div className="modal-content center">
      <h4>Upload progress</h4>
      <p>Uploading: {props.countUploadProgress()}%</p>
      {
      	props.clientUploadProgress === 100 &&
      	<p>Please wait a moment until upload process to database completed in server side and this modal will close automatically</p>
      }
    </div>
  </div>
)

export default ModalUploadProgress