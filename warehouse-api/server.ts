import Koa from 'koa'
import cors from '@koa/cors'
import qs from 'koa-qs'
import { RegisterRoutes } from '../build/routes'
import swagger from '../build/swagger.json'
import KoaRouter from '@koa/router'
import { koaSwagger } from 'koa2-swagger-ui'
import bodyParser from 'koa-bodyparser'
import { type Server, type IncomingMessage, type ServerResponse } from 'http'
import { type AppWarehouseDatabaseState, getDefaultWarehouseDatabase } from './src/warehouse_database'

export default async function server (port?: number, randomizeDbs?: boolean): Promise<{ server: Server<typeof IncomingMessage, typeof ServerResponse>, state: AppWarehouseDatabaseState }> {
  const warehouseDb = await getDefaultWarehouseDatabase(randomizeDbs === true ? undefined : 'warehouse-db')

  const state: AppWarehouseDatabaseState = {
    warehouse: warehouseDb
  }

  const app = new Koa<AppWarehouseDatabaseState, Koa.DefaultContext>()

  app.use(async (ctx, next): Promise<void> => {
    ctx.state = state
    await next()
  })

  qs(app)
  app.use(cors())
  app.use(bodyParser())

  const koaRouter = new KoaRouter()
  RegisterRoutes(koaRouter)
  app.use(koaRouter.routes())

  app.use(koaSwagger({
    routePrefix: '/docs',
    specPrefix: '/docs/spec',
    exposeSpec: true,
    swaggerOptions: {
      spec: swagger
    }
  }))

  return {
    server: app.listen(port, () => {
      console.log('warehouse-api listening')
    }),
    state
  }
}
