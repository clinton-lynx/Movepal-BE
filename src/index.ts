import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import dotenv from 'dotenv'
dotenv.config()

import './config/env'
import { errorHandler } from './middleware/error.middleware'
import routes from './routes'

const app = express()
const PORT = process.env.PORT || 3000

app.use(helmet())
app.use(cors())
app.use(express.json())

app.get('/health', (_, res) => {
  res.status(200).json({
    success: true,
    message: 'MovePal API is running',
    data: {
      service: 'movepal-api',
      version: '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      timestamp: new Date().toISOString(),
    }
  })
})

app.use('/api', routes)
app.use(errorHandler)

app.listen(PORT, () => {
  console.log(`MovePal API running on port ${PORT}`)
})
