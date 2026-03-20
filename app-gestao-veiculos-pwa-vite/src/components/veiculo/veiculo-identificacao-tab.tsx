import { Box, Typography, Paper } from '@mui/material';
import {
  LocalShipping, Settings, CheckCircleOutline,
} from '@mui/icons-material';
import { PessoaAvatar } from '@/components/shared/pessoa-avatar';
import type { VeiculoPerfil } from '@/api/veiculos';

function SectionHeader({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
      <Box sx={{ color: 'primary.main', display: 'flex' }}>{icon}</Box>
      <Typography variant="overline" sx={{ color: 'text.secondary', lineHeight: 1 }}>
        {label}
      </Typography>
    </Box>
  );
}

function InfoRow({ label, value, mono }: { label: string; value: string | number | null | undefined; mono?: boolean }) {
  return (
    <Box sx={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
      py: 1, '&:not(:last-child)': { borderBottom: '1px solid', borderColor: 'divider' },
    }}>
      <Typography variant="caption" sx={{ color: 'text.secondary', flexShrink: 0, mr: 2 }}>
        {label}
      </Typography>
      <Typography variant="body2" sx={{
        fontWeight: 600, textAlign: 'right',
        ...(mono && { fontFamily: '"JetBrains Mono", monospace', letterSpacing: '0.02em' }),
      }}>
        {value ?? '-'}
      </Typography>
    </Box>
  );
}

interface Props { perfil: VeiculoPerfil }

export function VeiculoIdentificacaoTab({ perfil }: Props) {
  const anoLabel = perfil.anofabric && perfil.anomod
    ? `${perfil.anofabric}/${perfil.anomod}`
    : perfil.anofabric?.toString();

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Paper sx={{ p: 2 }}>
        <SectionHeader icon={<LocalShipping sx={{ fontSize: 20 }} />} label="Identificacao" />
        <InfoRow label="Codigo" value={perfil.codveiculo} mono />
        <InfoRow label="Placa" value={perfil.placa} mono />
        <InfoRow label="TAG" value={perfil.tag} mono />
        <InfoRow label="Marca/Modelo" value={perfil.marcamodelo} />
        <InfoRow label="Categoria" value={perfil.categoria} />
        <InfoRow label="Tipo" value={perfil.tipo} />
      </Paper>

      <Paper sx={{ p: 2 }}>
        <SectionHeader icon={<Settings sx={{ fontSize: 20 }} />} label="Dados Tecnicos" />
        <InfoRow label="Fabricante" value={perfil.fabricante} />
        <InfoRow label="Capacidade" value={perfil.capacidade} />
        <InfoRow label="Ano Fab/Mod" value={anoLabel} />
        <InfoRow label="Combustivel" value={perfil.combustivel} />
        <InfoRow label="Chassis" value={perfil.chassis} mono />
        <InfoRow label="Renavam" value={perfil.renavam} mono />
        <InfoRow label="KM Acumulado" value={perfil.kmacum?.toLocaleString('pt-BR')} mono />
      </Paper>

      <Paper sx={{ p: 2 }}>
        <SectionHeader icon={<CheckCircleOutline sx={{ fontSize: 20 }} />} label="Status Operacional" />
        <InfoRow label="Ativo" value={perfil.ativo === 'S' ? 'Sim' : 'Nao'} />
        <InfoRow label="Bloqueado" value={perfil.bloqueado === 'S' ? 'Sim' : 'Nao'} />

        {perfil.motoristaNome ? (
          <Box sx={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            py: 1, '&:not(:last-child)': { borderBottom: '1px solid', borderColor: 'divider' },
          }}>
            <Typography variant="caption" sx={{ color: 'text.secondary', flexShrink: 0, mr: 2 }}>
              Operador
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
              <PessoaAvatar codparc={perfil.codmotorista} nome={perfil.motoristaNome} size={24} />
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {perfil.motoristaNome}
              </Typography>
            </Box>
          </Box>
        ) : (
          <InfoRow label="Operador" value="-" />
        )}

        <InfoRow label="OS Manutencao" value={perfil.osManutencao?.length ?? 0} />
        <InfoRow label="OS Comerciais" value={perfil.osComerciais?.length ?? 0} />
        <InfoRow label="Contratos" value={perfil.contratos?.length ?? 0} />
      </Paper>
    </Box>
  );
}
