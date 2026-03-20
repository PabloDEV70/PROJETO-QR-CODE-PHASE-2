import { z } from 'zod';

export const rdoFormSchema = z.object({
  CODPARC: z.number({ error: 'Selecione um funcionario' }).positive('Selecione um funcionario'),
  DTREF: z.string({ error: 'Informe a data' }).min(1, 'Informe a data'),
});

export const detalheFormSchema = z.object({
  HRINI: z.number({ error: 'Informe hora inicio' }).min(0).max(2359),
  HRFIM: z.number({ error: 'Informe hora fim' }).min(0).max(2359),
  RDOMOTIVOCOD: z.number({ error: 'Selecione um motivo' }).positive(),
  NUOS: z.number().nullable().optional(),
  OBS: z.string().nullable().optional(),
}).refine((d) => d.HRFIM > d.HRINI, {
  message: 'Hora fim deve ser maior que hora inicio',
  path: ['HRFIM'],
});

export const motivoFormSchema = z.object({
  DESCRICAO: z.string({ error: 'Informe a descricao' }).min(1, 'Informe a descricao'),
  SIGLA: z.string({ error: 'Informe a sigla' }).min(1, 'Informe a sigla').max(5, 'Maximo 5 caracteres'),
  ATIVO: z.enum(['S', 'N']),
  PRODUTIVO: z.enum(['S', 'N']),
  TOLERANCIA: z.number().nullable(),
  PENALIDADE: z.number().nullable(),
  WTCATEGORIA: z.string().nullable(),
});

export type RdoFormInput = z.infer<typeof rdoFormSchema>;
export type DetalheFormInput = z.infer<typeof detalheFormSchema>;
export type MotivoFormInput = z.infer<typeof motivoFormSchema>;
