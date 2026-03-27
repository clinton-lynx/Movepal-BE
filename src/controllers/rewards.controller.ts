import { Request, Response } from 'express'
import { db } from '../config/firebase'
import { 
  getAccessToken, 
  purchaseAirtime
} from '../services/interswitch.service'
import { sendSuccess, sendError } from '../utils/response'

// Points to naira conversion
const POINTS_TO_NAIRA: Record<number, number> = {
  50:  100,   // 50 points = ₦100 airtime
  100: 200,   // 100 points = ₦200 airtime
  250: 500,   // 250 points = ₦500 airtime
}

export const rewardsController = {

  // GET /api/rewards/options
  async getOptions(req: Request, res: Response) {
    const options = Object.entries(POINTS_TO_NAIRA).map(
      ([points, naira]) => ({
        points: Number(points),
        naira,
        label: `₦${naira} Airtime`,
        description: `Redeem ${points} points for ₦${naira} airtime on any network`
      })
    )
    return sendSuccess(res, { options }, 'Reward options fetched')
  },

  // GET /api/rewards/balance
  async getBalance(req: Request, res: Response) {
    try {
      const userId = req.user!.id
      const userDoc = await db.collection('users').doc(userId).get()
      const points = userDoc.data()?.points || 0
      return sendSuccess(res, { points }, 'Balance fetched')
    } catch (err: any) {
      return sendError(res, err.message, 500)
    }
  },

  // POST /api/rewards/redeem
  async redeem(req: Request, res: Response) {
    try {
      const userId = req.user!.id
      const { phoneNumber, pointsToRedeem, network } = req.body

      if (!phoneNumber || !pointsToRedeem || !network) {
        return sendError(res, 
          'phoneNumber, pointsToRedeem and network required', 
          400
        )
      }

      const nairaValue = POINTS_TO_NAIRA[pointsToRedeem]
      if (!nairaValue) {
        return sendError(res, 
          'Invalid points amount. Valid: 50, 100, 250', 
          400
        )
      }

      // Check user has enough points
      const userDoc = await db.collection('users').doc(userId).get()
      const currentPoints = userDoc.data()?.points || 0

      if (currentPoints < pointsToRedeem) {
        return sendError(res, 
          `Insufficient points. You have ${currentPoints} points, need ${pointsToRedeem}`,
          400,
          'INSUFFICIENT_POINTS'
        )
      }

      // Network to biller/payment code mapping (sandbox)
      const NETWORK_CODES: Record<string, {
        paymentCode: string
      }> = {
        MTN:      { paymentCode: '10403' },
        AIRTEL:   { paymentCode: '90101' },
        GLO:      { paymentCode: '10903' },
        '9MOBILE':{ paymentCode: '10301' },
      }

      const networkCode = NETWORK_CODES[network.toUpperCase()]
      if (!networkCode) {
        return sendError(res, 
          'Invalid network. Valid: MTN, AIRTEL, GLO, 9MOBILE', 
          400
        )
      }

      // Call Interswitch Bills Payment API
      const result = await purchaseAirtime(
        phoneNumber,
        nairaValue * 100, // kobo
        networkCode.paymentCode
      )

      // Deduct points from user
      await db.collection('users').doc(userId).update({
        points: currentPoints - pointsToRedeem,
        lastRedemption: new Date().toISOString(),
      })

      // Log the transaction
      await db.collection('redemptions').add({
        userId,
        phoneNumber,
        pointsRedeemed: pointsToRedeem,
        nairaValue,
        network,
        interswitchRef: result.requestReference,
        status: 'success',
        createdAt: new Date().toISOString(),
      })

      return sendSuccess(res, {
        pointsRedeemed: pointsToRedeem,
        remainingPoints: currentPoints - pointsToRedeem,
        nairaValue,
        phoneNumber,
        network,
        reference: result.requestReference,
      }, `₦${nairaValue} airtime sent to ${phoneNumber}!`)

    } catch (err: any) {
      console.error('Redemption error full:', 
        JSON.stringify(err.response?.data, null, 2))
      console.error('Status:', err.response?.status)
      return sendError(res, 
        'Airtime purchase failed. Please try again.',
        500,
        'INTERSWITCH_ERROR'
      )
    }
  },

  // POST /api/rewards/add-points (internal — called when user reports)
  async addPoints(userId: string, points: number): Promise<void> {
    const userDoc = await db.collection('users').doc(userId).get()
    const current = userDoc.data()?.points || 0
    await db.collection('users').doc(userId).update({
      points: current + points
    })
  }
}
