import { Like } from "typeorm";
import { AppDataSource } from "../data-source";
import { Product } from "../entities/Product";
import { CreateProductDto, UpdateProductDto } from "../dtos/product.dto";

interface GetProductsParams {
  search?: string;
  isAvailable?: boolean;
  limit: number;
  offset: number;
}

export class ProductService {
  private productRepository = AppDataSource.getRepository(Product);

  public async createProduct(
    createProductDto: CreateProductDto
  ): Promise<Product> {
    const product = this.productRepository.create(createProductDto);
    return this.productRepository.save(product);
  }

  public async getProducts(
    params: GetProductsParams
  ): Promise<{ products: Product[]; total: number }> {
    const { search, isAvailable, limit, offset } = params;

    const whereConditions: any = {};

    if (search) {
      whereConditions.name = Like(`%${search}%`);
    }

    if (isAvailable !== undefined) {
      whereConditions.isAvailable = isAvailable;
    }

    const [products, total] = await this.productRepository.findAndCount({
      where: whereConditions,
      order: { createdAt: "DESC" },
      take: limit,
      skip: offset,
    });

    return { products, total };
  }

  public async getProductById(productId: string): Promise<Product | null> {
    return this.productRepository.findOneBy({ id: productId });
  }

  public async updateProduct(
    productId: string,
    updateProductDto: UpdateProductDto
  ): Promise<Product | null> {
    const product = await this.productRepository.findOneBy({ id: productId });

    if (!product) {
      return null;
    }

    this.productRepository.merge(product, updateProductDto);
    return this.productRepository.save(product);
  }
}
