import Koa from 'koa'
import cors from '@koa/cors'
import qs from 'koa-qs'
import bodyParser from 'koa-bodyparser'
import KoaRouter from '@koa/router'
import { RegisterRoutes } from '../build/routes'
import swagger from '../build/swagger.json'
import { koaSwagger } from 'koa2-swagger-ui'
import { type Server } from 'http'
import { type AppOrdersDatabaseState, getDefaultOrdersDatabase } from './src/orders_database'

export default async function (port?: number): Promise<{ server: Server, state: AppOrdersDatabaseState }> {
  const orders = await getDefaultOrdersDatabase('orders-api-db')

  const state: AppOrdersDatabaseState = {
    orders
  }

  const app = new Koa<AppOrdersDatabaseState>()
  qs(app)
  app.use(cors())
  app.use(async (ctx, next) => {
    ctx.state = state
    await next()
  })
  app.use(bodyParser())

  const router = new KoaRouter()
  RegisterRoutes(router)
  app.use(router.routes())

  app.use(
    koaSwagger({
      routePrefix: '/docs',
      specPrefix: '/docs/spec',
      exposeSpec: true,
      swaggerOptions: { spec: swagger }
    })
  )

  return {
    server: app.listen(port, () => { console.log('orders-api listening') }),
    state
  }
}
