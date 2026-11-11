import { BrowserRouter } from 'react-router-dom'
import AppRoutes from './routes/AppRoutes.jsx'
import { AuthProvider } from './context/AuthContext.jsx'
import AiHelpAssistant from './components/common/AiHelpAssistant.jsx'

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
        <AiHelpAssistant />
      </AuthProvider>
    </BrowserRouter>
  )
}
