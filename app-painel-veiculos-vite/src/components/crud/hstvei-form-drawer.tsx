import { useState, useEffect } from 'react';
import {
  Drawer, Box, Typography, IconButton, TextField,
  Button, CircularProgress, Alert, Divider,
} from '@mui/material';
import { Close, Save, Add, CheckCircle } from '@mui/icons-material';
import { useSituacoes, useCreateHstVei, useUpdateHstVei } from '@/hooks/use-hstvei-crud';
import { useHstVeiPainel } from '@/hooks/use-hstvei-painel';
import { VeiculoSection } from '@/components/crud/form-sections/veiculo-section';
import { ClassificacaoSection } from '@/components/crud/form-sections/classificacao-section';
import { OsSection } from '@/components/crud/form-sections/os-section';
import { ParceiroAutocomplete } from '@/components/shared/parceiro-autocomplete';
import { UsuarioMultiSelect } from '@/components/shared/usuario-multi-select';
import { fetchUsuariosByIds } from '@/api/hstvei-crud';
import { useAuthStore } from '@/stores/auth-store';
import type { HstVeiRow, HstVeiCreatePayload, HstVeiUpdatePayload, UsuarioOption } from '@/api/hstvei-crud';

interface Props {
  open: boolean;
  onClose: () => void;
  editRow: HstVeiRow | null;
}

/** Safely extract string from API value (may be {} empty object) */
function safeStr(v: unknown): string {
  if (v == null) return '';
  if (typeof v === 'object') return '';
  return String(v);
}

function safeNum(v: unknown): number | null {
  if (v == null || typeof v === 'object') return null;
  const n = Number(v);
  return isNaN(n) ? null : n;
}

function parseUsuarios(csv: string | null): UsuarioOption[] {
  if (!csv || typeof csv !== 'string') return [];
  return csv.split(',').filter(Boolean).map((s) => {
    const codusu = parseInt(s.trim(), 10);
    return { codusu, nomeusu: `#${codusu}`, codparc: null, codemp: null, codfunc: null };
  });
}

function usuariosToString(usuarios: UsuarioOption[]): string {
  return usuarios.map((u) => u.codusu).join(',');
}

const SECTION_SX = {
  fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase' as const,
  letterSpacing: '0.08em', color: 'text.secondary', mb: 1, mt: 0.5,
};

export function HstVeiFormDrawer({ open, onClose, editRow }: Props) {
  const isEdit = !!editRow;
  const codusu = useAuthStore((s) => s.user?.codusu ?? 0);
  const { data: situacoes = [] } = useSituacoes();
  const { data: painel } = useHstVeiPainel();
  const createMut = useCreateHstVei();
  const updateMut = useUpdateHstVei();

  const [codveiculo, setCodveiculo] = useState<number | ''>('');
  const [idsit, setIdsit] = useState<number | ''>('');
  const [idpri, setIdpri] = useState<number | ''>('');
  const [descricao, setDescricao] = useState('');
  const [obs, setObs] = useState('');
  const [dtinicio, setDtinicio] = useState('');
  const [dtprevisao, setDtprevisao] = useState('');
  const [nuos, setNuos] = useState('');
  const [numos, setNumos] = useState('');
  const [nunota, setNunota] = useState('');
  const [codparc, setCodparc] = useState<number | null>(null);
  const [nomeParceiro, setNomeParceiro] = useState<string | null>(null);
  const [operadores, setOperadores] = useState<UsuarioOption[]>([]);
  const [mecanicos, setMecanicos] = useState<UsuarioOption[]>([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (!open) return;
    setError(''); setSuccess('');
    if (editRow) {
      setCodveiculo(editRow.CODVEICULO);
      setIdsit(editRow.IDSIT);
      setIdpri(safeNum(editRow.IDPRI) ?? '');
      setDescricao(safeStr(editRow.DESCRICAO));
      setObs(safeStr(editRow.OBS));
      setDtinicio(safeStr(editRow.DTINICIO).slice(0, 16));
      setDtprevisao(safeStr(editRow.DTPREVISAO).slice(0, 16));
      setNuos(safeNum(editRow.NUOS)?.toString() ?? '');
      setNumos(safeNum(editRow.NUMOS)?.toString() ?? '');
      setNunota(safeNum(editRow.NUNOTA)?.toString() ?? '');
      setCodparc(safeNum(editRow.CODPARC));
      setNomeParceiro(safeStr(editRow.nomeParc) || null);

      // Set placeholder immediately, then enrich with real data
      const opeIds = parseUsuarios(editRow.EXEOPE);
      const mecIds = parseUsuarios(editRow.EXEMEC);
      setOperadores(opeIds);
      setMecanicos(mecIds);

      // Enrich with real user data (names + codparc for photos)
      const allIds = [...opeIds, ...mecIds].map((u) => u.codusu);
      if (allIds.length > 0) {
        fetchUsuariosByIds(allIds).then((users) => {
          const byId = new Map(users.map((u) => [u.codusu, u]));
          setOperadores((prev) => prev.map((p) => byId.get(p.codusu) ?? p));
          setMecanicos((prev) => prev.map((p) => byId.get(p.codusu) ?? p));
        });
      }
    } else {
      setCodveiculo(''); setIdsit(''); setIdpri('');
      setDescricao(''); setObs('');
      setDtinicio(''); setDtprevisao('');
      setNuos(''); setNumos(''); setNunota('');
      setCodparc(null); setNomeParceiro(null);
      setOperadores([]); setMecanicos([]);
    }
  }, [open, editRow]);

  const handleSubmit = async () => {
    setError(''); setSuccess('');
    try {
      if (isEdit) {
        const payload: HstVeiUpdatePayload = {
          idsit: idsit === '' ? undefined : idsit as number,
          idpri: idpri === '' ? null : idpri as number,
          descricao: descricao || null, obs: obs || null,
          dtprevisao: dtprevisao || null,
          nuos: nuos ? Number(nuos) : null,
          numos: numos ? Number(numos) : null,
          codparc, exeope: usuariosToString(operadores) || null,
          exemec: usuariosToString(mecanicos) || null,
          codUsuAlt: codusu || undefined,
        };
        await updateMut.mutateAsync({ id: editRow!.ID, payload });
        setSuccess('Atualizado!');
      } else {
        if (!codveiculo || !idsit) { setError('Veiculo e situacao obrigatorios'); return; }
        if (!codusu) { setError('Usuario nao identificado — refaca login'); return; }
        const payload: HstVeiCreatePayload = {
          codveiculo: codveiculo as number, idsit: idsit as number,
          codUsuInc: codusu,
          ...(idpri !== '' && { idpri: idpri as number }),
          ...(descricao && { descricao }), ...(obs && { obs }),
          ...(dtinicio && { dtinicio }), ...(dtprevisao && { dtprevisao }),
          ...(nuos && { nuos: Number(nuos) }), ...(numos && { numos: Number(numos) }),
          ...(nunota && { nunota: Number(nunota) }), ...(codparc && { codparc }),
          ...(operadores.length && { exeope: usuariosToString(operadores) }),
          ...(mecanicos.length && { exemec: usuariosToString(mecanicos) }),
        };
        await createMut.mutateAsync(payload);
        setSuccess('Criado!');
        setTimeout(onClose, 800);
      }
    } catch (e) { setError(e instanceof Error ? e.message : 'Erro ao salvar'); }
  };

  const loading = createMut.isPending || updateMut.isPending;

  return (
    <Drawer anchor="right" open={open} onClose={onClose} variant="persistent"
      sx={{ '& .MuiDrawer-paper': { width: 500, boxSizing: 'border-box' } }}>

      {/* Header */}
      <Box sx={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        px: 2.5, py: 1.5, borderBottom: 1, borderColor: 'divider',
        bgcolor: isEdit ? 'primary.main' : 'success.main', color: '#fff',
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {isEdit ? <Save sx={{ fontSize: 20 }} /> : <Add sx={{ fontSize: 20 }} />}
          <Typography sx={{ fontSize: '0.95rem', fontWeight: 700 }}>
            {isEdit ? `Editar #${editRow?.ID ?? 0}` : 'Nova Situacao'}
          </Typography>
        </Box>
        <IconButton onClick={onClose} size="small" sx={{ color: '#fff' }}><Close /></IconButton>
      </Box>

      {error && <Alert severity="error" sx={{ mx: 2, mt: 1.5, fontSize: '0.8rem' }}>{error}</Alert>}
      {success && <Alert severity="success" icon={<CheckCircle />} sx={{ mx: 2, mt: 1.5, fontSize: '0.8rem' }}>{success}</Alert>}

      {/* Form */}
      <Box sx={{ p: 2.5, display: 'flex', flexDirection: 'column', gap: 1.5, overflow: 'auto', flex: 1 }}>
        <Typography sx={SECTION_SX}>Veiculo</Typography>
        <VeiculoSection codveiculo={codveiculo} onChange={setCodveiculo}
          veiculos={painel?.veiculos ?? []} isEdit={isEdit} editRow={editRow} />

        <Divider />
        <Typography sx={SECTION_SX}>Classificacao</Typography>
        <ClassificacaoSection idsit={idsit} idpri={idpri}
          onSitChange={setIdsit} onPriChange={setIdpri} situacoes={situacoes} />

        <Divider />
        <Typography sx={SECTION_SX}>Detalhes</Typography>
        <TextField size="small" label="Descricao" value={descricao}
          onChange={(e) => setDescricao(e.target.value)} multiline rows={3} fullWidth
          slotProps={{ htmlInput: { maxLength: 500 } }} helperText={`${descricao.length}/500`} />
        <TextField size="small" label="Observacoes" value={obs}
          onChange={(e) => setObs(e.target.value)} multiline rows={2} fullWidth
          slotProps={{ htmlInput: { maxLength: 1000 } }} />

        <Divider />
        <Typography sx={SECTION_SX}>Datas</Typography>
        <Box sx={{ display: 'flex', gap: 1.5 }}>
          <TextField size="small" label="Inicio" type="datetime-local" value={dtinicio}
            onChange={(e) => setDtinicio(e.target.value)} fullWidth disabled={isEdit}
            slotProps={{ inputLabel: { shrink: true } }} />
          <TextField size="small" label="Previsao" type="datetime-local" value={dtprevisao}
            onChange={(e) => setDtprevisao(e.target.value)} fullWidth
            slotProps={{ inputLabel: { shrink: true } }} />
        </Box>

        <Divider />
        <Typography sx={SECTION_SX}>OS e Movimentos</Typography>
        <OsSection nuos={nuos} numos={numos} nunota={nunota}
          onNuosChange={setNuos} onNumosChange={setNumos} onNunotaChange={setNunota}
          isEdit={isEdit} editRow={editRow} />

        <Divider />
        <Typography sx={SECTION_SX}>Parceiro</Typography>
        <ParceiroAutocomplete value={codparc} nomeParceiro={nomeParceiro}
          onChange={(cp, nome) => { setCodparc(cp); setNomeParceiro(nome ?? null); }} />

        <Divider />
        <Typography sx={SECTION_SX}>Equipe</Typography>
        <UsuarioMultiSelect value={operadores} onChange={setOperadores}
          label="Operadores" placeholder="Buscar operadores..." />
        <UsuarioMultiSelect value={mecanicos} onChange={setMecanicos}
          label="Mecanicos" placeholder="Buscar mecanicos..." />
      </Box>

      {/* Footer */}
      <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider', display: 'flex', gap: 1.5 }}>
        <Button variant="outlined" onClick={onClose} size="small" sx={{ flex: 1, textTransform: 'none' }}>
          Cancelar
        </Button>
        <Button variant="contained" onClick={handleSubmit} disabled={loading} size="small"
          startIcon={loading ? <CircularProgress size={16} /> : isEdit ? <Save /> : <Add />}
          sx={{ flex: 1, textTransform: 'none', fontWeight: 700 }}>
          {isEdit ? 'Salvar' : 'Criar Situacao'}
        </Button>
      </Box>
    </Drawer>
  );
}
