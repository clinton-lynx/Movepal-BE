import { Router } from 'express'
import { notificationsController } from '../controllers/notifications.controller'
import { authenticate } from '../middleware/auth.middleware'

const router = Router()
router.post('/send', authenticate, notificationsController.send)
export default router
