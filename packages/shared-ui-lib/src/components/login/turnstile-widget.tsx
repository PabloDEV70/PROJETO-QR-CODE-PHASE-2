import { Turnstile } from '@marsidev/react-turnstile';
import { Box } from '@mui/material';

interface TurnstileWidgetProps {
  siteKey: string;
  onVerify: (token: string) => void;
  onExpire?: () => void;
  onError?: () => void;
}

export function TurnstileWidget({ siteKey, onVerify, onExpire, onError }: TurnstileWidgetProps) {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
      <Turnstile
        siteKey={siteKey}
        onSuccess={onVerify}
        onExpire={onExpire}
        onError={onError}
        options={{
          theme: 'auto',
          size: 'normal',
        }}
      />
    </Box>
  );
}
