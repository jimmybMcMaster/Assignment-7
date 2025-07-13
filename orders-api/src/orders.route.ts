import { BodyProp, Controller, Get, Path, Post, Put, Route, SuccessResponse, Request } from 'tsoa'
import { type OrderId, type FulfilledBooks, type OrderPlacement, type Order } from '../../warehouse-api/src/documented_types'
import { type ParameterizedContext, type DefaultContext, type Request as KoaRequest } from 'koa'
import { type AppOrdersDatabaseState } from './orders_database'

@Route('fulfil')
export class FulfilOrderRoutes extends Controller {
  /**
   * Fulfil an order by removing books from shelves
   */
  @Put('{order}')
  @SuccessResponse(201, 'Fulfilled')
  public async fulfilOrder (
    @Path() order: OrderId,
      @BodyProp('booksFulfilled') booksFulfilled: FulfilledBooks,
      @Request() request: KoaRequest
  ): Promise<void> {
    const ctx: ParameterizedContext<AppOrdersDatabaseState, DefaultContext> = request.ctx
    this.setStatus(201)

    try {
      await ctx.state.orders.fulfilOrder(order, booksFulfilled)
    } catch (e) {
      this.setStatus(500)
      console.error('Error fulfilling order:', e)
    }
  }
}

@Route('order')
export class OrderRoutes extends Controller {
  /**
   * Place an order
   */
  @Post()
  @SuccessResponse(201, 'Created')
  public async placeOrder (
    @BodyProp('order') order: OrderPlacement,
      @Request() request: KoaRequest
  ): Promise<OrderId> {
    const ctx: ParameterizedContext<AppOrdersDatabaseState, DefaultContext> = request.ctx
    this.setStatus(201)

    try {
      return await ctx.state.orders.placeOrder(
        order.reduce<Record<string, number>>((acc, id) => {
          acc[id] = (acc[id] ?? 0) + 1
          return acc
        }, {})
      )
    } catch (e) {
      this.setStatus(500)
      console.error('Error placing order:', e)
      return ''
    }
  }

  /**
   * Get all pending orders
   */
  @Get()
  public async listOrders (
    @Request() request: KoaRequest
  ): Promise<Order[]> {
    const ctx: ParameterizedContext<AppOrdersDatabaseState, DefaultContext> = request.ctx
    return await ctx.state.orders.listOrders()
  }
}
