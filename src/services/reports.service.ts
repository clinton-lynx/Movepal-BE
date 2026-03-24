import { db, messaging } from '../config/firebase'
import { StationStatus } from '../types/station'

export const reportsService = {
  async submitReport(
    stationId: string,
    status: StationStatus,
    userId: string
  ) {
    const stationRef = db.collection('stations').doc(stationId)
    const stationDoc = await stationRef.get()

    if (!stationDoc.exists) {
      throw new Error('Station not found')
    }

    const previousStatus = stationDoc.data()?.status

    // Save report to subcollection
    await stationRef.collection('reports').add({
      status,
      userId,
      createdAt: new Date().toISOString(),
    })

    // Get last 10 reports to calculate consensus status
    const recentReports = await stationRef
      .collection('reports')
      .orderBy('createdAt', 'desc')
      .limit(10)
      .get()

    const statusCounts = { heavy: 0, moderate: 0, flowing: 0 }
    recentReports.docs.forEach(doc => {
      const s = doc.data().status as StationStatus
      statusCounts[s]++
    })

    // Majority vote determines station status
    const newStatus = Object.entries(statusCounts)
      .sort(([,a], [,b]) => b - a)[0][0] as StationStatus

    // Update station
    await stationRef.update({
      status: newStatus,
      reportCount: (recentReports.size),
      lastUpdated: new Date().toISOString(),
    })

    // If station flipped to heavy — send push notification
    if (newStatus === 'heavy' && previousStatus !== 'heavy') {
      await reportsService.notifyHeavyCongestion(
        stationDoc.data()?.name || 'A station'
      )
    }

    return { success: true, newStatus }
  },

  async notifyHeavyCongestion(stationName: string) {
    try {
      // Get all users with push tokens
      const usersSnapshot = await db.collection('users')
        .where('pushToken', '!=', null)
        .get()

      const tokens = usersSnapshot.docs
        .map(doc => doc.data().pushToken)
        .filter(Boolean)

      if (tokens.length === 0) return

      // Send via Firebase Cloud Messaging
      await messaging.sendEachForMulticast({
        tokens,
        notification: {
          title: '🚨 Station Alert — MovePal',
          body: `${stationName} is now heavily congested. Consider an alternative.`,
        },
        data: { stationName },
      })

      console.log(`Push sent to ${tokens.length} users`)
    } catch (err) {
      console.error('Push notification failed:', err)
    }
  }
}
