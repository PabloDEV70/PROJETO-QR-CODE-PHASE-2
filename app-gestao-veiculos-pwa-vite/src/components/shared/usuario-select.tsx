import { useState, useMemo } from 'react';
import { Autocomplete, TextField, Avatar, Chip, Box, CircularProgress } from '@mui/material';
import { fetchUsuarios, getUsuarioFotoUrl, type UsuarioItem } from '@/api/usuarios';

interface UsuarioSelectProps {
  label: string;
  value: number[];
  onChange: (values: number[]) => void;
  placeholder?: string;
  departamento?: string;
}

export function UsuarioSelect({ label, value, onChange, placeholder, departamento }: UsuarioSelectProps) {
  const [open, setOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [options, setOptions] = useState<readonly UsuarioItem[]>([]);
  const loading = open && options.length === 0 && inputValue.length >= 2;

  const selectedUsers = useMemo(() => {
    return options.filter((u) => value.includes(u.codusu));
  }, [options, value]);

  const handleOpen = () => {
    setOpen(true);
    fetchUsuarios('', departamento).then(setOptions).catch(() => setOptions([]));
  };

  const handleClose = () => {
    setOpen(false);
    setInputValue('');
  };

  const handleInputChange = (_: unknown, newInput: string) => {
    setInputValue(newInput);
    if (newInput.length >= 2) {
      fetchUsuarios(newInput, departamento).then(setOptions).catch(() => setOptions([]));
    }
  };

  const handleChange = (_: unknown, newValue: UsuarioItem[]) => {
    onChange(newValue.map((u) => u.codusu));
  };

  return (
    <Autocomplete
      multiple
      open={open}
      onOpen={handleOpen}
      onClose={handleClose}
      value={selectedUsers}
      onChange={handleChange}
      inputValue={inputValue}
      onInputChange={handleInputChange}
      options={options}
      loading={loading}
      getOptionLabel={(option) => option.nomeusu || `Usuário ${option.codusu}`}
      isOptionEqualToValue={(option, val) => option.codusu === val.codusu}
      renderInput={(params) => (
        <TextField
          {...params}
          label={label}
          placeholder={placeholder || 'Buscar usuários...'}
          InputProps={{
            ...params.InputProps,
            endAdornment: (
              <>
                {loading ? <CircularProgress color="inherit" size={20} /> : null}
                {params.InputProps.endAdornment}
              </>
            ),
          }}
        />
      )}
      renderTags={(tagValue, getTagProps) =>
        tagValue.map((option, index) => {
          const { key, ...tagProps } = getTagProps({ index });
          const fotoUrl = getUsuarioFotoUrl(option.codparc);
          return (
            <Chip
              key={key}
              {...tagProps}
              label={option.nomeusu?.split(' ')[0] || `U${option.codusu}`}
              avatar={
                fotoUrl ? (
                  <Avatar 
                    src={fotoUrl} 
                    sx={{ width: 24, height: 24 }}
                    slotProps={{ img: { loading: 'lazy' } }}
                  />
                ) : (
                  <Avatar sx={{ width: 24, height: 24 }}>{option.nomeusu?.charAt(0) || 'U'}</Avatar>
                )
              }
              size="small"
            />
          );
        })
      }
      renderOption={(props, option) => {
        const { key, ...restProps } = props;
        const fotoUrl = getUsuarioFotoUrl(option.codparc);
        return (
          <Box component="li" key={key} {...restProps} sx={{ display: 'flex', gap: 1.5, py: 0.75 }}>
            {fotoUrl ? (
              <Avatar 
                src={fotoUrl} 
                sx={{ width: 32, height: 32 }}
                slotProps={{ img: { loading: 'lazy' } }}
              />
            ) : (
              <Avatar sx={{ width: 32, height: 32 }}>{option.nomeusu?.charAt(0) || 'U'}</Avatar>
            )}
            <Box>
              <Box sx={{ fontWeight: 500 }}>{option.nomeusu}</Box>
              {option.nomeparc && (
                <Box sx={{ fontSize: '0.75rem', color: 'text.secondary' }}>{option.nomeparc}</Box>
              )}
            </Box>
          </Box>
        );
      }}
    />
  );
}
