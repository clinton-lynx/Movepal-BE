import { Router } from 'express'
import authRoutes from './auth.routes'
import stationsRoutes from './stations.routes'
import notificationsRoutes from './notifications.routes'

const router = Router()
router.use('/auth', authRoutes)
router.use('/stations', stationsRoutes)
router.use('/notifications', notificationsRoutes)
export default router
