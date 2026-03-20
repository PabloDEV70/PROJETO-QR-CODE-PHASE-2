import { useRef, useState, useCallback } from 'react';
import {
  Drawer, Button, Typography, Box, IconButton, Stack, Chip, Tooltip, Divider,
} from '@mui/material';
import {
  Print, Close, OpenInNew, ContentCopy, Check, Language, Code,
  Image as ImageIcon, PictureAsPdf,
} from '@mui/icons-material';
import { QRCodeSVG } from 'qrcode.react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import type { ArmarioListItem } from '@/types/armario-types';

const PROD_URL = 'https://publico.gigantao.net';
const DEV_URL = import.meta.env.VITE_PUBLIC_URL || window.location.origin;
const IS_DEV = import.meta.env.DEV;

interface ArmarioLabelDrawerProps {
  open: boolean;
  onClose: () => void;
  armario: ArmarioListItem | null;
}

function buildLabelHtml(qrSvg: string, tag: string, num: number, fontData?: string): string {
  const fontFace = fontData
    ? `@font-face{font-family:'STOP';src:url(data:font/woff2;base64,${fontData}) format('woff2');font-weight:400;font-style:normal}`
    : '';
  return `<html><head><title>Etiqueta ${tag}</title>
<style>
*{margin:0;padding:0;box-sizing:border-box;-webkit-print-color-adjust:exact!important;print-color-adjust:exact!important;color-adjust:exact!important}
${fontFace}
body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;display:flex;justify-content:center;align-items:center;min-height:100vh;background:#fff}
.label{width:105mm;height:38mm;display:flex;align-items:stretch;overflow:hidden;border:.5px solid #ccc}
.left{flex:1;padding:3mm 4mm;display:flex;flex-direction:column;justify-content:center;align-items:center;background:#1B5E20!important;color:#fff!important}
.left p{font-size:6.5pt;color:#fff!important;margin-bottom:2mm;text-align:center;line-height:1.3}
.left .qr{background:#fff!important;padding:2mm;border-radius:1mm}.left .qr svg{display:block}
.right{flex:1;padding:2mm 3mm 2mm 1mm;display:flex;flex-direction:row;align-items:center;background:#fff!important;color:#1B5E20!important}
.vlabel{width:5mm;display:flex;align-items:center;justify-content:center;flex-shrink:0}.vlabel span{transform:rotate(-90deg);font-size:7pt;font-weight:700;color:#1B5E20!important;letter-spacing:.3px;white-space:nowrap}
.rc{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center}
.brand{font-family:'STOP','Arial Black',Impact,sans-serif;font-size:14pt;font-weight:400;letter-spacing:.5px;color:#1B5E20!important}
.sub{font-size:4pt;letter-spacing:.4px;margin-top:.3mm;color:#555!important;font-weight:600}
.circle{width:16mm;height:16mm;background:#4CAF50!important;border-radius:50%;display:flex;align-items:center;justify-content:center;margin-top:1.5mm}
.num{font-size:18pt;font-weight:900;color:#fff!important}
@media print{body{min-height:auto;margin:0;padding:3mm}@page{margin:0;size:110mm 42mm}.label{border:none}}
</style></head><body>
<div class="label"><div class="left"><p>Escaneie o QR Code e<br>verifique o status do armario:</p><div class="qr">${qrSvg}</div></div>
<div class="right"><div class="vlabel"><span>Arm\u00E1rio N\u00BA</span></div><div class="rc"><div class="brand">GIGANT\u00C3O</div><div class="sub">ENGENHARIA DE MOVIMENTA\u00C7\u00C3O</div>
<div class="circle"><span class="num">${num}</span></div></div></div></div></body></html>`;
}

function copyToClipboard(text: string): void {
  if (navigator.clipboard?.writeText) {
    navigator.clipboard.writeText(text);
    return;
  }
  const ta = document.createElement('textarea');
  ta.value = text;
  ta.style.cssText = 'position:fixed;opacity:0';
  document.body.appendChild(ta);
  ta.select();
  document.execCommand('copy');
  document.body.removeChild(ta);
}

export function ArmarioLabelDrawer({ open, onClose, armario }: ArmarioLabelDrawerProps) {
  const labelRef = useRef<HTMLDivElement>(null);
  const [useProd, setUseProd] = useState(true);
  const [copied, setCopied] = useState(false);
  const [exporting, setExporting] = useState(false);

  const tag = armario?.tagArmario ?? '';

  const handleExportPng = useCallback(async () => {
    if (!labelRef.current || exporting) return;
    setExporting(true);
    try {
      const canvas = await html2canvas(labelRef.current, {
        scale: 3, backgroundColor: '#ffffff', useCORS: true,
      });
      const link = document.createElement('a');
      link.download = `etiqueta-${tag}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } finally { setExporting(false); }
  }, [tag, exporting]);

  const handleExportPdf = useCallback(async () => {
    if (!labelRef.current || exporting) return;
    setExporting(true);
    try {
      const canvas = await html2canvas(labelRef.current, {
        scale: 3, backgroundColor: '#ffffff', useCORS: true,
      });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: [42, 110] });
      pdf.addImage(imgData, 'PNG', 2.5, 2, 105, 38);
      pdf.save(`etiqueta-${tag}.pdf`);
    } finally { setExporting(false); }
  }, [tag, exporting]);

  if (!armario) return null;

  const { codarmario, nuarmario, tagArmario, localDescricao, departamento, nucadeado } = armario;
  const baseUrl = useProd ? PROD_URL : DEV_URL;
  const url = `${baseUrl}/p/armario/${codarmario}`;

  const handleCopy = () => {
    copyToClipboard(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    const qrSvg = document.getElementById('armario-label-qr')?.innerHTML || '';
    const pw = window.open('', '_blank', 'width=600,height=300');
    if (!pw) return;
    pw.document.write(buildLabelHtml(qrSvg, tagArmario, nuarmario));
    pw.document.close();
    pw.focus();
    setTimeout(() => { pw.print(); pw.close(); }, 250);
  };

  return (
    <Drawer anchor="right" open={open} onClose={onClose} PaperProps={{ sx: { width: 420 } }}>
      {/* Header */}
      <Box sx={{
        background: 'linear-gradient(135deg, #1B5E20 0%, #2E7D32 100%)',
        px: 2.5, pt: 2, pb: 2.5, position: 'relative', overflow: 'hidden',
      }}>
        <Typography sx={{
          position: 'absolute', top: -8, right: 12,
          fontSize: 80, fontWeight: 900, lineHeight: 1,
          color: 'rgba(255,255,255,0.08)', userSelect: 'none',
        }}>
          {nuarmario}
        </Typography>

        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1.5 }}>
          <Typography sx={{
            fontFamily: "'STOP', 'Arial Black', sans-serif",
            fontSize: 16, color: 'rgba(255,255,255,0.7)', letterSpacing: '0.06em',
          }}>
            GIGANTÃO
          </Typography>
          <IconButton size="small" onClick={onClose} sx={{ color: 'rgba(255,255,255,0.7)' }}>
            <Close fontSize="small" />
          </IconButton>
        </Stack>

        <Typography sx={{
          fontSize: 26, fontWeight: 800, color: '#fff', letterSpacing: 1.5, lineHeight: 1.1,
        }}>
          {tagArmario}
        </Typography>

        <Stack direction="row" spacing={0.75} sx={{ mt: 1 }} flexWrap="wrap">
          <Chip label={localDescricao} size="small" sx={{
            bgcolor: 'rgba(255,255,255,0.15)', color: '#fff',
            fontSize: 11, fontWeight: 600, height: 22, backdropFilter: 'blur(4px)',
          }} />
          {nucadeado && <Chip label={`Cadeado ${nucadeado}`} size="small" sx={{
            bgcolor: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.8)', fontSize: 11, height: 22,
          }} />}
          {departamento && <Chip label={departamento} size="small" sx={{
            bgcolor: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.8)', fontSize: 11, height: 22,
          }} />}
        </Stack>
      </Box>

      <Box sx={{ p: 2.5, flex: 1, overflow: 'auto' }}>
        {/* URL target selector */}
        {IS_DEV && (
          <Box sx={{ mb: 2 }}>
            <Typography sx={{ fontSize: 10, fontWeight: 700, color: '#475569', mb: 0.75, letterSpacing: 0.5 }}>
              DESTINO DO QR CODE
            </Typography>
            <Stack direction="row" spacing={0.75}>
              <Chip icon={<Language sx={{ fontSize: 15 }} />} label="Producao" size="small"
                variant={useProd ? 'filled' : 'outlined'} onClick={() => setUseProd(true)}
                sx={{
                  fontWeight: 600, fontSize: 12, height: 30, px: 0.5,
                  ...(useProd
                    ? { bgcolor: '#1B5E20', color: '#fff', '& .MuiChip-icon': { color: '#fff' } }
                    : { borderColor: '#cbd5e1', color: '#64748b' }),
                }} />
              <Chip icon={<Code sx={{ fontSize: 15 }} />} label="Dev Local" size="small"
                variant={!useProd ? 'filled' : 'outlined'} onClick={() => setUseProd(false)}
                sx={{
                  fontWeight: 600, fontSize: 12, height: 30, px: 0.5,
                  ...(!useProd
                    ? { bgcolor: '#d97706', color: '#fff', '& .MuiChip-icon': { color: '#fff' } }
                    : { borderColor: '#cbd5e1', color: '#64748b' }),
                }} />
            </Stack>
          </Box>
        )}

        {/* Link display */}
        <Box sx={{
          mb: 2.5, p: 1.5, bgcolor: '#f8fafc', borderRadius: '10px',
          border: '1px solid', borderColor: !useProd && IS_DEV ? '#fbbf24' : '#e2e8f0',
        }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 0.5 }}>
            <Typography sx={{ fontSize: 10, fontWeight: 700, color: '#94a3b8', letterSpacing: 0.5 }}>
              {useProd ? 'LINK OFICIAL' : 'LINK DEV'}
            </Typography>
            <Stack direction="row" spacing={0.25}>
              <Tooltip title={copied ? 'Copiado!' : 'Copiar'} arrow>
                <IconButton size="small" onClick={handleCopy} sx={{ p: 0.4 }}>
                  {copied
                    ? <Check sx={{ fontSize: 15, color: '#16a34a' }} />
                    : <ContentCopy sx={{ fontSize: 15, color: '#94a3b8' }} />}
                </IconButton>
              </Tooltip>
              <Tooltip title="Abrir" arrow>
                <IconButton size="small" component="a" href={url} target="_blank" sx={{ p: 0.4 }}>
                  <OpenInNew sx={{ fontSize: 15, color: '#94a3b8' }} />
                </IconButton>
              </Tooltip>
            </Stack>
          </Stack>
          <Typography sx={{
            fontSize: 12.5, fontFamily: 'monospace', color: '#334155',
            wordBreak: 'break-all', lineHeight: 1.5,
          }}>
            {url}
          </Typography>
          {!useProd && IS_DEV && (
            <Typography sx={{ fontSize: 10, color: '#d97706', mt: 0.75, fontWeight: 500 }}>
              QR aponta para ambiente local — apenas para teste
            </Typography>
          )}
        </Box>

        {/* Label preview */}
        <Typography sx={{ fontSize: 10, fontWeight: 700, color: '#94a3b8', letterSpacing: 0.5, mb: 1 }}>
          PREVIEW DA ETIQUETA
        </Typography>
        <Box
          ref={labelRef}
          sx={{
            display: 'flex', alignItems: 'stretch', borderRadius: '4px',
            overflow: 'hidden', height: 144, border: '1px solid #e2e8f0',
            boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
          }}
        >
          {/* Left — QR side */}
          <Stack
            alignItems="center" justifyContent="center" spacing={0.75}
            sx={{ flex: 1, p: 1.5, bgcolor: '#1B5E20', color: '#fff' }}
          >
            <Typography sx={{ fontSize: 10, textAlign: 'center', lineHeight: 1.3, opacity: 0.9 }}>
              Escaneie o QR Code e<br />verifique o status do armario:
            </Typography>
            <Box
              id="armario-label-qr"
              sx={{ bgcolor: '#fff', p: 0.75, borderRadius: '4px', display: 'inline-flex' }}
            >
              <QRCodeSVG value={url} size={80} level="H" bgColor="#ffffff" fgColor="#000000" />
            </Box>
          </Stack>

          {/* Right — Brand side */}
          <Stack direction="row" alignItems="center" sx={{ flex: 1, bgcolor: '#fff', px: 0.5 }}>
            <Box sx={{
              width: 18, minHeight: 100, display: 'flex',
              alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              <Typography sx={{
                transform: 'rotate(-90deg)', fontSize: 10, fontWeight: 700,
                color: '#1B5E20', whiteSpace: 'nowrap',
              }}>
                Armário Nº
              </Typography>
            </Box>
            <Stack alignItems="center" justifyContent="center" sx={{ flex: 1 }}>
              <Typography sx={{
                fontFamily: "'STOP', 'Arial Black', sans-serif",
                fontSize: 18, letterSpacing: '0.04em', lineHeight: 1, color: '#1B5E20',
              }}>
                GIGANTÃO
              </Typography>
              <Typography sx={{
                fontSize: 6, letterSpacing: 0.3, color: '#555', fontWeight: 600, mt: 0.25,
              }}>
                ENGENHARIA DE MOVIMENTAÇÃO
              </Typography>
              <Box sx={{
                width: 52, height: 52, bgcolor: '#4CAF50', borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center', mt: 0.75,
              }}>
                <Typography sx={{ fontSize: 22, fontWeight: 900, color: '#fff' }}>
                  {nuarmario}
                </Typography>
              </Box>
            </Stack>
          </Stack>
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Info */}
        <Stack spacing={0.75}>
          <InfoChip label="TAG" value={tagArmario} />
          <InfoChip label="Local" value={localDescricao} />
          <InfoChip label="Numero" value={String(nuarmario)} />
          {nucadeado && <InfoChip label="Cadeado" value={nucadeado} />}
          {departamento && <InfoChip label="Depto" value={departamento} />}
        </Stack>
      </Box>

      {/* Footer actions */}
      <Box sx={{ px: 2.5, py: 2, borderTop: '1px solid #e2e8f0' }}>
        <Button
          variant="contained" startIcon={<Print />} onClick={handlePrint} fullWidth
          sx={{
            textTransform: 'none', fontWeight: 700, fontSize: 14, mb: 1,
            bgcolor: '#1B5E20', py: 1.25, '&:hover': { bgcolor: '#2E7D32' },
          }}
        >
          Imprimir{!useProd && IS_DEV ? ' (Dev)' : ''}
        </Button>
        <Stack direction="row" spacing={1}>
          <Button
            variant="outlined" startIcon={<ImageIcon />} onClick={handleExportPng}
            disabled={exporting} fullWidth size="small"
            sx={{
              textTransform: 'none', fontWeight: 600, fontSize: 12,
              borderColor: '#cbd5e1', color: '#475569',
              '&:hover': { borderColor: '#94a3b8', bgcolor: '#f8fafc' },
            }}
          >
            PNG
          </Button>
          <Button
            variant="outlined" startIcon={<PictureAsPdf />} onClick={handleExportPdf}
            disabled={exporting} fullWidth size="small"
            sx={{
              textTransform: 'none', fontWeight: 600, fontSize: 12,
              borderColor: '#cbd5e1', color: '#475569',
              '&:hover': { borderColor: '#94a3b8', bgcolor: '#f8fafc' },
            }}
          >
            PDF
          </Button>
        </Stack>
      </Box>
    </Drawer>
  );
}

function InfoChip({ label, value }: { label: string; value: string }) {
  return (
    <Stack direction="row" alignItems="center" spacing={1}>
      <Typography sx={{ fontSize: 11, color: '#94a3b8', minWidth: 55 }}>{label}</Typography>
      <Typography sx={{ fontSize: 13, fontWeight: 600, color: '#1e293b' }}>{value}</Typography>
    </Stack>
  );
}
