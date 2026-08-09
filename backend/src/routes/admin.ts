import { Router } from 'express'
import { prisma } from '../prisma'
import { requireRole } from '../auth'
import { validate, adminStatusSchema } from '../validate'
import { AppError } from '../errors'

const router = Router()
router.use(requireRole('ADMIN'))

function vendorOut(v: {
  id: string
  email: string
  role: string
  createdAt: Date
  shop: { id: string; name: string; status: string; latitude: number; longitude: number } | null
}) {
  return {
    id: v.id,
    email: v.email,
    createdAt: v.createdAt,
    shop: v.shop ? { id: v.shop.id, name: v.shop.name, status: v.shop.status, latitude: v.shop.latitude, longitude: v.shop.longitude } : null,
  }
}

router.get('/vendors', async (_req, res) => {
  const vendors = await prisma.user.findMany({
    where: { role: 'VENDOR' },
    include: { shop: true },
    orderBy: { createdAt: 'asc' },
  })
  res.json({ vendors: vendors.map(vendorOut) })
})

router.patch('/vendors/:id', validate(adminStatusSchema), async (req, res, next) => {
  const { status } = req.body
  const vendor = await prisma.user.findUnique({
    where: { id: req.params.id },
    include: { shop: true },
  })
  if (!vendor || vendor.role !== 'VENDOR') return next(new AppError(404, 'vendor not found'))
  if (!vendor.shop) return next(new AppError(400, 'vendor has no shop to approve'))
  const shop = await prisma.shop.update({
    where: { vendorId: vendor.id },
    data: { status },
  })
  res.json({ vendor: vendorOut({ ...vendor, shop }) })
})

router.get('/orders', async (_req, res) => {
  const orders = await prisma.order.findMany({
    include: { items: true, customer: { select: { email: true } }, shop: { select: { name: true } } },
    orderBy: { createdAt: 'desc' },
  })
  res.json({
    orders: orders.map(o => ({
      id: o.id,
      customer: o.customer.email,
      shop: o.shop.name,
      total: Number(o.total),
      status: o.status,
      createdAt: o.createdAt,
      items: o.items.map(i => ({ title: i.title, quantity: i.quantity, price: Number(i.price) })),
    })),
  })
})

export default router
