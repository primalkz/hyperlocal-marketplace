import { Router } from 'express'
import { Prisma } from '@prisma/client'
import { prisma } from '../prisma'
import { requireRole } from '../auth'
import { AppError } from '../errors'

const router = Router()
router.use(requireRole('CUSTOMER'))

function orderOut(order: {
  id: string
  shopId: string
  total: Prisma.Decimal
  status: string
  createdAt: Date
  items: { id: string; productId: string; title: string; image: string; price: Prisma.Decimal; quantity: number }[]
}) {
  return {
    id: order.id,
    shopId: order.shopId,
    total: Number(order.total),
    status: order.status,
    createdAt: order.createdAt,
    items: order.items.map(i => ({ ...i, price: Number(i.price) })),
  }
}

router.post('/', async (req, res, next) => {
  const cart = await prisma.cart.findUnique({
    where: { customerId: req.user!.userId },
    include: { items: { include: { product: true } } },
  })
  if (!cart || cart.items.length === 0) return next(new AppError(400, 'cart is empty'))
  if (!cart.shopId) return next(new AppError(400, 'cart has no shop'))

  const total = cart.items.reduce((sum, i) => sum + Number(i.product.price) * i.quantity, 0)

  const order = await prisma.$transaction(async (tx) => {
    const created = await tx.order.create({
      data: {
        customerId: req.user!.userId,
        shopId: cart.shopId!,
        total,
        items: {
          create: cart.items.map(i => ({
            productId: i.productId,
            title: i.product.title,
            image: i.product.image,
            price: i.product.price,
            quantity: i.quantity,
          })),
        },
      },
      include: { items: true },
    })
    await tx.cartItem.deleteMany({ where: { cartId: cart.id } })
    await tx.cart.update({ where: { id: cart.id }, data: { shopId: null } })
    return created
  })

  res.status(201).json({ order: orderOut(order) })
})

router.get('/', async (req, res) => {
  const orders = await prisma.order.findMany({
    where: { customerId: req.user!.userId },
    include: { items: true },
    orderBy: { createdAt: 'desc' },
  })
  res.json({ orders: orders.map(orderOut) })
})

export default router
