import { Router } from 'express'
import { requireAuth, getUserFromToken, requireRole } from '../middleware/auth.js'
import { getAdminStats } from '../controllers/adminController.js'

const router = Router()

router.get('/', requireAuth, getUserFromToken, requireRole(['admin']), getAdminStats)

export default router
