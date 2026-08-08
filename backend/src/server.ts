import 'dotenv/config'
import { app } from './app'

const port = Number(process.env.PORT ?? 4000)

if (!process.env.JWT_SECRET) {
  console.error('JWT_SECRET is not set')
  process.exit(1)
}

app.listen(port, () => console.log(`api on ${port}`))
