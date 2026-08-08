import { Router } from 'express'
import { prisma } from '../prisma'
import { requireRole } from '../auth'
import { validate, shopSchema, productSchema } from '../validate'
import { productOut } from '../serialize'
import { AppError } from '../errors'

const router = Router()
router.use(requireRole('VENDOR'))

function shopOf(userId: string) {
  return prisma.shop.findUnique({ where: { vendorId: userId } })
}

router.get('/shop', async (req, res) => {
  const shop = await shopOf(req.user!.userId)
  res.json({ shop })
})

router.post('/shop', validate(shopSchema), async (req, res, next) => {
  const { name, latitude, longitude } = req.body
  if (await shopOf(req.user!.userId)) return next(new AppError(409, 'shop already exists'))
  const shop = await prisma.shop.create({
    data: { vendorId: req.user!.userId, name, latitude, longitude },
  })
  res.status(201).json({ shop })
})

router.patch('/shop', validate(shopSchema), async (req, res, next) => {
  const { name, latitude, longitude } = req.body
  const result = await prisma.shop.updateMany({
    where: { vendorId: req.user!.userId },
    data: { name, latitude, longitude },
  })
  if (result.count === 0) return next(new AppError(404, 'shop not found'))
  const shop = await shopOf(req.user!.userId)
  res.json({ shop })
})

router.get('/products', async (req, res) => {
  const shop = await shopOf(req.user!.userId)
  if (!shop) return res.json({ products: [] })
  const products = await prisma.product.findMany({
    where: { shopId: shop.id },
    orderBy: { createdAt: 'desc' },
  })
  res.json({ products: products.map(productOut) })
})

router.post('/products', validate(productSchema), async (req, res, next) => {
  const shop = await shopOf(req.user!.userId)
  if (!shop) return next(new AppError(400, 'create your shop first'))
  const { title, image, price, available } = req.body
  const product = await prisma.product.create({
    data: { shopId: shop.id, title, image, price, available },
  })
  res.status(201).json({ product: productOut(product) })
})

router.patch('/products/:id', validate(productSchema), async (req, res, next) => {
  const shop = await shopOf(req.user!.userId)
  if (!shop) return next(new AppError(400, 'create your shop first'))
  const product = await prisma.product.findUnique({ where: { id: req.params.id } })
  if (!product || product.shopId !== shop.id) return next(new AppError(404, 'product not found'))
  const { title, image, price, available } = req.body
  const updated = await prisma.product.update({
    where: { id: product.id },
    data: { title, image, price, available },
  })
  res.json({ product: productOut(updated) })
})

router.delete('/products/:id', async (req, res, next) => {
  const shop = await shopOf(req.user!.userId)
  if (!shop) return next(new AppError(400, 'create your shop first'))
  const product = await prisma.product.findUnique({ where: { id: req.params.id } })
  if (!product || product.shopId !== shop.id) return next(new AppError(404, 'product not found'))
  await prisma.product.delete({ where: { id: product.id } })
  res.json({ ok: true })
})

export default router
