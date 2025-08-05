// This file ensures n8n can find and load your nodes and credentials
const { GoogleForms } = require('./dist/nodes/GoogleForms/GoogleForms.node.js');

module.exports = {
	nodeTypes: {
		GoogleForms: GoogleForms,
	},
	credentialTypes: {
		GoogleFormsApi: require('./dist/credentials/GoogleFormsApi.credentials.js').GoogleFormsApi,
	},
};
