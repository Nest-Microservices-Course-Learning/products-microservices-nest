import { HttpStatus, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PrismaClient } from '@prisma/client';
import { PaginationDto } from 'src/common';
import { RpcException } from '@nestjs/microservices';

@Injectable()
export class ProductsService extends PrismaClient implements OnModuleInit {
  private readonly logger = new Logger('ProductService');

  onModuleInit() {
    this.$connect();
    this.logger.log('DB connected');
  }
  create(createProductDto: CreateProductDto) {
    return this.product.create({
      data: createProductDto,
    });
  }

  async findAll(paginationDto: PaginationDto) {
    const { page, limit } = paginationDto;
    const totalPage = await this.product.count();
    const lastPage = Math.ceil(totalPage / limit);
    return {
      total: totalPage,
      currentPage: page,
      lastPage: lastPage,
      data: await this.product.findMany({
        take: limit,
        skip: (page - 1) * limit,
        where: {
          state: true,
        },
      }),
      nextPage:
        page + 1 < lastPage ? `/products?page=${page + 1}&limit=${limit}` : '',
      backPage: page - 1 > 0 ? `/products?page=${page - 1}&limit=${limit}` : '',
    };
  }

  async findOne(id: number) {
    const product = await this.product.findFirst({
      where: {
        id,
      },
    });
    if (!product)
      throw new RpcException({
        message: `Product with id ${id} not found`,
        status: HttpStatus.BAD_REQUEST,
      });
    return product;
  }

  async update(id: number, updateProductDto: UpdateProductDto) {
    const { id: __, ...data } = updateProductDto;
    console.log(__);
    await this.findOne(id);
    return this.product.update({
      where: {
        id,
      },
      data: data,
    });
  }

  async remove(id: number) {
    const product = await this.findOne(id);

    if (!product.state)
      throw new RpcException({
        message: `Product with id ${id} not available`,
        status: HttpStatus.BAD_REQUEST,
      });

    return this.product.update({
      where: {
        id: id,
        state: true,
      },
      data: {
        state: false,
      },
    });
  }

  async validateProducts(ids: number[]) {
    ids = Array.from(new Set(ids));

    const products = await this.product.findMany({
      where: {
        id: {
          in: ids,
        },
      },
    });

    if (products.length !== ids.length) {
      throw new RpcException({
        message: 'Some products were not found',
        status: HttpStatus.BAD_REQUEST,
      });
    }

    return products;
  }
}
