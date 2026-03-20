import {
  Box, Typography, Card, CardContent, Chip, Skeleton,
} from '@mui/material';
import {
  Schedule, Business, Badge, Person, CalendarMonth, Fingerprint,
  WorkOutline, Numbers,
} from '@mui/icons-material';
import { format, parseISO } from 'date-fns';
import { useAuthStore } from '@/stores/auth-store';
import { FuncionarioAvatar } from '@/components/shared/funcionario-avatar';
import { usePerfilEnriquecido } from '@/hooks/use-perfil-enriquecido';

const MONO = '"SF Mono", "Roboto Mono", "Fira Code", monospace';

/* ── Helpers ── */

function fmtMin(m: number): string {
  const h = Math.floor(m / 60);
  const min = m % 60;
  return h > 0 ? `${h}h${min > 0 ? `${min}` : ''}` : `${min}min`;
}

function CodeBadge({ code }: { code: number | string | null | undefined }) {
  if (code == null) return null;
  return (
    <Typography component="span" sx={{
      fontFamily: MONO, px: 0.6, py: 0.15, borderRadius: 0.75, ml: 0.5,
      bgcolor: 'action.hover', color: 'text.disabled', fontSize: '0.6rem', fontWeight: 700,
      display: 'inline-flex', alignItems: 'center', gap: 0.25,
    }}>
      <Numbers sx={{ fontSize: 10 }} />{code}
    </Typography>
  );
}

/* ── DadoRow ── */

function DadoRow({ label, value, code, icon }: {
  label: string; value: string | null | undefined;
  code?: number | null; icon?: React.ReactNode;
}) {
  if (!value && code == null) return null;
  return (
    <Box sx={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      py: 0.6, px: 1.5, '&:not(:last-child)': { borderBottom: 1, borderColor: 'divider' },
    }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, color: 'text.secondary' }}>
        {icon}
        <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8rem' }}>{label}</Typography>
      </Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
        <Typography variant="body2" fontWeight={600} sx={{ textAlign: 'right', fontSize: '0.8rem' }}>
          {value ?? '—'}
        </Typography>
        <CodeBadge code={code} />
      </Box>
    </Box>
  );
}

/* ── Header Hero ── */

function ProfileHeader({ perfil, user }: {
  perfil: ReturnType<typeof usePerfilEnriquecido>;
  user: ReturnType<typeof useAuthStore.getState>['user'];
}) {
  const nome = perfil.data?.nomeparc ?? user?.nome ?? 'Usuario';
  const v = perfil.data?.vinculoAtual;
  const cpf = perfil.data?.cgcCpf;

  return (
    <Box sx={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      pt: 2, pb: 2.5, px: 2, textAlign: 'center',
    }}>
      <FuncionarioAvatar
        codparc={user?.codparc} codemp={user?.codemp} codfunc={user?.codfunc}
        nome={nome} size="large"
        sx={{ width: 72, height: 72, fontSize: 32, mb: 1.5 }}
      />
      <Typography sx={{ fontSize: '1.15rem', fontWeight: 800, lineHeight: 1.2 }}>{nome}</Typography>

      {/* Chips: depto + cargo */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 0.5, mt: 1 }}>
        {v?.departamento && (
          <Chip label={`${v.departamento} #${v.coddep}`} size="small" icon={<Business sx={{ fontSize: 14 }} />}
            sx={{ height: 24, fontSize: '0.7rem', fontWeight: 600 }} />
        )}
        {v?.cargo && (
          <Chip label={`${v.cargo} #${v.codcargo}`} size="small" icon={<Badge sx={{ fontSize: 14 }} />}
            sx={{ height: 24, fontSize: '0.7rem', fontWeight: 600 }} />
        )}
      </Box>

      {/* Codes row */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1, flexWrap: 'wrap', justifyContent: 'center' }}>
        {user?.codparc && (
          <Typography variant="caption" sx={{ fontFamily: MONO, color: 'text.disabled', fontWeight: 600 }}>
            CODPARC {user.codparc}
          </Typography>
        )}
        {cpf && (
          <Typography variant="caption" sx={{ fontFamily: MONO, color: 'text.disabled', fontWeight: 600 }}>
            CPF {cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')}
          </Typography>
        )}
      </Box>
    </Box>
  );
}

/* ── Meus Dados ── */

function DadosFuncionarioSection({ perfil, isLoading }: {
  perfil: ReturnType<typeof usePerfilEnriquecido>['data']; isLoading: boolean;
}) {
  if (isLoading) return (
    <Card variant="outlined">
      <CardContent sx={{ pb: '12px !important' }}>
        <Skeleton variant="text" width={140} height={24} sx={{ mb: 1 }} />
        {[1, 2, 3, 4, 5].map((i) => <Skeleton key={i} variant="text" height={28} />)}
      </CardContent>
    </Card>
  );
  const v = perfil?.vinculoAtual;
  if (!v) return null;
  const dtAdm = v.dtadm ? format(parseISO(v.dtadm), 'dd/MM/yyyy') : null;
  const ch = perfil?.cargaHoraria;

  return (
    <Card variant="outlined">
      <CardContent sx={{ pb: '8px !important', px: 0 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5, px: 2 }}>
          <Person sx={{ fontSize: 20, color: 'primary.main' }} />
          <Typography variant="subtitle2" fontWeight={700}>Dados Funcionais</Typography>
        </Box>
        <DadoRow label="Departamento" value={v.departamento} code={v.coddep}
          icon={<Business sx={{ fontSize: 14 }} />} />
        <DadoRow label="Cargo" value={v.cargo} code={v.codcargo}
          icon={<Badge sx={{ fontSize: 14 }} />} />
        {v.funcao && v.funcao !== v.cargo && (
          <DadoRow label="Funcao" value={v.funcao} code={v.codfuncao}
            icon={<WorkOutline sx={{ fontSize: 14 }} />} />
        )}
        <DadoRow label="Empresa" value={v.empresa} code={v.codemp}
          icon={<Business sx={{ fontSize: 14 }} />} />
        <DadoRow label="Vinculo" value={v.situacaoLabel} code={v.codfunc}
          icon={<Fingerprint sx={{ fontSize: 14 }} />} />
        <DadoRow label="Admissao" value={dtAdm}
          icon={<CalendarMonth sx={{ fontSize: 14 }} />} />
        {ch && (
          <DadoRow label="Escala" value={ch.descricao ?? ch.totalHorasSemanaFmt} code={v.codcargahor}
            icon={<Schedule sx={{ fontSize: 14 }} />} />
        )}
      </CardContent>
    </Card>
  );
}

/* ── Carga Horaria ── */

function CargaHorariaSection({ perfil, isLoading }: {
  perfil: ReturnType<typeof usePerfilEnriquecido>['data']; isLoading: boolean;
}) {
  if (isLoading) return (
    <Card variant="outlined">
      <CardContent sx={{ pb: '12px !important' }}>
        <Skeleton variant="text" width={180} height={24} sx={{ mb: 1 }} />
        {[1, 2, 3, 4, 5, 6, 7].map((i) => <Skeleton key={i} variant="text" height={32} />)}
      </CardContent>
    </Card>
  );
  const ch = perfil?.cargaHoraria;
  if (!ch) return null;
  const diasUteis = ch.dias.filter((d) => !d.folga).length;
  const mediaDiaria = diasUteis > 0 ? Math.round(ch.totalMinutosSemana / diasUteis) : 0;

  return (
    <Card variant="outlined">
      <CardContent sx={{ pb: '8px !important', px: 0 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5, px: 2 }}>
          <Schedule sx={{ fontSize: 20, color: 'primary.main' }} />
          <Typography variant="subtitle2" fontWeight={700} flex={1}>Carga Horaria</Typography>
          <Chip label={ch.totalHorasSemanaFmt} size="small" color="primary"
            sx={{ height: 24, fontSize: '0.7rem', fontWeight: 700 }} />
        </Box>

        {/* Stats row */}
        <Box sx={{ display: 'flex', gap: 1, px: 2, mb: 1, flexWrap: 'wrap' }}>
          <Typography variant="caption" sx={{ color: 'text.secondary', fontFamily: MONO }}>
            {diasUteis} dias uteis
          </Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>·</Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary', fontFamily: MONO }}>
            ~{fmtMin(mediaDiaria)}/dia
          </Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>·</Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary', fontFamily: MONO }}>
            {ch.totalMinutosSemana}min/sem
          </Typography>
          {ch.descricao && (
            <>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>·</Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                {ch.descricao}
              </Typography>
            </>
          )}
        </Box>

        {/* Days grid */}
        {ch.dias.map((dia) => (
          <Box key={dia.diasem} sx={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            py: 0.75, px: 2,
            bgcolor: dia.folga ? 'transparent' : 'action.hover',
            '&:not(:last-child)': { borderBottom: 1, borderColor: 'divider' },
          }}>
            <Typography variant="body2" sx={{
              width: 100, fontWeight: dia.folga ? 400 : 700, fontSize: '0.8rem',
              color: dia.folga ? 'text.disabled' : 'text.primary',
            }}>
              {dia.diasemLabel}
            </Typography>

            {dia.folga ? (
              <Typography variant="body2" sx={{ fontStyle: 'italic', color: 'text.disabled', fontSize: '0.8rem' }}>
                Folga
              </Typography>
            ) : (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 0.15 }}>
                  {dia.turnos.map((t, idx) => (
                    <Typography key={idx} variant="body2" sx={{
                      fontFamily: MONO, fontWeight: 600, fontSize: '0.8rem', letterSpacing: 0.5,
                    }}>
                      {t.entrada} — {t.saida}
                    </Typography>
                  ))}
                </Box>
                <Chip label={fmtMin(dia.minutosPrevistos)} size="small"
                  sx={{
                    height: 20, fontSize: '0.6rem', fontWeight: 700, fontFamily: MONO,
                    bgcolor: 'action.selected', color: 'text.secondary',
                  }} />
              </Box>
            )}
          </Box>
        ))}
      </CardContent>
    </Card>
  );
}

/* ── Main Page ── */

export function PerfilPage() {
  const user = useAuthStore((s) => s.user);
  const perfil = usePerfilEnriquecido(user?.codparc);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pb: 2, maxWidth: 480, mx: 'auto' }}>
      {/* Hero Header */}
      <ProfileHeader perfil={perfil} user={user} />

      {/* Dados Funcionais */}
      <DadosFuncionarioSection perfil={perfil.data} isLoading={perfil.isLoading} />

      {/* Carga Horaria */}
      <CargaHorariaSection perfil={perfil.data} isLoading={perfil.isLoading} />
    </Box>
  );
}

export default PerfilPage;
