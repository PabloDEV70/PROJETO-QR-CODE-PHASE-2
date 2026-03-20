import {
  Box,
  Card,
  CardContent,
  Chip,
  Typography,
} from '@mui/material';
import { format, parseISO, isValid } from 'date-fns';
import type { OsComercial } from '@/types/veiculo-perfil-types';

interface Props {
  items: OsComercial[];
}

function safeFmt(v: string | Date | null, fmt = 'dd/MM/yyyy'): string {
  if (!v) return '-';
  const d = typeof v === 'string' ? parseISO(v) : new Date(v);
  return isValid(d) ? format(d, fmt) : '-';
}

function situacaoLabel(s: string): string {
  if (s === 'P') return 'Pendente';
  if (s === 'A') return 'Aberta';
  if (s === 'F') return 'Fechada';
  if (s === 'C') return 'Cancelada';
  return s;
}

function situacaoColor(s: string): 'warning' | 'info' | 'success' | 'default' {
  if (s === 'P') return 'warning';
  if (s === 'A') return 'info';
  if (s === 'F') return 'success';
  return 'default';
}

function dateRange(ini: string | null, fim: string | null): string {
  const a = safeFmt(ini);
  const b = safeFmt(fim);
  if (a === b) return a;
  return `${a} → ${b}`;
}

function OsComercialRow({ os }: { os: OsComercial }) {
  return (
    <Card variant="outlined">
      <CardContent sx={{ py: 1, px: 1.5, '&:last-child': { pb: 1 } }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
          <Typography variant="body2" sx={{ fontWeight: 700 }}>
            OS {os.numos}
          </Typography>
          <Chip
            label={situacaoLabel(os.situacao)}
            size="small"
            color={situacaoColor(os.situacao)}
            sx={{ height: 20, fontSize: '0.65rem', fontWeight: 600 }}
          />
          {os.qtdDiarias > 1 && (
            <Chip
              label={`${os.qtdDiarias} diarias`}
              size="small"
              variant="outlined"
              sx={{ height: 20, fontSize: '0.65rem' }}
            />
          )}
          {os.nomeParc && (
            <Typography variant="body2" color="text.secondary" noWrap sx={{ maxWidth: 300 }}>
              {os.nomeParc}
            </Typography>
          )}
        </Box>
        <Box sx={{ display: 'flex', gap: 2, mt: 0.5, flexWrap: 'wrap' }}>
          <Typography variant="caption" color="text.secondary">
            Abertura: {safeFmt(os.dtabertura, 'dd/MM/yyyy HH:mm')}
          </Typography>
          {os.dhPrevistaIni && (
            <Typography variant="caption" color="text.secondary">
              Previsto: {dateRange(os.dhPrevistaIni, os.dhPrevistaFim)}
            </Typography>
          )}
        </Box>
        {(os.inicexec || os.operadorNome || os.localExecucao) && (
          <Box sx={{ display: 'flex', gap: 2, mt: 0.25, flexWrap: 'wrap' }}>
            {os.inicexec && (
              <Typography variant="caption" color="text.secondary">
                Exec: {safeFmt(os.inicexec)} - {safeFmt(os.termexec)}
              </Typography>
            )}
            {os.operadorNome && (
              <Typography variant="caption" color="text.secondary">
                Operador: {os.operadorNome}
              </Typography>
            )}
            {os.localExecucao && (
              <Typography variant="caption" color="text.secondary">
                Local: {os.localExecucao}
              </Typography>
            )}
          </Box>
        )}
      </CardContent>
    </Card>
  );
}

export function VeiculoComercialTab({ items }: Props) {
  if (items.length === 0) {
    return (
      <Card>
        <CardContent>
          <Typography color="text.secondary">Nenhuma OS comercial encontrada</Typography>
        </CardContent>
      </Card>
    );
  }

  const abertas = items.filter((o) => !o.dtfechamento).length;
  const totalDiarias = items.reduce((s, o) => s + (o.qtdDiarias || 0), 0);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
      <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
        OS Comerciais — {items.length} OS, {totalDiarias} diarias
        {abertas > 0 && ` (${abertas} abertas)`}
      </Typography>
      {items.map((os) => (
        <OsComercialRow key={os.numos} os={os} />
      ))}
    </Box>
  );
}
