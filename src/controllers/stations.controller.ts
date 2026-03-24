import { Request, Response } from 'express'
import { stationsService } from '../services/stations.service'
import { sendSuccess, sendError } from '../utils/response'

export const stationsController = {
  async getAll(req: Request, res: Response) {
    try {
      const stations = await stationsService.getAll()
      sendSuccess(res, { stations, count: stations.length }, 'Stations fetched successfully')
    } catch (err: any) {
      sendError(res, 'Failed to fetch stations', 500)
    }
  },

  async getById(req: Request, res: Response) {
    try {
      const station = await stationsService.getById(req.params.id)
      if (!station) {
        return sendError(res, 'Station not found', 404, 'NOT_FOUND')
      }
      sendSuccess(res, station, 'Station found')
    } catch (err: any) {
      if (err.message?.includes('not found')) {
        return sendError(res, 'Station not found', 404, 'NOT_FOUND')
      }
      sendError(res, 'Failed to fetch station', 500)
    }
  },

  async getPrediction(req: Request, res: Response) {
    try {
      const prediction = await stationsService
        .getPrediction(req.params.id)
      if (!prediction) {
        return sendError(res, 'Prediction service unavailable', 503, 'ML_SERVICE_DOWN')
      }
      sendSuccess(res, prediction, 'Prediction fetched')
    } catch (err: any) {
      sendError(res, 'Prediction service unavailable', 503, 'ML_SERVICE_DOWN')
    }
  },

  async report(req: Request, res: Response) {
    try {
      const { status } = req.body
      const { id } = req.params

      if (!req.user) {
        return sendError(res, 'Authentication required', 401, 'UNAUTHORIZED')
      }

      const userId = req.user.id

      if (!['heavy', 'moderate', 'flowing'].includes(status)) {
        return sendError(res, 'Invalid status value', 400, 'INVALID_STATUS')
      }

      const { reportsService } = await import(
        '../services/reports.service'
      )
      const result = await reportsService.submitReport(
        id, status, userId
      )
      sendSuccess(res, { newStatus: result.newStatus || status }, 'Report submitted successfully')
    } catch (err: any) {
      if (err.message?.includes('not found')) {
        return sendError(res, 'Station not found', 404, 'NOT_FOUND')
      }
      sendError(res, 'Failed to submit report', 500)
    }
  }
}
