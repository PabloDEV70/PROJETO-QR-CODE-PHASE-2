import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box, Typography, Stack, Skeleton, Button, Paper, Chip, Divider, IconButton,
} from '@mui/material';
import { ArrowBack, Visibility, VisibilityOff, Print } from '@mui/icons-material';
import {
  Timeline, TimelineItem, TimelineSeparator,
  TimelineConnector, TimelineContent, TimelineDot,
} from '@mui/lab';
import { FuncionarioAvatar } from '@/components/shared/funcionario-avatar';
import { SituacaoBadge } from '@/components/funcionarios/situacao-badge';
import { useFuncionarioPerfilSuper } from '@/hooks/use-funcionario';
import { FuncionarioQrCode } from '@/components/funcionarios/funcionario-qr-code';
import { FuncionarioQrPrint } from '@/components/funcionarios/funcionario-qr-print';
import {
  fmtDate, fmtCurrency, calcIdade, fmtTempoEmpresa,
} from '@/utils/funcionario-formatters';
import { ArmarioSectionDetail } from '@/components/armarios/armario-section';

function InfoRow({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <Stack direction="row" justifyContent="space-between" sx={{ py: 0.4 }}>
      <Typography sx={{ fontSize: 13, color: '#64748b' }}>{label}</Typography>
      <Typography sx={{ fontSize: 13, fontWeight: 600, color: '#1e293b' }}>
        {value || '-'}
      </Typography>
    </Stack>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Paper variant="outlined" sx={{ p: 2, borderRadius: '12px' }}>
      <Typography sx={{ fontSize: 13, fontWeight: 700, color: '#475569', mb: 1 }}>
        {title}
      </Typography>
      {children}
    </Paper>
  );
}

function SalarioRow({ salBruto }: { salBruto: number | null | undefined }) {
  const [show, setShow] = useState(false);
  const formatted = fmtCurrency(salBruto);
  return (
    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ py: 0.4 }}>
      <Typography sx={{ fontSize: 13, color: '#64748b' }}>Salario Bruto</Typography>
      <Stack direction="row" alignItems="center" spacing={0.5}>
        <Typography sx={{ fontSize: 13, fontWeight: 600, color: '#1e293b' }}>
          {show ? formatted : '******'}
        </Typography>
        <IconButton size="small" onClick={() => setShow((p) => !p)} sx={{ p: 0.25 }}>
          {show
            ? <VisibilityOff sx={{ fontSize: 16, color: '#94a3b8' }} />
            : <Visibility sx={{ fontSize: 16, color: '#94a3b8' }} />}
        </IconButton>
      </Stack>
    </Stack>
  );
}

export function FuncionarioDetailPage() {
  const { codparc: raw } = useParams<{ codparc: string }>();
  const codparc = raw ? Number(raw) : null;
  const navigate = useNavigate();
  const { data: perfil, isLoading } = useFuncionarioPerfilSuper(codparc);
  const [printOpen, setPrintOpen] = useState(false);

  if (isLoading) {
    return (
      <Stack spacing={2} sx={{ p: 2 }}>
        <Skeleton variant="rounded" height={80} />
        <Skeleton variant="rounded" height={120} />
        <Skeleton variant="rounded" height={100} />
      </Stack>
    );
  }

  if (!perfil) {
    return (
      <Box sx={{ p: 3 }}>
        <Button startIcon={<ArrowBack />} onClick={() => navigate('/funcionarios')}
          sx={{ mb: 2, textTransform: 'none' }}>
          Voltar
        </Button>
        <Typography color="text.secondary">Funcionario nao encontrado.</Typography>
      </Box>
    );
  }

  const v = perfil.vinculoAtual;
  const vinculos = perfil.historico?.vinculos ?? [];

  return (
    <Box sx={{ p: 2, maxWidth: 800 }}>
      <Button startIcon={<ArrowBack />} onClick={() => navigate('/funcionarios')}
        sx={{ mb: 2, textTransform: 'none' }}>
        Voltar
      </Button>

      {/* Header */}
      <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 3 }}>
        <FuncionarioAvatar codparc={perfil.codparc} nome={perfil.nomeparc} size="large" />
        <Box>
          <Typography variant="h5" fontWeight={700}>{perfil.nomeparc}</Typography>
          <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 0.5 }}>
            {v && <SituacaoBadge situacao={v.situacao} label={v.situacaoLabel} size="md" />}
            {v && (
              <Typography sx={{ fontSize: 12, color: '#94a3b8' }}>
                ID: {v.codemp}-{v.codfunc}
              </Typography>
            )}
            {perfil.cgcCpf && (
              <Typography sx={{ fontSize: 12, color: '#94a3b8' }}>
                CPF: {perfil.cgcCpf}
              </Typography>
            )}
          </Stack>
        </Box>
      </Stack>

      <Stack spacing={2}>
        <Section title="Dados Pessoais">
          <InfoRow label="Telefone" value={perfil.telefone} />
          <InfoRow label="Email" value={perfil.email} />
          <InfoRow label="Nascimento" value={fmtDate(perfil.dtNascimento)} />
          {perfil.dtNascimento && (
            <InfoRow label="Idade" value={`${calcIdade(perfil.dtNascimento)} anos`} />
          )}
        </Section>

        {v && (
          <Section title="Vinculo Atual">
            <InfoRow label="Empresa" value={v.empresa} />
            <InfoRow label="Cargo" value={v.cargo} />
            <InfoRow label="Funcao" value={v.funcao} />
            <InfoRow label="Departamento" value={v.departamento} />
            <InfoRow label="Admissao" value={fmtDate(v.dtadm)} />
            <InfoRow label="Tempo de Empresa" value={fmtTempoEmpresa(v.dtadm)} />
            {v.dtdem && <InfoRow label="Demissao" value={fmtDate(v.dtdem)} />}
            {perfil.salarioInfo && (
              <SalarioRow salBruto={perfil.salarioInfo.salBruto} />
            )}
          </Section>
        )}

        {perfil.gestor && (
          <Section title="Gestor">
            <InfoRow label="Nome" value={perfil.gestor.nome} />
            <InfoRow label="Email" value={perfil.gestor.email} />
            <InfoRow label="Cargo" value={perfil.gestor.cargo} />
          </Section>
        )}

        {perfil.centroResultado && (
          <Section title="Centro de Resultado">
            <InfoRow label="Descricao" value={perfil.centroResultado.descricao} />
          </Section>
        )}

        <Paper variant="outlined" sx={{ p: 2, borderRadius: '12px' }}>
          <Typography sx={{ fontSize: 13, fontWeight: 700, color: '#475569', mb: 1 }}>
            Papeis
          </Typography>
          <Stack direction="row" spacing={0.5} flexWrap="wrap">
            {perfil.papeis.funcionario && <Chip label="Funcionario" size="small" color="primary" />}
            {perfil.papeis.usuario && <Chip label="Usuario" size="small" color="secondary" />}
            {perfil.papeis.cliente && <Chip label="Cliente" size="small" color="info" />}
            {perfil.papeis.fornecedor && <Chip label="Fornecedor" size="small" color="warning" />}
          </Stack>
        </Paper>

        {v && (
          <Paper variant="outlined" sx={{ p: 2, borderRadius: '12px' }}>
            <Typography sx={{ fontSize: 13, fontWeight: 700, color: '#475569', mb: 1 }}>
              QR Code / Cracha
            </Typography>
            <Stack direction="row" alignItems="center" spacing={3}>
              <FuncionarioQrCode
                codemp={v.codemp}
                codfunc={v.codfunc}
                nome={perfil.nomeparc}
                size={140}
              />
              <Stack spacing={1}>
                <Typography sx={{ fontSize: 12, color: '#64748b' }}>
                  Escaneie o QR Code para abrir o perfil publico deste funcionario.
                </Typography>
                <Button
                  size="small"
                  variant="outlined"
                  startIcon={<Print />}
                  onClick={() => setPrintOpen(true)}
                  sx={{ textTransform: 'none', fontSize: 12, alignSelf: 'flex-start' }}
                >
                  Imprimir Cracha
                </Button>
              </Stack>
            </Stack>
            <FuncionarioQrPrint
              open={printOpen}
              onClose={() => setPrintOpen(false)}
              codemp={v.codemp}
              codfunc={v.codfunc}
              codparc={perfil.codparc}
              nome={perfil.nomeparc}
              cargo={v.cargo}
              funcao={v.funcao}
              departamento={v.departamento}
              empresa={v.empresa}
              situacao={v.situacao}
              situacaoLabel={v.situacaoLabel}
            />
          </Paper>
        )}

        {v && <ArmarioSectionDetail codemp={v.codemp} codfunc={v.codfunc} />}

        {vinculos.length > 0 && (
          <Paper variant="outlined" sx={{ p: 2, borderRadius: '12px' }}>
            <Typography sx={{ fontSize: 13, fontWeight: 700, color: '#475569', mb: 1 }}>
              Historico de Vinculos ({vinculos.length})
            </Typography>
            <Divider sx={{ mb: 1 }} />
            <Timeline position="right" sx={{
              p: 0, m: 0,
              '& .MuiTimelineItem-root:before': { flex: 0, padding: 0 },
            }}>
              {vinculos.map((vc, idx) => (
                <TimelineItem key={`${vc.codemp}-${vc.codfunc}`}>
                  <TimelineSeparator>
                    <TimelineDot color={vc.situacao === '1' ? 'success' : vc.situacao === '0' ? 'error' : 'warning'} sx={{ my: 0.5 }} />
                    {idx < vinculos.length - 1 && <TimelineConnector />}
                  </TimelineSeparator>
                  <TimelineContent sx={{ py: 0.5 }}>
                    <Typography sx={{ fontSize: 13, fontWeight: 600 }}>{vc.empresa ?? `Emp. ${vc.codemp}`}</Typography>
                    {vc.cargo && <Typography sx={{ fontSize: 12, color: '#475569' }}>{vc.cargo}</Typography>}
                    <Typography sx={{ fontSize: 11, color: '#94a3b8' }}>{fmtDate(vc.dtadm)} — {vc.dtdem ? fmtDate(vc.dtdem) : 'Atual'}</Typography>
                  </TimelineContent>
                </TimelineItem>
              ))}
            </Timeline>
          </Paper>
        )}
      </Stack>
    </Box>
  );
}
