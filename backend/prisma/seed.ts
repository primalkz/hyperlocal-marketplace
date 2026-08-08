import 'dotenv/config'
import { prisma } from '../src/prisma'
import { hashPassword } from '../src/auth'

const img = (seed) => `https://picsum.photos/seed/${seed}/400/300`

async function main() {
  await prisma.user.upsert({
    where: { email: 'admin@local.test' },
    update: {},
    create: { email: 'admin@local.test', passwordHash: await hashPassword('admin123'), role: 'ADMIN' },
  })

  const vendor = await prisma.user.upsert({
    where: { email: 'vendor@local.test' },
    update: {},
    create: { email: 'vendor@local.test', passwordHash: await hashPassword('vendor123'), role: 'VENDOR' },
  })

  const shop = await prisma.shop.upsert({
    where: { vendorId: vendor.id },
    update: { name: 'Sharma Kirana Store', latitude: 19.076, longitude: 72.8777, status: 'APPROVED' },
    create: {
      vendorId: vendor.id,
      name: 'Sharma Kirana Store',
      latitude: 19.076,
      longitude: 72.8777,
      status: 'APPROVED',
    },
  })

  await prisma.product.deleteMany({ where: { shopId: shop.id } })
  await prisma.product.createMany({
    data: [
      { shopId: shop.id, title: 'India Gate Basmati Rice 1kg', image: img('rice'), price: 120, available: true },
      { shopId: shop.id, title: 'Tata Toor Dal 1kg', image: img('dal'), price: 140, available: true },
      { shopId: shop.id, title: 'Fortune Sunflower Oil 1L', image: img('oil'), price: 180, available: false },
    ],
  })

  await prisma.user.upsert({
    where: { email: 'customer@local.test' },
    update: {},
    create: { email: 'customer@local.test', passwordHash: await hashPassword('customer123'), role: 'CUSTOMER' },
  })

  console.log('seeded: Sharma Kirana Store')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
