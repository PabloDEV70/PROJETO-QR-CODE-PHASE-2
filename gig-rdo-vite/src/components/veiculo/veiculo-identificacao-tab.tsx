import {
  Box,
  Card,
  CardContent,
  Divider,
  Grid,
  Typography,
} from '@mui/material';
import type { VeiculoPerfil } from '@/types/veiculo-perfil-types';
import { COMBUSTIVEL_MAP } from '@/types/veiculo-perfil-types';

interface Props {
  perfil: VeiculoPerfil;
}

function InfoRow({ label, value }: { label: string; value: string | number | null | undefined }) {
  const display = value != null && value !== '' ? String(value) : '-';
  return (
    <Box sx={{ py: 0.5 }}>
      <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
        {label}
      </Typography>
      <Typography variant="body2" sx={{ fontWeight: 500 }}>
        {display}
      </Typography>
    </Box>
  );
}

export function VeiculoIdentificacaoTab({ perfil }: Props) {
  const combustivelLabel = perfil.combustivel
    ? (COMBUSTIVEL_MAP[perfil.combustivel] || perfil.combustivel)
    : null;

  return (
    <Grid container spacing={2}>
      <Grid size={{ xs: 12, md: 6 }}>
        <Card>
          <CardContent>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
              Identificacao
            </Typography>
            <Divider sx={{ mb: 1 }} />
            <InfoRow label="Codigo" value={perfil.codveiculo} />
            <InfoRow label="Placa" value={perfil.placa} />
            <InfoRow label="TAG" value={perfil.tag} />
            <InfoRow label="Marca / Modelo" value={perfil.marcamodelo} />
            <InfoRow label="Categoria / Tipo Eqpto" value={perfil.categoria} />
            <InfoRow label="Especie / Tipo" value={perfil.tipo} />
          </CardContent>
        </Card>
      </Grid>

      <Grid size={{ xs: 12, md: 6 }}>
        <Card>
          <CardContent>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
              Dados Tecnicos
            </Typography>
            <Divider sx={{ mb: 1 }} />
            <InfoRow label="Fabricante" value={perfil.fabricante} />
            <InfoRow label="Capacidade" value={perfil.capacidade} />
            <InfoRow
              label="Ano Fabricacao / Modelo"
              value={
                perfil.anofabric
                  ? `${perfil.anofabric} / ${perfil.anomod || perfil.anofabric}`
                  : null
              }
            />
            <InfoRow label="Combustivel" value={combustivelLabel} />
            <InfoRow label="Chassis" value={perfil.chassis} />
            <InfoRow label="Renavam" value={perfil.renavam} />
            <InfoRow label="KM Acumulado" value={perfil.kmacum} />
          </CardContent>
        </Card>
      </Grid>

      <Grid size={{ xs: 12, md: 6 }}>
        <Card>
          <CardContent>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
              Status Operacional
            </Typography>
            <Divider sx={{ mb: 1 }} />
            <InfoRow label="Ativo" value={perfil.ativo === 'S' ? 'Sim' : 'Nao'} />
            <InfoRow label="Bloqueado" value={perfil.bloqueado === 'S' ? 'Sim' : 'Nao'} />
            <InfoRow label="Exibe no Dashboard" value={perfil.exibeDash === 'S' ? 'Sim' : 'Nao'} />
            <InfoRow label="Motorista / Operador" value={perfil.motoristaNome} />
          </CardContent>
        </Card>
      </Grid>

      <Grid size={{ xs: 12, md: 6 }}>
        <Card>
          <CardContent>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
              Resumo
            </Typography>
            <Divider sx={{ mb: 1 }} />
            <InfoRow
              label="OS Manutencao Ativas"
              value={
                perfil.osManutencao
                  ? perfil.osManutencao.filter((o) => o.status !== 'F').length
                  : '-'
              }
            />
            <InfoRow
              label="OS Comerciais Ativas"
              value={
                perfil.osComerciais
                  ? perfil.osComerciais.filter((o) => !o.dtfechamento).length
                  : '-'
              }
            />
            <InfoRow
              label="Contratos Vigentes"
              value={
                perfil.contratos
                  ? perfil.contratos.filter((c) => c.statusContrato === 'VIGENTE').length
                  : '-'
              }
            />
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
}
