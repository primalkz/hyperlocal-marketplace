import 'dotenv/config'
import { prisma } from '../src/prisma'

const img = (s: string) => `https://picsum.photos/seed/${s}/400/300`

async function main() {
  const sharma = await prisma.shop.findFirst({ where: { name: 'Sharma Kirana Store' } })
  if (sharma) {
    await prisma.product.createMany({
      data: [
        { shopId: sharma.id, title: 'Aashirvaad Atta 5kg', image: img('atta'), price: 250, available: true },
        { shopId: sharma.id, title: 'Tata Salt 1kg', image: img('salt'), price: 28, available: true },
        { shopId: sharma.id, title: 'Madhur Sugar 1kg', image: img('sugar'), price: 55, available: true },
        { shopId: sharma.id, title: 'Tata Tea Gold 500g', image: img('tea'), price: 290, available: true },
        { shopId: sharma.id, title: 'Maggi Noodles 4-pack', image: img('maggi'), price: 80, available: true },
        { shopId: sharma.id, title: 'Parle-G Biscuit 200g', image: img('parleg'), price: 15, available: true },
        { shopId: sharma.id, title: 'Amul Butter 500g', image: img('butter'), price: 265, available: true },
      ],
      skipDuplicates: true,
    })
    console.log('added products to sharma')
  }

  const quick = await prisma.shop.findFirst({ where: { name: 'Quick Mart' } })
  if (quick) {
    await prisma.shop.update({ where: { id: quick.id }, data: { latitude: 19.07, longitude: 72.87, status: 'APPROVED' } })
    await prisma.product.createMany({
      data: [
        { shopId: quick.id, title: 'Nescafe Classic 100g', image: img('coffee'), price: 320, available: true },
        { shopId: quick.id, title: 'Haldiram Bhujia 400g', image: img('bhujia'), price: 95, available: true },
        { shopId: quick.id, title: 'Dabur Honey 250g', image: img('honey'), price: 135, available: true },
      ],
      skipDuplicates: true,
    })
    console.log('moved quick mart near customer + added products')
  }

  console.log('done')
}

main().catch((e) => { console.error(e); process.exit(1) }).finally(() => prisma.$disconnect())
