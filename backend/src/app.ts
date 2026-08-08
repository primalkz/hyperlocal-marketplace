import express from 'express'
import cors from 'cors'
import { errorHandler } from './errors'
import authRoutes from './routes/auth'
import vendorRoutes from './routes/vendor'
import shopRoutes from './routes/shops'
import cartRoutes from './routes/cart'
import orderRoutes from './routes/orders'
import adminRoutes from './routes/admin'
import './types'

export const app = express()

app.use(cors({ origin: process.env.CLIENT_URL ?? 'http://localhost:3000', credentials: true }))
app.use(express.json())

app.use('/api/auth', authRoutes)
app.use('/api/vendor', vendorRoutes)
app.use('/api', shopRoutes)
app.use('/api/cart', cartRoutes)
app.use('/api/orders', orderRoutes)
app.use('/api/admin', adminRoutes)

app.use(errorHandler)
