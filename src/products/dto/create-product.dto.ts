import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  Min,
} from 'class-validator';

export class CreateProductDto {
  @IsString()
  public name: string;

  @Type(() => Number)
  @IsNumber({
    maxDecimalPlaces: 4,
  })
  @IsPositive()
  @Min(0)
  public price: number;

  @Type(() => Boolean)
  @IsBoolean()
  @IsOptional()
  public state?: boolean = false;
}
