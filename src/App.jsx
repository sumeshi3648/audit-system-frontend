import './App.css'
import ReportGenerator from './components/ReportGenerator'
import RequirementsViewer from './components/RequirementsViewer'

function App() {
  return (
    <div className="page">
      <h1 className="title">University Audit System</h1>
      <ReportGenerator />
      <RequirementsViewer />
    </div>
  )
}

export default App
