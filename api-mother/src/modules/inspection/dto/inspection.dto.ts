export class TableSchemaDto {
  tableName: string;
}

import { ApiProperty } from '@nestjs/swagger';

export class QueryDto {
  @ApiProperty({
    description: 'SQL SELECT query to execute',
    example: 'SELECT TOP 10 CODFUNC, NOMEFUNC FROM TFPFUN ORDER BY CODFUNC DESC',
  })
  query: string;

  @ApiProperty({
    description: 'Query parameters (optional)',
    example: [],
    required: false,
  })
  params?: any[];
}
