import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter as Router } from "react-router-dom";
import { Amplify } from 'aws-amplify';
import "bootstrap/dist/css/bootstrap.min.css";
import './index.css'
import {App} from './App.tsx';
import {config} from './config.ts';


Amplify.configure({
  Auth: {
    Cognito: {
      userPoolId: config.cognito.USER_POOL_ID,
      identityPoolId: config.cognito.IDENTITY_POOL_ID,
      userPoolClientId: config.cognito.APP_CLIENT_ID,
    }
  },
  API: {
    REST: {
      endpoint: config.apiGateway.URL,
      region: config.apiGateway.REGION,
    }
  },
});


createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Router>
      <App />
    </Router>
  </StrictMode>,
)
