import { BrowserRouter } from 'react-router-dom'
import AppRoutes from './routes/AppRoutes.jsx'
import { AuthProvider } from './context/AuthContext.jsx'
import AiHelpAssistant from './components/common/AiHelpAssistant.jsx'
import ErrorBoundary from './components/common/ErrorBoundary.jsx'

export default function App() {
  return (
    <BrowserRouter>
      <ErrorBoundary>
        <AuthProvider>
          <AppRoutes />
          <AiHelpAssistant />
        </AuthProvider>
      </ErrorBoundary>
    </BrowserRouter>
  )
}
