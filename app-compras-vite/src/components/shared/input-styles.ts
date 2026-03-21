import type { SxProps, Theme } from '@mui/material';

export const FILTER_INPUT_HEIGHT = 36;
export const FILTER_INPUT_RADIUS = '6px';
export const FILTER_INPUT_FONT_SIZE = 13;

export const filterInputRootSx: SxProps<Theme> = {
  bgcolor: 'background.paper',
  height: FILTER_INPUT_HEIGHT,
  borderRadius: FILTER_INPUT_RADIUS,
  fontSize: FILTER_INPUT_FONT_SIZE,
  fontWeight: 500,
  '& .MuiOutlinedInput-notchedOutline': {
    borderColor: 'divider',
  },
  '&:hover .MuiOutlinedInput-notchedOutline': {
    borderColor: 'action.active',
  },
  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
    borderColor: 'primary.main',
    borderWidth: 1.5,
  },
};

export const filterFieldSx: SxProps<Theme> = {
  '& .MuiOutlinedInput-root': filterInputRootSx,
  '& .MuiInputAdornment-root .MuiSvgIcon-root': {
    fontSize: 18,
    color: 'action.active',
  },
};
