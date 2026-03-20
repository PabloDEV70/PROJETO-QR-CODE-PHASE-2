/**
 * DTOs para schemas de grid.
 *
 * Nota: Estes DTOs não implementam as interfaces diretamente porque
 * usam tipos string para serialização, enquanto as interfaces usam
 * tipos de domínio (value objects).
 *
 * @module FormBuilder
 */

export class ColunaGridSchemaDto {
  field: string;
  header: string;
  type: string;
  width?: number | string;
  sortable: boolean;
  filterable: boolean;
  editable: boolean;
  format?: string;
  align?: 'left' | 'center' | 'right';
  visible: boolean;
  order: number;
  isPrimaryKey: boolean;
  renderer?: string;
}

export class GridSchemaDto {
  tableName: string;
  title: string;
  description?: string;
  columns: ColunaGridSchemaDto[];
  config?: {
    pageable: boolean;
    pageSize: number;
    pageSizeOptions: number[];
    selectable: boolean;
    selectionMode?: 'single' | 'multiple';
    exportable: boolean;
    exportFormats?: ('csv' | 'excel' | 'pdf')[];
  };
  metadata?: {
    primaryKey?: string;
    totalRecords?: number;
  };
}
