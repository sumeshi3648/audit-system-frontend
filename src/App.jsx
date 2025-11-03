import { useMemo, useRef, useState } from 'react'
import './App.css'
import { uploadAuditCsvAndDownloadZip, downloadBlob } from './api'

function App() {
  const fileInputRef = useRef(null)

  const [selectedFile, setSelectedFile] = useState(null)
  const [level, setLevel] = useState('')
  const [school, setSchool] = useState('')
  const [major, setMajor] = useState('')
  const [year, setYear] = useState(new Date().getFullYear())

  const levelOptions = [
    { value: 'BSc', label: 'BSc' },
    { value: 'MSc', label: 'MSc' },
    { value: 'PhD', label: 'PhD' },
  ]

  const schoolsByLevel = useMemo(() => ({
    BSc: ['SEDS', 'SSH', 'SMG', 'NUSOM'],
    MSc: ['GSB', 'GSE', 'SEDS'],
    PhD: ['SEDS'],
  }), [])

  const majorsBySchool = useMemo(() => ({
    SEDS: [
      'Computer Science',
      'Robotics',
      'Chemical Engineering',
      'Electrical Engineering',
      'Mechanical Engineering',
      'Civil Engineering',
    ],
  }), [])

  const schoolOptions = useMemo(() => {
    if (!level) return []
    return (schoolsByLevel[level] || []).map((s) => ({ value: s, label: s }))
  }, [level, schoolsByLevel])

  const majorOptions = useMemo(() => {
    if (!school) return []
    const majors = majorsBySchool[school] || []
    return majors.map((m) => ({ value: m, label: m }))
  }, [school, majorsBySchool])


  function handleChooseFileClick() {
    fileInputRef.current?.click()
  }

  function handleFileChange(e) {
    const file = e.target.files?.[0]
    setSelectedFile(file || null)
  }

  function handleLevelChange(e) {
    const nextLevel = e.target.value
    setLevel(nextLevel)
    setSchool('')
    setMajor('')
  }

  function handleSchoolChange(e) {
    const nextSchool = e.target.value
    setSchool(nextSchool)
    setMajor('')
  }

  function handleMajorChange(e) {
    setMajor(e.target.value)
  }

  const [isLoading, setIsLoading] = useState(false)
  const isReady = Boolean(selectedFile && level && school && major)

  async function handleGetReport() {
    if (!isReady) return
    try {
      setIsLoading(true)
      const { blob, filename } = await uploadAuditCsvAndDownloadZip({
        file: selectedFile,
        year,
        degree: level,
        school,
        major,
      })
      downloadBlob({ blob, filename })
    } catch (err) {
      alert(err?.message || 'Failed to get report')
    } finally {
      setIsLoading(false)
    }
  }


  return (
    <div className="page">
      <h1 className="title">University Audit System</h1>
      <div className="toolbar">
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv"
          style={{ display: 'none' }}
          onChange={handleFileChange}
        />
        <button type="button" onClick={handleChooseFileClick} className="btn">
          Upload CSV file{selectedFile ? `: ${selectedFile.name}` : ''}
        </button>

        <select value={level} onChange={handleLevelChange} className="select">
          <option value="">Select level of study</option>
          {levelOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        <select
          value={school}
          onChange={handleSchoolChange}
          disabled={!level || schoolOptions.length === 0}
          className="select"
        >
          <option value="">Select school</option>
          {schoolOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        <select
          value={major}
          onChange={handleMajorChange}
          disabled={!school || majorOptions.length === 0}
          className="select"
        >
          <option value="">Select major</option>
          {majorOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <select
          value={year}
          onChange={(e) => setYear(parseInt(e.target.value))}
          className="select"
        >
          <option value={2024}>2024</option>
          <option value={2025}>2025</option>
          <option value={2023}>2023</option>
        </select>

        <button type="button" onClick={handleGetReport} disabled={!isReady || isLoading} className="btn">
          {isLoading ? 'Generating…' : 'Get report'}
        </button>
      </div>

      
    </div>
  )
}

export default App
