console.log("main.jsx loaded");
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './pages/App'
import { ChakraProvider } from '@chakra-ui/react'
import { BrowserRouter } from 'react-router-dom'
import './styles/index.css'
import theme from './styles/theme.js'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ChakraProvider theme={theme}>
      <BrowserRouter>
    <App />
      </BrowserRouter>
    </ChakraProvider>
  </React.StrictMode>,
)
