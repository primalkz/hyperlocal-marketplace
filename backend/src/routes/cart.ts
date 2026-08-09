import { Router } from 'express'
import { prisma } from '../prisma'
import { requireRole } from '../auth'
import { validate, cartItemSchema, cartQtySchema } from '../validate'
import { productOut } from '../serialize'
import { AppError } from '../errors'

const router = Router()
router.use(requireRole('CUSTOMER'))

async function loadCart(userId: string) {
  return prisma.cart.findUnique({
    where: { customerId: userId },
    include: { items: { include: { product: true } } },
  })
}

function cartOut(cart: Awaited<ReturnType<typeof loadCart>>) {
  if (!cart) return null
  return {
    id: cart.id,
    shopId: cart.shopId,
    items: cart.items.map(i => ({
      id: i.id,
      productId: i.productId,
      quantity: i.quantity,
      product: productOut(i.product),
    })),
  }
}

router.get('/', async (req, res) => {
  const cart = await loadCart(req.user!.userId)
  res.json({ cart: cartOut(cart) })
})

router.post('/items', validate(cartItemSchema), async (req, res, next) => {
  const { productId, quantity } = req.body
  const product = await prisma.product.findUnique({
    where: { id: productId },
    include: { shop: true },
  })
  if (!product || product.shop.status !== 'APPROVED') return next(new AppError(404, 'product not found'))
  if (!product.available) return next(new AppError(400, 'product unavailable'))

  const cart = await prisma.cart.findUnique({ where: { customerId: req.user!.userId } })
  if (cart && cart.shopId && cart.shopId !== product.shopId) {
    return next(new AppError(409, 'cart already holds items from another shop'))
  }

  await prisma.$transaction(async (tx) => {
    const c = await tx.cart.upsert({
      where: { customerId: req.user!.userId },
      create: { customerId: req.user!.userId, shopId: product.shopId },
      update: { shopId: product.shopId },
    })
    await tx.cartItem.upsert({
      where: { cartId_productId: { cartId: c.id, productId } },
      create: { cartId: c.id, productId, quantity },
      update: { quantity: { increment: quantity } },
    })
  })

  const fresh = await loadCart(req.user!.userId)
  res.status(201).json({ cart: cartOut(fresh) })
})

router.patch('/items/:id', validate(cartQtySchema), async (req, res, next) => {
  const { quantity } = req.body
  const cart = await loadCart(req.user!.userId)
  if (!cart) return next(new AppError(404, 'cart item not found'))
  const item = cart.items.find(i => i.id === req.params.id)
  if (!item) return next(new AppError(404, 'cart item not found'))
  if (quantity === 0) {
    await prisma.cartItem.delete({ where: { id: item.id } })
  } else {
    await prisma.cartItem.update({ where: { id: item.id }, data: { quantity } })
  }
  const fresh = await loadCart(req.user!.userId)
  res.json({ cart: cartOut(fresh) })
})

router.delete('/items/:id', async (req, res, next) => {
  const cart = await loadCart(req.user!.userId)
  if (!cart) return next(new AppError(404, 'cart item not found'))
  const item = cart.items.find(i => i.id === req.params.id)
  if (!item) return next(new AppError(404, 'cart item not found'))
  await prisma.cartItem.delete({ where: { id: item.id } })
  const fresh = await loadCart(req.user!.userId)
  res.json({ cart: cartOut(fresh) })
})

export default router
