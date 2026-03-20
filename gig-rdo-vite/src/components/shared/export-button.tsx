import { useState } from 'react';
import {
  Button, Menu, MenuItem, ListItemIcon, ListItemText, CircularProgress,
  Snackbar, Alert,
} from '@mui/material';
import { Download, TableChart, PictureAsPdf, Description } from '@mui/icons-material';
import type { ExportFormat } from '@/hooks/use-export';

interface ExportButtonProps {
  onExport: (format: ExportFormat) => void;
  isExporting: boolean;
  error?: string | null;
  disabled?: boolean;
  size?: 'small' | 'medium';
  formats?: ExportFormat[];
}

const FORMAT_CONFIG: Record<ExportFormat, {
  label: string;
  desc: string;
  icon: typeof TableChart;
  color: string;
}> = {
  xlsx: { label: 'Excel (.xlsx)', desc: 'Com formulas e estilos', icon: TableChart, color: 'success.main' },
  pdf: { label: 'PDF (.pdf)', desc: 'Dados em tabela', icon: PictureAsPdf, color: 'error.main' },
  csv: { label: 'CSV (.csv)', desc: 'Separador ponto-e-virgula', icon: Description, color: 'info.main' },
};

export function ExportButton({
  onExport,
  isExporting,
  error,
  disabled = false,
  size = 'small',
  formats = ['xlsx', 'pdf', 'csv'],
}: ExportButtonProps) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [successOpen, setSuccessOpen] = useState(false);

  const handleExport = (format: ExportFormat) => {
    setAnchorEl(null);
    onExport(format);
    if (!error) setSuccessOpen(true);
  };

  return (
    <>
      <Button
        variant="outlined"
        size={size}
        startIcon={isExporting ? <CircularProgress size={16} /> : <Download />}
        onClick={(e) => setAnchorEl(e.currentTarget)}
        disabled={disabled || isExporting}
        sx={{ minWidth: 110 }}
      >
        {isExporting ? 'Exportando...' : 'Exportar'}
      </Button>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
      >
        {formats.map((fmt) => {
          const cfg = FORMAT_CONFIG[fmt];
          const Icon = cfg.icon;
          return (
            <MenuItem key={fmt} onClick={() => handleExport(fmt)}>
              <ListItemIcon><Icon fontSize="small" sx={{ color: cfg.color }} /></ListItemIcon>
              <ListItemText primary={cfg.label} secondary={cfg.desc} />
            </MenuItem>
          );
        })}
      </Menu>

      <Snackbar
        open={successOpen}
        autoHideDuration={3000}
        onClose={() => setSuccessOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert severity="success" variant="filled" onClose={() => setSuccessOpen(false)}>
          Exportacao concluida
        </Alert>
      </Snackbar>

      {error && (
        <Snackbar
          open={!!error}
          autoHideDuration={5000}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          <Alert severity="error" variant="filled">{error}</Alert>
        </Snackbar>
      )}
    </>
  );
}
