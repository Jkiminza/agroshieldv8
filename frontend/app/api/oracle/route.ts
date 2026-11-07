import { NextRequest, NextResponse } from 'next/server'
import { fetchRainfallData, fetchWeatherByLocation, checkRainfallTrigger, generateReportHash } from '@/lib/weather-oracle'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const lat = searchParams.get('lat')
  const lon = searchParams.get('lon')
  const location = searchParams.get('location')
  const policyId = searchParams.get('policyId')
  const threshold = searchParams.get('threshold')

  try {
    let weatherData
    let latitude: number
    let longitude: number

    if (location) {
      weatherData = await fetchWeatherByLocation(location)
      latitude = weatherData.latitude
      longitude = weatherData.longitude
    } else {
      if (!lat || !lon) {
        return NextResponse.json({ error: 'Missing lat/lon or location parameters' }, { status: 400 })
      }
      latitude = parseFloat(lat)
      longitude = parseFloat(lon)
      if (isNaN(latitude) || isNaN(longitude)) {
        return NextResponse.json({ error: 'Invalid lat/lon' }, { status: 400 })
      }
      weatherData = await fetchRainfallData(latitude, longitude)
    }

    if (policyId && threshold) {
      const triggerResult = await checkRainfallTrigger(
        parseInt(policyId),
        parseFloat(threshold),
        latitude,
        longitude
      )

      return NextResponse.json({
        ...weatherData,
        trigger: triggerResult,
        reportHash: triggerResult.reportHash
      })
    }

    return NextResponse.json(weatherData)
  } catch (error) {
    console.error('Oracle error:', error)
    return NextResponse.json({ error: 'Failed to fetch weather data' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { policyId, latitude, longitude, location, threshold } = body

    let lat = latitude
    let lon = longitude
    if (location && (!lat || !lon)) {
      const geo = await (await import('@/lib/weather-oracle')).geocodeLocation(location)
      if (geo) { lat = geo.latitude; lon = geo.longitude }
    }

    if (!lat || !lon || !policyId || !threshold) {
      return NextResponse.json({
        error: 'Missing required fields: policyId, latitude/longitude (or location), threshold'
      }, { status: 400 })
    }

    const result = await checkRainfallTrigger(policyId, threshold, lat, lon)
    
    return NextResponse.json({
      policyId,
      latitude,
      longitude,
      threshold,
      ...result,
      timestamp: Date.now()
    })
  } catch (error) {
    console.error('Oracle trigger check error:', error)
    return NextResponse.json({ error: 'Failed to check trigger' }, { status: 500 })
  }
}