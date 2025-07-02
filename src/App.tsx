import { ConfigProvider } from 'antd'
import './App.css'
import DashboardDesigner from './components/DashboardDesigner'
import { DashboardProvider } from './contexts/DashboardContext'

function App() {
  return (
    <ConfigProvider>
      <DashboardProvider>
        <DashboardDesigner />
      </DashboardProvider>
    </ConfigProvider>
  )
}

export default App
