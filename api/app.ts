import express, {
  type Request,
  type Response,
  type NextFunction,
} from 'express'
import cors from 'cors'
import path from 'path'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import './db/database.js'

import dashboardRoutes from './routes/dashboard.js'
import certificateRoutes from './routes/certificates.js'
import gatewayRoutes from './routes/gateways.js'
import factoryRoutes from './routes/factories.js'
import traceRoutes from './routes/trace.js'
import settingsRoutes from './routes/settings.js'
import gatewayAuthRoutes from './routes/gatewayAuth.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

dotenv.config()

const app: express.Application = express()

app.use(cors())
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

app.use('/api/dashboard', dashboardRoutes)
app.use('/api/certificates', certificateRoutes)
app.use('/api/gateways', gatewayRoutes)
app.use('/api/factories', factoryRoutes)
app.use('/api/trace', traceRoutes)
app.use('/api/settings', settingsRoutes)
app.use('/api/gateway', gatewayAuthRoutes)

app.use(
  '/api/health',
  (req: Request, res: Response, next: NextFunction): void => {
    res.status(200).json({
      success: true,
      message: 'ok',
    })
  },
)

app.use((error: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('Server error:', error)
  res.status(500).json({
    success: false,
    error: error.message || 'Server internal error',
  })
})

app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: 'API not found',
  })
})

export default app
