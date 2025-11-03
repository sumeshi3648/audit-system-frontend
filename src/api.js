import { API_BASE_URL, AUTH } from './config'

export async function uploadAuditCsvAndDownloadZip(params) {
  const { file, year, degree, school, major } = params;

  const url = `${API_BASE_URL}/audit`;
  const formData = new FormData();

  if (file) formData.append('csv', file);
  formData.append('csvYear', String(year || new Date().getFullYear()));

  //hardcoded
  const csvConfig = {
    studentIds: [[0], [1, 2]],
    courseIds: [[8, 9], [10]],
    creditHours: 12,
    grade: 13,
    yearOfStudy: 3,
    degree: 6,
    school: 7,
    major: 4,
  };
  formData.append('csvConfig', JSON.stringify(csvConfig));

  const requirements = [
    { year, degree, school, major },
  ];
  formData.append('requirements', JSON.stringify(requirements));

  const headers = new Headers();
  if (AUTH.scheme === 'bearer') {
    if (AUTH.token) headers.set('Authorization', `Bearer ${AUTH.token}`);
  } else if (AUTH.scheme === 'basic') {
    const encoded = btoa(`${AUTH.user}:${AUTH.pass}`);
    headers.set('Authorization', `Basic ${encoded}`);
  }

  const response = await fetch(url, {
    method: 'POST',
    body: formData,
    headers,
  });

  if (!response.ok) {
    let details = '';
    try {
      const data = await response.json();
      details = data?.message || JSON.stringify(data);
    } catch {
      try {
        details = await response.text();
      } catch {
        details = '';
      }
    }
    throw new Error(`Request failed (${response.status}): ${details}`);
  }

  const blob = await response.blob();
  const contentDisposition = response.headers.get('content-disposition') || '';
  const filenameMatch = /filename\*=UTF-8''([^;]+)|filename="?([^";]+)"?/i.exec(contentDisposition);
  const fallbackName = `audit-report.zip`;
  const filename = decodeURIComponent(filenameMatch?.[1] || filenameMatch?.[2] || fallbackName);

  return { blob, filename };
}


export function downloadBlob({ blob, filename }) {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename || 'download.zip'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
export { API_BASE_URL, AUTH }

