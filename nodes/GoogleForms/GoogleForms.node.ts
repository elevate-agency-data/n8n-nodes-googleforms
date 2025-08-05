import {
  ApplicationError,
  INodeType,
  INodeTypeDescription,
  IExecuteFunctions,
  NodeApiError,
  NodeConnectionType
} from 'n8n-workflow';

export class GoogleForms implements INodeType {
  description:INodeTypeDescription = {
    name: 'googleForms',
	  displayName: 'Google Forms',
    group: ['transform'],
    version: 1,
    description: 'Use the Google Forms API',
    defaults:{ name: 'Google Forms' },
    icon: 'file:googleforms.svg',
    // @ts-ignore - node-class-description-inputs-wrong
    inputs: [{ type: NodeConnectionType.Main }],
    // @ts-ignore - node-class-description-outputs-wrong
    outputs: [{ type: NodeConnectionType.Main }],
		usableAsTool: true,
    credentials:[{ name: 'googleFormsOAuth2Api', required:true }],
    requestDefaults:{
      baseURL: 'https://datastudio.googleapis.com/v1',
      headers:{ 'Content-Type': 'application/json' }
    },
    properties:[
      {
        displayName: 'Resource',
        name: 'resource',
        type: 'options',
        noDataExpression: true,
        options: [
          { name: 'Form', value: 'forms', description: 'Manages forms' },
          { name: 'Form Response', value: 'formResponses', description: 'Manages form responses' },
          { name: 'Form Watch', value: 'formWatches', description: 'Manages form watches' }
        ],
        default: 'forms',
        required: true,
      },
      {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        noDataExpression: true,
        displayOptions: { show: { resource: ['forms'] } },
        options: [
          { name: 'Batch Update Form', value: 'formsBatchUpdatePost', action:'Changes the form with a batch of updates', description: 'Changes the form with a batch of updates' },
          { name: 'Create Form', value: 'formsCreatePost', action:'Creates a new form', description: 'Creates a new form using the title given in the provided form message in the request' },
          { name: 'Get Form', value: 'formsGet', action:'Gets a form', description: 'Gets a form' },
          { name: 'Update Publish Settings', value: 'formsPublishSettingsUpdatePost', action:'Updates the publish settings', description: 'Updates the publish settings of a form' }
        ],
        default: 'formsBatchUpdatePost',
        required: true,
      },
      {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        noDataExpression: true,
        displayOptions: { show: { resource: ['formResponses'] } },
        options: [
          { name: 'Get Response', value: 'formResponsesGet', action:'Gets a response ', description: 'Gets a response from the form' },
          { name: 'List Responses', value: 'formResponsesList', action:'Lists responses', description: 'List form responses' }
        ],
        default: 'formResponsesGet',
        required: true,
      },
      {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        noDataExpression: true,
        displayOptions: { show: { resource: ['formWatches'] } },
        options: [
          { name: 'Create Watch', value: 'formWatchesCreatePost', action:'Creates a new watch ', description: 'Creates a new watch' },
          { name: 'Delete Watch', value: 'formWatchesDelete', action:'Deletes a watch', description: 'Deletes a watch' },
          { name: 'List Watches', value: 'formWatchesList', action:'Lists watches', description: 'Returns a list of the watches owned by the invoking project' },
          { name: 'Renew Watch', value: 'formWatchesRenewPost', action:'Renews a watch', description: 'Renews an existing watch for seven days' }
        ],
        default: 'formWatchesCreatePost',
        required: true,
      },
			{
				displayName: 'Form ID',
				name: 'formId',
				type: 'string',
				default: '',
        description: 'The ID of the form',
        displayOptions:{ show:{ operation:['formsBatchUpdatePost', 'formsGet', 'formsPublishSettingsUpdatePost', 'formResponsesGet', 'formResponsesList', 'formWatchesCreatePost', 'formWatchesDelete', 'formWatchesList', 'formWatchesRenewPost'] } }
			},
			{
				displayName: 'Response ID',
				name: 'responseId',
				type: 'string',
				default: '',
        description: 'The response ID within the form',
        displayOptions:{ show:{ operation:['formResponsesGet'] } }
			},
			{
				displayName: 'Watch ID',
				name: 'watchId',
				type: 'string',
				default: '',
        description: 'The ID of the watch',
        displayOptions:{ show:{ operation:['formWatchesDelete', 'formWatchesRenewPost'] } }
			},
      {
        displayName: 'Query Parameters',
        name: 'queryParameters',
        type: 'collection',
        placeholder: 'Add Parameter',
        default:{},
        options:[
          {
            displayName: 'Filter',
            name: 'filter',
            description: 'Which form responses to return',
            type: 'string',
            default: ''
          },
          {
            displayName: 'Unpublished',
            name: 'unpublished',
            description: 'Whether the form is unpublished',
            type: 'boolean',
            default: false
          },
          {
            displayName: 'Page Size',
            name: 'pageSize',
            description: 'The number of results to include per page',
            type: 'number',
            default: 5000,
          },
          {
            displayName: 'Page Token',
            name: 'pageToken',
            description: 'A token identifying a page of results to return',
            type: 'string',
            default: '',
            typeOptions: {
              password: true
            }
          }
        ],
      },
      {
        displayName: 'Request Body',
        name: 'requestBody',
        type: 'json',
	      default: '{}',
        displayOptions:{ show:{ operation:['formsBatchUpdatePost', 'formsCreatePost', 'formsPublishSettingsUpdatePost', 'formWatchesCreatePost'] } }
      }
    ]
  };

  async execute(this:IExecuteFunctions) {
    const items = this.getInputData();
    const returnData = [];
    const credentials = await this.getCredentials('googleFormsOAuth2Api');
    if (!credentials) { throw new ApplicationError('Missing Google Forms API Credentials'); }

    for (let i = 0; i < items.length; i++) {
      try {

        const operation = this.getNodeParameter('operation', i, '') as string;
        const resource = this.getNodeParameter('resource', i, '') as string;
        const formId = this.getNodeParameter('formId', i, '') as string;
        const responseId = this.getNodeParameter('responseId', i, '') as string;
        const watchId = this.getNodeParameter('watchId', i, '') as string;
        const queryParameters = this.getNodeParameter('queryParameters', i, {}) as Record<string, any>;
        const requestBody = this.getNodeParameter('requestBody', i, '') as string;

        let url = 'https://forms.googleapis.com/v1';

        const queryParams = new URLSearchParams();
        Object.entries(queryParameters).forEach(([key, value]) => {
          if (value) queryParams.append(key, String(value));
        });
        const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';

        switch (resource) {
          case 'forms':
            switch (operation) {
              case 'formsBatchUpdatePost':
                if (!formId) { throw new ApplicationError('Form ID is required'); }
                url += `/forms/${formId}:batchUpdate${queryString}`;
                break;
              case 'formsCreatePost':
                url += `/forms${queryString}`;
                break;
              case 'formsGet':
                if (!formId) { throw new ApplicationError('Form ID is required'); }
                url += `/forms/${formId}${queryString}`;
                break;
              case 'formsPublishSettingsUpdatePost':
                if (!formId) { throw new ApplicationError('Form ID is required'); }
                url += `/forms/${formId}:setPublishSettings${queryString}`;
                break;
            }
            break;
          case 'formResponses':
            switch (operation) {
              case 'formResponsesGet':
                if (!formId) { throw new ApplicationError('Form ID is required'); }
                if (!responseId) { throw new ApplicationError('Response ID is required'); }
                url += `/forms/${formId}/responses/${responseId}${queryString}`;
                break;
              case 'formResponsesList':
                if (!formId) { throw new ApplicationError('Form ID is required'); }
                url += `/forms/${formId}/responses${queryString}`;
                break;
            }
            break;   
          case 'formWatches':
            switch (operation) {
              case 'formWatchesCreatePost':
                if (!formId) { throw new ApplicationError('Form ID is required'); }
                url += `/forms/${formId}/watches${queryString}`;
                break;
              case 'formWatchesDelete':
                if (!formId) { throw new ApplicationError('Form ID is required'); }
                if (!watchId) { throw new ApplicationError('Watch ID is required'); }
                url += `/forms/${formId}/watches/${watchId}${queryString}`;
                break;
              case 'formWatchesList':
                if (!formId) { throw new ApplicationError('Form ID is required'); }
                url += `/forms/${formId}/watches${queryString}`;
                break;
              case 'formWatchesRenewPost':
                if (!formId) { throw new ApplicationError('Form ID is required'); }
                if (!watchId) { throw new ApplicationError('Watch ID is required'); }
                url += `/forms/${formId}/watches/${watchId}:renew${queryString}`;
                break;
            }
            break;         
        }

        const httpMethod: 'DELETE' | 'GET' | 'PATCH' | 'POST'  = operation.endsWith('Delete') ? 'DELETE' :
                                                                 operation.endsWith('Patch') ? 'PATCH' :
                                                                 operation.endsWith('Post') ? 'POST' : 'GET';  
                                                                 
        const operationsWithoutBody = [
          'formWatchesDelete',
          'formWatchesRenewPost'
        ];
                                                                 
        let body;

        if (!operationsWithoutBody.includes(operation) && ['DELETE', 'PATCH', 'POST'].includes(httpMethod)) {
          body = JSON.parse(requestBody);
        }

        const requestConf = {
          method: httpMethod,
          url,
          headers: { 'Content-Type': 'application/json' },
          ...(body ? { body } : {}),
        };

        console.log('url : ' + url);
        console.log('requestConf : ' + JSON.stringify(requestConf));

        const responseData = await this.helpers.requestOAuth2.call(this, 'googleFormsOAuth2Api', requestConf);

        console.log('responseData : ' + responseData);

        if (typeof responseData === 'string') {
          const trimmed = responseData.trim();
          if (trimmed !== '') {
            try {
              returnData.push({ json: JSON.parse(trimmed) });
            } catch (e) {
              returnData.push({ text: trimmed });
            }
          } else {
            returnData.push({ 'Status Code': '204 No Content' });
          }
        } else if (responseData) {
          returnData.push(responseData);
        } else {
          returnData.push({ 'Status Code': '204 No Content' });
        }     

      } catch (error) {
        throw new NodeApiError(this.getNode(), {
          message: `Error calling Google Forms API: ${error.message}`,
          description: error.stack || 'No stack trace available'
        });
      }
    }
    return [this.helpers.returnJsonArray(returnData)];
  }
}