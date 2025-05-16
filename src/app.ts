import "reflect-metadata";
import express from "express";
import dotenv from "dotenv";
import cors from "cors";

import { AppDataSource } from "./data-source";
import { userRoutes } from "./routes/user.routes";
import { productRoutes } from "./routes/product.routes";
import { orderRoutes } from "./routes/order.routes";
import { errorHandler } from "./middlewares/error-handler";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use("/users", userRoutes);
app.use("/products", productRoutes);
app.use("/orders", orderRoutes);

app.use(errorHandler);

AppDataSource.initialize()
  .then(() => {
    console.log("Data Source has been initialized!");
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((error) =>
    console.error("Error during Data Source initialization", error)
  );
