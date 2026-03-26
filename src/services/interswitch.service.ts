import axios from 'axios'

const BASE_URL = process.env.INTERSWITCH_BASE_URL || 
  'https://sandbox.interswitchng.com'
const CLIENT_ID = process.env.INTERSWITCH_CLIENT_ID
const CLIENT_SECRET = process.env.INTERSWITCH_CLIENT_SECRET

// Get Interswitch OAuth access token
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
  console.log('Interswitch access token successfully generated')
  return response.data.access_token
}

// Get list of airtime billers
export const getAirtimeBillers = async () => {
  const token = await getAccessToken()
  
  const response = await axios.get(
    `${BASE_URL}/quicktellerservice/api/v5/services`,
    {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'TerminalID': process.env.INTERSWITCH_TERMINAL_ID || 'default',
      },
      params: { categoryid: 1 } // 1 = Airtime category
    }
  )
  return response.data
}

// Purchase airtime for a phone number
export const purchaseAirtime = async (
  phoneNumber: string,
  amount: number,      // in kobo (₦100 = 10000 kobo)
  billerId: string,    // biller ID from getAirtimeBillers
  paymentCode: string  // payment code from biller
) => {
  const token = await getAccessToken()

  const requestRef = `MOVEPAL_${Date.now()}_${Math.random()
    .toString(36).substr(2, 9).toUpperCase()}`

  const response = await axios.post(
    `${BASE_URL}/quicktellerservice/api/v5/payments`,
    {
      paymentCode,
      customerId: phoneNumber,
      customerMobile: phoneNumber,
      amount: amount.toString(),
      requestReference: requestRef,
      terminalId: process.env.INTERSWITCH_TERMINAL_ID || 'default',
    },
    {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      }
    }
  )
  return { ...response.data, requestReference: requestRef }
}
