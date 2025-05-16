import { Request, Response, NextFunction } from "express";
import { validate } from "class-validator";
import { plainToInstance } from "class-transformer";
import { ProductService } from "../services/product.service";
import { CreateProductDto, UpdateProductDto } from "../dtos/product.dto";

export class ProductController {
  private productService: ProductService;

  constructor() {
    this.productService = new ProductService();
  }

  public createProduct = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const createProductDto = plainToInstance(CreateProductDto, req.body);
      const errors = await validate(createProductDto);

      if (errors.length > 0) {
        return res.status(400).json({ errors });
      }

      const product = await this.productService.createProduct(createProductDto);
      return res.status(201).json(product);
    } catch (error) {
      next(error);
    }
  };

  public getProducts = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { search, available, page = "1" } = req.query;

      const pageNumber = parseInt(page as string, 10);
      const limit = 20;
      const offset = (pageNumber - 1) * limit;

      const isAvailable =
        available === "true" ? true : available === "false" ? false : undefined;

      const { products, total } = await this.productService.getProducts({
        search: search as string,
        isAvailable,
        limit,
        offset,
      });

      return res.status(200).json({
        products,
        pagination: {
          page: pageNumber,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      });
    } catch (error) {
      next(error);
    }
  };

  public getProductById = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const productId = req.params.id;
      const product = await this.productService.getProductById(productId);

      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }

      return res.status(200).json(product);
    } catch (error) {
      next(error);
    }
  };

  public updateProduct = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const productId = req.params.id;
      const updateProductDto = plainToInstance(UpdateProductDto, req.body);
      const errors = await validate(updateProductDto);

      if (errors.length > 0) {
        return res.status(400).json({ errors });
      }

      const product = await this.productService.updateProduct(
        productId,
        updateProductDto
      );
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }

      return res.status(200).json(product);
    } catch (error) {
      next(error);
    }
  };
}
