# hyperlocal marketplace

a small hyperlocal grocery marketplace. vendors run their own catalogue, customers find shops nearby and place orders. three portals: vendor, customer, admin.

the backend is the real work. the ui is minimal on purpose.

## stack

- backend: express + typescript, prisma + postgres (neon), bcrypt, jsonwebtoken, zod
- frontend: next.js (app router) + tailwind
- two apps in one repo: `backend/` and `frontend/`, deployed separately

## setup

node 20+ and npm.

backend:
```
cd backend
npm install
cp .env.example .env          # fill DATABASE_URL, JWT_SECRET, CLIENT_URL
npx prisma migrate deploy
npm run db:seed
npm run dev                    # api on http://localhost:4000
```

frontend:
```
cd frontend
npm install
cp .env.example .env.local     # set NEXT_PUBLIC_API_URL to the backend
npm run dev                     # ui on http://localhost:3000
```

seeded logins (email / password):
- admin@local.test / admin123
- vendor@local.test / vendor123
- customer@local.test / customer123

## env

backend `.env`:
- `DATABASE_URL` neon pooled connection string
- `JWT_SECRET` long random string
- `CLIENT_URL` frontend origin, for cors
- `PORT` defaults to 4000

frontend `.env.local`:
- `NEXT_PUBLIC_API_URL` backend base, e.g. http://localhost:4000/api

## api

all under `/api`. auth uses an httponly cookie set on login and cleared on logout.

| method | path | who | what |
| --- | --- | --- | --- |
| POST | /auth/register | anyone | register as vendor or customer, sets cookie |
| POST | /auth/login | anyone | login, sets cookie |
| POST | /auth/logout | anyone | clears cookie |
| GET | /auth/me | anyone | current session or null |
| GET | /vendor/shop | vendor | own shop |
| POST | /vendor/shop | vendor | create shop |
| PATCH | /vendor/shop | vendor | update shop |
| GET | /vendor/products | vendor | own products |
| POST | /vendor/products | vendor | add product |
| PATCH | /vendor/products/:id | vendor | edit own product |
| DELETE | /vendor/products/:id | vendor | delete own product |
| GET | /shops?lat&lng&radius | anyone | nearby approved shops by km |
| GET | /shops/:id | anyone | shop detail |
| GET | /shops/:id/products | anyone | shop products |
| GET | /cart | customer | own cart |
| POST | /cart/items | customer | add item (409 if cart holds another shop) |
| PATCH | /cart/items/:id | customer | set quantity, 0 removes |
| DELETE | /cart/items/:id | customer | remove item |
| POST | /orders | customer | checkout, clears cart |
| GET | /orders | customer | own orders |
| GET | /admin/vendors | admin | all vendors and shop status |
| PATCH | /admin/vendors/:id | admin | approve, reject or disable |
| GET | /admin/orders | admin | all orders |

a product is: title, image (url), price, available (boolean). errors come back as `{ "error": "message" }` with the matching status code.

## urls

local:
- frontend http://localhost:3000
- backend http://localhost:4000/api

deployed:
- frontend https://hyperlocal-marketplace-y2g6.vercel.app
- backend https://hyperlocal-marketplace-xi.vercel.app/api

## database

seven tables. full schema in `backend/prisma/schema.prisma`, migrations in `backend/prisma/migrations/`.
- users (id, email, passwordHash, role)
- shops (vendorId, name, latitude, longitude, status)
- products (shopId, title, image, price decimal(10,2), available)
- carts (customerId, shopId nullable) one per customer
- cartItems (cartId, productId, quantity) unique on (cartId, productId)
- orders (customerId, shopId, total, status)
- orderItems (orderId, productId, title, image, price, quantity) snapshot, no fk to product

## assumptions

- one cart per customer, pinned to one shop. adding a product from a different shop returns 409. the customer clears the cart themselves. no silent clear.
- images are url strings. production would use s3 or an upload service.
- vendors can build their catalogue while pending. shops show to customers only when approved and not disabled.
- a rejected or disabled vendor can log in but mutations return 403.
- no order status workflow. orders land as PLACED and stay there.
- nearby default radius 5 km. distance is haversine computed in node, not in the database.
- admin is seeded, never self-registered.
- a vendor hitting a product that is not theirs gets 404, not 403, so they cannot probe which ids exist.

## trade-offs

- one users table with a role enum instead of three tables. fewer joins, simpler auth, the data is the same shape.
- orderItem copies title, image and price instead of joining product. orders must not change if a product is edited or deleted later.
- distance in node not sql. simpler and testable at this scale. for real scale i would push haversine into a sql function or use postgis.
- prisma over raw sql. the schema file reads as documentation and migrations are a deliverable. the cost is a generated client i do not hand-write.
- jsonwebtoken + bcrypt over hand-rolled crypto. boring, easy to explain. the jwt lives in an httponly samesite cookie, none and secure in production so it survives cross-site fetch.
- express on vercel as one serverless function (zero config, src/app.ts is the default export). keeps everything on one host. the fallback is a long-running render instance and the code already supports it through src/server.ts.
- zod for validation. the type inference earns the one dependency. schemas stay tiny.

## tests

```
cd backend && npm test
```

vitest, 11 tests. covers password hash/verify, jwt round trip, haversine, zod rejection, and one supertest hit on /auth/me. no database in the suite, so it runs fast and anywhere.

## deploy

vercel, one project per app. monorepo, so set the root directory per project.

backend (root directory `backend`):
- build command: leave blank, vercel detects express from `src/app.ts`
- env: `DATABASE_URL`, `JWT_SECRET`, `CLIENT_URL` (the frontend url), `NODE_ENV=production`

frontend (root directory `frontend`):
- env: `NEXT_PUBLIC_API_URL` = `https://<backend>.vercel.app/api`

after both deploy, set `CLIENT_URL` on the backend to the frontend url and `NEXT_PUBLIC_API_URL` on the frontend to the backend url, then redeploy so cors and cookies line up.

a render fallback for the backend: `npm run build && npm start` with the same env. the long-running server avoids serverless cold starts.

## out of scope, how i would add them

- payment gateway: a payments table (orderId, provider, providerRef, amount, status) and a /orders/:id/pay endpoint that calls the provider and relies on its webhook. order stays PLACED until the webhook confirms PAID.
- delivery tracking: an order status enum (placed, accepted, picked, out_for_delivery, delivered) and a delivery_assignments table linking an order to a rider with a live lat/lng. a rider app pings /tracking, customers poll /orders/:id.
- push notifications: a notification_tokens table per user. on status change, look up the token and call fcm/apns from a worker so the request does not block.
- inventory management: add stockQty to products, decrement in the checkout $transaction, reject oversell, alert below a threshold.
- order status workflow: the status column is already there. add allowed transitions in a guard and a /orders/:id/status endpoint for vendor/admin.
- multi-vendor cart: a cart already keys items by product, which knows its shop. allow many shops, group by shop at checkout, create one order per shop in the same transaction.
- search: ilike on product.title to start. for scale, pg_trgm trigram index or a separate meilisearch/typesense index.
- reviews and ratings: a reviews table (productId, customerId, rating, body). average via a view or a cached column on product.
- coupons: a coupons table (code, kind, value, expiresAt, shopId nullable), a couponId on the order rechecked and total recomputed at checkout.
- analytics: do not bake it in. emit domain events (order_placed, product_added) to a queue and let a separate service aggregate. keeps the request path clean.
