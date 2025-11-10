import React, { useEffect, useState } from 'react'
import { getHealth, API_URL } from '../utils/api'

export default function HealthCheck() {
  const [status, setStatus] = useState('Checking backend...')
  const [ok, setOk] = useState(null)

  useEffect(() => {
    getHealth()
      .then((data) => { setOk(data.ok !== false); setStatus(data.message || 'Connected') })
      .catch((e) => { setOk(false); setStatus(e.message) })
  }, [])

  return (
    <div className={`mt-2 text-sm ${ok ? 'text-primary' : 'text-red-600'}`}>
      API: {API_URL} — {status}
    </div>
  )
}
