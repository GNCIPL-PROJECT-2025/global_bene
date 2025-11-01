import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import { store } from './redux/store/store'
import { checkAuthStatus } from './redux/slice/auth.slice'
import { ThemeProvider } from './context/ThemeContext'
import './index.css'
import App from './App.jsx'

// Check auth status on app load
store.dispatch(checkAuthStatus());

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ThemeProvider>
      <Provider store={store}>
        <App />
      </Provider>
    </ThemeProvider>
  </StrictMode>,
)
