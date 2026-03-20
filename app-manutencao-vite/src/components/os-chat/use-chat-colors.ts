import { useTheme } from '@mui/material';
import { chatColors } from './chat-tokens';

export function useChatColors() {
  const theme = useTheme();
  return theme.palette.mode === 'dark' ? chatColors.dark : chatColors.light;
}
