import { Router } from 'express'
import axios from 'axios'
import { sendSuccess, sendError } from '../utils/response'

const router = Router()

router.post('/predict', async (req, res) => {
  try {
    const { lat, lng } = req.body
    if (!lat || !lng) {
      return sendError(res, 'lat and lng required', 400)
    }
    const response = await axios.post(
      `${process.env.ML_SERVICE_URL}/predict/now`,
      { lat, lng },
      { timeout: 5000 }
    )
    return sendSuccess(res, response.data.data, 'Prediction fetched')
  } catch {
    return sendError(res, 'Prediction service unavailable', 503, 'ML_SERVICE_DOWN')
  }
})

export default router
