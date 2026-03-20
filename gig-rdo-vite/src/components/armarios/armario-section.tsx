import { useState, useMemo } from 'react';
import { Box, Stack, Typography, IconButton, Button, Paper } from '@mui/material';
import { Print, OpenInNew } from '@mui/icons-material';
import { useArmarioFuncionario } from '@/hooks/use-armario';
import { ArmarioLabelDrawer } from '@/components/armarios/armario-label-print';
import type { ArmarioListItem } from '@/types/armario-types';

const BASE_URL = import.meta.env.VITE_PUBLIC_URL || 'https://publico.gigantao.net';

function InfoRow({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <Stack direction="row" justifyContent="space-between" sx={{ py: 0.4 }}>
      <Typography sx={{ fontSize: 12, color: '#64748b' }}>{label}</Typography>
      <Typography sx={{ fontSize: 12, fontWeight: 600, color: '#1e293b' }}>
        {value || '-'}
      </Typography>
    </Stack>
  );
}

function toListItem(a: {
  codarmario: number; nuarmario: number; localArm: number;
  tagArmario: string; localDescricao: string; nucadeado: string;
  codemp: number; codfunc: number;
}): ArmarioListItem {
  return {
    ...a, ocupado: 0, codparc: 0, nomeFuncionario: '',
    cargo: '', departamento: '', funcao: '', empresa: '',
  };
}

interface ArmarioSectionDrawerProps {
  codemp: number | null | undefined;
  codfunc: number | null | undefined;
}

export function ArmarioSectionDrawer({ codemp, codfunc }: ArmarioSectionDrawerProps) {
  const [labelOpen, setLabelOpen] = useState(false);
  const { data: armario } = useArmarioFuncionario(codemp, codfunc);
  const listItem = useMemo(() => armario ? toListItem(armario) : null, [armario]);

  if (!armario) return null;

  const publicUrl = `${BASE_URL}/p/armario/${armario.codarmario}`;

  return (
    <Box sx={{ mb: 2 }}>
      <Typography sx={{ fontSize: 12, fontWeight: 700, color: '#475569', mb: 0.75 }}>
        Armario
      </Typography>
      <Box sx={{
        bgcolor: '#f8fafc', borderRadius: '12px', p: 1.5,
        border: '1px solid rgba(148,163,184,0.15)',
      }}>
        <InfoRow label="TAG" value={armario.tagArmario} />
        <InfoRow label="Local" value={armario.localDescricao} />
        <InfoRow label="Numero" value={String(armario.nuarmario)} />
        {armario.nucadeado && <InfoRow label="Cadeado" value={armario.nucadeado} />}
        <Stack direction="row" spacing={0.5} sx={{ mt: 0.5 }}>
          <IconButton
            size="small" onClick={() => setLabelOpen(true)}
            title="Imprimir Etiqueta" sx={{ p: 0.25 }}
          >
            <Print sx={{ fontSize: 14, color: '#94a3b8' }} />
          </IconButton>
          <IconButton
            size="small" component="a" href={publicUrl} target="_blank"
            title="Ver pagina publica" sx={{ p: 0.25 }}
          >
            <OpenInNew sx={{ fontSize: 14, color: '#94a3b8' }} />
          </IconButton>
        </Stack>
      </Box>
      <ArmarioLabelDrawer
        open={labelOpen}
        onClose={() => setLabelOpen(false)}
        armario={listItem}
      />
    </Box>
  );
}

interface ArmarioSectionDetailProps {
  codemp: number | null | undefined;
  codfunc: number | null | undefined;
}

export function ArmarioSectionDetail({ codemp, codfunc }: ArmarioSectionDetailProps) {
  const [labelOpen, setLabelOpen] = useState(false);
  const { data: armario } = useArmarioFuncionario(codemp, codfunc);
  const listItem = useMemo(() => armario ? toListItem(armario) : null, [armario]);

  if (!armario) return null;

  const publicUrl = `${BASE_URL}/p/armario/${armario.codarmario}`;

  return (
    <Paper variant="outlined" sx={{ p: 2, borderRadius: '12px' }}>
      <Typography sx={{ fontSize: 13, fontWeight: 700, color: '#475569', mb: 1 }}>
        Armario
      </Typography>
      <InfoRow label="TAG" value={armario.tagArmario} />
      <InfoRow label="Local" value={armario.localDescricao} />
      <InfoRow label="Numero" value={String(armario.nuarmario)} />
      {armario.nucadeado && <InfoRow label="Cadeado" value={armario.nucadeado} />}
      <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
        <Button
          size="small" variant="outlined" startIcon={<Print />}
          onClick={() => setLabelOpen(true)}
          sx={{ textTransform: 'none', fontSize: 12, color: '#1B5E20', borderColor: '#1B5E20' }}
        >
          Imprimir Etiqueta
        </Button>
        <Button
          size="small" variant="text" startIcon={<OpenInNew />}
          component="a" href={publicUrl} target="_blank"
          sx={{ textTransform: 'none', fontSize: 12, color: '#475569' }}
        >
          Ver publica
        </Button>
      </Stack>
      <ArmarioLabelDrawer
        open={labelOpen}
        onClose={() => setLabelOpen(false)}
        armario={listItem}
      />
    </Paper>
  );
}
