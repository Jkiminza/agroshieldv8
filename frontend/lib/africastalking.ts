export interface SMSMessage {
  to: string
  message: string
  from?: string
}

export interface USSDSession {
  sessionId: string
  phoneNumber: string
  text: string
  serviceCode: string
}

export interface USSDResponse {
  text: string
  endSession: boolean
}

const AFRICASTALKING_USERNAME = process.env.AFRICASTALKING_USERNAME || 'sandbox'
const AFRICASTALKING_API_KEY = process.env.AFRICASTALKING_API_KEY
const AFRICASTALKING_BASE_URL = AFRICASTALKING_USERNAME === 'sandbox' 
  ? 'https://api.sandbox.africastalking.com' 
  : 'https://api.africastalking.com'

export async function sendSMS(message: SMSMessage): Promise<{ success: boolean; messageId?: string; error?: string }> {
  if (!AFRICASTALKING_API_KEY || AFRICASTALKING_API_KEY === 'your_sandbox_api_key_here') {
    console.log('[SMS Mock] Would send:', message)
    return { success: true, messageId: `mock-${Date.now()}` }
  }

  try {
    const formData = new URLSearchParams()
    formData.append('username', AFRICASTALKING_USERNAME)
    formData.append('to', message.to)
    formData.append('message', message.message)
    if (message.from) {
      formData.append('from', message.from)
    }

    const response = await fetch(`${AFRICASTALKING_BASE_URL}/version1/messaging`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json',
        'apiKey': AFRICASTALKING_API_KEY,
      },
      body: formData.toString(),
    })

    const data = await response.json()
    
    if (data.SMSMessageData?.Recipients?.[0]?.statusCode === 101) {
      return { 
        success: true, 
        messageId: data.SMSMessageData.Recipients[0].messageId 
      }
    }
    
    return { 
      success: false, 
      error: data.SMSMessageData?.Recipients?.[0]?.status || 'Failed to send SMS' 
    }
  } catch (error) {
    console.error('Africa\'s Talking SMS error:', error)
    return { success: false, error: String(error) }
  }
}

export async function sendBulkSMS(messages: SMSMessage[]): Promise<{ success: boolean; results: any[] }> {
  const results = await Promise.all(messages.map(msg => sendSMS(msg)))
  return {
    success: results.every(r => r.success),
    results
  }
}

export function generatePolicyPurchaseSMS(policyId: number, coverageAmount: string, premium: string): string {
  return `AgroShield: Policy #${policyId} confirmed! Coverage: ${coverageAmount}. Premium paid: ${premium}. Your crops are now protected against drought.`
}

export function generatePayoutSMS(policyId: number, amount: string): string {
  return `AgroShield: Payout triggered for Policy #${policyId}! Amount: ${amount}. Funds sent to your wallet. Stay resilient!`
}

export function generateWeatherAlertSMS(region: string, rainfallMm: number, threshold: number): string {
  return `AgroShield Alert: Rainfall in ${region} is ${rainfallMm}mm (threshold: ${threshold}mm). Your policy may trigger soon.`
}

export function generateWelcomeSMS(name: string): string {
  return `Welcome to AgroShield, ${name}! Your crops are now protected with parametric insurance. Get instant payouts when drought strikes.`
}

export function handleUSSDRequest(session: USSDSession): USSDResponse {
  const { text, phoneNumber } = session
  const inputs = text.split('*').filter(Boolean)
  const level = inputs.length

  if (level === 0 || text === '') {
    return {
      text: `CON Welcome to AgroShield\n\nWelcome to AgroShield! Parametric crop insurance on-chain.\n\n- Buy coverage and get instant payouts when drought strikes\n- Weather alerts via SMS/USSD\n\n1. Buy Coverage\n2. My Policies\n3. Check Payouts\n4. Weather Alerts\n5. Help`,
      endSession: false
    }
  }

  const mainMenu = inputs[0]

  switch (mainMenu) {
    case '1':
      return handleBuyCoverage(inputs, phoneNumber)
    case '2':
      return handleMyPolicies(inputs, phoneNumber)
    case '3':
      return handleCheckPayouts(inputs, phoneNumber)
    case '4':
      return handleWeatherAlerts(inputs, phoneNumber)
    case '5':
      return {
        text: `END AgroShield Help:\n- Dial *789*12350# for menu\n- Visit app.agroshield.com\n- Call +254 700 000 000\n- Email support@agroshield.com`,
        endSession: true
      }
    default:
      return {
        text: `END Invalid option. Dial *789*12350# to try again.`,
        endSession: true
      }
  }
}

function handleBuyCoverage(inputs: string[], phoneNumber: string): USSDResponse {
  const level = inputs.length

  if (level === 1) {
    return {
      text: `CON Select Crop:\n1. Maize\n2. Beans\n3. Sorghum\n4. Millet\n0. Back`,
      endSession: false
    }
  }

  if (level === 2) {
    const crop = inputs[1]
    const crops: Record<string, string> = {
      '1': 'Maize',
      '2': 'Beans', 
      '3': 'Sorghum',
      '4': 'Millet'
    }
    if (!crops[crop]) {
      return { text: `END Invalid crop selection.`, endSession: true }
    }
    return {
      text: `CON ${crops[crop]} selected.\nEnter coverage amount (KES):\n1. 50,000\n2. 100,000\n3. 250,000\n4. 500,000\n0. Back`,
      endSession: false
    }
  }

  if (level === 3) {
    const amount = inputs[2]
    const amounts: Record<string, string> = {
      '1': '50000',
      '2': '100000',
      '3': '250000',
      '4': '500000'
    }
    if (!amounts[amount]) {
      return { text: `END Invalid amount.`, endSession: true }
    }
    return {
      text: `CON Coverage: KES ${parseInt(amounts[amount]).toLocaleString()}\nEst. Premium: KES ${Math.round(parseInt(amounts[amount]) * 0.05).toLocaleString()}\nConfirm purchase?\n1. Yes\n2. No`,
      endSession: false
    }
  }

  if (level === 4) {
    if (inputs[3] === '1') {
      return {
        text: `END Policy purchased successfully! Policy ID: AGS-${Date.now().toString().slice(-6)}. You'll receive SMS confirmation.`,
        endSession: true
      }
    }
    return { text: `END Purchase cancelled.`, endSession: true }
  }

  return { text: `END Invalid selection.`, endSession: true }
}

function handleMyPolicies(inputs: string[], phoneNumber: string): USSDResponse {
  return {
    text: `END Your Policies:\n1. AGS-2024-001 - Maize - KES 250,000 - Active\n2. AGS-2024-002 - Beans - KES 100,000 - Active\n\nDial *789*12350*2# to refresh.`,
    endSession: true
  }
}

function handleCheckPayouts(inputs: string[], phoneNumber: string): USSDResponse {
  return {
    text: `END Recent Payouts:\n1. AGS-2024-001 - KES 250,000 - Paid Mar 15, 2024\n2. AGS-2023-045 - KES 100,000 - Paid Oct 10, 2023\n\nNo pending payouts.`,
    endSession: true
  }
}

function handleWeatherAlerts(inputs: string[], phoneNumber: string): USSDResponse {
  return {
    text: `END Weather for your region:\nCurrent: 45mm (30 days)\nThreshold: 25mm\nStatus: Above threshold ✓\n\nNext check in 24 hours.`,
    endSession: true
  }
}

export async function sendPolicyConfirmationSMS(phoneNumber: string, policyId: number, coverage: string, premium: string) {
  return sendSMS({
    to: phoneNumber,
    message: generatePolicyPurchaseSMS(policyId, coverage, premium)
  })
}

export async function sendPayoutNotificationSMS(phoneNumber: string, policyId: number, amount: string) {
  return sendSMS({
    to: phoneNumber,
    message: generatePayoutSMS(policyId, amount)
  })
}

export async function sendWeatherAlertSMS(phoneNumber: string, region: string, rainfall: number, threshold: number) {
  return sendSMS({
    to: phoneNumber,
    message: generateWeatherAlertSMS(region, rainfall, threshold)
  })
}