import { 
  ICredentialType, 
  INodeProperties, 
  Icon 
} from 'n8n-workflow';

const scopes = [
  'https://www.googleapis.com/auth/drive',
  'https://www.googleapis.com/auth/drive.file',
  'https://www.googleapis.com/auth/drive.readonly',
  'https://www.googleapis.com/auth/forms.body',
  'https://www.googleapis.com/auth/forms.body.readonly',
  'https://www.googleapis.com/auth/forms.responses.readonly'
];

export class GoogleFormsApi implements ICredentialType {
  name = 'googleFormsOAuth2Api';
  extends = ['googleOAuth2Api'];
  displayName = 'Google Forms OAuth2 API';
  documentationUrl = 'https://docs.n8n.io/integrations/builtin/credentials/google/oauth-single-service/';
  icon: Icon = 'file:icons/GoogleForms.svg';
  properties: INodeProperties[] = [
    {
      displayName: 'Grant Type',
      name: 'grantType',
      type: 'hidden',
      default: 'authorizationCode',
    },
    {
      displayName: 'Authorization URL',
      name: 'authUrl',
      type: 'hidden',
      default: 'https://accounts.google.com/o/oauth2/v2/auth',
    },
    {
      displayName: 'Access Token URL',
      name: 'accessTokenUrl',
      type: 'hidden',
      default: 'https://oauth2.googleapis.com/token',
    },
    {
      displayName: 'Auth URI Query Parameters',
      name: 'authQueryParameters',
      type: 'hidden',
      default: 'access_type=offline&prompt=consent',
    },
    {
      displayName: 'Authentication',
      name: 'authentication',
      type: 'hidden',
      default: 'header',
    },
    {
      displayName: 'Scope',
      name: 'scope',
      type: 'hidden',
      default: scopes.join(' '),
    }
  ];
}
