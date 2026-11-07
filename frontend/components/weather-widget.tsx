'use client'

import { useEffect, useState } from 'react'
import { CloudRain, RefreshCw, Thermometer, Droplets, Wind } from 'lucide-react'

interface WeatherState {
  locationName: string
  rainfallMm: number
  temperatureC?: number
  humidity?: number
  windSpeedMs?: number
  description?: string
  timestamp: number
  loading: boolean
  error: string | null
}

interface Props {
  location?: string | null
}

export function WeatherWidget({ location }: Props) {
  const [state, setState] = useState<WeatherState>({
    locationName: '',
    rainfallMm: 0,
    timestamp: 0,
    loading: true,
    error: null,
  })

  const load = async () => {
    setState((s) => ({ ...s, loading: true, error: null }))
    try {
      const url = location
        ? `/api/oracle?location=${encodeURIComponent(location)}`
        : `/api/oracle?lat=-1.286389&lon=36.817223`
      const res = await fetch(url)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json()
      setState({
        locationName: data.locationName || location || 'Nairobi',
        rainfallMm: data.rainfallMm ?? 0,
        temperatureC: data.temperatureC,
        humidity: data.humidity,
        windSpeedMs: data.windSpeedMs,
        description: data.description,
        timestamp: data.timestamp ?? Date.now(),
        loading: false,
        error: null,
      })
    } catch (e: any) {
      setState((s) => ({ ...s, loading: false, error: e?.message || 'Failed to load weather' }))
    }
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location])

  const title = state.locationName || location || 'Nairobi'

  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#e7f6ee] text-[#16834e]">
            <CloudRain size={20} />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-neutral-950">Live weather — {title}</h3>
            <p className="text-xs text-neutral-500 capitalize">{state.description || '—'}</p>
          </div>
        </div>
        <button
          onClick={load}
          disabled={state.loading}
          className="rounded-lg p-2 text-neutral-500 hover:bg-neutral-100 disabled:opacity-50"
          aria-label="Refresh weather"
        >
          <RefreshCw size={16} className={state.loading ? 'animate-spin' : ''} />
        </button>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-4">
        <div className="rounded-xl bg-[#f7f7f5] p-3">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-neutral-400">Rainfall</p>
          <p className="mt-1 text-lg font-bold text-neutral-950">{state.loading ? '…' : `${state.rainfallMm} mm`}</p>
        </div>
        <div className="rounded-xl bg-[#f7f7f5] p-3">
          <div className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide text-neutral-400"><Thermometer size={12} /> Temp</div>
          <p className="mt-1 text-lg font-bold text-neutral-950">{state.loading ? '…' : `${state.temperatureC?.toFixed(1) ?? '—'}°C`}</p>
        </div>
        <div className="rounded-xl bg-[#f7f7f5] p-3">
          <div className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide text-neutral-400"><Droplets size={12} /> Humidity</div>
          <p className="mt-1 text-lg font-bold text-neutral-950">{state.loading ? '…' : `${state.humidity ?? '—'}%`}</p>
        </div>
        <div className="rounded-xl bg-[#f7f7f5] p-3">
          <div className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide text-neutral-400"><Wind size={12} /> Wind</div>
          <p className="mt-1 text-lg font-bold text-neutral-950">{state.loading ? '…' : `${state.windSpeedMs?.toFixed(1) ?? '—'} m/s`}</p>
        </div>
      </div>

      {state.error && <p className="mt-3 text-sm text-red-600">{state.error}</p>}
      <p className="mt-3 text-xs text-neutral-400">Last updated: {state.loading ? '…' : new Date(state.timestamp).toLocaleTimeString()}</p>
    </div>
  )
}
