import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Typography, Button, Stack, Chip, Tooltip } from '@mui/material';
import { Edit, Close, SwapHoriz, Receipt, Schedule } from '@mui/icons-material';
import { useHstVeiDetail } from '@/hooks/use-hstvei-detail';
import { useEncerrarSituacao, useTrocarSituacao } from '@/hooks/use-hstvei-mutations';
import { PrioridadeBadge } from '@/components/shared/prioridade-badge';
import { DepartamentoChip } from '@/components/shared/departamento-chip';
import { PessoaAvatar } from '@/components/shared/pessoa-avatar';
import { EncerrarDialog } from '@/components/situacoes/encerrar-dialog';
import { TrocarSituacaoDialog } from '@/components/situacoes/trocar-situacao-dialog';
import { LoadingSkeleton } from '@/components/shared/loading-skeleton';
import { calcPrevisaoCountdown, safeDate } from '@/utils/previsao-utils';
import { formatRelativeTime } from '@/utils/date-utils';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

function fmtDateTime(val: unknown): string {
  if (!val) return '-';
  const d = safeDate(val);
  if (isNaN(d.getTime())) return '-';
  try {
    return format(d, 'dd/MM/yy HH:mm', { locale: ptBR });
  } catch { return '-'; }
}

export function SituacaoDetailPage() {
  const { id } = useParams<{ id: string }>();
  const numId = Number(id);
  const navigate = useNavigate();
  const { data: detail, isLoading } = useHstVeiDetail(numId);
  const encerrar = useEncerrarSituacao();
  const trocar = useTrocarSituacao();
  const [encerrarOpen, setEncerrarOpen] = useState(false);
  const [trocarOpen, setTrocarOpen] = useState(false);

  if (isLoading) return <LoadingSkeleton />;
  if (!detail) return <Typography>Situacao nao encontrada</Typography>;

  const previsao = calcPrevisaoCountdown(detail.DTPREVISAO);
  const elapsedInicio = formatRelativeTime(detail.DTINICIO);
  const elapsedCriacao = formatRelativeTime(detail.DTCRIACAO);
  const elapsedAlteracao = formatRelativeTime(detail.DTALTER);
  const allPessoas = [...(detail.operadores ?? []), ...(detail.mecanicos ?? [])];

  return (
    <>
      <Box sx={{ mb: 2 }}>
        <Typography variant="h6" fontWeight={700}>{detail.placa}</Typography>
        <Typography variant="body2" color="text.secondary">{detail.marcaModelo}</Typography>
      </Box>
      <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
        <PrioridadeBadge idpri={detail.IDPRI} size="medium" />
        <DepartamentoChip departamento={detail.departamentoNome} size="medium" />
        {detail.DTFIM && <Chip label="Encerrada" size="small" color="default" />}
      </Stack>
      <Typography variant="subtitle1" fontWeight={700}>{detail.situacaoDescricao}</Typography>
      {detail.DESCRICAO && <Typography variant="body2" sx={{ mt: 0.5 }}>{detail.DESCRICAO}</Typography>}
      {detail.OBS && <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>{detail.OBS}</Typography>}

      {/* Equipe */}
      {(detail.criadoPor || allPessoas.length > 0) && (
        <Box sx={{ mt: 2, p: 1.5, bgcolor: 'action.hover', borderRadius: 2 }}>
          <Typography sx={{ fontSize: '0.7rem', fontWeight: 700, color: 'text.secondary', mb: 1, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Equipe
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
            {detail.criadoPor && (
              <Tooltip title={`Criado por: ${detail.criadoPor.nome}`}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <PessoaAvatar
                    codparc={detail.criadoPor.codparc}
                    nome={detail.criadoPor.nome}
                    size={32}
                    sx={{ border: '2px solid', borderColor: 'success.main' }}
                  />
                  <Typography sx={{ fontSize: '0.75rem', fontWeight: 600 }}>{detail.criadoPor.nome}</Typography>
                </Box>
              </Tooltip>
            )}
            {(detail.operadores ?? []).map((p) => (
              <Tooltip key={`op-${p.codusu}`} title={`Operador: ${p.nome}`}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <PessoaAvatar codparc={p.codparc} nome={p.nome} size={32}
                    sx={{ border: '2px solid', borderColor: 'info.main' }} />
                  <Typography sx={{ fontSize: '0.75rem' }}>{p.nome}</Typography>
                </Box>
              </Tooltip>
            ))}
            {(detail.mecanicos ?? []).map((p) => (
              <Tooltip key={`mec-${p.codusu}`} title={`Mecanico: ${p.nome}`}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <PessoaAvatar codparc={p.codparc} nome={p.nome} size={32}
                    sx={{ border: '2px solid', borderColor: 'warning.main' }} />
                  <Typography sx={{ fontSize: '0.75rem' }}>{p.nome}</Typography>
                </Box>
              </Tooltip>
            ))}
          </Box>
        </Box>
      )}

      <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Schedule sx={{ fontSize: 16, color: 'text.disabled' }} />
          <Typography variant="caption" color="text.secondary">
            Inicio: {fmtDateTime(detail.DTINICIO)}
            {elapsedInicio && (
              <Chip
                label={elapsedInicio.text}
                size="small"
                sx={{ ml: 1, height: 18, fontSize: '0.65rem', bgcolor: elapsedInicio.isPast ? 'error.light' : 'success.light', color: elapsedInicio.isPast ? 'error.dark' : 'success.dark' }}
              />
            )}
          </Typography>
        </Box>

        {detail.DTPREVISAO && (
          <Typography variant="caption" sx={{ color: previsao?.isOverdue ? 'error.main' : 'text.secondary', display: 'flex', alignItems: 'center', gap: 1 }}>
            <Schedule sx={{ fontSize: 16 }} />
            Previsao: {fmtDateTime(detail.DTPREVISAO)} {previsao && `(${previsao.text})`}
          </Typography>
        )}

        {detail.DTFIM && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Schedule sx={{ fontSize: 16, color: 'text.disabled' }} />
            <Typography variant="caption" color="success.main">
              Encerrada: {fmtDateTime(detail.DTFIM)}
            </Typography>
          </Box>
        )}

        <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
          Criacao: {fmtDateTime(detail.DTCRIACAO)}
          {elapsedCriacao && (
            <Chip
              label={elapsedCriacao.text}
              size="small"
              sx={{ ml: 1, height: 16, fontSize: '0.6rem' }}
              variant="outlined"
            />
          )}
        </Typography>

        {detail.DTALTER !== detail.DTCRIACAO && (
          <Typography variant="caption" color="text.secondary">
            Alteracao: {fmtDateTime(detail.DTALTER)}
            {elapsedAlteracao && (
              <Chip
                label={elapsedAlteracao.text}
                size="small"
                sx={{ ml: 1, height: 16, fontSize: '0.6rem' }}
                variant="outlined"
              />
            )}
          </Typography>
        )}

        {!detail.criadoPor && detail.nomeUsuInc && <Typography variant="caption" color="text.secondary">Criado por: {detail.nomeUsuInc}</Typography>}
        {detail.nomeUsuAlt && <Typography variant="caption" color="text.secondary">Alterado por: {detail.nomeUsuAlt}</Typography>}
      </Box>

      {!detail.DTFIM && (
        <Stack direction="row" spacing={1} sx={{ mt: 3 }}>
          <Button variant="outlined" startIcon={<Edit />} onClick={() => navigate(`/situacao/${numId}/editar`)} fullWidth>Editar</Button>
          <Button variant="outlined" color="warning" startIcon={<SwapHoriz />} onClick={() => setTrocarOpen(true)} fullWidth>Trocar</Button>
          <Button variant="outlined" color="error" startIcon={<Close />} onClick={() => setEncerrarOpen(true)} fullWidth>Encerrar</Button>
        </Stack>
      )}
      {detail.NUNOTA && (
        <Button variant="text" startIcon={<Receipt />} onClick={() => navigate(`/situacao/${numId}/notas`)} sx={{ mt: 1 }}>Ver notas</Button>
      )}
      <EncerrarDialog open={encerrarOpen} onClose={() => setEncerrarOpen(false)} onConfirm={() => { encerrar.mutate(numId); setEncerrarOpen(false); navigate(-1); }} loading={encerrar.isPending} />
      <TrocarSituacaoDialog open={trocarOpen} onClose={() => setTrocarOpen(false)} onConfirm={(payload) => { trocar.mutate({ id: numId, payload }); setTrocarOpen(false); navigate(-1); }} loading={trocar.isPending} />
    </>
  );
}
