console.log("main.jsx loaded");
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './pages/App/App.jsx'
import { ChakraProvider } from '@chakra-ui/react'
import './theme/index.css'
import theme from './theme/theme.js'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ChakraProvider theme={theme}>
      <App />
    </ChakraProvider>
  </React.StrictMode>,
)
