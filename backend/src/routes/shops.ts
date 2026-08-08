import { Router } from 'express'
import { prisma } from '../prisma'
import { nearbySchema } from '../validate'
import { productOut } from '../serialize'
import { haversine } from '../distance'
import { AppError } from '../errors'

const router = Router()

router.get('/shops', async (req, res, next) => {
  const q = nearbySchema.safeParse(req.query)
  if (!q.success) return next(new AppError(400, q.error.issues.map(i => i.message).join(', ')))
  const { lat, lng, radius } = q.data
  const shops = await prisma.shop.findMany({
    where: { status: 'APPROVED' },
    include: { _count: { select: { products: true } } },
  })
  const out = shops
    .map(s => ({ ...s, distance: haversine(lat, lng, s.latitude, s.longitude) }))
    .filter(s => s.distance <= (radius ?? 5))
    .sort((a, b) => a.distance - b.distance)
  res.json({ shops: out })
})

router.get('/shops/:id', async (req, res, next) => {
  const shop = await prisma.shop.findUnique({ where: { id: req.params.id } })
  if (!shop || shop.status !== 'APPROVED') return next(new AppError(404, 'shop not found'))
  res.json({ shop })
})

router.get('/shops/:id/products', async (req, res, next) => {
  const shop = await prisma.shop.findUnique({ where: { id: req.params.id } })
  if (!shop || shop.status !== 'APPROVED') return next(new AppError(404, 'shop not found'))
  const products = await prisma.product.findMany({ where: { shopId: shop.id } })
  res.json({ products: products.map(productOut) })
})

export default router
