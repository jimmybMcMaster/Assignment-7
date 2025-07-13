import { afterEach, beforeEach } from 'vitest'
import server from '../server'
import { type AppWarehouseDatabaseState } from '../src/warehouse_database'

export interface WarehouseTestContext {
  address: string
  state: AppWarehouseDatabaseState
  closeServer: () => void
}

export default function (): void {
  beforeEach<WarehouseTestContext>(async (context) => {
    const { server: instance, state } = await server()
    const address = instance.address()
    context.address = typeof address === 'string'
      ? `http://${address}`
      : `http://localhost:${address?.port ?? 0}`

    context.state = state
    context.closeServer = () => instance.close()
  })

  afterEach<WarehouseTestContext>(async (context) => {
    context.closeServer()
  })
}
