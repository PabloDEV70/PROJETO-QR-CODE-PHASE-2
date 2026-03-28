import { useState, useCallback, useRef } from 'react';
import { Autocomplete, TextField, Box, Typography } from '@mui/material';
import { Place } from '@mui/icons-material';

const GOOGLE_API_KEY = 'AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8';

interface Prediction {
  place_id: string;
  description: string;
  structured_formatting: {
    main_text: string;
    secondary_text: string;
  };
}

interface GooglePlacesAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
}

export function GooglePlacesAutocomplete({
  value,
  onChange,
  label = 'Destino',
  placeholder = 'Buscar endereco...',
}: GooglePlacesAutocompleteProps) {
  const [options, setOptions] = useState<Prediction[]>([]);
  const [loading, setLoading] = useState(false);
  const [inputValue, setInputValue] = useState(value);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const search = useCallback((term: string) => {
    if (term.length < 3) { setOptions([]); setLoading(false); return; }
    setLoading(true);

    // Google Places Autocomplete API has CORS restrictions for browser calls.
    // Use the Places JS library via script tag as a workaround.
    if (!(window as any)._googleAutocompleteService) {
      // Fallback: just use the typed value
      setOptions([{
        place_id: 'custom',
        description: term,
        structured_formatting: { main_text: term, secondary_text: 'Endereco digitado' },
      }]);
      setLoading(false);
      return;
    }

    const service = (window as any)._googleAutocompleteService;
    service.getPlacePredictions(
      { input: term, componentRestrictions: { country: 'br' } },
      (predictions: Prediction[] | null) => {
        setOptions(predictions ?? []);
        setLoading(false);
      },
    );
  }, []);

  const handleInputChange = useCallback((_: unknown, val: string, reason: string) => {
    setInputValue(val);
    if (reason === 'input') {
      onChange(val);
      clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => search(val), 400);
    }
  }, [search, onChange]);

  // Load Google Places JS if not loaded
  if (!(window as any)._googlePlacesLoaded) {
    (window as any)._googlePlacesLoaded = true;
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_API_KEY}&libraries=places`;
    script.async = true;
    script.onload = () => {
      (window as any)._googleAutocompleteService = new (window as any).google.maps.places.AutocompleteService();
    };
    document.head.appendChild(script);
  }

  return (
    <Autocomplete
      freeSolo
      value={value}
      inputValue={inputValue}
      onInputChange={handleInputChange}
      onChange={(_, val) => {
        if (typeof val === 'string') {
          onChange(val);
        } else if (val) {
          onChange(val.description);
          setInputValue(val.description);
        }
      }}
      options={options}
      loading={loading}
      fullWidth
      size="small"
      filterOptions={(x) => x}
      getOptionLabel={(opt) => typeof opt === 'string' ? opt : opt.description}
      isOptionEqualToValue={(opt, val) => {
        if (typeof val === 'string') return opt.description === val;
        return opt.place_id === val.place_id;
      }}
      noOptionsText={inputValue.length < 3 ? 'Digite para buscar endereco...' : 'Nenhum endereco encontrado'}
      loadingText="Buscando..."
      renderOption={({ key, ...props }, option) => (
        <li key={key} {...props}>
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', width: '100%' }}>
            <Place sx={{ fontSize: 18, color: 'primary.main', flexShrink: 0 }} />
            <Box sx={{ minWidth: 0, flex: 1 }}>
              <Typography variant="body2" fontWeight={600} noWrap>
                {option.structured_formatting.main_text}
              </Typography>
              <Typography variant="caption" color="text.secondary" noWrap>
                {option.structured_formatting.secondary_text}
              </Typography>
            </Box>
          </Box>
        </li>
      )}
      renderInput={(params) => (
        <TextField {...params} label={label} placeholder={placeholder} />
      )}
    />
  );
}
