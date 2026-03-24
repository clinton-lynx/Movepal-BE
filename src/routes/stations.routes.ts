import { Router } from 'express'
import { stationsController } from '../controllers/stations.controller'
import { authenticate } from '../middleware/auth.middleware'

const router = Router()
router.get('/', stationsController.getAll)
router.get('/:id', stationsController.getById)
router.get('/:id/predict', stationsController.getPrediction)
router.post('/:id/report', authenticate, stationsController.report)
export default router
