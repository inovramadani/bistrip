import { stringifyPrettyJSON } from '../../utils/helperFunctions'

export const editViewHelpText = `Hints :\n
"displayName" is to change the column title for related field in the collection page.\n
"order" is to determine the column position in the table.\n
"showInTable" is to show or hide a column.\n
"valueToIcon" is an object which keys refer to record texts and values refer to icon names* which are expected to replace the record texts. \n\
"showSummary" when true is to trim the text when the text length exceeds "maxLength". \n
Please find a view configuration example below.`

export const linkToIconNameReference = 'https://materializecss.com/icons.html'

const editViewJSONExample = {
	"createdTime": {
    "displayName": "Is Completed?",
    "order": 2,
    "showInTable": true,
    "valueToIcon": { "yes": "check", "no" : "close" }
  },
  "description" : {
  	"displayName": "Task description",
    "order": 1,
    "showInTable": true,
    "maxLength": 100,
    "showSummary": true
  }
}

export const editViewJSONExample_string = stringifyPrettyJSON(editViewJSONExample)