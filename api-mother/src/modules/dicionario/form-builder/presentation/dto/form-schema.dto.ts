/**
 * DTOs para schemas de formulário.
 *
 * Nota: Estes DTOs não implementam as interfaces diretamente porque
 * usam tipos string para serialização, enquanto as interfaces usam
 * tipos de domínio (value objects).
 *
 * @module FormBuilder
 */

export class ValidationRuleDto {
  type: string;
  value?: any;
  message?: string;
}

export class CampoFormSchemaDto {
  name: string;
  label: string;
  type: 'text' | 'number' | 'date' | 'time' | 'boolean' | 'select' | 'textarea';
  tipoSankhya: string;
  required: boolean;
  readonly: boolean;
  defaultValue?: any;
  placeholder?: string;
  helpText?: string;
  mask?: string;
  validations: ValidationRuleDto[];
  options?: Array<{ value: any; label: string }>;
  maxLength?: number;
  decimals?: number;
  min?: number | Date;
  max?: number | Date;
  order: number;
  visible: boolean;
  isPrimaryKey: boolean;
  isForeignKey: boolean;
}

export class FormSchemaDto {
  tableName: string;
  title: string;
  description?: string;
  fields: CampoFormSchemaDto[];
  metadata?: {
    primaryKey?: string;
    foreignKeys?: string[];
    requiredFields?: string[];
  };
}
