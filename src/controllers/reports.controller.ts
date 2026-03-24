import { Request, Response } from 'express'
import { reportsService } from '../services/reports.service'

export const reportsController = {
  async submit(req: Request, res: Response) {
    try {
      const { stationId, status } = req.body
      const userId = req.user!.id
      const result = await reportsService.submitReport(stationId, status, userId)
      res.json(result)
    } catch (err: any) {
      res.status(500).json({ error: err.message })
    }
  }
}
