import { Grid, Paper, Typography, Box, Divider, Stack, Tooltip } from '@mui/material';
import { AttachFileRounded } from '@mui/icons-material';
import { FuncionarioAvatar } from '@/components/shared/funcionario-avatar';
import { StatusBadge, PrioBadge } from '@/components/chamados/chamado-badges';
import type { Chamado } from '@/types/chamados-types';

interface ChamadoDetailCardProps {
  chamado: Chamado;
}

function formatDate(value: string | null): string {
  if (!value) return '-';
  return new Date(value).toLocaleString('pt-BR');
}

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <Box sx={{ mb: 1 }}>
      <Typography variant="caption" color="text.secondary">{label}</Typography>
      <Typography variant="body2">{value ?? '-'}</Typography>
    </Box>
  );
}

function PersonField({
  label, nome, codparc,
}: {
  label: string; nome: string | null; codparc: number | null;
}) {
  if (!nome) {
    return (
      <Box sx={{ mb: 1 }}>
        <Typography variant="caption" color="text.secondary">{label}</Typography>
        <Typography variant="body2">-</Typography>
      </Box>
    );
  }
  return (
    <Box sx={{ mb: 1.25 }}>
      <Typography variant="caption" color="text.secondary">{label}</Typography>
      <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 0.25 }}>
        <FuncionarioAvatar codparc={codparc} nome={nome} size="small" />
        <Typography variant="body2" fontWeight={500}>{nome}</Typography>
      </Stack>
    </Box>
  );
}

export function ChamadoDetailCard({ chamado }: ChamadoDetailCardProps) {
  return (
    <Paper variant="outlined" sx={{ p: 2 }}>
      <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap', alignItems: 'center' }}>
        <Typography variant="h6">Chamado #{chamado.NUCHAMADO}</Typography>
        <StatusBadge status={chamado.STATUS} />
        <PrioBadge prioridade={chamado.PRIORIDADE} />
        {chamado.TEM_ANEXO > 0 && (
          <Tooltip title={`${chamado.TEM_ANEXO} anexo(s)`} placement="top">
            <AttachFileRounded sx={{ fontSize: 20, color: '#64748b' }} />
          </Tooltip>
        )}
      </Box>

      {chamado.DESCRCHAMADO && (
        <Typography variant="body1" sx={{ mb: 2 }}>{chamado.DESCRCHAMADO}</Typography>
      )}

      <Divider sx={{ mb: 2 }} />

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 6 }}>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>Informacoes Basicas</Typography>
          <Field label="Tipo" value={chamado.TIPOCHAMADO} />
          <Field label="Setor" value={chamado.SETOR} />
          <Field label="Parceiro" value={chamado.NOMEPARC} />
        </Grid>

        <Grid size={{ xs: 12, sm: 6 }}>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>Pessoas</Typography>
          <PersonField
            label="Solicitante"
            nome={chamado.NOMESOLICITANTE}
            codparc={chamado.CODPARCSOLICITANTE}
          />
          <PersonField
            label="Atribuido a"
            nome={chamado.NOMEATRIBUIDO}
            codparc={chamado.CODPARCATRIBUIDO}
          />
          <PersonField
            label="Finalizado por"
            nome={chamado.NOMEFINALIZADOR}
            codparc={chamado.CODPARCFINALIZADOR}
          />
          <PersonField
            label="Validado por"
            nome={chamado.NOMEVALIDADOR}
            codparc={chamado.CODPARCVALIDADOR}
          />
          <PersonField
            label="Alterado por"
            nome={chamado.NOMEALTERADOR}
            codparc={chamado.CODPARCALTERADOR}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6 }}>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>Datas</Typography>
          <Field label="Abertura" value={formatDate(chamado.DHCHAMADO)} />
          <Field label="Previsao de Entrega" value={formatDate(chamado.DHPREVENTREGA)} />
          <Field label="Finalizacao" value={formatDate(chamado.DHFINCHAM)} />
          <Field label="Validacao" value={formatDate(chamado.DHVALIDACAO)} />
          <Field label="Ultima Alteracao" value={formatDate(chamado.DHALTER)} />
        </Grid>
      </Grid>
    </Paper>
  );
}
