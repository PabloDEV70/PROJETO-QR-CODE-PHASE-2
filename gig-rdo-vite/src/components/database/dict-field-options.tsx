import {
  Drawer, Typography, Chip, CircularProgress,
  Table, TableBody, TableCell, TableHead, TableRow,
} from '@mui/material';
import { useFieldOptions } from '@/hooks/use-dictionary-fields';

interface Props {
  nucampo: number | null;
  fieldName: string | null;
  onClose: () => void;
}

export function DictFieldOptions({ nucampo, fieldName, onClose }: Props) {
  const { data: options, isLoading } = useFieldOptions(nucampo);
  const list = options ?? [];

  return (
    <Drawer anchor="right" open={!!nucampo} onClose={onClose}
      slotProps={{ paper: { sx: { width: 340, p: 2 } } }}>
      <Typography sx={{ fontWeight: 700, fontSize: 14, mb: 1 }}>
        Opcoes: {fieldName}
      </Typography>
      {isLoading && <CircularProgress size={20} />}
      {!isLoading && list.length === 0 && (
        <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>
          Sem opcoes cadastradas
        </Typography>
      )}
      {list.length > 0 && (
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 700, fontSize: 11, py: 0.5 }}>Valor</TableCell>
              <TableCell sx={{ fontWeight: 700, fontSize: 11, py: 0.5 }}>Descricao</TableCell>
              <TableCell sx={{ fontWeight: 700, fontSize: 11, py: 0.5 }}>Padrao</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {list.map((o) => (
              <TableRow key={o.valor} hover>
                <TableCell sx={{ fontSize: 12, py: 0.3, fontFamily: 'monospace', fontWeight: 700 }}>
                  {o.valor}
                </TableCell>
                <TableCell sx={{ fontSize: 12, py: 0.3 }}>{o.opcao}</TableCell>
                <TableCell sx={{ fontSize: 12, py: 0.3 }}>
                  {o.padrao && (
                    <Chip label="default" size="small" color="primary"
                      sx={{ height: 16, fontSize: 9 }} />
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </Drawer>
  );
}
