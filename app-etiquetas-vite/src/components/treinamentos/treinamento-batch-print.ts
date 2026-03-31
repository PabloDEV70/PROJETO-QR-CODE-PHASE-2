import type { ColaboradorListItem } from '@/types/treinamento-types';

const BASE_URL = import.meta.env.VITE_PUBLIC_URL || 'https://publico.gigantao.net';

function labelHtml(item: ColaboradorListItem): string {
  const url = `${BASE_URL}/p/treinamento/${item.CODFUNC}`;
  return `<div class="label-wrapper">
    <div class="label">
      <div class="left">
        <p>Escaneie o QR Code para<br>ver os treinamentos:</p>
        <div class="qr">
          <img src="https://api.qrserver.com/v1/create-qr-code/?size=80x80&data=${encodeURIComponent(url)}" width="80" height="80" />
        </div>
      </div>
      <div class="right">
        <div class="right-content">
          <div class="brand">GIGANTÃO</div>
          <div class="sub">ENGENHARIA DE MOVIMENTAÇÃO</div>
          <div class="nome">${item.NOMEFUNC}</div>
        </div>
      </div>
    </div>
    <div class="tag-info">${item.DESCRCARGO}</div>
  </div>`;
}

export interface BatchPrintOptions {
  columns?: number;
}

export function printTreinamentosBatch(
  colaboradores: ColaboradorListItem[],
  options?: BatchPrintOptions,
) {
  const cols = options?.columns ?? 2;
  const pw = window.open('', '_blank', 'width=800,height=600');
  if (!pw) return;

  const labels = colaboradores.map(labelHtml).join('');

  const colWidths: Record<number, { label: string; gap: string; pad: string }> = {
    1: { label: '105mm', gap: '0', pad: '10mm' },
    2: { label: '105mm', gap: '8mm', pad: '10mm' },
    3: { label: '90mm', gap: '5mm', pad: '5mm' },
    4: { label: '70mm', gap: '4mm', pad: '3mm' },
  };
  const defaultCfg = { label: '105mm', gap: '8mm', pad: '10mm' };
  const cfg = colWidths[cols] ?? defaultCfg;

  pw.document.write('<html><head><title>Etiquetas de Treinamento (' + colaboradores.length + ')</title><style>' +
    '* { margin: 0; padding: 0; box-sizing: border-box; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; color-adjust: exact !important; }' +
    'body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; padding: ' + cfg.pad + '; background: #fff; }' +
    '.grid { display: grid; grid-template-columns: repeat(' + cols + ', 1fr); gap: ' + cfg.gap + '; justify-items: center; }' +
    '.label-wrapper { page-break-inside: avoid; text-align: center; border: 1px dashed #bbb; padding: 1mm; }' +
    '.label { width: ' + cfg.label + '; height: 38mm; display: flex; align-items: stretch; overflow: hidden; }' +
    '.left { flex: 1; padding: 3mm 4mm; display: flex; flex-direction: column; justify-content: center; align-items: center; background: #1976d2 !important; color: #fff !important; }' +
    '.left p { font-size: 6.5pt; color: #fff !important; margin-bottom: 2mm; text-align: center; line-height: 1.3; }' +
    '.left .qr { background: #fff !important; padding: 2mm; border-radius: 1mm; }' +
    '.left .qr img { display: block; }' +
    '.right { flex: 1.2; padding: 2mm 3mm 2mm 1mm; display: flex; flex-direction: column; align-items: center; justify-content: center; background: #fff !important; color: #1976d2 !important; }' +
    '.right-content { text-align: center; }' +
    '.brand { font-size: 12pt; font-weight: 900; letter-spacing: 0.5px; color: #1976d2 !important; }' +
    '.sub { font-size: 4pt; letter-spacing: 0.4px; margin-top: 0.3mm; color: #555 !important; font-weight: 600; }' +
    '.nome { font-size: 10pt; font-weight: 700; color: #333 !important; margin-top: 3mm; }' +
    '.tag-info { font-size: 7pt; color: #999; margin-top: 1mm; }' +
    '@media print { body { padding: ' + (cols >= 3 ? '3mm' : '5mm') + '; } @page { margin: ' + (cols >= 3 ? '3mm' : '5mm') + '; } .label-wrapper { border: 1px dashed #ccc; } }' +
    '</style></head><body><div class="grid">' + labels + '</div>' +
    '<script>var imgs = document.querySelectorAll("img"); var loaded = 0; function checkPrint() { loaded++; if (loaded >= imgs.length) { setTimeout(function() { window.print(); window.close(); }, 300); } } if (imgs.length === 0) { setTimeout(function() { window.print(); window.close(); }, 300); } else { imgs.forEach(function(img) { if (img.complete) checkPrint(); else { img.onload = checkPrint; img.onerror = checkPrint; } }); }</script>' +
    '</body></html>');
  pw.document.close();
}
