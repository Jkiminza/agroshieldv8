import { NextRequest, NextResponse } from 'next/server'
import { 
  sendSMS, 
  sendPolicyConfirmationSMS, 
  sendPayoutNotificationSMS, 
  sendWeatherAlertSMS,
  generatePolicyPurchaseSMS,
  generatePayoutSMS,
  generateWeatherAlertSMS,
  generateWelcomeSMS
} from '@/lib/africastalking'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { type, phoneNumber, ...params } = body

    if (!phoneNumber) {
      return NextResponse.json({ error: 'Phone number required' }, { status: 400 })
    }

    let result

    switch (type) {
      case 'policy_confirmation': {
        const { policyId, coverage, premium } = params
        if (!policyId || !coverage || !premium) {
          return NextResponse.json({ error: 'Missing policyId, coverage, or premium' }, { status: 400 })
        }
        result = await sendPolicyConfirmationSMS(phoneNumber, policyId, coverage, premium)
        break
      }

      case 'payout': {
        const { policyId, amount } = params
        if (!policyId || !amount) {
          return NextResponse.json({ error: 'Missing policyId or amount' }, { status: 400 })
        }
        result = await sendPayoutNotificationSMS(phoneNumber, policyId, amount)
        break
      }

      case 'weather_alert': {
        const { region, rainfall, threshold } = params
        if (!region || rainfall === undefined || threshold === undefined) {
          return NextResponse.json({ error: 'Missing region, rainfall, or threshold' }, { status: 400 })
        }
        result = await sendWeatherAlertSMS(phoneNumber, region, rainfall, threshold)
        break
      }

      case 'welcome': {
        const { name } = params
        result = await sendSMS({
          to: phoneNumber,
          message: generateWelcomeSMS(name || 'Farmer')
        })
        break
      }

      case 'custom': {
        const { message } = params
        if (!message) {
          return NextResponse.json({ error: 'Missing message' }, { status: 400 })
        }
        result = await sendSMS({ to: phoneNumber, message })
        break
      }

      default:
        return NextResponse.json({ error: 'Invalid type. Use: policy_confirmation, payout, weather_alert, welcome, custom' }, { status: 400 })
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error('SMS API error:', error)
    return NextResponse.json({ error: 'Failed to send SMS' }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'AgroShield SMS API',
    endpoints: {
      policy_confirmation: { policyId: 'number', coverage: 'string', premium: 'string' },
      payout: { policyId: 'number', amount: 'string' },
      weather_alert: { region: 'string', rainfall: 'number', threshold: 'number' },
      welcome: { name: 'string' },
      custom: { message: 'string' }
    }
  })
}