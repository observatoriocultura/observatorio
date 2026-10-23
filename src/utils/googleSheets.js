import Papa from 'papaparse'

export const getGoogleSheetCsvUrl = ({ fileId, gid }) => {
  if (!fileId) {
    throw new Error('fileId is required to build a Google Sheets CSV URL.')
  }

  const url = new URL(`https://docs.google.com/spreadsheets/d/${fileId}/export`)
  url.searchParams.set('format', 'csv')

  if (gid !== undefined && gid !== null && gid !== '') {
    url.searchParams.set('gid', gid)
  }

  return url.toString()
}

export const fetchGoogleSheetCsv = async ({ fileId, gid, requiredHeaders = [] }) => {
  const url = getGoogleSheetCsvUrl({ fileId, gid })
  const response = await fetch(url)

  if (!response.ok) {
    throw new Error(`Could not fetch Google Sheets CSV. Status: ${response.status}`)
  }

  const csv = await response.text()

  if (/^\s*<(?:!doctype\s+html|html)\b/i.test(csv)) {
    throw new Error('Google Sheets returned HTML instead of CSV. Check public read access.')
  }

  const result = Papa.parse(csv, {
    header: true,
    skipEmptyLines: 'greedy',
    transformHeader: (header) => header.replace(/^\uFEFF/, '').trim(),
  })

  if (result.errors.length > 0) {
    throw new Error(`Could not parse Google Sheets CSV. ${result.errors[0].message}`)
  }

  const missingHeaders = requiredHeaders.filter((header) => !result.meta.fields?.includes(header))

  if (missingHeaders.length > 0) {
    throw new Error(`Google Sheets CSV is missing required headers: ${missingHeaders.join(', ')}`)
  }

  return result.data
}
