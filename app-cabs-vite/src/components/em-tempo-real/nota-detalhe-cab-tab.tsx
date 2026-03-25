import { Paper, Typography, Stack, Chip } from '@mui/material';
import {
  Person, Business, CalendarMonth, AttachMoney,
  Description, LocalShipping,
} from '@mui/icons-material';
import { FuncionarioAvatar } from '@/components/shared/funcionario-avatar';
import type { NotaDetalheCab } from '@/types/em-tempo-real-types';

const fmtBRL = (v: number | null) =>
  v != null
    ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v)
    : '-';

const fmtDate = (v: string | null) => {
  if (!v) return '-';
  const d = new Date(v);
  return isNaN(d.getTime()) ? v : d.toLocaleDateString('pt-BR');
};

function InfoRow({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <Stack direction="row" justifyContent="space-between" sx={{ py: 0.25 }}>
      <Typography variant="body2" color="text.secondary" sx={{ minWidth: 120 }}>
        {label}
      </Typography>
      <Typography variant="body2" fontWeight="medium" textAlign="right" sx={{ flex: 1 }}>
        {value || '-'}
      </Typography>
    </Stack>
  );
}

function SectionHeader({ icon, title }: { icon: React.ReactNode; title: string }) {
  return (
    <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.5 }}>
      {icon}
      <Typography variant="subtitle2" fontWeight="bold">{title}</Typography>
    </Stack>
  );
}

interface NotaDetalheCabTabProps {
  cab: NotaDetalheCab;
}

export function NotaDetalheCabTab({ cab }: NotaDetalheCabTabProps) {
  return (
    <Stack spacing={2}>
      {/* Status */}
      <Paper variant="outlined" sx={{ p: 1.5 }}>
        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
          <Chip
            label={cab.STATUS_DESCRICAO}
            size="small"
            color={
              cab.STATUSNOTA === 'L' ? 'success'
                : cab.STATUSNOTA === 'A' ? 'info'
                  : 'warning'
            }
          />
          <Chip
            label={cab.TIPMOV_DESCRICAO}
            size="small"
            variant="outlined"
            color="primary"
          />
          <Chip
            label={cab.ATUALEST_DESCRICAO}
            size="small"
            variant="outlined"
          />
          {cab.STATUSNFE && (
            <Chip
              label={`NFe: ${cab.STATUS_NFE_DESCRICAO}`}
              size="small"
              variant="outlined"
              color={cab.STATUSNFE === 'A' ? 'success' : 'default'}
            />
          )}
          <Chip
            label={`Financeiro: ${cab.ATUALFIN_DESCRICAO}`}
            size="small"
            variant="outlined"
          />
        </Stack>
      </Paper>

      {/* Identification */}
      <Paper variant="outlined" sx={{ p: 1.5 }}>
        <SectionHeader
          icon={<Description fontSize="small" color="action" />}
          title="Identificacao"
        />
        <InfoRow label="NUNOTA" value={String(cab.NUNOTA)} />
        <InfoRow label="Num. Nota" value={cab.NUMNOTA ? String(cab.NUMNOTA) : null} />
        <InfoRow label="Serie" value={cab.SERIENOTA} />
        <InfoRow label="TOP" value={`${cab.CODTIPOPER} - ${cab.TIPO_OPER_DESCRICAO}`} />
        <InfoRow label="Empresa" value={`${cab.CODEMP} - ${cab.NOME_EMPRESA ?? ''}`} />
        {cab.CODNAT && (
          <InfoRow label="Natureza" value={`${cab.CODNAT} - ${cab.NATUREZA_DESCRICAO ?? ''}`} />
        )}
        {cab.CODCENCUS && (
          <InfoRow
            label="Centro Custo"
            value={`${cab.CODCENCUS} - ${cab.CENTRO_CUSTO_DESCRICAO ?? ''}`}
          />
        )}
        {cab.CHAVENFE && (
          <InfoRow label="Chave NFe" value={cab.CHAVENFE} />
        )}
      </Paper>

      {/* Partner */}
      <Paper variant="outlined" sx={{ p: 1.5 }}>
        <SectionHeader
          icon={<Person fontSize="small" color="action" />}
          title="Parceiro"
        />
        <InfoRow label="Codigo" value={String(cab.CODPARC)} />
        <InfoRow label="Nome" value={cab.PARCEIRO_NOME} />
        <InfoRow
          label="Tipo"
          value={cab.PARCEIRO_TIPO_PESSOA === 'J' ? 'Juridica' : 'Fisica'}
        />
        <InfoRow label="CPF/CNPJ" value={cab.PARCEIRO_CGC_CPF} />
        {cab.PARCEIRO_CIDADE && (
          <InfoRow
            label="Cidade"
            value={`${cab.PARCEIRO_CIDADE}${cab.PARCEIRO_UF ? ` - ${cab.PARCEIRO_UF}` : ''}`}
          />
        )}
      </Paper>

      {/* Dates */}
      <Paper variant="outlined" sx={{ p: 1.5 }}>
        <SectionHeader
          icon={<CalendarMonth fontSize="small" color="action" />}
          title="Datas"
        />
        <InfoRow label="Negociacao" value={fmtDate(cab.DTNEG)} />
        <InfoRow label="Movimento" value={cab.DATA_HORA_MOVIMENTO} />
        {cab.DTENTSAI && <InfoRow label="Entrada/Saida" value={fmtDate(cab.DTENTSAI)} />}
        {cab.DTFATUR && <InfoRow label="Faturamento" value={fmtDate(cab.DTFATUR)} />}
        {cab.DTALTER && <InfoRow label="Ult. Alteracao" value={fmtDate(cab.DTALTER)} />}
      </Paper>

      {/* Financial */}
      <Paper variant="outlined" sx={{ p: 1.5 }}>
        <SectionHeader
          icon={<AttachMoney fontSize="small" color="action" />}
          title="Valores"
        />
        <InfoRow label="Valor Nota" value={fmtBRL(cab.VLRNOTA)} />
        <InfoRow label="Desconto" value={fmtBRL(cab.VLRDESC)} />
        <InfoRow label="Frete" value={fmtBRL(cab.VLRFRETE)} />
        <InfoRow label="IPI" value={fmtBRL(cab.VLRIPI)} />
        <InfoRow label="ICMS" value={fmtBRL(cab.VLRICMS)} />
        <InfoRow label="Base ICMS" value={fmtBRL(cab.BASEICMS)} />
        <InfoRow label="Substituicao" value={fmtBRL(cab.VLRSUBST)} />
        <InfoRow label="Despesas" value={fmtBRL(cab.VLRDESPTOT)} />
      </Paper>

      {/* Users */}
      <Paper variant="outlined" sx={{ p: 1.5 }}>
        <SectionHeader
          icon={<Business fontSize="small" color="action" />}
          title="Usuarios"
        />
        <Stack direction="row" alignItems="center" gap={1} sx={{ py: 0.5 }}>
          <Typography variant="body2" color="text.secondary" sx={{ minWidth: 120 }}>
            Inclusao
          </Typography>
          <FuncionarioAvatar
            codparc={cab.CODPARC_USUARIO_INC}
            nome={cab.NOME_USUARIO_INC || ''}
            size="small"
          />
          <Typography variant="body2">{cab.NOME_USUARIO_INC || '-'}</Typography>
        </Stack>
        {cab.NOME_USUARIO_ALTER && (
          <InfoRow label="Alteracao" value={cab.NOME_USUARIO_ALTER} />
        )}
        {cab.VENDEDOR_NOME && (
          <InfoRow label="Vendedor" value={cab.VENDEDOR_NOME} />
        )}
      </Paper>

      {/* Observation */}
      {cab.OBSERVACAO && (
        <Paper variant="outlined" sx={{ p: 1.5 }}>
          <SectionHeader
            icon={<LocalShipping fontSize="small" color="action" />}
            title="Observacao"
          />
          <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
            {cab.OBSERVACAO}
          </Typography>
        </Paper>
      )}
    </Stack>
  );
}
