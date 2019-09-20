import React from 'react'

export const arrayFieldTemplate = (props) => {
	const innerObjectProperties = props.items[0] ? props.items[0].children.props.schema.properties : {}

  return (
    <div className="array-field-container">
    	<div className="row">
	    	<div className="col s11">
		    	<table>
						<thead>
							<tr className="array-item-table-head">
							{
								Object.keys(innerObjectProperties).map((property, index) => (
									<th key={index}>{innerObjectProperties[property].title}</th>
								))
							}
							</tr>
						</thead>
					</table>
				</div>
			</div>
      {
      	props.items.map((element, idx1) => {
      		element.children.props.registry.ObjectFieldTemplate = innerObjectFieldTemplate
      		return (
      			<div key={idx1} className="row zero-margin">
	      			<div className="col s11">
	      				{element.children}
	      			</div>
	      			<div className="btn-actions-container">
		            {element.hasMoveDown && (
		              <span
		              	className="waves-effect waves-light btn btn-action-array-field"
		                onClick={element.onReorderClick(
		                  element.index,
		                  element.index + 1
		                )}>
		                <i className="material-icons">arrow_drop_down</i>
		              </span>
		            )}
		            {element.hasMoveUp && (
		              <span
		              	className="waves-effect waves-light btn btn-action-array-field"
		                onClick={element.onReorderClick(
		                  element.index,
		                  element.index - 1
		                )}>
		                <i className="material-icons">arrow_drop_up</i>
		              </span>
		            )}
		            {element.hasRemove && (
		            	<span 
			            	className="waves-effect waves-light btn btn-action-array-field"
			            	onClick={element.onDropIndexClick(element.index)}>
			              <i className="material-icons">delete</i>
			            </span>
		            )}			            
		          </div>
            </div>
      		)
      	})
      }
      <div className="row total-amount-container">
	      {
	      	props.schema.showTotalCell &&
		      <div className="col s11">
		      	<span className="col s3 left right-align">Sum column :</span>
		      	<input type="text" id="sum-column-name" className="col s3 left" onChange={e => handleChangeSumColumnName(e, props)}/>
						<span id="total-amount-array-items" className="col s3 right total-amount-cell"></span>
						<span className="col s3 right total-amount-cell">Total</span>
		    	</div>
	      }
	      {
	      	props.canAdd && 
	      	<div className="col s1 right">
		      	<span 
		      		className="waves-effect waves-light btn btn-floating red right" 
		      		onClick={e => handleClickAdd(e, props)}
		      	>
		      		<i className="material-icons">add</i>
		      	</span>
		      </div>
	      }
	    </div>
    </div>
  )
}

const innerObjectFieldTemplate = (props) => {
	return (
		<table>
		<tbody>
			<tr className="array-object-properties-row">
			{
				props.properties.map((property, idx2) => (
					<td key={idx2} className={`${property.name}-cell array-item-cell`}>{property.content}</td>
				))
			}
			</tr>
		</tbody>
		</table>
	)
}

const handleChangeSumColumnName = ({ target }, props) => {
	const total = countValuesOnCells(target.value, props)
	const totalCell = document.getElementById('total-amount-array-items')
	if (totalCell) totalCell.innerHTML = total
}

const countValuesOnCells = (targetProperty, props) => {
	const properties = props.schema.items.properties
	let total = 0

	Object.keys(properties).forEach(key => {
		if (key === targetProperty && properties[key].type === 'number') {
			const cells = Array.prototype.slice.call(document.getElementsByClassName(`${key}-cell`))
			cells.forEach(cell => {
				const input = cell.children[0].children[0].children[0].children[0].children[2]
				if (input) total += Number(input.value)
			})
		}
	})

	return total
}

const handleClickAdd = (e, props) => {
	props.onAddClick(e)
	const propertiesLength = Object.keys(props.schema.items.properties).length
	setTimeout(() => {
		// fix hidden dropdown select due to materializecss override script
		// by adding 'browser-default' class
		addBrowserDefaultClassOnSelectElements() 
		setCellWidthEqually(propertiesLength)
	}, 50)
}

const addBrowserDefaultClassOnSelectElements = () => {
	// hide input dropdown materialize default
	const selectwrapper = Array.prototype.slice.call(document.getElementsByClassName('select-wrapper'))
	selectwrapper.forEach(el => {
		const select = el.getElementsByClassName('select-dropdown')[0]
		const svg = el.getElementsByTagName('svg')[0]
		select.style.display = 'none'
		svg.style.display = 'none'
	})

	// show browser-default select element
	const selects = document.getElementsByTagName('SELECT')
	if (selects.length > 0) {
		for (let i = 0; i < selects.length; i++) {
			selects[i].classList.add('browser-default')
		}
	}
}

export const setCellWidthEqually = (numberOfItems) => {
	const cells = document.getElementsByClassName('array-item-cell')
	for (let i = 0; i < cells.length; i++) {
		cells[i].style.width = `${100/numberOfItems}%`
	}

	const cells2 = document.getElementsByClassName('array-item-cell')
	let minWidth
	for (let i = 0; i < cells2.length; i++) {
		if (i === 0) {
			minWidth = cells2[i].offsetWidth
		} else {
			minWidth = Math.min(minWidth, cells2[i].offsetWidth)
		}
	}

	for (let i = 0; i < cells2.length; i++) {
		const input = cells2[i].getElementsByTagName('INPUT')[0]
		if (input !== undefined) input.style.maxWidth = `${minWidth}px`
	}
}