import { useState } from 'react';
import {
  Box, Paper, Typography, Stack, Chip, TextField, MenuItem,
  Pagination, CircularProgress, InputAdornment,
} from '@mui/material';
import { Search, Add } from '@mui/icons-material';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useCorridasList, useMotoristas } from '@/hooks/use-corridas';
import { useAuthStore } from '@/stores/auth-store';
import {
  STATUS_LABELS, STATUS_COLORS, BUSCAR_LEVAR_LABELS,
} from '@/types/corrida';
import { format } from 'date-fns';
import { Fab } from '@mui/material';

export function CorridasListPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const user = useAuthStore((s) => s.user);
  const { data: motoristas } = useMotoristas();

  const [search, setSearch] = useState(searchParams.get('search') ?? '');
  const status = searchParams.get('status') ?? '';
  const motorista = searchParams.get('motorista') ?? '';
  const page = Number(searchParams.get('page') ?? '1');

  const { data, isLoading } = useCorridasList({
    page,
    limit: 20,
    status: status || undefined,
    motorista: motorista ? Number(motorista) : undefined,
    search: search || undefined,
    orderBy: 'DT_CREATED',
    orderDir: 'DESC',
  });

  function updateParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams);
    if (value) params.set(key, value);
    else params.delete(key);
    params.set('page', '1');
    setSearchParams(params);
  }

  const totalPages = data ? Math.ceil(data.total / 20) : 0;
  const showMyRides = searchParams.get('minhas') === '1';

  return (
    <Box sx={{ p: 2, pb: 10 }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
        <Typography variant="h6" fontWeight={700}>Corridas</Typography>
        <Stack direction="row" spacing={1}>
          <Chip
            label="Minhas Solicitacoes"
            variant={showMyRides ? 'filled' : 'outlined'}
            size="small"
            onClick={() => {
              const params = new URLSearchParams(searchParams);
              if (showMyRides) {
                params.delete('minhas');
                params.delete('solicitante');
              } else {
                params.set('minhas', '1');
                if (user?.codusu) params.set('solicitante', String(user.codusu));
              }
              setSearchParams(params);
            }}
          />
        </Stack>
      </Stack>

      <Stack direction="row" spacing={1} sx={{ mb: 2 }} flexWrap="wrap" useFlexGap>
        <TextField
          size="small"
          placeholder="Buscar..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && updateParam('search', search)}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <Search sx={{ fontSize: 18 }} />
                </InputAdornment>
              ),
            },
          }}
          sx={{ minWidth: 200 }}
        />
        <TextField
          select
          size="small"
          label="Status"
          value={status}
          onChange={(e) => updateParam('status', e.target.value)}
          sx={{ minWidth: 140 }}
        >
          <MenuItem value="">Todos</MenuItem>
          {Object.entries(STATUS_LABELS).map(([v, l]) => (
            <MenuItem key={v} value={v}>{l}</MenuItem>
          ))}
        </TextField>
        <TextField
          select
          size="small"
          label="Motorista"
          value={motorista}
          onChange={(e) => updateParam('motorista', e.target.value)}
          sx={{ minWidth: 160 }}
        >
          <MenuItem value="">Todos</MenuItem>
          {motoristas?.map((m) => (
            <MenuItem key={m.CODUSU} value={String(m.CODUSU)}>{m.NOMEUSU}</MenuItem>
          ))}
        </TextField>
      </Stack>

      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Stack spacing={1}>
          {data?.data.map((c) => (
            <Paper
              key={c.ID}
              variant="outlined"
              onClick={() => navigate(`/corridas/${c.ID}`)}
              sx={{ p: 1.5, cursor: 'pointer', '&:hover': { bgcolor: 'action.hover' } }}
            >
              <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                <Box sx={{ flex: 1 }}>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Typography variant="body2" fontWeight={700}>#{c.ID}</Typography>
                    <Typography variant="body2" fontWeight={600}>
                      {c.NOMEPARC ?? c.DESTINO ?? 'Sem destino'}
                    </Typography>
                  </Stack>
                  <Typography variant="caption" color="text.secondary">
                    {c.NOMESOLICITANTE}
                    {c.NOMEMOTORISTA ? ` → ${c.NOMEMOTORISTA}` : ''}
                    {' · '}{BUSCAR_LEVAR_LABELS[c.BUSCARLEVAR] ?? c.BUSCARLEVAR}
                  </Typography>
                  {c.PASSAGEIROSMERCADORIA && (
                    <Typography variant="caption" display="block" color="text.secondary" sx={{ mt: 0.25 }}>
                      {c.PASSAGEIROSMERCADORIA.slice(0, 80)}
                    </Typography>
                  )}
                </Box>
                <Stack alignItems="flex-end" spacing={0.5}>
                  <Chip
                    label={STATUS_LABELS[c.STATUS] ?? c.STATUS}
                    size="small"
                    sx={{
                      bgcolor: `${STATUS_COLORS[c.STATUS] ?? '#999'}18`,
                      color: STATUS_COLORS[c.STATUS] ?? '#999',
                      fontWeight: 600, fontSize: 11,
                    }}
                  />
                  <Typography variant="caption" color="text.disabled">
                    {c.DT_CREATED ? format(new Date(c.DT_CREATED), 'dd/MM HH:mm') : ''}
                  </Typography>
                </Stack>
              </Stack>
            </Paper>
          ))}
          {data?.data.length === 0 && (
            <Typography color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
              Nenhuma corrida encontrada
            </Typography>
          )}
        </Stack>
      )}

      {totalPages > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
          <Pagination
            count={totalPages}
            page={page}
            onChange={(_, p) => {
              const params = new URLSearchParams(searchParams);
              params.set('page', String(p));
              setSearchParams(params);
            }}
            size="small"
          />
        </Box>
      )}

      <Fab
        color="primary"
        onClick={() => navigate('/nova-corrida')}
        sx={{ position: 'fixed', bottom: 24, right: 24 }}
      >
        <Add />
      </Fab>
    </Box>
  );
}
