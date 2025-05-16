import { Request, Response, NextFunction } from "express";
import { validate } from "class-validator";
import { plainToInstance } from "class-transformer";
import { OrderService } from "../services/order.service";
import {
  CreateOrderDto,
  UpdateOrderStatusDto,
  GetOrdersQueryDto,
} from "../dtos/order.dto";
import { OrderStatus } from "../entities/Order";

export class OrderController {
  private orderService: OrderService;

  constructor() {
    this.orderService = new OrderService();
  }

  public createOrder = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const createOrderDto = plainToInstance(CreateOrderDto, req.body);
      const errors = await validate(createOrderDto);

      if (errors.length > 0) {
        return res.status(400).json({ errors });
      }

      const order = await this.orderService.createOrder(createOrderDto);
      return res.status(201).json(order);
    } catch (error) {
      next(error);
    }
  };

  public cancelOrder = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const orderId = req.params.id;
      const order = await this.orderService.updateOrderStatus(
        orderId,
        OrderStatus.CANCELED
      );

      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }

      return res.status(200).json(order);
    } catch (error) {
      next(error);
    }
  };

  public updateOrderStatus = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const orderId = req.params.id;
      const updateStatusDto = plainToInstance(UpdateOrderStatusDto, req.body);
      const errors = await validate(updateStatusDto);

      if (errors.length > 0) {
        return res.status(400).json({ errors });
      }

      const order = await this.orderService.updateOrderStatus(
        orderId,
        updateStatusDto.status
      );
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }

      return res.status(200).json(order);
    } catch (error) {
      next(error);
    }
  };

  public getUserOrders = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const userId = req.params.userId;
      const queryDto = plainToInstance(GetOrdersQueryDto, req.query);
      const errors = await validate(queryDto);

      if (errors.length > 0) {
        return res.status(400).json({ errors });
      }

      const orders = await this.orderService.getUserOrders(
        userId,
        queryDto.status
      );
      return res.status(200).json(orders);
    } catch (error) {
      next(error);
    }
  };
}
