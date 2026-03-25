import {
  Autocomplete, TextField, Box, Typography,
  InputAdornment, Chip, alpha,
} from '@mui/material';
import { Search as SearchIcon } from '@mui/icons-material';
import type { PageConfig } from '@/components/layout/pages-config';
import { usePageSearch } from '@/hooks/use-page-search';

export function PageSearch() {
  const {
    pathname, inputValue, setInputValue, open, setOpen,
    filteredOptions, handleSelect,
  } = usePageSearch();

  return (
    <Autocomplete
      id="page-search"
      options={filteredOptions}
      getOptionLabel={(option) => option.label}
      groupBy={(option) => option.group || 'Outros'}
      value={null}
      inputValue={inputValue}
      onInputChange={(_, value, reason) => {
        if (reason === 'reset') return;
        setInputValue(value);
      }}
      onChange={handleSelect}
      open={open}
      onOpen={() => setOpen(true)}
      onClose={() => { setOpen(false); setInputValue(''); }}
      clearOnBlur
      blurOnSelect
      sx={{ width: { xs: '100%', sm: 280, md: 400, lg: 480 } }}
      slotProps={{
        paper: {
          sx: {
            mt: 0.5,
            border: '1px solid',
            borderColor: 'divider',
            boxShadow: (theme) => theme.shadows[8],
          },
        },
      }}
      renderInput={(params) => (
        <TextField
          {...params}
          id="page-search-input"
          placeholder="Buscar pagina..."
          size="small"
          slotProps={{
            input: {
              ...params.InputProps,
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: 'text.disabled', fontSize: 18 }} />
                </InputAdornment>
              ),
              endAdornment: (
                <>
                  <InputAdornment
                    position="end"
                    sx={{ display: { xs: 'none', md: 'flex' } }}
                  >
                    <Chip
                      label="Ctrl K"
                      size="small"
                      variant="outlined"
                      sx={{
                        height: 20,
                        fontSize: '0.6rem',
                        fontWeight: 600,
                        color: 'text.disabled',
                        borderColor: 'divider',
                        '& .MuiChip-label': { px: 0.75 },
                      }}
                    />
                  </InputAdornment>
                  {params.InputProps.endAdornment}
                </>
              ),
              sx: {
                borderRadius: 2,
                bgcolor: (theme) => alpha(theme.palette.text.primary, 0.03),
                '&:hover': {
                  bgcolor: (theme) => alpha(theme.palette.text.primary, 0.05),
                },
                '&.Mui-focused': { bgcolor: 'background.paper' },
              },
            },
          }}
        />
      )}
      renderGroup={(params) => (
        <li key={params.key}>
          <Box
            sx={{
              fontWeight: 700,
              fontSize: '0.7rem',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: 'text.disabled',
              bgcolor: 'background.default',
              lineHeight: '32px',
              px: 2,
              position: 'sticky',
              top: -8,
              zIndex: 1,
            }}
          >
            {params.group}
          </Box>
          <ul style={{ padding: 0 }}>{params.children}</ul>
        </li>
      )}
      renderOption={({ key, ...props }, option) => (
        <SearchOption
          key={key}
          props={props}
          option={option}
          pathname={pathname}
        />
      )}
    />
  );
}

function SearchOption({ props, option, pathname }: {
  props: React.HTMLAttributes<HTMLLIElement>;
  option: PageConfig;
  pathname: string;
}) {
  const Icon = option.icon;
  const isCurrentPage = pathname === option.path
    || (option.path !== '/' && pathname.startsWith(option.path));
  return (
    <Box
      component="li"
      {...props}
      sx={{
        py: 1, px: 2,
        display: 'flex', alignItems: 'center', gap: 1.5,
        opacity: isCurrentPage ? 0.5 : 1,
        '&:hover': { bgcolor: 'action.hover' },
      }}
    >
      <Icon
        sx={{
          color: isCurrentPage ? 'primary.main' : 'text.disabled',
          fontSize: 20, flexShrink: 0,
        }}
      />
      <Box sx={{ minWidth: 0, flex: 1 }}>
        <Typography
          variant="body2"
          sx={{
            fontWeight: isCurrentPage ? 700 : 500,
            color: isCurrentPage ? 'primary.main' : 'text.primary',
            lineHeight: 1.3,
          }}
          noWrap
        >
          {option.label}
        </Typography>
        {option.description && (
          <Typography
            variant="caption"
            sx={{ color: 'text.disabled', lineHeight: 1.2 }}
            noWrap
          >
            {option.description}
          </Typography>
        )}
      </Box>
      {isCurrentPage && (
        <Chip
          label="Atual"
          size="small"
          sx={{
            height: 18, fontSize: '0.6rem', fontWeight: 600,
            bgcolor: 'primary.main', color: 'primary.contrastText',
            '& .MuiChip-label': { px: 0.75 },
          }}
        />
      )}
    </Box>
  );
}
