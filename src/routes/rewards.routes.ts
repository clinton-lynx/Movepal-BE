import { Router } from 'express'
import { rewardsController } from '../controllers/rewards.controller'
import { authenticate } from '../middleware/auth.middleware'

const router = Router()

router.get('/options', rewardsController.getOptions)
router.get('/balance', authenticate, rewardsController.getBalance)
router.post('/redeem', authenticate, rewardsController.redeem)

export default router
