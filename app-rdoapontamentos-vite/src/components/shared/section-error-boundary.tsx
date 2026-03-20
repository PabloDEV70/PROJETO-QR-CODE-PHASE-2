import { Component, type ReactNode } from 'react';
import { Box, Typography, Button, alpha } from '@mui/material';
import { ErrorOutline, Refresh } from '@mui/icons-material';

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class SectionErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 1,
            py: 3,
            px: 2,
            borderRadius: 2,
            bgcolor: (t) => alpha(t.palette.error.main, 0.05),
            border: 1,
            borderColor: (t) => alpha(t.palette.error.main, 0.15),
          }}
        >
          <ErrorOutline sx={{ fontSize: 32, color: 'error.main', opacity: 0.6 }} />
          <Typography variant="body2" fontWeight={600} color="error.main">
            {this.props.fallbackTitle ?? 'Erro ao carregar'}
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ textAlign: 'center', maxWidth: 250 }}>
            {this.state.error?.message ?? 'Ocorreu um erro inesperado'}
          </Typography>
          <Button
            size="small"
            startIcon={<Refresh sx={{ fontSize: 14 }} />}
            onClick={this.handleRetry}
            sx={{ mt: 0.5, fontSize: '0.75rem' }}
          >
            Tentar novamente
          </Button>
        </Box>
      );
    }
    return this.props.children;
  }
}
