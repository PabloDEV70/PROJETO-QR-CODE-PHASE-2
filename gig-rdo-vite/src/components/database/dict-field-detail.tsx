import {
  Drawer, Typography, Box, Chip, Divider, CircularProgress,
  Table, TableBody, TableCell, TableHead, TableRow,
} from '@mui/material';
import { useFieldOptions } from '@/hooks/use-dictionary-fields';
import { CodeBlock } from '@/components/shared/code-block';
import type { CampoDicionario, FieldTypesMap } from '@/types/database-types';

interface Props {
  field: CampoDicionario | null;
  tableName: string | null;
  pkCols: string[];
  fkMap: Map<string, string>;
  typeLabels: FieldTypesMap;
  presLabels: FieldTypesMap;
  onClose: () => void;
}

const cellSx = { fontSize: 12, py: 0.4 } as const;
const labelSx = { ...cellSx, fontWeight: 700, color: 'text.secondary', width: 130 } as const;

function MetaRow({ label, value }: { label: string; value: React.ReactNode }) {
  if (value == null || value === '' || value === '-') return null;
  return (
    <TableRow>
      <TableCell sx={labelSx}>{label}</TableCell>
      <TableCell sx={cellSx}>{value}</TableCell>
    </TableRow>
  );
}

function BoolChip({ value, label }: { value?: boolean; label: string }) {
  if (!value) return <Chip label="Nao" size="small" variant="outlined" sx={{ height: 18, fontSize: 9 }} />;
  return <Chip label={label} size="small" color="primary" sx={{ height: 18, fontSize: 9 }} />;
}

function OptionsSection({ nucampo }: { nucampo: number }) {
  const { data: options, isLoading } = useFieldOptions(nucampo);
  const list = options ?? [];
  if (isLoading) return <CircularProgress size={16} sx={{ mt: 1 }} />;
  if (list.length === 0) return null;

  return (
    <Box sx={{ mt: 1.5 }}>
      <Typography sx={{ fontSize: 12, fontWeight: 700, mb: 0.5 }}>
        Opcoes ({list.length})
      </Typography>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell sx={{ fontWeight: 700, fontSize: 11, py: 0.3 }}>Valor</TableCell>
            <TableCell sx={{ fontWeight: 700, fontSize: 11, py: 0.3 }}>Descricao</TableCell>
            <TableCell sx={{ fontWeight: 700, fontSize: 11, py: 0.3 }}>Padrao</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {list.map((o) => (
            <TableRow key={o.valor} hover>
              <TableCell sx={{ fontSize: 12, py: 0.25, fontFamily: 'monospace', fontWeight: 700 }}>
                {o.valor}
              </TableCell>
              <TableCell sx={{ fontSize: 12, py: 0.25 }}>{o.opcao}</TableCell>
              <TableCell sx={{ py: 0.25 }}>
                {o.padrao && <Chip label="default" size="small" color="primary"
                  sx={{ height: 16, fontSize: 9 }} />}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Box>
  );
}

export function DictFieldDetail({
  field, tableName, pkCols, fkMap, typeLabels, presLabels, onClose,
}: Props) {
  if (!field) return null;
  const isPk = pkCols.includes(field.nomeCampo);
  const fkRef = fkMap.get(field.nomeCampo);
  const typeLabel = typeLabels[field.tipo] ?? field.tipo;
  const presLabel = presLabels[field.tipoapresentacao ?? ''] ?? field.tipoapresentacao;
  const hasOptions = field.qtdOpcoes > 0;

  return (
    <Drawer anchor="right" open={!!field} onClose={onClose}
      slotProps={{ paper: { sx: { width: 380, p: 2, overflow: 'auto' } } }}>
      <Typography sx={{ fontFamily: 'monospace', fontWeight: 700, fontSize: 16 }}>
        {field.nomeCampo}
      </Typography>
      <Typography sx={{ fontSize: 12, color: 'text.secondary', mb: 1 }}>
        {tableName} &middot; #{field.nucampo}
      </Typography>

      <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mb: 1 }}>
        {isPk && <Chip label="PK" size="small" color="primary" sx={{ height: 20, fontSize: 10 }} />}
        {fkRef && <Chip label={`FK → ${fkRef}`} size="small" variant="outlined"
          sx={{ height: 20, fontSize: 10 }} />}
        {field.calculado && <Chip label="Calculado" size="small" sx={{ height: 20, fontSize: 10 }} />}
        {field.sistema && <Chip label="Sistema" size="small" variant="outlined"
          sx={{ height: 20, fontSize: 10 }} />}
        {field.adicional && <Chip label="Adicional" size="small" variant="outlined"
          sx={{ height: 20, fontSize: 10 }} />}
      </Box>

      <Table size="small">
        <TableBody>
          <MetaRow label="Descricao" value={field.descricao} />
          <MetaRow label="Tipo" value={`${typeLabel} (${field.tipo})`} />
          <MetaRow label="Tamanho" value={field.tamanho} />
          <MetaRow label="Apresentacao" value={presLabel ? `${presLabel} (${field.tipoapresentacao})` : null} />
          <MetaRow label="Mascara" value={field.mascara} />
          <MetaRow label="Ordem" value={field.ordem} />
          <MetaRow label="Pesquisavel" value={<BoolChip value={field.permitePesquisa} label="Sim" />} />
          <MetaRow label="Permite Padrao" value={<BoolChip value={field.permitepadrao} label="Sim" />} />
          <MetaRow label="Visivel Grid" value={<BoolChip value={field.visivelgridpesquisa} label="Sim" />} />
          <MetaRow label="Domain" value={field.domain} />
          <MetaRow label="Controle" value={field.controle} />
        </TableBody>
      </Table>

      {field.expressao && (
        <Box sx={{ mt: 1.5 }}>
          <Typography sx={{ fontSize: 12, fontWeight: 700, mb: 0.5 }}>Expressao</Typography>
          <CodeBlock code={field.expressao} language="sql" compact maxHeight={200} />
        </Box>
      )}

      {hasOptions && (
        <>
          <Divider sx={{ my: 1.5 }} />
          <OptionsSection nucampo={field.nucampo} />
        </>
      )}
    </Drawer>
  );
}
