import { useRef } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, Stack, Typography, Box, IconButton,
} from '@mui/material';
import { Print, Close } from '@mui/icons-material';
import { QRCodeSVG } from 'qrcode.react';
import { FuncionarioAvatar } from '@/components/shared/funcionario-avatar';
import { SituacaoBadge } from '@/components/funcionarios/situacao-badge';

interface FuncionarioQrPrintProps {
  open: boolean;
  onClose: () => void;
  codemp: number;
  codfunc: number;
  codparc?: number | null;
  nome: string;
  cargo?: string | null;
  funcao?: string | null;
  departamento?: string | null;
  empresa?: string | null;
  situacao?: string;
  situacaoLabel?: string;
}

export function FuncionarioQrPrint({
  open,
  onClose,
  codemp,
  codfunc,
  codparc,
  nome,
  cargo,
  funcao,
  departamento,
  empresa,
  situacao,
  situacaoLabel,
}: FuncionarioQrPrintProps) {
  const printRef = useRef<HTMLDivElement>(null);
  const url = `${window.location.origin}/p/func/${codemp}/${codfunc}`;

  const handlePrint = () => {
    const content = printRef.current;
    if (!content) return;

    const printWindow = window.open('', '_blank', 'width=400,height=600');
    if (!printWindow) return;

    printWindow.document.write(`
      <html>
        <head>
          <title>Cracha - ${nome}</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
              display: flex; justify-content: center; align-items: center;
              min-height: 100vh; background: #fff;
            }
            .card {
              width: 86mm; padding: 8mm;
              border: 1px solid #e2e8f0; border-radius: 4mm;
              text-align: center;
            }
            .nome { font-size: 14pt; font-weight: 700; color: #1e293b; margin: 4mm 0 1mm; }
            .cargo { font-size: 10pt; color: #475569; }
            .depto { font-size: 9pt; color: #64748b; margin-top: 1mm; }
            .empresa { font-size: 9pt; color: #64748b; font-weight: 600; margin-top: 2mm; }
            .matricula { font-size: 8pt; color: #94a3b8; margin-top: 3mm; }
            .qr { margin-top: 3mm; }
            @media print {
              body { min-height: auto; }
              .card { border: none; }
            }
          </style>
        </head>
        <body>
          <div class="card">
            <div class="nome">${nome}</div>
            <div class="cargo">${[cargo, funcao].filter(Boolean).join(' · ') || '-'}</div>
            ${departamento ? `<div class="depto">${departamento}</div>` : ''}
            ${empresa ? `<div class="empresa">${empresa}</div>` : ''}
            <div class="matricula">Matricula: ${codemp}-${codfunc}</div>
            <div class="qr">${document.getElementById('qr-print-svg')?.innerHTML || ''}</div>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography sx={{ fontWeight: 700, fontSize: 16 }}>Cracha do Funcionario</Typography>
        <IconButton size="small" onClick={onClose}><Close /></IconButton>
      </DialogTitle>
      <DialogContent>
        <Box
          ref={printRef}
          sx={{
            textAlign: 'center', py: 2, px: 1,
            border: '1px dashed rgba(148,163,184,0.3)',
            borderRadius: '12px', bgcolor: '#fafbfc',
          }}
        >
          <FuncionarioAvatar
            codparc={codparc} codemp={codemp} codfunc={codfunc}
            nome={nome} size="large"
          />
          <Typography sx={{ fontSize: 18, fontWeight: 700, color: '#1e293b', mt: 1.5 }}>
            {nome}
          </Typography>
          <Typography sx={{ fontSize: 13, color: '#475569' }}>
            {[cargo, funcao].filter(Boolean).join(' · ') || '-'}
          </Typography>
          {departamento && (
            <Typography sx={{ fontSize: 12, color: '#64748b' }}>{departamento}</Typography>
          )}
          {empresa && (
            <Typography sx={{ fontSize: 12, color: '#64748b', fontWeight: 600, mt: 0.5 }}>
              {empresa}
            </Typography>
          )}
          <Stack direction="row" justifyContent="center" spacing={1} sx={{ mt: 1 }}>
            {situacao && situacaoLabel && (
              <SituacaoBadge situacao={situacao} label={situacaoLabel} size="md" />
            )}
            <Typography sx={{ fontSize: 11, color: '#94a3b8' }}>
              Matricula: {codemp}-{codfunc}
            </Typography>
          </Stack>
          <Box id="qr-print-svg" sx={{ mt: 2, display: 'inline-flex' }}>
            <QRCodeSVG value={url} size={120} level="H" bgColor="#ffffff" fgColor="#1e293b" />
          </Box>
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} color="inherit">Fechar</Button>
        <Button
          variant="contained"
          startIcon={<Print />}
          onClick={handlePrint}
          sx={{ textTransform: 'none' }}
        >
          Imprimir Cracha
        </Button>
      </DialogActions>
    </Dialog>
  );
}
