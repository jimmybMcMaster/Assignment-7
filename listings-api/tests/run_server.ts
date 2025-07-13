import { afterEach, beforeEach } from 'vitest'
import server from '../server'
import { type AppBookDatabaseState } from '../database_access'

export interface ListingsTestContext {
  address: string
  state: AppBookDatabaseState
  closeServer: () => void
}

export default function (): void {
  beforeEach<ListingsTestContext>(async (context) => {
    const { server: instance, state } = await server()
    const address = instance.address()
    context.address = typeof address === 'string'
      ? `http://${address}`
      : `http://localhost:${address?.port ?? 0}`

    context.state = state
    context.closeServer = () => instance.close()
  })

  afterEach<ListingsTestContext>(async (context) => {
    context.closeServer()
  })
}
