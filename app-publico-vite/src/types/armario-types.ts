export interface ArmarioPublico {
  codarmario: number;
  nuarmario: number;
  tagArmario: string;
  localDescricao: string;
  ocupado: boolean;
  funcionario: {
    nome: string;
    departamento: string;
    empresa: string;
    fotoBase64: string | null;
  } | null;
}
