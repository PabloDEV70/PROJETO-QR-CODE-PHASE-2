import { useRef, useState } from 'react';
import {
  Drawer, Button, Typography, Box, IconButton, Stack, Divider,
} from '@mui/material';
import {
  Print, Close, ContentCopy, Check, OpenInNew,
} from '@mui/icons-material';
import { QRCodeSVG } from 'qrcode.react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import type { ColaboradorListItem } from '@/types/treinamento-types';

const PROD_URL = 'https://publico.gigantao.net';
const DEV_URL = import.meta.env.VITE_PUBLIC_URL || window.location.origin;

interface TreinamentoDetailDrawerProps {
  open: boolean;
  onClose: () => void;
  colaborador: ColaboradorListItem | null;
}

export function TreinamentoDetailDrawer({ open, onClose, colaborador }: TreinamentoDetailDrawerProps) {
  const qrRef = useRef<HTMLDivElement>(null);
  const [useProd, setUseProd] = useState(true);
  const [copied, setCopied] = useState(false);
  const [exporting, setExporting] = useState(false);

  if (!colaborador) return null;

  const { CODFUNC, NOMEFUNC, DESCRCARGO, RAZAOSOCIAL } = colaborador;
  const baseUrl = useProd ? PROD_URL : DEV_URL;
  const qrUrl = `${baseUrl}/p/treinamento/${CODFUNC}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(qrUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleOpenLink = () => {
    window.open(qrUrl, '_blank');
  };

  const handlePrint = async () => {
    if (!qrRef.current) return;
    const qrSvg = qrRef.current.innerHTML;
    const pw = window.open('', '_blank');
    if (!pw) return;
    const html = `<html><head><title>Treinamentos</title>
<style>
*{margin:0;padding:0;box-sizing:border-box;-webkit-print-color-adjust:exact!important;print-color-adjust:exact!important}
body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;display:flex;justify-content:center;align-items:center;min-height:100vh;background:#fff}
.container{width:150mm;height:100mm;padding:10mm;display:flex;flex-direction:column;align-items:center;justify-content:center;border:2px solid #1976d2;border-radius:4mm;background:#fff}
.title{font-size:16pt;font-weight:700;color:#1976d2;margin-bottom:8mm;text-align:center}
.qr{background:#fff;padding:5mm;border:1px solid #ddd;border-radius:2mm;margin-bottom:8mm}
.info{text-align:center;width:100%}
.info span{display:block;font-size:10pt;color:#333;margin-bottom:2mm}
.status{font-size:9pt;color:#666;margin-top:4mm}
@media print{body{margin:0;padding:0}@page{margin:0;size:154mm 104mm}}
</style></head><body>
<div class="container">
<div class="title">TREINAMENTOS ATIVOS</div>
<div class="qr">${qrSvg}</div>
<div class="info">
<span style="font-weight:600;font-size:12pt">${NOMEFUNC}</span>
<span class="status">Escaneie o QR para visualizar todos os treinamentos</span>
</div>
</div></body></html>`;
    pw.document.write(html);
    pw.document.close();
    pw.focus();
    setTimeout(() => { pw.print(); pw.close(); }, 250);
  };

  const handleExportPng = async () => {
    if (!qrRef.current || exporting) return;
    setExporting(true);
    try {
      const canvas = await html2canvas(qrRef.current, {
        scale: 3, backgroundColor: '#ffffff', useCORS: true,
      });
      const link = document.createElement('a');
      link.download = `treinamento-${CODFUNC}-qrcode.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } finally { setExporting(false); }
  };

  const handleExportPdf = async () => {
    if (!qrRef.current || exporting) return;
    setExporting(true);
    try {
      const canvas = await html2canvas(qrRef.current, {
        scale: 3, backgroundColor: '#ffffff', useCORS: true,
      });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const imgWidth = 150;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      const y = (pdf.internal.pageSize.height - imgHeight) / 2;
      pdf.addImage(imgData, 'PNG', 30, y, imgWidth, imgHeight);
      pdf.save(`treinamento-${CODFUNC}-qrcode.pdf`);
    } finally { setExporting(false); }
  };

  return (
    <Drawer anchor="right" open={open} onClose={onClose} PaperProps={{ sx: { width: 500 } }}>
      {/* Header */}
      <Box sx={{
        background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
        px: 2.5, pt: 2, pb: 2.5, position: 'relative',
      }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1.5 }}>
          <Typography sx={{ fontSize: 16, color: 'rgba(255,255,255,0.9)', fontWeight: 600 }}>
            Detalhes do Colaborador
          </Typography>
          <IconButton size="small" onClick={onClose} sx={{ color: 'rgba(255,255,255,0.7)' }}>
            <Close fontSize="small" />
          </IconButton>
        </Stack>

        <Typography sx={{ fontSize: 18, color: '#fff', fontWeight: 700, mb: 0.5 }}>
          {NOMEFUNC}
        </Typography>
        <Typography sx={{ fontSize: 12, color: 'rgba(255,255,255,0.8)' }}>
          {DESCRCARGO} • {RAZAOSOCIAL}
        </Typography>
      </Box>

      {/* Content */}
      <Box sx={{ flex: 1, overflow: 'auto', p: 2.5 }}>
        {/* QR Code Section */}
        <Box sx={{ mb: 3 }}>
          <Typography sx={{ fontSize: 11, fontWeight: 700, color: '#666', mb: 1.5, textTransform: 'uppercase' }}>
            QR Code - Treinamentos
          </Typography>
          <Box
            ref={qrRef}
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              p: 2,
              bgcolor: '#fff',
              borderRadius: 1.5,
              border: '1px solid #ddd',
            }}
          >
            <QRCodeSVG
              value={qrUrl}
              size={220}
              level="H"
              includeMargin={true}
            />
            <Typography sx={{ fontSize: 9, color: '#999', mt: 1.5, textAlign: 'center' }}>
              Escaneie para visualizar todos os treinamentos
            </Typography>
          </Box>
        </Box>

        <Divider sx={{ my: 2.5 }} />

        {/* URL para copiar */}
        <Box sx={{ mb: 2.5 }}>
          <Typography sx={{ fontSize: 11, fontWeight: 700, color: '#666', mb: 0.8, textTransform: 'uppercase' }}>
            Link do QR Code
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
            <Box
              sx={{
                flex: 1,
                p: 1,
                bgcolor: '#f5f5f5',
                borderRadius: 1,
                fontSize: 10,
                color: '#666',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
              title={qrUrl}
            >
              {qrUrl}
            </Box>
            <IconButton
              size="small"
              onClick={handleCopy}
              title={copied ? 'Copiado!' : 'Copiar'}
              sx={{
                minWidth: 'auto',
                p: 0.5,
                color: copied ? '#2e7d32' : '#666',
              }}
            >
              {copied ? <Check sx={{ fontSize: 16 }} /> : <ContentCopy sx={{ fontSize: 16 }} />}
            </IconButton>
            <IconButton
              size="small"
              onClick={handleOpenLink}
              title="Abrir em nova aba"
              sx={{
                minWidth: 'auto',
                p: 0.5,
                color: '#1976d2',
              }}
            >
              <OpenInNew sx={{ fontSize: 16 }} />
            </IconButton>
          </Box>
        </Box>

        <Divider sx={{ my: 2.5 }} />

        {/* Modo de URL */}
        <Box sx={{ mb: 1 }}>
          <Typography sx={{ fontSize: 11, fontWeight: 700, color: '#666', mb: 1, textTransform: 'uppercase' }}>
            Ambiente
          </Typography>
          <Stack direction="row" spacing={1}>
            <Button
              size="small"
              variant={useProd ? 'contained' : 'outlined'}
              onClick={() => setUseProd(true)}
              sx={{ flex: 1 }}
            >
              Produção
            </Button>
            <Button
              size="small"
              variant={!useProd ? 'contained' : 'outlined'}
              onClick={() => setUseProd(false)}
              sx={{ flex: 1 }}
            >
              Dev
            </Button>
          </Stack>
        </Box>
      </Box>

      {/* Actions */}
      <Box sx={{ p: 2.5, borderTop: '1px solid #eee' }}>
        <Stack spacing={1}>
          <Button
            fullWidth
            variant="contained"
            startIcon={<Print />}
            onClick={handlePrint}
          >
            Imprimir
          </Button>
          <Button
            fullWidth
            variant="outlined"
            onClick={handleExportPng}
            disabled={exporting}
          >
            Exportar PNG
          </Button>
          <Button
            fullWidth
            variant="outlined"
            onClick={handleExportPdf}
            disabled={exporting}
          >
            Exportar PDF
          </Button>
        </Stack>
      </Box>
    </Drawer>
  );
}