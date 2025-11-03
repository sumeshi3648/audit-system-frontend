import { useState } from 'react'
import '../assets/RequirementsViewer.css'
import RequirementModal from './RequirementsModal'

const majorsBySchool = {
  SEDS: ['Computer Science', 'Robotics', 'Electrical Engineering'],
  SMG: ['Economics', 'Finance'],
  SSH: ['Political Science', 'History'],
  NUSOM: ['Medicine', 'Nursing']
}

export default function RequirementsViewer() {
  const [activeMajor, setActiveMajor] = useState(null)

  return (
    <div className="requirements-viewer">
      {Object.entries(majorsBySchool).map(([school, majors]) => (
        <div key={school} className="school-section">
          <details open>
            <summary className="school-title">{school}</summary>
            <div className="majors-row">
              {majors.map(major => (
                <button
                  key={major}
                  className="major-btn"
                  onClick={() => setActiveMajor({ school, major, degree: 'BSc' })}
                >
                  {major}
                </button>
              ))}
            </div>
          </details>
        </div>
      ))}

        {activeMajor && (
        <RequirementModal
            major={activeMajor.major}
            school={activeMajor.school}
            degree={activeMajor.degree}
            onClose={() => setActiveMajor(null)}
        />
        )}

    </div>
  )
}
