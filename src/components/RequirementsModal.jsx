import { useEffect, useState } from 'react'
import '../assets/RequirementsModal.css'
import { API_BASE_URL, AUTH } from '../api'

export default function RequirementModal({ school, major, degree, onClose }) {
  const [year, setYear] = useState(new Date().getFullYear())
  const [requirements, setRequirements] = useState(null)
  const [loading, setLoading] = useState(true)

  const groupedRequirements = requirements ? groupRequirementsByYearSemester(requirements) : {}

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true)
        const url = `${API_BASE_URL}/requirements/${year}/${degree}/${school}/${major}`
    
        const headers = new Headers()
        if (AUTH.scheme === 'bearer' && AUTH.token) {
          headers.set('Authorization', `Bearer ${AUTH.token}`)
        } else if (AUTH.scheme === 'basic' && AUTH.user && AUTH.pass) {
          const encoded = btoa(`${AUTH.user}:${AUTH.pass}`)
          headers.set('Authorization', `Basic ${encoded}`)
        }
    
        const res = await fetch(url, { headers })
        if (!res.ok) {
          throw new Error(`Failed to fetch: ${res.status}`)
        }
    
        const data = await res.json()
        setRequirements(data.requirements)
      } catch (err) {
        setRequirements(null)
        console.error(err)
      } finally {
        setLoading(false)
      }
    }    
    fetchData()
  }, [year, school, degree, major])

  return (
    <div className="requirement-modal">
      <div className="modal-content">
        <div className="modal-header">
          <h2>{`${degree} in ${major}`}</h2>
          <select value={year} onChange={e => setYear(parseInt(e.target.value))}>
            {[2025, 2024, 2023].map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>

        {!loading && requirements && (
          <div className="requirement-tables">
            {Object.entries(groupedRequirements).sort(([a], [b]) => {
                const getYearNum = (label) => parseInt(label);
                return getYearNum(a) - getYearNum(b)
              })
              .map(([yearLabel, semesters]) => (
              <div key={yearLabel} className="year-section">
                <h3>{yearLabel}</h3>
                <div className="semester-pair">
                  {['Fall', 'Spring'].map((sem) => (
                    <table key={sem}>
                      <thead>
                        <tr><th>{sem}</th><th>ECTs</th><th>Latest</th></tr>
                      </thead>
                      <tbody>
                        {(semesters[sem] || []).map((row, i) => (
                          <tr key={i}>
                            <td>{row.course}</td>
                            <td>{row.ects}</td>
                            <td>{row.latest}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}


        <button className="btn" onClick={onClose}>Close</button>
      </div>
    </div>
  )
}

function groupRequirementsByYearSemester(reqs) {
  const grouped = {}

  for (const req of reqs) {
    const parsed = parseExpected(req.expected)
    if (!parsed) continue

    const { yearLabel, semester } = parsed
    if (!yearLabel || !semester) continue

    if (!grouped[yearLabel]) grouped[yearLabel] = { Fall: [], Spring: [] }

    const item = {
      course: req.course?.code || req.name || 'N/A',
      ects: req.course?.credits || '',
      latest: req.latest || '',
    }

    // fallback to "Fall" if semester is not Fall or Spring
    const season = ['Fall', 'Spring'].includes(semester) ? semester : 'Fall'
    grouped[yearLabel][season].push(item)
  }
  return grouped
}

function parseExpected(expected) {
  const match = expected?.match(/^(\d+)\s+year\s+(\w+)$/i)
  if (!match) return null
  const yearNum = parseInt(match[1])
  const semester = match[2]
  const suffix = yearNum === 1 ? 'st' : yearNum === 2 ? 'nd' : yearNum === 3 ? 'rd' : 'th'
  return {
    yearLabel: `${yearNum}${suffix} year`,
    semester
  }
}
