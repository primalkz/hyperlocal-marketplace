import type { Product } from '@prisma/client'

export function productOut(p: Product) {
  return {
    id: p.id,
    shopId: p.shopId,
    title: p.title,
    image: p.image,
    price: Number(p.price),
    available: p.available,
    createdAt: p.createdAt,
  }
}
