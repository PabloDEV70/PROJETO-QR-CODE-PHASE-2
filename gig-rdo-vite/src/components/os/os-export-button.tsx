import { useState } from 'react';
import { IconButton, Tooltip, CircularProgress } from '@mui/material';
import { PictureAsPdf } from '@mui/icons-material';
import type { FuncionarioPerfilEnriquecido } from '@/types/funcionario-types';
import type { OsColabServico } from '@/types/os-list-types';

interface OsExportButtonProps {
  funcionario: FuncionarioPerfilEnriquecido | undefined;
  servicos: OsColabServico[];
  periodo: { dataInicio?: string; dataFim?: string };
}

export function OsExportButton({ funcionario, servicos, periodo }: OsExportButtonProps) {
  const [loading, setLoading] = useState(false);
  const disabled = !funcionario || servicos.length === 0;

  const handleExport = async () => {
    if (!funcionario || servicos.length === 0) return;
    setLoading(true);
    try {
      const { exportOsExecutorPdf } = await import('@/utils/pdf-os-executor-report');
      await exportOsExecutorPdf({ funcionario, servicos, periodo });
    } catch (err) {
      console.error('[OsExportButton] PDF export failed:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Tooltip title={disabled ? 'Selecione um colaborador com servicos' : 'Exportar PDF'}>
      <span>
        <IconButton
          size="small"
          onClick={handleExport}
          disabled={disabled || loading}
          sx={{ color: 'error.main' }}
        >
          {loading ? <CircularProgress size={18} /> : <PictureAsPdf fontSize="small" />}
        </IconButton>
      </span>
    </Tooltip>
  );
}
