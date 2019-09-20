import React from 'react'

import { openCloseModal } from '../../utils/helperFunctions'
import './index.css'

const ModalConfirmation = (props) => (
	<div id={props.id || 'modal-confirmation'} className={`modal modal-confirmation ${props.className}`}>
    <div className={`modal-content ${props.contentClass}`}>
      <h4 className={props.titleClass || 'title'}>
        {props.title}
      </h4>
      <p className={props.textClass || 'text'}>
        {props.text}
      </p>
      {
        props.showOkButton && 
        <span className="btn btn-action" 
          onClick={props.onConfirm || (e => closeModal(props.id || 'modal-confirmation'))}>
          {props.btnOKtext || 'OK'}
        </span>
      }
      {
        props.showCancelButton && 
        <span className="btn btn-action" 
          onClick={props.onCancel || (e => closeModal(props.id || 'modal-confirmation'))}>
          {props.btnCanceltext || 'Cancel'}
        </span>
      }
    </div>
  </div>
)

const closeModal = (id) => {
  openCloseModal(id, 'close')
}

export default ModalConfirmation