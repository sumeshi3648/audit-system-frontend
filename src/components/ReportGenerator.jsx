// components/ReportGenerator.jsx
import { useMemo, useRef, useState } from 'react'
import { uploadAuditCsvAndDownloadZip, downloadBlob } from '../api'

export default function ReportGenerator() {
  const fileInputRef = useRef(null)
  const [selectedFile, setSelectedFile] = useState(null)
  const [level, setLevel] = useState('')
  const [school, setSchool] = useState('')
  const [major, setMajor] = useState('')
  const [year, setYear] = useState(new Date().getFullYear())
  const [isLoading, setIsLoading] = useState(false)

  const isReady = Boolean(selectedFile && level && school && major)

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
    return (schoolsByLevel[level] || []).map(s => ({ value: s, label: s }))
  }, [level, schoolsByLevel])

  const majorOptions = useMemo(() => {
    if (!school) return []
    return (majorsBySchool[school] || []).map(m => ({ value: m, label: m }))
  }, [school, majorsBySchool])

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
    <div className="toolbar">
      <input
        ref={fileInputRef}
        type="file"
        accept=".csv"
        style={{ display: 'none' }}
        onChange={e => setSelectedFile(e.target.files?.[0] || null)}
      />
      <button onClick={() => fileInputRef.current?.click()} className="btn">
        Upload CSV file{selectedFile ? `: ${selectedFile.name}` : ''}
      </button>

      <select value={level} onChange={e => setLevel(e.target.value)} className="select">
        <option value="">Select level of study</option>
        {levelOptions.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>

      <select
        value={school}
        onChange={e => setSchool(e.target.value)}
        disabled={!level || schoolOptions.length === 0}
        className="select"
      >
        <option value="">Select school</option>
        {schoolOptions.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>

      <select
        value={major}
        onChange={e => setMajor(e.target.value)}
        disabled={!school || majorOptions.length === 0}
        className="select"
      >
        <option value="">Select major</option>
        {majorOptions.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>

      <select
        value={year}
        onChange={e => setYear(parseInt(e.target.value))}
        className="select"
      >
        {[2025, 2024, 2023].map(y => (
          <option key={y} value={y}>{y}</option>
        ))}
      </select>

      <button onClick={handleGetReport} disabled={!isReady || isLoading} className="btn">
        {isLoading ? 'Generating…' : 'Get report'}
      </button>
    </div>
  )
}
