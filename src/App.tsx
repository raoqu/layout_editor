import { ConfigProvider } from 'antd'
import './App.css'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import DashboardDesigner from './components/DashboardDesigner'
import PreviewPage from './pages/PreviewPage'
import { DashboardProvider } from './contexts/DashboardContext'

function App() {
  return (
    <ConfigProvider>
      <DashboardProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<DashboardDesigner />} />
            <Route path="/preview" element={<PreviewPage />} />
          </Routes>
        </BrowserRouter>
      </DashboardProvider>
    </ConfigProvider>
  )
}

export default App
