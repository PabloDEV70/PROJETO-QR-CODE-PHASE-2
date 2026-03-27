import { IsString, IsArray, IsOptional, IsNumber, Min, Max } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class QueryRequestDto {
  @IsString()
  query: string;

  @IsArray()
  @IsOptional()
  params: any[] = [];

  @ApiPropertyOptional({
    description: 'Limite máximo de linhas retornadas (injeta TOP automaticamente se ausente)',
    example: 5000,
    default: 5000,
    minimum: 1,
    maximum: 10000,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(10000)
  maxRows?: number;
}
