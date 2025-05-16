import { Router } from "express";
import { OrderController } from "../controllers/order.controller";

const router = Router();
const orderController = new OrderController();

router.post("/", orderController.createOrder);

router.put("/:id/cancel", orderController.cancelOrder);

router.put("/:id/status", orderController.updateOrderStatus);

router.get("/user/:userId", orderController.getUserOrders);

export const orderRoutes = router;
