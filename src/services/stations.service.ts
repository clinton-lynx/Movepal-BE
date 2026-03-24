import { db } from '../config/firebase'
import axios from 'axios'

export const stationsService = {
  async getAll() {
    const snapshot = await db.collection('stations').get()
    return snapshot.docs.map(doc => ({ 
      id: doc.id, 
      ...doc.data() 
    }))
  },

  async getById(id: string) {
    const doc = await db.collection('stations').doc(id).get()
    if (!doc.exists) throw new Error('Station not found')
    return { id: doc.id, ...doc.data() }
  },

  async getPrediction(stationId: string) {
    try {
      const response = await axios.get(
        `${process.env.ML_SERVICE_URL}/predict/now/${stationId}`,
        { timeout: 3000 }
      )
      return response.data
    } catch {
      return null // ML service unavailable — graceful fallback
    }
  }
}
