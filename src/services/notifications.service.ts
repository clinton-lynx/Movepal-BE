import { messaging } from '../config/firebase'

export const notificationsService = {
  async sendToAll(title: string, body: string, data?: any) {
    try {
      // In a real app, you'd probably use a topic or chunked sends
      // This is a placeholder for the notification logic
      console.log('Sending notification to all users:', { title, body })
      return { success: true }
    } catch (error) {
      console.error('Failed to send notifications:', error)
      throw error
    }
  },

  async sendToUser(pushToken: string, title: string, body: string, data?: any) {
    try {
      await messaging.send({
        token: pushToken,
        notification: { title, body },
        data,
      })
      return { success: true }
    } catch (error) {
      console.error('Failed to send notification to user:', error)
      throw error
    }
  }
}
