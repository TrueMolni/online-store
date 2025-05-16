import { DataSource } from "typeorm";
import { User } from "./entities/User";
import { Product } from "./entities/Product";
import { OrderItem } from "./entities/OrderItem";
import { Order } from "./entities/Order";

export const AppDataSource = new DataSource({
  type: "postgres",
  host: "localhost",
  port: 5432,
  username: "postgres",
  password: "1",
  database: "online_store",
  synchronize: true,
  logging: false,
  entities: [User, Order, OrderItem, Product],
});
