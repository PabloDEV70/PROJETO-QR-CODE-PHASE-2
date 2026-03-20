import { Box, Typography, Paper, Chip } from '@mui/material';
import { Business, DirectionsCar } from '@mui/icons-material';
import { PessoaAvatar } from '@/components/shared/pessoa-avatar';
import type { OsComercial } from '@/api/veiculos';
import { fmtDateShort } from '@/utils/fmt';

const SIT_LABEL: Record<string, { label: string; color: 'warning' | 'info' | 'success' | 'default' }> = {
  P: { label: 'Pendente', color: 'warning' },
  A: { label: 'Em Andamento', color: 'info' },
  F: { label: 'Fechada', color: 'success' },
  C: { label: 'Cancelada', color: 'default' },
};

function isPessoa(tippessoa: string | null): boolean {
  return tippessoa === 'F';
}

interface Props { items: OsComercial[] }

export function VeiculoComercialTab({ items }: Props) {
  if (!items?.length) {
    return (
      <Box sx={{ textAlign: 'center', py: 6, color: 'text.secondary' }}>
        <Business sx={{ fontSize: 40, opacity: 0.3, mb: 1 }} />
        <Typography variant="body2">Nenhuma OS comercial</Typography>
      </Box>
    );
  }

  const abertas = items.filter((o) => o.situacao === 'A' || o.situacao === 'P').length;
  const totalDiarias = items.reduce((s, o) => s + (o.qtdDiarias ?? 0), 0);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
        <Chip size="small" label={`${items.length} OS`} variant="outlined" />
        <Chip size="small" label={`${totalDiarias} diarias`} variant="outlined" />
        {abertas > 0 && <Chip size="small" label={`${abertas} abertas`} color="info" />}
      </Box>

      {items.map((os) => {
        const sit = SIT_LABEL[os.situacao] ?? { label: os.situacao, color: 'default' as const };
        const operadorIsPessoa = isPessoa(os.tippessoaOperador);

        return (
          <Paper key={os.numos} sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <Typography sx={{ fontWeight: 700, fontSize: '0.95rem', fontFamily: 'monospace' }}>
                OS {os.numos}
              </Typography>
              <Chip size="small" label={sit.label} color={sit.color} />
              {os.qtdDiarias != null && os.qtdDiarias > 1 && (
                <Chip size="small" label={`${os.qtdDiarias} diarias`} variant="outlined" />
              )}
            </Box>

            {os.nomeParc && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <PessoaAvatar codparc={os.codparc} nome={os.nomeParc} size={28} />
                <Typography variant="body2" sx={{ fontWeight: 600 }}>{os.nomeParc}</Typography>
              </Box>
            )}

            <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap', mb: os.operadorNome ? 1 : 0 }}>
              <MetaItem label="Abertura" value={fmtDateShort(os.dtabertura)} />
              {os.dhPrevistaIni && <MetaItem label="Previsto" value={`${fmtDateShort(os.dhPrevistaIni)} — ${fmtDateShort(os.dhPrevistaFim)}`} />}
            </Box>

            {os.operadorNome && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, pt: 1, borderTop: '1px solid', borderColor: 'divider' }}>
                {operadorIsPessoa ? (
                  <PessoaAvatar codparc={os.codparcOperador} nome={os.operadorNome} size={24} />
                ) : (
                  <DirectionsCar sx={{ fontSize: 20, color: 'text.secondary' }} />
                )}
                <Box>
                  <Typography variant="caption" sx={{ color: 'text.disabled', display: 'block', lineHeight: 1 }}>
                    {operadorIsPessoa ? 'Operador' : 'Veiculo'}
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600, lineHeight: 1.3 }}>
                    {os.operadorNome}
                  </Typography>
                </Box>
              </Box>
            )}

            {os.localExecucao && (
              <Typography variant="caption" sx={{ color: 'text.disabled', mt: 0.75, display: 'block' }}>
                Local: {os.localExecucao}
              </Typography>
            )}
          </Paper>
        );
      })}
    </Box>
  );
}

function MetaItem({ label, value }: { label: string; value: string }) {
  return (
    <Box>
      <Typography variant="caption" sx={{ color: 'text.disabled', display: 'block', lineHeight: 1 }}>{label}</Typography>
      <Typography variant="body2" sx={{ fontWeight: 600, lineHeight: 1.3 }}>{value}</Typography>
    </Box>
  );
}
