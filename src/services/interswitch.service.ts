import axios from 'axios'

// Correct sandbox base URL from Interswitch docs
const BASE_URL = 'https://qa.interswitchng.com'
const CLIENT_ID = process.env.INTERSWITCH_CLIENT_ID
const CLIENT_SECRET = process.env.INTERSWITCH_CLIENT_SECRET
const TERMINAL_ID = '3PBL0001' // Official sandbox terminal ID

export const getAccessToken = async (): Promise<string> => {
  const credentials = Buffer.from(
    `${CLIENT_ID}:${CLIENT_SECRET}`
  ).toString('base64')

  const response = await axios.post(
    `${BASE_URL}/passport/oauth/token`,
    'grant_type=client_credentials&scope=profile',
    {
      headers: {
        'Authorization': `Basic ${credentials}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      }
    }
  )
  
  console.log('Token generated successfully')
  return response.data.access_token
}

export const purchaseAirtime = async (
  phoneNumber: string,
  amount: number,
  paymentCode: string
) => {
  const token = await getAccessToken()

  // Request reference must start with 1453 per sandbox docs
  const requestRef = `1453${Date.now()}`

  // Phone number must be in format 2348XXXXXXXXX
  const formattedPhone = phoneNumber.startsWith('0')
    ? `234${phoneNumber.slice(1)}`
    : phoneNumber

  console.log('Purchasing airtime:', {
    phoneNumber: formattedPhone,
    amount,
    paymentCode,
    requestRef,
    terminalId: TERMINAL_ID
  })

  const response = await axios.post(
    `${BASE_URL}/quicktellerservice/api/v5/Transactions`,
    {
      TerminalId: TERMINAL_ID,
      paymentCode,
      customerId: formattedPhone,
      customerMobile: formattedPhone,
      customerEmail: 'customer@movepal.com',
      amount: amount.toString(),
      requestReference: requestRef,
    },
    {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'TerminalID': TERMINAL_ID,
      }
    }
  )

  console.log('Airtime response:', response.data)
  return { ...response.data, requestReference: requestRef }
}
