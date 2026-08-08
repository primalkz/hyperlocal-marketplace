const base = 'http://localhost:4000/api'

class Sess {
  cookie = ''
  async call(method, path, body) {
    const headers = { 'Content-Type': 'application/json' }
    if (this.cookie) headers.Cookie = this.cookie
    const r = await fetch(base + path, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
    })
    const sc = r.headers.get('set-cookie')
    if (sc) this.cookie = sc.split(';')[0]
    const text = await r.text()
    let parsed = text
    try { parsed = JSON.parse(text) } catch {}
    return { status: r.status, body: parsed }
  }
  post(p, b) { return this.call('POST', p, b) }
  patch(p, b) { return this.call('PATCH', p, b) }
  get(p) { return this.call('GET', p) }
  del(p) { return this.call('DELETE', p) }
}

const cust = new Sess()
const admin = new Sess()
const v2 = new Sess()

async function login(s, email, pw) {
  return s.post('/auth/login', { email, password: pw })
}

await login(cust, 'customer@local.test', 'customer123')
const c0 = (await cust.get('/cart')).body.cart
if (c0) for (const i of c0.items) await cust.del('/cart/items/' + i.id)
console.log('cleared leftover:', c0?.items?.length ?? 0)

const shops = (await cust.get('/shops?lat=19.076&lng=72.8777')).body
const shopId = shops.shops[0].id
const prods = (await cust.get('/shops/' + shopId + '/products')).body.products
const p1 = prods[0].id
const p2 = prods[1].id

let r = await cust.post('/cart/items', { productId: p1, quantity: 2 })
console.log('add1:', r.status, 'items', r.body.cart?.items?.length, 'qty', r.body.cart?.items?.[0]?.quantity)
r = await cust.post('/cart/items', { productId: p2, quantity: 3 })
console.log('add2 same shop:', r.status, 'items', r.body.cart?.items?.length)
const iid = r.body.cart.items[0].id
r = await cust.patch('/cart/items/' + iid, { quantity: 5 })
console.log('patch qty:', r.status, '->', r.body.cart?.items?.[0]?.quantity)
r = await cust.post('/orders', {})
console.log('checkout:', r.status, 'total', r.body.order?.total, 'items', r.body.order?.items?.length)
r = await cust.get('/cart')
console.log('cart after checkout:', 'items', r.body.cart?.items?.length, 'shopId', r.body.cart?.shopId)
r = await cust.get('/orders')
console.log('customer orders:', r.body.orders?.length)

await login(admin, 'admin@local.test', 'admin123')
r = await admin.get('/admin/orders')
console.log('admin orders:', r.body.orders?.length)
r = await admin.get('/admin/vendors')
console.log('admin vendors:', r.body.vendors?.length)

await v2.post('/auth/register', { email: 'v2@t.test', password: 'secret123', role: 'VENDOR' })
await v2.post('/vendor/shop', { name: 'Shop Two', latitude: 19.05, longitude: 72.85 })
r = await admin.patch('/admin/vendors/' + (await v2.get('/auth/me')).body.user.userId, { status: 'APPROVED' })
console.log('v2 approved:', r.body.vendor?.shop?.status)
r = await v2.post('/vendor/products', { title: 'X', image: 'https://picsum.photos/seed/x/400', price: 10, available: true })
const prod2 = r.body.product.id
console.log('v2 product:', prod2)

r = await cust.post('/cart/items', { productId: prod2, quantity: 1 })
console.log('add shop2 product:', r.status, 'cart shopId', r.body.cart?.shopId)
r = await cust.post('/cart/items', { productId: p1, quantity: 1 })
console.log('cross-shop (expect 409):', r.status, r.body?.error)
