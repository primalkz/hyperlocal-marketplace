import 'dotenv/config'
import { prisma } from '../src/prisma'

async function main() {
  const sharma = await prisma.shop.findFirst({ where: { name: 'Sharma Kirana Store' } })
  if (sharma) {
    await prisma.product.deleteMany({ where: { shopId: sharma.id } })
    await prisma.product.createMany({
      data: [
        { shopId: sharma.id, title: 'Aashirvaad Whole Wheat Atta 5kg', image: 'https://www.quickpantry.in/cdn/shop/products/aashirvaad-whole-wheat-atta-5-kg-quick-pantry.jpg?v=1710537925&width=460', price: 240, available: true },
        { shopId: sharma.id, title: 'Tata Iodised Salt 1kg', image: 'https://www.quickpantry.in/cdn/shop/products/tata-iodised-salt-1-kg-quick-pantry.jpg?v=1710537948&width=460', price: 31, available: true },
        { shopId: sharma.id, title: 'Sugar (Loose) 1kg', image: 'https://www.quickpantry.in/cdn/shop/files/sugar-loose-packing-quick-pantry.png?v=1710537951&width=460', price: 26, available: true },
        { shopId: sharma.id, title: 'Teen Ekka Toor Dal 1kg', image: 'https://www.quickpantry.in/cdn/shop/products/teen-ekka-toorarhar-dal-unpolished-and-bold-loose-packing-quick-pantry.jpg?v=1710538056&width=460', price: 35, available: true },
        { shopId: sharma.id, title: 'Premium Basmati Rice 1kg', image: 'https://www.quickpantry.in/cdn/shop/products/premium-basmati-whole-rice-loose-packing-quick-pantry-1.jpg?v=1710538779&width=460', price: 28, available: true },
        { shopId: sharma.id, title: 'Gangwal Besan 500g', image: 'https://www.quickpantry.in/cdn/shop/products/gangwal-regular-besan-sada-500-g-quick-pantry.png?v=1710537970&width=460', price: 60, available: true },
        { shopId: sharma.id, title: 'Gangwal Rawa Sooji 500g', image: 'https://www.quickpantry.in/cdn/shop/products/gangwal-rawa-semolina-500-g-quick-pantry.png?v=1710537972&width=460', price: 30, available: true },
        { shopId: sharma.id, title: 'Swadist Soyabean Oil 850g', image: 'https://www.quickpantry.in/cdn/shop/products/swadist-soyabean-refined-oil-1-l-quick-pantry.jpg?v=1710538008&width=460', price: 145, available: true },
        { shopId: sharma.id, title: 'Cumin/Jeera Whole 100g', image: 'https://www.quickpantry.in/cdn/shop/products/cuminjeera-whole-premium-quality-quick-pantry.jpg?v=1710538100&width=460', price: 50, available: true },
        { shopId: sharma.id, title: 'Gangwal Poha 500g', image: 'https://www.quickpantry.in/cdn/shop/products/gangwal-poha-500-g-quick-pantry.png?v=1710538841&width=460', price: 35, available: true },
      ],
    })
    console.log('sharma products updated with real images')
  }

  const quick = await prisma.shop.findFirst({ where: { name: 'Quick Mart' } })
  if (quick) {
    await prisma.shop.update({ where: { id: quick.id }, data: { latitude: 19.07, longitude: 72.87, status: 'APPROVED' } })
    await prisma.product.deleteMany({ where: { shopId: quick.id } })
    await prisma.product.createMany({
      data: [
        { shopId: quick.id, title: 'Jaggery/Gud 1kg', image: 'https://www.quickpantry.in/cdn/shop/products/jaggerygud-loose-packing-quick-pantry.jpg?v=1710537951&width=460', price: 15, available: true },
        { shopId: quick.id, title: 'Cardamom/Elaichi Green 50g', image: 'https://www.quickpantry.in/cdn/shop/products/cardamomelaichi-green-premium-quality-quick-pantry.jpg?v=1710538102&width=460', price: 50, available: true },
        { shopId: quick.id, title: 'Makhana Premium 100g', image: 'https://www.quickpantry.in/cdn/shop/products/makhana-premium-quality-quick-pantry.jpg?v=1710538286&width=460', price: 180, available: true },
      ],
    })
    console.log('quick mart moved + real images')
  }

  console.log('done')
}

main().catch((e) => { console.error(e); process.exit(1) }).finally(() => prisma.$disconnect())
