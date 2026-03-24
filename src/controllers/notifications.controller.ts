import { Request, Response } from 'express'
import { notificationsService } from '../services/notifications.service'

export const notificationsController = {
  async send(req: Request, res: Response) {
    try {
      const { title, body, data } = req.body
      const result = await notificationsService.sendToAll(title, body, data)
      res.json(result)
    } catch (err: any) {
      res.status(500).json({ error: err.message })
    }
  }
}
