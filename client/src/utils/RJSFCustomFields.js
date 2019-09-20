import React from 'react'
import SchemaField from "react-jsonschema-form/lib/components/fields/SchemaField";
import ObjectField from "react-jsonschema-form/lib/components/fields/ObjectField";

export const CustomSchemaField = (props) => {
	const column = props.uiSchema ? props.uiSchema.column ? `col s${props.uiSchema.column}` : '' : ''
	return (
		<div className={`${column}`} style={{padding: '0 5px'}}>
			<SchemaField {...props} />
		</div>
	)
}

export const CustomObjectField = (props) => {
	return (
		<div className="row">
			<ObjectField {...props} />
		</div>
	)
}

export const CustomTitleField = ({title, required}) => {
  const legend = required ? title + '*' : title;
  return (
  	<div id="custom">
  		<h5><strong>{legend}</strong></h5>
  		<hr />
  		<br />
		</div>
	)
}

const customFields = {
  TitleField: CustomTitleField,
  SchemaField: CustomSchemaField,
  ObjectField: CustomObjectField
}

export default customFields

