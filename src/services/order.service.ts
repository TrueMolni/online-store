import { AppDataSource } from "../data-source";
import { Order, OrderStatus } from "../entities/Order";
import { OrderItem } from "../entities/OrderItem";
import { Product } from "../entities/Product";
import { User } from "../entities/User";
import { CreateOrderDto } from "../dtos/order.dto";

export class OrderService {
  private orderRepository = AppDataSource.getRepository(Order);
  private orderItemRepository = AppDataSource.getRepository(OrderItem);
  private productRepository = AppDataSource.getRepository(Product);
  private userRepository = AppDataSource.getRepository(User);

  public async createOrder(createOrderDto: CreateOrderDto): Promise<Order> {
    const user = await this.userRepository.findOneBy({
      id: createOrderDto.userId,
    });
    if (!user) {
      throw new Error("User not found");
    }

    return AppDataSource.transaction(async (transactionalEntityManager) => {
      let totalAmount = 0;
      const orderItems: OrderItem[] = [];

      for (const item of createOrderDto.items) {
        const product = await this.productRepository.findOneBy({
          id: item.productId,
        });
        if (!product) {
          throw new Error(`Product with ID ${item.productId} not found`);
        }

        if (!product.isAvailable) {
          throw new Error(`Product ${product.name} is not available`);
        }

        if (product.quantity < item.quantity) {
          throw new Error(
            `Not enough quantity available for product ${product.name}`
          );
        }

        const orderItem = new OrderItem();
        orderItem.productId = product.id;
        orderItem.quantity = item.quantity;
        orderItem.priceAtPurchase = product.price;
        orderItems.push(orderItem);

        product.quantity -= item.quantity;
        if (product.quantity === 0) {
          product.isAvailable = false;
        }

        await transactionalEntityManager.save(product);

        totalAmount += product.price * item.quantity;
      }

      const order = new Order();
      order.userId = createOrderDto.userId;
      order.totalAmount = totalAmount;
      order.status = OrderStatus.PENDING;

      const savedOrder = await transactionalEntityManager.save(order);

      for (const item of orderItems) {
        item.orderId = savedOrder.id;
        await transactionalEntityManager.save(item);
      }

      const orderWithItems = await transactionalEntityManager.findOne(Order, {
        where: { id: savedOrder.id },
        relations: ["orderItems", "orderItems.product"],
      });

      return orderWithItems!;
    });
  }

  public async updateOrderStatus(
    orderId: string,
    status: OrderStatus
  ): Promise<Order | null> {
    const order = await this.orderRepository.findOne({
      where: { id: orderId },
      relations: ["orderItems", "orderItems.product"],
    });

    if (!order) {
      return null;
    }

    if (
      status === OrderStatus.CANCELED &&
      order.status !== OrderStatus.CANCELED
    ) {
      await AppDataSource.transaction(async (transactionalEntityManager) => {
        for (const item of order.orderItems) {
          const product = await this.productRepository.findOneBy({
            id: item.productId,
          });
          if (product) {
            product.quantity += item.quantity;
            product.isAvailable = true;
            await transactionalEntityManager.save(product);
          }
        }
      });
    }

    order.status = status;
    return this.orderRepository.save(order);
  }

  public async getUserOrders(
    userId: string,
    status?: OrderStatus
  ): Promise<Order[]> {
    const whereConditions: any = { userId };

    if (status) {
      whereConditions.status = status;
    }

    return this.orderRepository.find({
      where: whereConditions,
      relations: ["orderItems", "orderItems.product"],
      order: { createdAt: "DESC" },
    });
  }
}
