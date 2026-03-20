import { useState } from 'react';
import { Box, Stack, Typography, Skeleton, Chip, Divider, IconButton } from '@mui/material';
import { Visibility, VisibilityOff, Print } from '@mui/icons-material';
import { FuncionarioAvatar } from '@/components/shared/funcionario-avatar';
import { SituacaoBadge } from '@/components/funcionarios/situacao-badge';
import { FuncionarioQrCode } from '@/components/funcionarios/funcionario-qr-code';
import { FuncionarioQrPrint } from '@/components/funcionarios/funcionario-qr-print';
import {
  fmtDate, fmtCurrency, calcIdade, fmtTempoEmpresa,
} from '@/utils/funcionario-formatters';
import type { FuncionarioPerfilSuper } from '@/types/funcionario-types';
import { ArmarioSectionDrawer } from '@/components/armarios/armario-section';

interface FuncionarioDrawerPerfilProps {
  perfil: FuncionarioPerfilSuper | null | undefined;
  isLoading: boolean;
}

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

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Box sx={{ mb: 2 }}>
      <Typography sx={{ fontSize: 12, fontWeight: 700, color: '#475569', mb: 0.75 }}>
        {title}
      </Typography>
      <Box sx={{
        bgcolor: '#f8fafc', borderRadius: '12px', p: 1.5,
        border: '1px solid rgba(148,163,184,0.15)',
      }}>
        {children}
      </Box>
    </Box>
  );
}

function SalarioRow({ salBruto }: { salBruto: number | null | undefined }) {
  const [show, setShow] = useState(false);
  const formatted = fmtCurrency(salBruto);
  return (
    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ py: 0.4 }}>
      <Typography sx={{ fontSize: 12, color: '#64748b' }}>Salario</Typography>
      <Stack direction="row" alignItems="center" spacing={0.5}>
        <Typography sx={{ fontSize: 12, fontWeight: 600, color: '#1e293b' }}>
          {show ? formatted : '******'}
        </Typography>
        <IconButton size="small" onClick={() => setShow((p) => !p)} sx={{ p: 0.25 }}>
          {show
            ? <VisibilityOff sx={{ fontSize: 15, color: '#94a3b8' }} />
            : <Visibility sx={{ fontSize: 15, color: '#94a3b8' }} />}
        </IconButton>
      </Stack>
    </Stack>
  );
}

export function FuncionarioDrawerPerfil({ perfil, isLoading }: FuncionarioDrawerPerfilProps) {
  const [printOpen, setPrintOpen] = useState(false);
  if (isLoading) {
    return (
      <Stack spacing={2} sx={{ p: 2 }}>
        <Skeleton variant="circular" width={56} height={56} />
        <Skeleton variant="rounded" height={60} />
        <Skeleton variant="rounded" height={100} />
        <Skeleton variant="rounded" height={80} />
      </Stack>
    );
  }

  if (!perfil) {
    return (
      <Typography sx={{ p: 2, color: '#94a3b8', fontSize: 13 }}>
        Funcionario nao encontrado.
      </Typography>
    );
  }

  const v = perfil.vinculoAtual;

  return (
    <Box sx={{ p: 2 }}>
      {/* Header */}
      <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
        <FuncionarioAvatar codparc={perfil.codparc} nome={perfil.nomeparc} size="large" />
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography sx={{ fontSize: 16, fontWeight: 700, color: '#1e293b' }}>
            {perfil.nomeparc}
          </Typography>
          <Stack direction="row" spacing={0.5} alignItems="center" sx={{ mt: 0.5 }}>
            {v && <SituacaoBadge situacao={v.situacao} label={v.situacaoLabel} size="md" />}
            {v && (
              <Typography sx={{ fontSize: 11, color: '#94a3b8' }}>
                ID: {v.codemp}-{v.codfunc}
              </Typography>
            )}
            {perfil.cgcCpf && (
              <Typography sx={{ fontSize: 11, color: '#94a3b8' }}>
                CPF: {perfil.cgcCpf}
              </Typography>
            )}
          </Stack>
        </Box>
        {v && (
          <Stack alignItems="center" spacing={0.25} sx={{ flexShrink: 0 }}>
            <FuncionarioQrCode
              codemp={v.codemp}
              codfunc={v.codfunc}
              size={64}
              showLabel={false}
            />
            <IconButton
              size="small"
              onClick={() => setPrintOpen(true)}
              title="Imprimir Cracha"
              sx={{ p: 0.25 }}
            >
              <Print sx={{ fontSize: 14, color: '#94a3b8' }} />
            </IconButton>
          </Stack>
        )}
      </Stack>

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

      <Divider sx={{ my: 1.5 }} />

      <Typography sx={{ fontSize: 12, fontWeight: 700, color: '#475569', mb: 0.75 }}>
        Papeis
      </Typography>
      <Stack direction="row" spacing={0.5} flexWrap="wrap">
        {perfil.papeis.funcionario && <Chip label="Funcionario" size="small" color="primary" />}
        {perfil.papeis.usuario && <Chip label="Usuario" size="small" color="secondary" />}
        {perfil.papeis.cliente && <Chip label="Cliente" size="small" color="info" />}
        {perfil.papeis.fornecedor && <Chip label="Fornecedor" size="small" color="warning" />}
      </Stack>

      {v && <ArmarioSectionDrawer codemp={v.codemp} codfunc={v.codfunc} />}

      {v && (
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
      )}
    </Box>
  );
}
