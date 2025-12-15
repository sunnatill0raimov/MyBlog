import cors from 'cors'
import express from 'express'
import rateLimit from 'express-rate-limit'
// import helmet from 'helmet';
import { createServer } from 'http'

import { checkMongoDBConnection, connectDB } from './config/db.js'
import { env } from './config/env.js'

import errorMiddleware from './middleware/error.middleware.js'
import authRoutes from './routes/auth.routes.js'
import binaryRoutes from './routes/binary.routes.js'
import chatRoutes from './routes/chat.routes.js'
import messageRoutes from './routes/message.routes.js'
import notificationRoutes from './routes/notification.routes.js'
import postRoutes from './routes/post.routes.js'
import userRoutes from './routes/user.routes.js'

const app = express()

// Connect to MongoDB
connectDB()

// Security middleware
// app.use(helmet()); // Temporarily disabled due to import issues

// Rate limiting
const limiter = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 minutes
	max: 100, // limit each IP to 100 requests per windowMs
	message: 'Too many requests from this IP, please try again later.',
})
app.use(limiter)

// CORS configuration
app.use(
	cors({
		origin: env.CLIENT_URL,
		credentials: true,
	})
)

// Body parsing middleware
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

// Static files
app.use('/uploads', express.static(env.UPLOAD_PATH))

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/users', userRoutes)
app.use('/api/posts', postRoutes)
app.use('/api/binary', binaryRoutes)
app.use('/api/chat', chatRoutes)
app.use('/api/message', messageRoutes)
app.use('/api/notifications', notificationRoutes)

// Health check route
app.get('/api/health', (req, res) => {
	const dbStatus = checkMongoDBConnection() ? 'connected' : 'disconnected'
	res.status(200).json({
		status: 'OK',
		timestamp: new Date().toISOString(),
		environment: env.NODE_ENV,
		database: dbStatus,
	})
})

// MongoDB health check route
app.get('/api/db-health', (req, res) => {
	try {
		const isConnected = checkMongoDBConnection()
		const connectionState = mongoose.connection.readyState

		res.status(200).json({
			status: isConnected ? 'healthy' : 'unhealthy',
			connectionState: getConnectionStateName(connectionState),
			timestamp: new Date().toISOString(),
		})
	} catch (error) {
		res.status(500).json({
			status: 'error',
			message: 'Database health check failed',
			error: error.message,
		})
	}
})

// Helper function to get connection state name
function getConnectionStateName(state) {
	const states = {
		0: 'disconnected',
		1: 'connected',
		2: 'connecting',
		3: 'disconnecting',
		99: 'uninitialized',
	}
	return states[state] || 'unknown'
}

// 404 handler
app.use((req, res, next) => {
	const error = new Error(`Route ${req.originalUrl} not found`)
	error.statusCode = 404
	next(error)
})

// Error middleware (must be last)
app.use(errorMiddleware)

// Create HTTP server for Socket.io
const server = createServer(app)

export { app, server }
export default app
