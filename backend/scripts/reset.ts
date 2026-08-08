import 'dotenv/config'
import { prisma } from '../src/prisma'

async function main() {
  await prisma.cartItem.deleteMany()
  await prisma.orderItem.deleteMany()
  await prisma.cart.deleteMany()
  await prisma.order.deleteMany()
  await prisma.product.deleteMany()
  await prisma.shop.deleteMany()
  await prisma.user.deleteMany()
  console.log('wiped all rows')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
