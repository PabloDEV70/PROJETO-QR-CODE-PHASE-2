import { useMemo, useState } from 'react';
import { Autocomplete, TextField, Box, Typography, Chip, Paper } from '@mui/material';
import type { PainelVeiculo } from '@/types/hstvei-types';
import type { HstVeiRow } from '@/api/hstvei-crud';

interface Props {
  codveiculo: number | '';
  onChange: (v: number) => void;
  veiculos: PainelVeiculo[];
  isEdit: boolean;
  editRow: HstVeiRow | null;
}

export function VeiculoSection({ codveiculo, onChange, veiculos, isEdit, editRow }: Props) {
  const selected = useMemo(
    () => veiculos.find((v) => v.codveiculo === codveiculo) ?? null,
    [veiculos, codveiculo],
  );

  const [inputValue, setInputValue] = useState('');

  return (
    <>
      <Autocomplete
        value={selected}
        onChange={(_, opt) => { if (opt) onChange(opt.codveiculo); }}
        inputValue={inputValue}
        onInputChange={(_, val) => setInputValue(val)}
        options={veiculos}
        disabled={isEdit}
        size="small"
        fullWidth
        getOptionLabel={(o) => `${o.placa} ${o.tag ?? ''}`}
        getOptionKey={(o) => o.codveiculo}
        isOptionEqualToValue={(a, b) => a.codveiculo === b.codveiculo}
        filterOptions={(opts, state) => {
          const term = state.inputValue.toLowerCase().trim();
          if (!term) return opts.slice(0, 30);
          return opts.filter((o) =>
            o.placa?.toLowerCase().includes(term) ||
            o.tag?.toLowerCase().includes(term) ||
            o.marcaModelo?.toLowerCase().includes(term) ||
            o.tipo?.toLowerCase().includes(term) ||
            o.fabricante?.toLowerCase().includes(term)
          ).slice(0, 20);
        }}
        renderOption={({ key, ...props }, o) => (
          <li key={key} {...props} style={{ padding: '4px 12px' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
              <Box sx={{ minWidth: 70 }}>
                <Typography sx={{ fontWeight: 800, fontFamily: 'monospace', fontSize: '0.82rem', lineHeight: 1.2 }}>
                  {o.placa}
                </Typography>
                {o.tag && (
                  <Typography sx={{ fontSize: '0.6rem', color: 'text.disabled', fontFamily: 'monospace' }}>
                    {o.tag}
                  </Typography>
                )}
              </Box>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography sx={{ fontSize: '0.72rem', lineHeight: 1.2 }} noWrap>
                  {o.marcaModelo ?? ''}
                </Typography>
                <Typography sx={{ fontSize: '0.62rem', color: 'text.disabled', lineHeight: 1.2 }} noWrap>
                  {[o.tipo, o.fabricante, o.capacidade].filter(Boolean).join(' · ')}
                </Typography>
              </Box>
              {o.situacoesAtivas.length > 0 && (
                <Chip label={o.situacoesAtivas[0].situacao} size="small"
                  sx={{ height: 18, fontSize: '0.58rem', maxWidth: 100 }} />
              )}
            </Box>
          </li>
        )}
        renderInput={(params) => (
          <TextField {...params} label="Veiculo *" placeholder="Placa, tag, modelo..." />
        )}
        slotProps={{
          listbox: { sx: { maxHeight: 280, '& .MuiAutocomplete-option': { minHeight: 36 } } },
          popper: { sx: { '& .MuiPaper-root': { maxWidth: 480 } } },
        }}
      />

      {isEdit && editRow && (
        <Paper variant="outlined" sx={{ p: 1.5, bgcolor: 'action.hover' }}>
          <Box sx={{ display: 'flex', gap: 2, fontSize: '0.72rem', color: 'text.secondary' }}>
            <Box>
              <strong>Placa:</strong> {editRow.placa}<br />
              <strong>Tag:</strong> {editRow.veiculoTag ?? '-'}<br />
              <strong>Tipo:</strong> {editRow.veiculoTipo ?? '-'}
            </Box>
            <Box>
              <strong>Marca:</strong> {editRow.marcaModelo ?? '-'}<br />
              <strong>Inicio:</strong> {editRow.DTINICIO ?? '-'}<br />
              <strong>Criado por:</strong> {editRow.nomeUsuInc ?? '-'}
            </Box>
          </Box>
        </Paper>
      )}
    </>
  );
}
