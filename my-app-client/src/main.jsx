import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { RouterProvider } from 'react-router-dom'
import router from './routers/router.jsx'
import AuthProider from './contects/AuthProider.jsx'
import { GoogleOAuthProvider } from '@react-oauth/google'

// Get Google Client ID from environment variables
const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId={googleClientId}>
      <AuthProider>
        <RouterProvider router={router} />
      </AuthProider>
    </GoogleOAuthProvider>
  </React.StrictMode>
)