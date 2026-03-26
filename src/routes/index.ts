import { Router } from 'express'
import authRoutes from './auth.routes'
import stationsRoutes from './stations.routes'
import notificationsRoutes from './notifications.routes'
import mlRoutes from './ml.routes'
import rewardsRoutes from './rewards.routes'

const router = Router()
router.use('/auth', authRoutes)
router.use('/stations', stationsRoutes)
router.use('/notifications', notificationsRoutes)
router.use('/ml', mlRoutes)
router.use('/rewards', rewardsRoutes)
export default router
