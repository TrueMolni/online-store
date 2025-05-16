import { Router } from "express";
import { UserController } from "../controllers/user.controller";

const router = Router();
const userController = new UserController();


router.post("/", userController.createUser);


router.put("/:id", userController.updateUser);

router.get("/:id", userController.getUserById);

export const userRoutes = router;
