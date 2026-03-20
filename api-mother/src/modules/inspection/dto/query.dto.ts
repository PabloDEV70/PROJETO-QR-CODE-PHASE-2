import { IsString, IsArray, IsOptional } from 'class-validator';

export class QueryRequestDto {
  @IsString()
  query: string;

  @IsArray()
  @IsOptional()
  params: any[] = [];
}
