import { parseEther, formatEther, keccak256, toBytes } from 'viem'

export interface WeatherData {
  latitude: number
  longitude: number
  locationName?: string
  rainfallMm: number
  temperatureC?: number
  humidity?: number
  windSpeedMs?: number
  description?: string
  timestamp: number
  source: string
}

export interface RainfallReport {
  policyId: number
  rainfallMm: number
  reportHash: `0x${string}`
  timestamp: number
}

const WEATHER_API_KEY = process.env.WEATHER_API_KEY
const WEATHER_API_BASE = 'https://api.openweathermap.org/data/2.5'

export async function fetchRainfallData(latitude: number, longitude: number): Promise<WeatherData> {
  if (!WEATHER_API_KEY) {
    return mockRainfallData(latitude, longitude)
  }

  try {
    const response = await fetch(
      `${WEATHER_API_BASE}/weather?lat=${latitude}&lon=${longitude}&appid=${WEATHER_API_KEY}&units=metric`
    )
    
    if (!response.ok) {
      throw new Error(`Weather API error: ${response.status}`)
    }
    
    const data = await response.json()
    const rainfallMm = data.rain?.['1h'] || data.rain?.['3h'] || 0
    
    return {
      latitude,
      longitude,
      locationName: data.name,
      rainfallMm,
      temperatureC: data.main?.temp,
      humidity: data.main?.humidity,
      windSpeedMs: data.wind?.speed,
      description: data.weather?.[0]?.description,
      timestamp: Date.now(),
      source: 'openweathermap'
    }
  } catch (error) {
    console.error('Weather API error:', error)
    return mockRainfallData(latitude, longitude)
  }
}

export async function fetchHistoricalRainfall(
  latitude: number, 
  longitude: number, 
  days: number = 30
): Promise<WeatherData[]> {
  if (!WEATHER_API_KEY) {
    return Array.from({ length: days }, (_, i) => mockRainfallData(latitude, longitude, i))
  }

  try {
    const endDate = Math.floor(Date.now() / 1000)
    const startDate = endDate - (days * 24 * 60 * 60)
    
    const response = await fetch(
      `${WEATHER_API_BASE}/onecall/timemachine?lat=${latitude}&lon=${longitude}&dt=${startDate}&appid=${WEATHER_API_KEY}&units=metric`
    )
    
    if (!response.ok) {
      throw new Error(`Weather API error: ${response.status}`)
    }
    
    const data = await response.json()
    
    return data.hourly?.map((hour: any) => ({
      latitude,
      longitude,
      rainfallMm: hour.rain?.['1h'] || 0,
      timestamp: hour.dt * 1000,
      source: 'openweathermap'
    })) || [mockRainfallData(latitude, longitude)]
  } catch (error) {
    console.error('Historical weather API error:', error)
    return Array.from({ length: days }, (_, i) => mockRainfallData(latitude, longitude, i))
  }
}

function mockRainfallData(latitude: number, longitude: number, dayOffset: number = 0): WeatherData {
  const baseRainfall = 15 + Math.random() * 20
  const variation = (Math.random() - 0.5) * 10
  
  return {
    latitude,
    longitude,
    locationName: 'Mock location',
    rainfallMm: Math.max(0, Math.round(baseRainfall + variation)),
    temperatureC: 22 + Math.random() * 6,
    humidity: 60 + Math.round(Math.random() * 20),
    windSpeedMs: 2 + Math.random() * 4,
    description: 'scattered clouds',
    timestamp: Date.now() - (dayOffset * 24 * 60 * 60 * 1000),
    source: 'mock'
  }
}

export function generateReportHash(data: RainfallReport): `0x${string}` {
  return keccak256(toBytes(JSON.stringify(data)))
}

export async function geocodeLocation(query: string): Promise<{ latitude: number; longitude: number; name: string } | null> {
  if (!WEATHER_API_KEY || !query) return null
  try {
    const response = await fetch(
      `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(query)}&limit=1&appid=${WEATHER_API_KEY}`
    )
    if (!response.ok) return null
    const data = await response.json()
    if (!Array.isArray(data) || data.length === 0) return null
    return { latitude: data[0].lat, longitude: data[0].lon, name: data[0].name }
  } catch (error) {
    console.error('Geocoding error:', error)
    return null
  }
}

export async function fetchWeatherByLocation(location: string): Promise<WeatherData> {
  const geo = await geocodeLocation(location)
  if (!geo) {
    // Fall back to Nairobi
    return fetchRainfallData(DEFAULT_LAT, DEFAULT_LON)
  }
  const data = await fetchRainfallData(geo.latitude, geo.longitude)
  return { ...data, locationName: geo.name }
}

const DEFAULT_LAT = -1.286389
const DEFAULT_LON = 36.817223

export async function checkRainfallTrigger(
  policyId: number,
  threshold: number,
  latitude: number,
  longitude: number
): Promise<{ triggered: boolean; rainfallMm: number; reportHash: `0x${string}` }> {
  const weatherData = await fetchRainfallData(latitude, longitude)
  const triggered = weatherData.rainfallMm < threshold
  
  const report: RainfallReport = {
    policyId,
    rainfallMm: weatherData.rainfallMm,
    reportHash: '0x0000000000000000000000000000000000000000000000000000000000000000',
    timestamp: weatherData.timestamp
  }
  
  report.reportHash = generateReportHash(report)
  
  return {
    triggered,
    rainfallMm: weatherData.rainfallMm,
    reportHash: report.reportHash
  }
}

export function calculateTotalRainfall(weatherData: WeatherData[]): number {
  return weatherData.reduce((sum, day) => sum + day.rainfallMm, 0)
}

export function isBelowThreshold(totalRainfall: number, threshold: number): boolean {
  return totalRainfall < threshold
}