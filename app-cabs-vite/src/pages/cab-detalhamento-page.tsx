import React, { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import Divider from '@mui/material/Divider';
import CircularProgress from '@mui/material/CircularProgress';
import Tooltip from '@mui/material/Tooltip';
import Collapse from '@mui/material/Collapse';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import { alpha } from '@mui/material/styles';

import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import InventoryIcon from '@mui/icons-material/Inventory2';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import LinkIcon from '@mui/icons-material/Link';
import TimelineIcon from '@mui/icons-material/Timeline';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import StorefrontIcon from '@mui/icons-material/Storefront';
import HistoryIcon from '@mui/icons-material/History';

import GavelIcon from '@mui/icons-material/Gavel';
import RestoreFromTrashIcon from '@mui/icons-material/RestoreFromTrash';
import RequestQuoteIcon from '@mui/icons-material/RequestQuote';
import { useCabDetalhamento } from '@/hooks/use-cab-detalhamento';
import type {
  CabDetalheCab, CabDetalheItem, CabRelacionado, CabVarLink,
  CabDetalheTop, CabDetalheVar, CabAuditLogEntry,
  CabLixeiraCab, CabLixeiraItem, CabCotacao, CabCotacaoDocumento,
  CabLiberacao, CabLiberacaoSistema,
} from '@/types/cab-detalhamento-types';

/* ─── Formatters ─── */

/** Safely convert any date-like value to dd/MM/yyyy */
function fmtDate(d: unknown): string {
  if (d == null) return '-';
  try {
    // Handle Date objects, ISO strings, or any value
    const date = d instanceof Date ? d : new Date(String(d));
    if (isNaN(date.getTime())) return String(d);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  } catch { return String(d); }
}

/** Safely convert any date-like value to dd/MM/yyyy HH:mm:ss */
function fmtDateTime(d: unknown): string {
  if (d == null) return '-';
  try {
    const date = d instanceof Date ? d : new Date(String(d));
    if (isNaN(date.getTime())) return String(d);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const hh = String(date.getHours()).padStart(2, '0');
    const mm = String(date.getMinutes()).padStart(2, '0');
    const ss = String(date.getSeconds()).padStart(2, '0');
    return `${day}/${month}/${year} ${hh}:${mm}:${ss}`;
  } catch { return String(d); }
}

function fmtMoney(v: number | null | undefined): string {
  if (v == null || v === 0) return '-';
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function fmtNum(v: number | null | undefined): string {
  if (v == null) return '-';
  return v.toLocaleString('pt-BR');
}

function statusColor(s: string | null): string {
  if (!s) return '#6B7280';
  switch (s) {
    case 'L': return '#16A34A';
    case 'A': return '#2563EB';
    case 'P': return '#F59E0B';
    default: return '#6B7280';
  }
}

function acaoColor(acao: string): string {
  switch (acao) {
    case 'INSERT': return '#16A34A';
    case 'DELETE': return '#DC2626';
    case 'UPDATE': return '#F59E0B';
    default: return '#6B7280';
  }
}

function acaoLabel(acao: string): string {
  switch (acao) {
    case 'INSERT': return 'Criacao';
    case 'DELETE': return 'Exclusao';
    case 'UPDATE': return 'Alteracao';
    default: return acao;
  }
}

/* ─── Table header cell style ─── */
const thSx = { fontWeight: 700, fontSize: 11, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: '0.03em', py: 0.75 } as const;

/* ─── Field row ─── */
function Field({ label, value, mono }: { label: string; value: string | number | null | undefined; mono?: boolean }) {
  const display = value == null || value === '' ? '-' : String(value);
  return (
    <Box sx={{ display: 'flex', gap: 1, py: 0.3, '&:hover': { bgcolor: (t) => alpha(t.palette.primary.main, 0.02) } }}>
      <Typography fontSize={11.5} color="text.secondary" fontWeight={600} sx={{ minWidth: 130, flexShrink: 0 }}>
        {label}
      </Typography>
      <Typography fontSize={11.5} fontWeight={display === '-' ? 400 : 500} color={display === '-' ? 'text.disabled' : 'text.primary'} fontFamily={mono ? 'monospace' : undefined} sx={{ wordBreak: 'break-all' }}>
        {display}
      </Typography>
    </Box>
  );
}

/* ─── Section group label ─── */
function GroupLabel({ children }: { children: string }) {
  return (
    <Typography fontWeight={700} fontSize={10} color="text.secondary" textTransform="uppercase" letterSpacing="0.08em" sx={{ mb: 0.5, pb: 0.25, borderBottom: 1, borderColor: 'divider' }}>
      {children}
    </Typography>
  );
}

/* ─── Collapsible Section ─── */
function Section({ title, icon, count, defaultOpen = true, color, badge, children }: {
  title: string; icon: React.ReactNode; count?: number; defaultOpen?: boolean; color?: string;
  badge?: React.ReactNode; children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <Paper variant="outlined" sx={{ borderRadius: 2, overflow: 'hidden' }}>
      <Box
        onClick={() => setOpen(!open)}
        sx={{
          display: 'flex', alignItems: 'center', gap: 1, px: 2, py: 1.25,
          cursor: 'pointer', userSelect: 'none',
          bgcolor: (t) => t.palette.mode === 'dark' ? alpha('#fff', 0.03) : alpha('#000', 0.015),
          borderBottom: open ? 1 : 0, borderColor: 'divider',
          transition: 'background-color 0.15s',
          '&:hover': { bgcolor: (t) => t.palette.mode === 'dark' ? alpha('#fff', 0.05) : alpha('#000', 0.03) },
        }}
      >
        <Box sx={{ color: color ?? 'primary.main', display: 'flex', opacity: 0.85 }}>{icon}</Box>
        <Typography fontWeight={700} fontSize={13} sx={{ flex: 1 }}>{title}</Typography>
        {badge}
        {count != null && (
          <Chip label={count} size="small" variant="outlined" sx={{ fontWeight: 700, fontSize: 11, height: 22, minWidth: 30 }} />
        )}
        <Box sx={{ color: 'text.secondary', display: 'flex', ml: 0.5, transition: 'transform 0.2s', transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }}>
          <ExpandMoreIcon fontSize="small" />
        </Box>
      </Box>
      <Collapse in={open}>
        <Box sx={{ p: 2 }}>{children}</Box>
      </Collapse>
    </Paper>
  );
}

/* ─── Value Pill ─── */
function ValuePill({ label, value, color }: { label: string; value: string; color?: string }) {
  if (value === '-') return null;
  return (
    <Box sx={{
      display: 'inline-flex', flexDirection: 'column', alignItems: 'center',
      px: 1.5, py: 0.5, borderRadius: 1,
      bgcolor: (t) => t.palette.mode === 'dark' ? alpha('#fff', 0.04) : alpha('#000', 0.03),
    }}>
      <Typography fontSize={10} color="text.secondary" fontWeight={600} textTransform="uppercase" letterSpacing="0.05em">
        {label}
      </Typography>
      <Typography fontSize={12} fontWeight={700} fontFamily="monospace" color={color ?? 'text.primary'}>
        {value}
      </Typography>
    </Box>
  );
}

/* ─── CAB Header Card ─── */
function CabHeader({ cab, top }: { cab: CabDetalheCab; top: CabDetalheTop | null }) {
  const sc = statusColor(cab.STATUSNOTA);
  return (
    <Paper variant="outlined" sx={{ borderRadius: 2, borderLeft: 4, borderLeftColor: sc, overflow: 'hidden' }}>
      {/* Hero strip */}
      <Box sx={{ px: 2.5, pt: 2, pb: 1.5, bgcolor: (t) => t.palette.mode === 'dark' ? alpha('#fff', 0.02) : alpha('#000', 0.01) }}>
        <Stack direction="row" spacing={1.5} alignItems="flex-start" flexWrap="wrap">
          <ReceiptLongIcon sx={{ color: sc, fontSize: 32, mt: 0.25 }} />
          <Box sx={{ flex: 1, minWidth: 200 }}>
            <Stack direction="row" spacing={1} alignItems="baseline" flexWrap="wrap">
              <Typography fontWeight={800} fontSize={22} fontFamily="monospace" letterSpacing="-0.02em">
                {cab.NUNOTA}
              </Typography>
              {cab.NUMNOTA != null && cab.NUMNOTA > 0 && (
                <Typography fontSize={12} color="text.secondary" fontWeight={500}>
                  Nota {cab.NUMNOTA}
                  {cab.SERIENOTA ? ` / Serie ${cab.SERIENOTA}` : ''}
                </Typography>
              )}
            </Stack>
            <Typography fontSize={13} fontWeight={600} color="text.secondary" sx={{ mt: -0.25 }}>
              {cab.CODTIPOPER} - {cab.TIPO_OPER_DESCRICAO ?? '-'}
            </Typography>
          </Box>
          <Stack direction="row" spacing={0.75} alignItems="center" flexWrap="wrap">
            <Chip label={cab.STATUS_DESCRICAO} size="small" sx={{ fontWeight: 700, fontSize: 11, bgcolor: alpha(sc, 0.12), color: sc, border: `1px solid ${alpha(sc, 0.25)}` }} />
            <Chip label={cab.TIPMOV_DESCRICAO} size="small" variant="outlined" sx={{ fontWeight: 600, fontSize: 11 }} />
            {cab.STATUSNFE && cab.STATUSNFE !== '-' && (
              <Chip label={`NFe: ${cab.STATUS_NFE_DESCRICAO}`} size="small" variant="outlined" sx={{ fontSize: 10 }} />
            )}
          </Stack>
        </Stack>

        {/* Value strip */}
        {(cab.VLRNOTA ?? 0) > 0 && (
          <Stack direction="row" spacing={1} sx={{ mt: 1.5 }} flexWrap="wrap">
            <ValuePill label="Total" value={fmtMoney(cab.VLRNOTA)} color="#16A34A" />
            <ValuePill label="Desconto" value={fmtMoney(cab.VLRDESC)} />
            <ValuePill label="Frete" value={fmtMoney(cab.VLRFRETE)} />
            <ValuePill label="IPI" value={fmtMoney(cab.VLRIPI)} />
            <ValuePill label="ICMS" value={fmtMoney(cab.VLRICMS)} />
            <ValuePill label="ST" value={fmtMoney(cab.VLRSUBST)} />
            <ValuePill label="Despesas" value={fmtMoney(cab.VLRDESPTOT)} />
          </Stack>
        )}
      </Box>

      <Divider />

      {/* Detail grid */}
      <Box sx={{ px: 2.5, py: 1.5, display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', lg: '1fr 1fr 1fr 1fr' }, gap: 2 }}>
        <Box>
          <GroupLabel>Parceiro</GroupLabel>
          <Field label="Codigo" value={cab.CODPARC} mono />
          <Field label="Nome" value={cab.PARCEIRO_NOME} />
          <Field label="Tipo" value={cab.PARCEIRO_TIPO_PESSOA === 'J' ? 'Pessoa Juridica' : cab.PARCEIRO_TIPO_PESSOA === 'F' ? 'Pessoa Fisica' : cab.PARCEIRO_TIPO_PESSOA} />
          <Field label="CNPJ/CPF" value={cab.PARCEIRO_CGC_CPF} mono />
          <Field label="Cidade/UF" value={[cab.PARCEIRO_CIDADE, cab.PARCEIRO_UF].filter(Boolean).join(' / ') || '-'} />
        </Box>

        <Box>
          <GroupLabel>Datas</GroupLabel>
          <Field label="Negociacao" value={fmtDate(cab.DTNEG)} />
          <Field label="Movimento" value={fmtDateTime(cab.DTMOV)} />
          <Field label="Ent./Saida" value={fmtDate(cab.DTENTSAI)} />
          <Field label="Faturamento" value={fmtDate(cab.DTFATUR)} />
          <Field label="Alteracao" value={fmtDate(cab.DTALTER)} />
        </Box>

        <Box>
          <GroupLabel>Classificacao</GroupLabel>
          <Field label="Empresa" value={`${cab.CODEMP} - ${cab.NOME_EMPRESA ?? '-'}`} />
          <Field label="Centro Custo" value={cab.CODCENCUS ? `${cab.CODCENCUS} - ${cab.CENTRO_CUSTO_DESCRICAO ?? '-'}` : '-'} />
          <Field label="Natureza" value={cab.CODNAT ? `${cab.CODNAT} - ${cab.NATUREZA_DESCRICAO ?? '-'}` : '-'} />
          <Field label="Projeto" value={cab.CODPROJ} />
          {top && (
            <>
              <Field label="Estoque" value={cab.ATUALEST_DESCRICAO} />
              <Field label="Financeiro" value={cab.ATUALFIN_DESCRICAO} />
            </>
          )}
        </Box>

        <Box>
          <GroupLabel>Usuarios</GroupLabel>
          <Field label="Criado por" value={cab.CODUSUINC ? `${cab.CODUSUINC} - ${cab.NOME_USUARIO_INC ?? '-'}` : '-'} />
          <Field label="Alterado por" value={cab.CODUSUALTER ? `${cab.CODUSUALTER} - ${cab.NOME_USUARIO_ALTER ?? '-'}` : '-'} />
          <Field label="Vendedor" value={cab.CODVEND ? `${cab.CODVEND} - ${cab.VENDEDOR_NOME ?? '-'}` : '-'} />
          {top && (
            <>
              <Field label="Frete" value={top.TIPFRETE_DESCRICAO} />
              <Field label="Emitente" value={top.EMITENTE_DESCRICAO} />
            </>
          )}
        </Box>
      </Box>

      {/* Observacao */}
      {cab.OBSERVACAO && (
        <>
          <Divider />
          <Box sx={{ px: 2.5, py: 1.5, bgcolor: (t) => alpha(t.palette.warning.main, 0.04) }}>
            <Typography fontWeight={700} fontSize={10} color="text.secondary" textTransform="uppercase" letterSpacing="0.08em" sx={{ mb: 0.5 }}>
              Observacao
            </Typography>
            <Typography fontSize={12} fontWeight={500} sx={{ whiteSpace: 'pre-wrap' }}>{cab.OBSERVACAO}</Typography>
          </Box>
        </>
      )}

      {/* Technical IDs */}
      {(cab.CHAVENFE || cab.NUFIN) && (
        <>
          <Divider />
          <Box sx={{ px: 2.5, py: 1, bgcolor: (t) => t.palette.mode === 'dark' ? alpha('#fff', 0.02) : alpha('#000', 0.015) }}>
            <Stack direction="row" spacing={3} flexWrap="wrap">
              {cab.CHAVENFE && <Field label="Chave NFe" value={cab.CHAVENFE} mono />}
              {cab.NUFIN && <Field label="NUFIN" value={cab.NUFIN} mono />}
            </Stack>
          </Box>
        </>
      )}
    </Paper>
  );
}

/* ─── Items Table ─── */
function ItemsTable({ itens }: { itens: CabDetalheItem[] }) {
  const total = itens.reduce((s, i) => s + (i.VLRTOT ?? 0), 0);
  return (
    <Section title="Itens do Documento" icon={<InventoryIcon fontSize="small" />} count={itens.length}>
      <TableContainer sx={{ mx: -2, width: 'calc(100% + 32px)' }}>
        <Table size="small">
          <TableHead>
            <TableRow sx={{ bgcolor: (t) => t.palette.mode === 'dark' ? alpha('#fff', 0.03) : alpha('#000', 0.02) }}>
              <TableCell sx={thSx}>#</TableCell>
              <TableCell sx={thSx}>Produto</TableCell>
              <TableCell sx={thSx}>Grupo</TableCell>
              <TableCell align="right" sx={thSx}>Qtd</TableCell>
              <TableCell sx={thSx}>Un</TableCell>
              <TableCell align="right" sx={thSx}>Vlr Unit</TableCell>
              <TableCell align="right" sx={thSx}>Total</TableCell>
              <TableCell sx={thSx}>Obs</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {itens.map((item) => (
              <TableRow key={item.SEQUENCIA} hover sx={{ '&:last-child td': { borderBottom: 0 } }}>
                <TableCell sx={{ fontSize: 11, fontFamily: 'monospace', color: 'text.secondary' }}>{item.SEQUENCIA}</TableCell>
                <TableCell>
                  <Typography fontSize={12} fontWeight={600}>{item.PRODUTO_DESCRICAO}</Typography>
                  <Typography fontSize={10} color="text.secondary" fontFamily="monospace">COD {item.CODPROD}{item.PRODUTO_REFERENCIA ? ` · Ref ${item.PRODUTO_REFERENCIA}` : ''}</Typography>
                </TableCell>
                <TableCell sx={{ fontSize: 11, color: 'text.secondary' }}>{item.GRUPO_PRODUTO ?? '-'}</TableCell>
                <TableCell align="right">
                  <Typography fontSize={12} fontWeight={700} fontFamily="monospace">{fmtNum(item.QTDNEG)}</Typography>
                  {item.QTDENTREGUE != null && item.QTDENTREGUE > 0 && (
                    <Typography fontSize={9} color="text.secondary">entregue: {fmtNum(item.QTDENTREGUE)}</Typography>
                  )}
                </TableCell>
                <TableCell sx={{ fontSize: 11, color: 'text.secondary' }}>{item.UNIDADE ?? '-'}</TableCell>
                <TableCell align="right" sx={{ fontSize: 11.5, fontFamily: 'monospace', color: 'text.secondary' }}>{fmtMoney(item.VLRUNIT)}</TableCell>
                <TableCell align="right" sx={{ fontSize: 12, fontWeight: 700, fontFamily: 'monospace' }}>{fmtMoney(item.VLRTOT)}</TableCell>
                <TableCell sx={{ maxWidth: 100 }}>
                  <Typography fontSize={10} color="text.secondary" noWrap>{item.OBSERVACAO_ITEM ?? '-'}</Typography>
                </TableCell>
              </TableRow>
            ))}
            {total > 0 && (
              <TableRow sx={{ bgcolor: (t) => alpha(t.palette.success.main, 0.04) }}>
                <TableCell colSpan={6} align="right" sx={{ fontWeight: 700, fontSize: 12, borderBottom: 0 }}>TOTAL</TableCell>
                <TableCell align="right" sx={{ fontWeight: 800, fontSize: 14, fontFamily: 'monospace', color: '#16A34A', borderBottom: 0 }}>
                  {fmtMoney(total)}
                </TableCell>
                <TableCell sx={{ borderBottom: 0 }} />
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Section>
  );
}

/* ─── Related Documents ─── */
function RelatedDocsTable({ docs, title, icon, color, navigate: nav }: {
  docs: CabRelacionado[]; title: string; icon: React.ReactNode; color?: string; navigate: (p: string) => void;
}) {
  if (docs.length === 0) return null;
  return (
    <Section title={title} icon={icon} count={docs.length} defaultOpen={false} color={color}>
      <TableContainer sx={{ mx: -2, width: 'calc(100% + 32px)' }}>
        <Table size="small">
          <TableHead>
            <TableRow sx={{ bgcolor: (t) => t.palette.mode === 'dark' ? alpha('#fff', 0.03) : alpha('#000', 0.02) }}>
              <TableCell sx={thSx}>NUNOTA</TableCell>
              <TableCell sx={thSx}>Nota</TableCell>
              <TableCell sx={thSx}>Tipo Operacao</TableCell>
              <TableCell sx={thSx}>Data</TableCell>
              <TableCell sx={thSx}>Parceiro</TableCell>
              <TableCell align="right" sx={thSx}>Valor</TableCell>
              <TableCell sx={thSx}>Status</TableCell>
              <TableCell sx={thSx}>Usuario</TableCell>
              <TableCell sx={{ ...thSx, width: 36 }} />
            </TableRow>
          </TableHead>
          <TableBody>
            {docs.map((doc, idx) => {
              const sc = statusColor(doc.STATUSNOTA);
              return (
                <TableRow key={`${doc.NUNOTA}-${idx}`} hover sx={{ cursor: 'pointer', '&:last-child td': { borderBottom: 0 } }}
                  onClick={() => nav(`/cab/${doc.NUNOTA}`)}
                >
                  <TableCell sx={{ fontWeight: 700, fontSize: 12, fontFamily: 'monospace', color: 'primary.main' }}>
                    {doc.NUNOTA}
                  </TableCell>
                  <TableCell sx={{ fontSize: 11, fontFamily: 'monospace', color: 'text.secondary' }}>{doc.NUMNOTA || '-'}</TableCell>
                  <TableCell>
                    <Typography fontSize={11} fontWeight={500}>{doc.TIPO_OPER_DESCRICAO ?? '-'}</Typography>
                    <Typography fontSize={9.5} color="text.disabled" fontFamily="monospace">TOP {doc.CODTIPOPER}</Typography>
                  </TableCell>
                  <TableCell sx={{ fontSize: 11.5 }}>{fmtDate(doc.DTNEG)}</TableCell>
                  <TableCell sx={{ maxWidth: 150 }}>
                    <Typography fontSize={11} noWrap>{doc.PARCEIRO_NOME ?? '-'}</Typography>
                  </TableCell>
                  <TableCell align="right" sx={{ fontSize: 12, fontWeight: 700, fontFamily: 'monospace' }}>
                    {fmtMoney(doc.VLRNOTA)}
                  </TableCell>
                  <TableCell>
                    <Chip label={doc.STATUS_DESCRICAO} size="small"
                      sx={{ fontWeight: 700, fontSize: 9.5, height: 20, bgcolor: alpha(sc, 0.1), color: sc, border: `1px solid ${alpha(sc, 0.2)}` }}
                    />
                  </TableCell>
                  <TableCell sx={{ fontSize: 10.5, color: 'text.secondary' }}>{doc.NOME_USUARIO ?? '-'}</TableCell>
                  <TableCell>
                    <Tooltip title="Abrir detalhamento">
                      <OpenInNewIcon sx={{ fontSize: 13, color: 'text.disabled' }} />
                    </Tooltip>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </Section>
  );
}

/* ─── Variacoes (TGFVAR) ─── */
function VariacoesSection({ variacoes }: { variacoes: CabDetalheVar[] }) {
  if (variacoes.length === 0) return null;
  return (
    <Section title="Historico de Movimentacoes" icon={<TimelineIcon fontSize="small" />} count={variacoes.length} defaultOpen={false}>
      <TableContainer sx={{ mx: -2, width: 'calc(100% + 32px)' }}>
        <Table size="small">
          <TableHead>
            <TableRow sx={{ bgcolor: (t) => t.palette.mode === 'dark' ? alpha('#fff', 0.03) : alpha('#000', 0.02) }}>
              <TableCell sx={thSx}>Seq</TableCell>
              <TableCell sx={thSx}>Data/Hora</TableCell>
              <TableCell sx={thSx}>Evento</TableCell>
              <TableCell sx={thSx}>Usuario</TableCell>
              <TableCell sx={thSx}>NUNOTA Origem</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {variacoes.map((v) => (
              <TableRow key={v.SEQUENCIA} hover>
                <TableCell sx={{ fontSize: 11, fontFamily: 'monospace', color: 'text.secondary' }}>{v.SEQUENCIA}</TableCell>
                <TableCell sx={{ fontSize: 11, fontFamily: 'monospace' }}>{v.DATA_HORA}</TableCell>
                <TableCell sx={{ fontSize: 11 }}>{v.EVENTO ?? '-'}</TableCell>
                <TableCell sx={{ fontSize: 11 }}>{v.NOME_USUARIO ?? '-'}</TableCell>
                <TableCell sx={{ fontSize: 11, fontFamily: 'monospace' }}>{v.NUNOTA_ORIGEM ?? '-'}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Section>
  );
}

/* ─── VarLinks (cross-doc) ─── */
function VarLinksSection({ links }: { links: CabVarLink[] }) {
  if (links.length === 0) return null;
  return (
    <Section title="Cadeia de Documentos" icon={<AccountTreeIcon fontSize="small" />} count={links.length} defaultOpen={false} color="#7C3AED">
      <TableContainer sx={{ mx: -2, width: 'calc(100% + 32px)' }}>
        <Table size="small">
          <TableHead>
            <TableRow sx={{ bgcolor: (t) => t.palette.mode === 'dark' ? alpha('#fff', 0.03) : alpha('#000', 0.02) }}>
              <TableCell sx={thSx}>NUNOTA</TableCell>
              <TableCell sx={thSx}>Origem</TableCell>
              <TableCell sx={thSx}>Data/Hora</TableCell>
              <TableCell sx={thSx}>Evento</TableCell>
              <TableCell sx={thSx}>Tipo Oper.</TableCell>
              <TableCell sx={thSx}>Parceiro</TableCell>
              <TableCell align="right" sx={thSx}>Valor</TableCell>
              <TableCell sx={thSx}>Usuario</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {links.map((l, idx) => (
              <TableRow key={`${l.NUNOTA}-${l.SEQUENCIA}-${idx}`} hover>
                <TableCell sx={{ fontWeight: 700, fontSize: 12, fontFamily: 'monospace', color: 'primary.main' }}>{l.NUNOTA}</TableCell>
                <TableCell sx={{ fontSize: 11, fontFamily: 'monospace', color: 'text.secondary' }}>{l.NUNOTA_ORIGEM ?? '-'}</TableCell>
                <TableCell sx={{ fontSize: 11, fontFamily: 'monospace' }}>{l.DATA_HORA ?? '-'}</TableCell>
                <TableCell sx={{ fontSize: 11 }}>{l.EVENTO ?? '-'}</TableCell>
                <TableCell sx={{ fontSize: 11 }}>{l.TIPO_OPER_DESCRICAO ?? '-'}</TableCell>
                <TableCell sx={{ fontSize: 11 }}>{l.PARCEIRO_NOME ?? '-'}</TableCell>
                <TableCell align="right" sx={{ fontSize: 12, fontWeight: 600, fontFamily: 'monospace' }}>{fmtMoney(l.VLRNOTA)}</TableCell>
                <TableCell sx={{ fontSize: 11 }}>{l.NOME_USUARIO ?? '-'}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Section>
  );
}

/* ─── Snapshot parser for VERSAO_NOVA / VERSAO_ANTIGA ─── */
function parseSnapshot(raw: string | null): { key: string; value: string }[] {
  if (!raw) return [];
  // AD_GIG_LOG stores "KEY: value, KEY: value, ..."
  // But values themselves can contain commas (dates like "Jul 30 2025 9:54AM"), so we split on ", KEY:" pattern
  const entries: { key: string; value: string }[] = [];
  // First split by known key pattern: comma followed by space and uppercase word followed by colon
  const parts = raw.split(/,\s*(?=[A-Z_]+\s*:)/);
  for (const part of parts) {
    const trimmed = part.trim();
    const colonIdx = trimmed.indexOf(':');
    if (colonIdx === -1) continue;
    const key = trimmed.slice(0, colonIdx).trim();
    const value = trimmed.slice(colonIdx + 1).trim();
    if (key) entries.push({ key, value });
  }
  return entries;
}

/* ─── Snapshot diff view ─── */
function SnapshotView({ label, data, color }: { label: string; data: { key: string; value: string }[]; color: string }) {
  if (data.length === 0) return null;
  return (
    <Box sx={{ flex: 1, minWidth: 280 }}>
      <Typography fontSize={10} fontWeight={700} color={color} textTransform="uppercase" letterSpacing="0.05em" sx={{ mb: 0.75 }}>
        {label}
      </Typography>
      <Paper
        variant="outlined"
        sx={{
          borderRadius: 1.5,
          borderColor: alpha(color, 0.2),
          bgcolor: (t) => alpha(color, t.palette.mode === 'dark' ? 0.06 : 0.02),
          maxHeight: 280,
          overflow: 'auto',
        }}
      >
        <Table size="small">
          <TableBody>
            {data.map((f, i) => (
              <TableRow key={i} sx={{ '&:last-child td': { borderBottom: 0 } }}>
                <TableCell sx={{ fontSize: 10, fontWeight: 700, color: 'text.secondary', py: 0.4, px: 1.5, width: 120, borderColor: alpha(color, 0.08) }}>
                  {f.key}
                </TableCell>
                <TableCell sx={{ fontSize: 10.5, fontFamily: 'monospace', py: 0.4, px: 1.5, wordBreak: 'break-all', borderColor: alpha(color, 0.08) }}>
                  {f.value || <Typography component="span" fontSize={10} color="text.disabled">vazio</Typography>}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>
    </Box>
  );
}

/* ─── Audit Log Timeline (AD_GIG_LOG) ─── */
function AuditLogSection({ entries }: { entries: CabAuditLogEntry[] }) {
  const [expandedId, setExpandedId] = useState<number | null>(null);

  if (entries.length === 0) return null;

  return (
    <Section
      title="Trilha de Auditoria (AD_GIG_LOG)"
      icon={<HistoryIcon fontSize="small" />}
      count={entries.length}
      defaultOpen
      color="#8B5CF6"
    >
      <Stack spacing={0}>
        {entries.map((e, idx) => {
          const isExpanded = expandedId === e.ID;
          const hasSnapshot = !!(e.VERSAO_NOVA || e.VERSAO_ANTIGA);
          const ac = acaoColor(e.ACAO);
          const isLast = idx === entries.length - 1;

          return (
            <Box key={e.ID} sx={{ display: 'flex', gap: 0 }}>
              {/* Timeline line */}
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 32, flexShrink: 0 }}>
                <Box sx={{
                  width: 12, height: 12, borderRadius: '50%', mt: 1.25,
                  bgcolor: ac, border: `2px solid ${alpha(ac, 0.3)}`,
                  boxShadow: `0 0 0 3px ${alpha(ac, 0.08)}`,
                }} />
                {!isLast && (
                  <Box sx={{ width: 2, flex: 1, bgcolor: (t) => t.palette.mode === 'dark' ? alpha('#fff', 0.08) : alpha('#000', 0.08), mt: 0.5 }} />
                )}
              </Box>

              {/* Event card */}
              <Box sx={{ flex: 1, pb: isLast ? 0 : 2 }}>
                <Paper
                  variant="outlined"
                  sx={{
                    borderRadius: 1.5,
                    borderColor: isExpanded ? alpha(ac, 0.3) : 'divider',
                    overflow: 'hidden',
                    transition: 'border-color 0.2s',
                  }}
                >
                  {/* Header row */}
                  <Box
                    onClick={() => hasSnapshot && setExpandedId(isExpanded ? null : e.ID)}
                    sx={{
                      display: 'flex', alignItems: 'center', gap: 1.5, px: 2, py: 1,
                      cursor: hasSnapshot ? 'pointer' : 'default',
                      '&:hover': hasSnapshot ? { bgcolor: (t) => alpha(t.palette.primary.main, 0.02) } : {},
                    }}
                  >
                    <Chip
                      label={e.ACAO}
                      size="small"
                      sx={{
                        fontWeight: 800, fontSize: 9, height: 20, minWidth: 56,
                        bgcolor: alpha(ac, 0.12), color: ac,
                        border: `1px solid ${alpha(ac, 0.25)}`,
                      }}
                    />
                    <Chip
                      label={e.TABELA}
                      size="small"
                      variant="outlined"
                      sx={{ fontWeight: 600, fontSize: 9.5, height: 20, fontFamily: 'monospace' }}
                    />
                    <Typography fontSize={11} fontWeight={600} sx={{ flex: 1 }}>
                      {acaoLabel(e.ACAO)} em {e.TABELA}
                    </Typography>
                    <Stack direction="row" spacing={1.5} alignItems="center">
                      <Typography fontSize={10.5} color="text.secondary">
                        {e.NOMEUSU ?? '-'}
                        {e.CODUSU ? ` (${e.CODUSU})` : ''}
                      </Typography>
                      <Typography fontSize={10.5} fontFamily="monospace" color="text.secondary" sx={{ whiteSpace: 'nowrap' }}>
                        {fmtDateTime(e.DTCREATED)}
                      </Typography>
                    </Stack>
                    {hasSnapshot && (
                      <Box sx={{
                        color: 'text.disabled', display: 'flex',
                        transition: 'transform 0.2s', transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                      }}>
                        <ExpandMoreIcon sx={{ fontSize: 18 }} />
                      </Box>
                    )}
                  </Box>

                  {/* Changed fields summary */}
                  {e.CAMPOS_ALTERADOS && (
                    <Box sx={{ px: 2, pb: 0.75, mt: -0.5 }}>
                      <Typography fontSize={10} color="text.secondary">
                        <Typography component="span" fontSize={10} fontWeight={600} color="text.secondary">Campos: </Typography>
                        {e.CAMPOS_ALTERADOS}
                      </Typography>
                    </Box>
                  )}

                  {/* Expandable snapshot */}
                  {hasSnapshot && (
                    <Collapse in={isExpanded}>
                      <Divider />
                      <Box sx={{ p: 2, display: 'flex', gap: 2, flexWrap: 'wrap', bgcolor: (t) => t.palette.mode === 'dark' ? alpha('#fff', 0.01) : alpha('#000', 0.008) }}>
                        <SnapshotView label="Versao Anterior" data={parseSnapshot(e.VERSAO_ANTIGA)} color="#DC2626" />
                        <SnapshotView label="Versao Nova" data={parseSnapshot(e.VERSAO_NOVA)} color="#16A34A" />
                      </Box>
                    </Collapse>
                  )}
                </Paper>
              </Box>
            </Box>
          );
        })}
      </Stack>
    </Section>
  );
}

/* ─── Lixeira Header (TGFCAB_EXC) ─── */
function LixeiraHeader({ cab, navigate: _nav }: { cab: CabLixeiraCab; navigate: (p: string) => void }) {
  return (
    <Section title="Dados da Lixeira (TGFCAB_EXC)" icon={<RestoreFromTrashIcon fontSize="small" />} color="#DC2626" defaultOpen>
      <Paper variant="outlined" sx={{ borderRadius: 1.5, borderLeft: 3, borderLeftColor: '#DC2626', overflow: 'hidden' }}>
        {/* Hero */}
        <Box sx={{ px: 2, pt: 1.5, pb: 1, bgcolor: (t) => alpha(t.palette.error.main, 0.02) }}>
          <Stack direction="row" spacing={1.5} alignItems="baseline" flexWrap="wrap">
            <Typography fontWeight={800} fontSize={20} fontFamily="monospace">{cab.NUNOTA}</Typography>
            {cab.NUMNOTA != null && cab.NUMNOTA > 0 && (
              <Typography fontSize={11.5} color="text.secondary">Nota {cab.NUMNOTA}</Typography>
            )}
            <Chip label={cab.STATUS_DESCRICAO} size="small" sx={{ fontWeight: 700, fontSize: 10, height: 20, bgcolor: alpha('#DC2626', 0.1), color: '#DC2626' }} />
            <Chip label={cab.TIPMOV_DESCRICAO} size="small" variant="outlined" sx={{ fontSize: 10, height: 20 }} />
            {cab.VLRNOTA != null && cab.VLRNOTA > 0 && (
              <Typography fontWeight={800} fontSize={14} fontFamily="monospace" color="#16A34A">{fmtMoney(cab.VLRNOTA)}</Typography>
            )}
          </Stack>
          <Typography fontSize={12} color="text.secondary" fontWeight={500}>
            {cab.CODTIPOPER} - {cab.TIPO_OPER_DESCRICAO ?? '-'}
          </Typography>
        </Box>
        <Divider />
        <Box sx={{ px: 2, py: 1.5, display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr 1fr' }, gap: 2 }}>
          <Box>
            <GroupLabel>Parceiro / Classificacao</GroupLabel>
            <Field label="Parceiro" value={cab.CODPARC ? `${cab.CODPARC} - ${cab.PARCEIRO_NOME ?? '-'}` : '-'} />
            <Field label="Centro Custo" value={cab.CODCENCUS ? `${cab.CODCENCUS} - ${cab.CENTRO_CUSTO_DESCRICAO ?? '-'}` : '-'} />
            <Field label="Vendedor" value={cab.CODVEND ? `${cab.CODVEND} - ${cab.VENDEDOR_NOME ?? '-'}` : '-'} />
          </Box>
          <Box>
            <GroupLabel>Datas</GroupLabel>
            <Field label="Negociacao" value={fmtDate(cab.DTNEG)} />
            <Field label="Cotacao" value={cab.NUMCOTACAO} mono />
            <Field label="Aprovado" value={cab.APROVADO === 'S' ? 'Sim' : cab.APROVADO === 'N' ? 'Nao' : cab.APROVADO} />
          </Box>
          <Box>
            <GroupLabel>Exclusao</GroupLabel>
            <Field label="Excluido em" value={fmtDateTime(cab.DHEXCLUSAO)} />
            <Field label="Criado por" value={cab.CODUSUINC ? `${cab.CODUSUINC} - ${cab.NOME_USUARIO_INC ?? '-'}` : '-'} />
            <Field label="Host" value={cab.HOSTNAME?.trim() || '-'} mono />
          </Box>
        </Box>
        {cab.NUMCOTACAO != null && cab.NUMCOTACAO > 0 && (
          <>
            <Divider />
            <Box sx={{ px: 2, py: 1, bgcolor: (t) => alpha(t.palette.info.main, 0.03) }}>
              <Stack direction="row" spacing={1} alignItems="center">
                <RequestQuoteIcon sx={{ fontSize: 16, color: 'info.main' }} />
                <Typography fontSize={11.5} fontWeight={500}>
                  Vinculado a Cotacao <strong>{cab.NUMCOTACAO}</strong>
                </Typography>
              </Stack>
            </Box>
          </>
        )}
      </Paper>
    </Section>
  );
}

/* ─── Lixeira Items (TGFITE_EXC) ─── */
function LixeiraItensTable({ itens }: { itens: CabLixeiraItem[] }) {
  if (itens.length === 0) return null;
  const total = itens.reduce((s, i) => s + (i.VLRTOT ?? 0), 0);
  return (
    <Section title="Itens Excluidos (TGFITE_EXC)" icon={<InventoryIcon fontSize="small" />} count={itens.length} color="#DC2626">
      <TableContainer sx={{ mx: -2, width: 'calc(100% + 32px)' }}>
        <Table size="small">
          <TableHead>
            <TableRow sx={{ bgcolor: (t) => alpha(t.palette.error.main, 0.03) }}>
              <TableCell sx={thSx}>#</TableCell>
              <TableCell sx={thSx}>Produto</TableCell>
              <TableCell align="right" sx={thSx}>Qtd</TableCell>
              <TableCell sx={thSx}>Un</TableCell>
              <TableCell align="right" sx={thSx}>Vlr Unit</TableCell>
              <TableCell align="right" sx={thSx}>Total</TableCell>
              <TableCell sx={thSx}>Excluido por</TableCell>
              <TableCell sx={thSx}>Data Exclusao</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {itens.map((item) => (
              <TableRow key={item.SEQUENCIA} hover>
                <TableCell sx={{ fontSize: 11, fontFamily: 'monospace', color: 'text.secondary' }}>{item.SEQUENCIA}</TableCell>
                <TableCell>
                  <Typography fontSize={12} fontWeight={600}>{item.PRODUTO_DESCRICAO}</Typography>
                  <Typography fontSize={10} color="text.secondary" fontFamily="monospace">COD {item.CODPROD}{item.PRODUTO_REFERENCIA ? ` · Ref ${item.PRODUTO_REFERENCIA}` : ''}</Typography>
                </TableCell>
                <TableCell align="right" sx={{ fontSize: 12, fontWeight: 700, fontFamily: 'monospace' }}>{fmtNum(item.QTDNEG)}</TableCell>
                <TableCell sx={{ fontSize: 11, color: 'text.secondary' }}>{item.UNIDADE ?? '-'}</TableCell>
                <TableCell align="right" sx={{ fontSize: 11.5, fontFamily: 'monospace', color: 'text.secondary' }}>{fmtMoney(item.VLRUNIT)}</TableCell>
                <TableCell align="right" sx={{ fontSize: 12, fontWeight: 700, fontFamily: 'monospace' }}>{fmtMoney(item.VLRTOT)}</TableCell>
                <TableCell sx={{ fontSize: 10.5 }}>{item.EXCLUIDO_POR ?? '-'}</TableCell>
                <TableCell sx={{ fontSize: 10.5, fontFamily: 'monospace' }}>{fmtDateTime(item.DHEXCLUSAO)}</TableCell>
              </TableRow>
            ))}
            {total > 0 && (
              <TableRow sx={{ bgcolor: (t) => alpha(t.palette.error.main, 0.04) }}>
                <TableCell colSpan={5} align="right" sx={{ fontWeight: 700, fontSize: 12, borderBottom: 0 }}>TOTAL</TableCell>
                <TableCell align="right" sx={{ fontWeight: 800, fontSize: 14, fontFamily: 'monospace', color: '#DC2626', borderBottom: 0 }}>
                  {fmtMoney(total)}
                </TableCell>
                <TableCell colSpan={2} sx={{ borderBottom: 0 }} />
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Section>
  );
}

/* ─── Cotacao (TGFCOT) ─── */
function CotacaoSection({ cotacao, documentos, navigate: nav }: { cotacao: CabCotacao; documentos: CabCotacaoDocumento[]; navigate: (p: string) => void }) {
  const sitColor = cotacao.SITUACAO === 'A' ? '#2563EB' : cotacao.SITUACAO === 'F' ? '#16A34A' : cotacao.SITUACAO === 'C' ? '#DC2626' : '#6B7280';
  return (
    <Section title={`Cotacao ${cotacao.NUMCOTACAO}`} icon={<RequestQuoteIcon fontSize="small" />} color="#0891B2" defaultOpen>
      <Paper variant="outlined" sx={{ borderRadius: 1.5, overflow: 'hidden' }}>
        <Box sx={{ px: 2, py: 1.5, display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr 1fr' }, gap: 2 }}>
          <Box>
            <GroupLabel>Cotacao</GroupLabel>
            <Field label="Numero" value={cotacao.NUMCOTACAO} mono />
            <Stack direction="row" spacing={0.5} alignItems="center" sx={{ py: 0.3 }}>
              <Typography fontSize={11.5} color="text.secondary" fontWeight={600} sx={{ minWidth: 130 }}>Situacao</Typography>
              <Chip label={cotacao.SITUACAO_DESCRICAO} size="small" sx={{ fontWeight: 700, fontSize: 10, height: 20, bgcolor: alpha(sitColor, 0.1), color: sitColor }} />
            </Stack>
            <Field label="Gera Pedido" value={cotacao.GERPEDREAL === 'S' ? 'Sim' : 'Nao'} />
          </Box>
          <Box>
            <GroupLabel>Datas / Origem</GroupLabel>
            <Field label="Inicio" value={fmtDate(cotacao.DHINIC)} />
            <Field label="Final" value={fmtDate(cotacao.DHFINAL)} />
            <Field label="NUNOTA Origem" value={cotacao.NUNOTAORIG} mono />
          </Box>
          <Box>
            <GroupLabel>Responsaveis</GroupLabel>
            <Field label="Solicitante" value={cotacao.CODUSUREQ ? `${cotacao.CODUSUREQ} - ${cotacao.NOME_SOLICITANTE ?? '-'}` : '-'} />
            <Field label="Responsavel" value={cotacao.CODUSURESP ? `${cotacao.CODUSURESP} - ${cotacao.NOME_RESPONSAVEL ?? '-'}` : '-'} />
            <Field label="Centro Custo" value={cotacao.CODCENCUS ? `${cotacao.CODCENCUS} - ${cotacao.CENTRO_CUSTO_DESCRICAO ?? '-'}` : '-'} />
          </Box>
        </Box>
        {cotacao.OBSERVACAO && (
          <>
            <Divider />
            <Box sx={{ px: 2, py: 1, bgcolor: (t) => alpha(t.palette.warning.main, 0.04) }}>
              <Typography fontSize={10} fontWeight={700} color="text.secondary" textTransform="uppercase" letterSpacing="0.08em">Observacao</Typography>
              <Typography fontSize={12} fontWeight={500}>{cotacao.OBSERVACAO}</Typography>
            </Box>
          </>
        )}
      </Paper>

      {/* Documentos da cotacao */}
      {documentos.length > 0 && (
        <Box sx={{ mt: 1.5 }}>
          <Typography fontSize={11} fontWeight={700} color="text.secondary" textTransform="uppercase" letterSpacing="0.05em" sx={{ mb: 0.75 }}>
            Documentos vinculados a esta cotacao
          </Typography>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ bgcolor: (t) => t.palette.mode === 'dark' ? alpha('#fff', 0.03) : alpha('#000', 0.02) }}>
                  <TableCell sx={thSx}>NUNOTA</TableCell>
                  <TableCell sx={thSx}>Tipo</TableCell>
                  <TableCell sx={thSx}>Data</TableCell>
                  <TableCell sx={thSx}>Parceiro</TableCell>
                  <TableCell align="right" sx={thSx}>Valor</TableCell>
                  <TableCell sx={thSx}>Status</TableCell>
                  <TableCell sx={thSx}>Origem</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {documentos.map((d, i) => {
                  const sc = statusColor(d.STATUSNOTA);
                  const isExcluido = d.ORIGEM === 'EXCLUIDO';
                  return (
                    <TableRow key={`${d.NUNOTA}-${i}`} hover sx={{ cursor: isExcluido ? 'default' : 'pointer', opacity: isExcluido ? 0.7 : 1 }}
                      onClick={() => !isExcluido && nav(`/cabs/detalhamento-completo?nunota=${d.NUNOTA}`)}
                    >
                      <TableCell sx={{ fontWeight: 700, fontSize: 12, fontFamily: 'monospace', color: isExcluido ? '#DC2626' : 'primary.main' }}>{d.NUNOTA}</TableCell>
                      <TableCell sx={{ fontSize: 11 }}>{d.TIPO_OPER_DESCRICAO ?? '-'}</TableCell>
                      <TableCell sx={{ fontSize: 11 }}>{fmtDate(d.DTNEG)}</TableCell>
                      <TableCell sx={{ fontSize: 11 }}>{d.PARCEIRO_NOME ?? '-'}</TableCell>
                      <TableCell align="right" sx={{ fontSize: 12, fontWeight: 700, fontFamily: 'monospace' }}>{fmtMoney(d.VLRNOTA)}</TableCell>
                      <TableCell>
                        <Chip label={d.STATUS_DESCRICAO} size="small" sx={{ fontWeight: 700, fontSize: 9, height: 18, bgcolor: alpha(sc, 0.1), color: sc }} />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={d.ORIGEM}
                          size="small"
                          sx={{
                            fontWeight: 700, fontSize: 9, height: 18,
                            bgcolor: isExcluido ? alpha('#DC2626', 0.08) : alpha('#16A34A', 0.08),
                            color: isExcluido ? '#DC2626' : '#16A34A',
                          }}
                        />
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}
    </Section>
  );
}

/* ─── Liberacoes (TGFLIB + TSILIB) ─── */
function LiberacoesSection({ liberacoes, liberacoesSistema }: { liberacoes: CabLiberacao[]; liberacoesSistema: CabLiberacaoSistema[] }) {
  if (liberacoes.length === 0 && liberacoesSistema.length === 0) return null;
  return (
    <Section
      title="Liberacoes / Aprovacoes"
      icon={<GavelIcon fontSize="small" />}
      count={liberacoes.length + liberacoesSistema.length}
      color="#7C3AED"
      defaultOpen={false}
    >
      {/* TGFLIB */}
      {liberacoes.length > 0 && (
        <Box sx={{ mb: liberacoesSistema.length > 0 ? 2 : 0 }}>
          <Typography fontSize={10} fontWeight={700} color="text.secondary" textTransform="uppercase" letterSpacing="0.05em" sx={{ mb: 0.75 }}>
            TGFLIB — Liberacoes do Documento
          </Typography>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ bgcolor: (t) => t.palette.mode === 'dark' ? alpha('#fff', 0.03) : alpha('#000', 0.02) }}>
                  <TableCell sx={thSx}>Data</TableCell>
                  <TableCell sx={thSx}>Usuario</TableCell>
                  <TableCell sx={thSx}>Liberacoes</TableCell>
                  <TableCell align="right" sx={thSx}>Valor Total</TableCell>
                  <TableCell sx={thSx}>Obs</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {liberacoes.map((l, i) => (
                  <TableRow key={i} hover>
                    <TableCell sx={{ fontSize: 11, fontFamily: 'monospace' }}>{fmtDateTime(l.DT)}</TableCell>
                    <TableCell sx={{ fontSize: 11 }}>{l.NOME_USUARIO ?? '-'}</TableCell>
                    <TableCell sx={{ fontSize: 10.5, maxWidth: 200 }}><Typography fontSize={10.5} noWrap>{l.LIBERACOES ?? '-'}</Typography></TableCell>
                    <TableCell align="right" sx={{ fontSize: 12, fontWeight: 700, fontFamily: 'monospace' }}>{fmtMoney(l.VLRTOTAL)}</TableCell>
                    <TableCell sx={{ fontSize: 10.5 }}>{l.OBS ?? '-'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}

      {/* TSILIB */}
      {liberacoesSistema.length > 0 && (
        <Box>
          <Typography fontSize={10} fontWeight={700} color="text.secondary" textTransform="uppercase" letterSpacing="0.05em" sx={{ mb: 0.75 }}>
            TSILIB — Liberacoes do Sistema (Cascata)
          </Typography>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ bgcolor: (t) => t.palette.mode === 'dark' ? alpha('#fff', 0.03) : alpha('#000', 0.02) }}>
                  <TableCell sx={thSx}>Solicitado</TableCell>
                  <TableCell sx={thSx}>Solicitante</TableCell>
                  <TableCell sx={thSx}>Liberado</TableCell>
                  <TableCell sx={thSx}>Liberador</TableCell>
                  <TableCell align="right" sx={thSx}>Vlr Limite</TableCell>
                  <TableCell align="right" sx={thSx}>Vlr Atual</TableCell>
                  <TableCell sx={thSx}>Status</TableCell>
                  <TableCell sx={thSx}>Obs</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {liberacoesSistema.map((l, i) => {
                  const reprovado = l.REPROVADO === 'S';
                  return (
                    <TableRow key={i} hover sx={{ bgcolor: reprovado ? (t) => alpha(t.palette.error.main, 0.03) : undefined }}>
                      <TableCell sx={{ fontSize: 11, fontFamily: 'monospace' }}>{fmtDateTime(l.DHSOLICIT)}</TableCell>
                      <TableCell sx={{ fontSize: 11 }}>{l.NOME_SOLICITANTE ?? '-'}</TableCell>
                      <TableCell sx={{ fontSize: 11, fontFamily: 'monospace' }}>{l.DHLIB ? fmtDateTime(l.DHLIB) : 'Pendente'}</TableCell>
                      <TableCell sx={{ fontSize: 11 }}>{l.NOME_LIBERADOR ?? '-'}</TableCell>
                      <TableCell align="right" sx={{ fontSize: 11, fontFamily: 'monospace' }}>{fmtMoney(l.VLRLIMITE)}</TableCell>
                      <TableCell align="right" sx={{ fontSize: 11, fontFamily: 'monospace' }}>{fmtMoney(l.VLRATUAL)}</TableCell>
                      <TableCell>
                        <Chip
                          label={reprovado ? 'Reprovado' : l.DHLIB ? 'Aprovado' : 'Pendente'}
                          size="small"
                          sx={{
                            fontWeight: 700, fontSize: 9, height: 18,
                            bgcolor: alpha(reprovado ? '#DC2626' : l.DHLIB ? '#16A34A' : '#F59E0B', 0.1),
                            color: reprovado ? '#DC2626' : l.DHLIB ? '#16A34A' : '#F59E0B',
                          }}
                        />
                      </TableCell>
                      <TableCell sx={{ fontSize: 10 }}>{l.OBSLIB || l.OBSERVACAO || '-'}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}
    </Section>
  );
}

/* ─── Summary for deleted docs ─── */
function DeletedSummary({ data, nunota }: {
  data: {
    relacionadosPorProduto: CabRelacionado[]; linkedByReq: CabRelacionado[]; linkedByVar: CabVarLink[];
    auditLog?: CabAuditLogEntry[]; lixeira?: CabLixeiraCab | null;
  };
  nunota: number;
}) {
  const lx = data.lixeira;
  const auditCount = data.auditLog?.length ?? 0;

  if (lx) {
    return (
      <Alert severity="warning" variant="outlined" icon={<RestoreFromTrashIcon />}>
        <AlertTitle>Registro encontrado na lixeira (TGFCAB_EXC)</AlertTitle>
        <Typography fontSize={12}>
          <strong>{lx.TIPO_OPER_DESCRICAO}</strong> (TOP {lx.CODTIPOPER}) para <strong>{lx.PARCEIRO_NOME}</strong>,
          valor <strong>{fmtMoney(lx.VLRNOTA)}</strong>.
          Excluido em <strong>{fmtDateTime(lx.DHEXCLUSAO)}</strong>
          {lx.NOME_USUARIO_INC && <> por <strong>{lx.NOME_USUARIO_INC}</strong></>}.
          {lx.NUMCOTACAO ? <> Cotacao: <strong>{lx.NUMCOTACAO}</strong>.</> : null}
          {auditCount > 0 && <> {auditCount} registro(s) de auditoria disponivel(is).</>}
        </Typography>
      </Alert>
    );
  }

  if (auditCount > 0) {
    const deleteEntry = data.auditLog?.find((e) => e.ACAO === 'DELETE');
    const insertEntry = data.auditLog?.find((e) => e.ACAO === 'INSERT');
    return (
      <Alert severity="warning" variant="outlined" icon={<HistoryIcon />}>
        <AlertTitle>Ciclo de vida reconstruido via AD_GIG_LOG</AlertTitle>
        <Typography fontSize={12}>
          {auditCount} registro(s) de auditoria.
          {insertEntry && <> Criado por <strong>{insertEntry.NOMEUSU ?? '?'}</strong> em <strong>{fmtDateTime(insertEntry.DTCREATED)}</strong>.</>}
          {deleteEntry && <> Excluido por <strong>{deleteEntry.NOMEUSU ?? '?'}</strong> em <strong>{fmtDateTime(deleteEntry.DTCREATED)}</strong>.</>}
        </Typography>
      </Alert>
    );
  }

  return (
    <Alert severity="error" variant="outlined" icon={<WarningAmberIcon />}>
      <AlertTitle>Sem rastros</AlertTitle>
      <Typography fontSize={12}>
        Nenhum registro encontrado na lixeira ou auditoria para o NUNOTA <strong>{nunota}</strong>.
      </Typography>
    </Alert>
  );
}

/* ─── MAIN PAGE ─── */
export default function CabDetalhamentoPage() {
  const navigate = useNavigate();
  const { nunota: nunotaParam } = useParams<{ nunota: string }>();
  const [inputValue, setInputValue] = useState(nunotaParam ?? '');

  const nunota = useMemo(() => {
    const n = Number(nunotaParam);
    return Number.isFinite(n) && n > 0 ? n : null;
  }, [nunotaParam]);

  const { data, isLoading, error } = useCabDetalhamento(nunota);

  function handleSearch() {
    const n = Number(inputValue);
    if (Number.isFinite(n) && n > 0) {
      navigate(`/cab/${n}`);
    }
  }

  const auditLog = data?.auditLog ?? [];

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pb: 4, maxWidth: 1200, mx: 'auto', width: '100%' }}>
      {/* Search bar */}
      <Paper
        elevation={0}
        sx={{
          px: 2.5, py: 1.5, borderRadius: 2,
          border: 1, borderColor: 'divider',
          bgcolor: (t) => t.palette.mode === 'dark' ? alpha('#fff', 0.02) : '#fff',
        }}
      >
        <Stack direction="row" spacing={1.5} alignItems="center">
          <StorefrontIcon sx={{ color: 'primary.main', fontSize: 22 }} />
          <Box sx={{ flex: 1 }}>
            <Typography fontWeight={800} fontSize={16} letterSpacing="-0.01em">
              Rastreio de Documento
            </Typography>
            <Typography fontSize={11} color="text.secondary" sx={{ mt: -0.25 }}>
              TGFCAB completo — itens, variacoes, vinculos, auditoria
            </Typography>
          </Box>
          <TextField
            placeholder="NUNOTA"
            size="small"
            type="number"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            sx={{ width: 140, '& .MuiInputBase-root': { fontFamily: 'monospace', fontWeight: 600 } }}
          />
          <Button
            variant="contained"
            size="small"
            onClick={handleSearch}
            disabled={!inputValue || Number(inputValue) <= 0}
            sx={{ px: 2.5, textTransform: 'none', fontWeight: 700 }}
          >
            Investigar
          </Button>
        </Stack>
      </Paper>

      {/* Loading */}
      {isLoading && (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 8, gap: 1.5 }}>
          <CircularProgress size={28} />
          <Typography fontSize={12} color="text.secondary">Consultando TGFCAB, TGFITE, TGFVAR, TGFTOP, AD_GIG_LOG...</Typography>
        </Box>
      )}

      {/* Error */}
      {error && (
        <Alert severity="error" variant="outlined">
          <AlertTitle>Erro na consulta</AlertTitle>
          {(error as Error).message}
        </Alert>
      )}

      {/* Empty state */}
      {!nunota && !isLoading && (
        <Paper
          variant="outlined"
          sx={{
            py: 8, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1,
            borderStyle: 'dashed', borderRadius: 2,
          }}
        >
          <ReceiptLongIcon sx={{ fontSize: 40, color: 'text.disabled', opacity: 0.5 }} />
          <Typography fontWeight={600} fontSize={14} color="text.secondary">
            Digite um NUNOTA para iniciar a investigacao
          </Typography>
          <Typography fontSize={11.5} color="text.disabled" sx={{ maxWidth: 360, textAlign: 'center' }}>
            Documentos excluidos sao rastreados via AD_GIG_LOG, TGFVAR, AD_NUNOTAREQORIG e documentos com mesmos produtos.
          </Typography>
        </Paper>
      )}

      {/* Results */}
      {data && (
        <Stack spacing={2}>
          {/* Existence banner */}
          {!data.existe ? (
            <Paper
              variant="outlined"
              sx={{
                p: 2, borderRadius: 2,
                borderLeft: 4, borderLeftColor: '#DC2626',
                bgcolor: (t) => alpha(t.palette.error.main, 0.03),
              }}
            >
              <Stack direction="row" spacing={1.5} alignItems="flex-start">
                <DeleteForeverIcon sx={{ color: '#DC2626', fontSize: 28, mt: 0.25 }} />
                <Box>
                  <Typography fontWeight={800} fontSize={16} color="#DC2626">
                    Documento Excluido
                  </Typography>
                  <Typography fontSize={12} color="text.secondary" sx={{ mt: 0.25 }}>
                    O NUNOTA <strong>{nunota}</strong> nao existe mais no TGFCAB.
                    {auditLog.length > 0
                      ? ` Ciclo de vida reconstruido com ${auditLog.length} registro(s) de auditoria.`
                      : data.refsNoVAR > 0
                        ? ` Encontrado em ${data.refsNoVAR} referencia(s) no historico de movimentacoes.`
                        : ' Nenhum rastro encontrado.'}
                  </Typography>
                </Box>
              </Stack>
            </Paper>
          ) : (
            <Paper
              variant="outlined"
              sx={{
                px: 2, py: 1.25, borderRadius: 2,
                borderLeft: 4, borderLeftColor: '#16A34A',
              }}
            >
              <Stack direction="row" spacing={1} alignItems="center">
                <CheckCircleIcon sx={{ color: '#16A34A', fontSize: 20 }} />
                <Typography fontSize={13} fontWeight={600}>
                  Documento <Typography component="span" fontFamily="monospace" fontWeight={700}>{nunota}</Typography> ativo no TGFCAB
                </Typography>
                {data.cabecalho && (
                  <Chip label={data.cabecalho.STATUS_DESCRICAO} size="small"
                    sx={{ ml: 1, fontWeight: 700, fontSize: 10, height: 20, bgcolor: alpha(statusColor(data.cabecalho.STATUSNOTA), 0.1), color: statusColor(data.cabecalho.STATUSNOTA) }}
                  />
                )}
              </Stack>
            </Paper>
          )}

          {/* Deleted summary */}
          {!data.existe && <DeletedSummary data={data} nunota={nunota!} />}

          {/* Lixeira (TGFCAB_EXC) — for deleted docs */}
          {data.lixeira && <LixeiraHeader cab={data.lixeira} navigate={navigate} />}

          {/* Lixeira Items (TGFITE_EXC) */}
          {(data.lixeiraItens?.length ?? 0) > 0 && <LixeiraItensTable itens={data.lixeiraItens} />}

          {/* Cotacao (TGFCOT) */}
          {data.cotacao && <CotacaoSection cotacao={data.cotacao} documentos={data.cotacaoDocumentos ?? []} navigate={navigate} />}

          {/* Audit Log — show prominently for deleted docs */}
          {auditLog.length > 0 && !data.existe && <AuditLogSection entries={auditLog} />}

          {/* Cabecalho (active docs) */}
          {data.cabecalho && <CabHeader cab={data.cabecalho} top={data.top} />}

          {/* Items (active docs) */}
          {data.itens.length > 0 && <ItemsTable itens={data.itens} />}

          {/* Liberacoes */}
          <LiberacoesSection liberacoes={data.liberacoes ?? []} liberacoesSistema={data.liberacoesSistema ?? []} />

          {/* Variacoes */}
          <VariacoesSection variacoes={data.variacoes} />

          {/* Cadeia via TGFVAR */}
          <VarLinksSection links={data.linkedByVar} />

          {/* Linked by req origin */}
          <RelatedDocsTable
            docs={data.linkedByReq}
            title="Vinculos por Requisicao"
            icon={<LinkIcon fontSize="small" />}
            color="#2563EB"
            navigate={navigate}
          />

          {/* Related by products */}
          <RelatedDocsTable
            docs={data.relacionadosPorProduto}
            title="Documentos com Mesmo Parceiro e Produtos"
            icon={<AccountTreeIcon fontSize="small" />}
            color="#7C3AED"
            navigate={navigate}
          />

          {/* Audit Log — at bottom for active docs */}
          {auditLog.length > 0 && data.existe && <AuditLogSection entries={auditLog} />}

          {/* Warnings — queries that failed */}
          {(data._warnings?.length ?? 0) > 0 && (
            <Alert severity="warning" variant="outlined" icon={<WarningAmberIcon />}>
              <AlertTitle>Consultas com erro ({data._warnings!.length})</AlertTitle>
              {data._warnings!.map((w, i) => (
                <Typography key={i} fontSize={11} fontFamily="monospace" sx={{ py: 0.15 }}>{w}</Typography>
              ))}
            </Alert>
          )}
        </Stack>
      )}
    </Box>
  );
}
