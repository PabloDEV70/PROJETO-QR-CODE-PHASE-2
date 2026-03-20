import type { Motivo } from '@/types/motivos-types';

const BASE_URL = import.meta.env.VITE_PUBLIC_URL || 'https://publico.gigantao.net';

function labelHtml(item: Motivo): string {
  const url = `${BASE_URL}/p/motivo/${item.RDOMOTIVOCOD}`;
  return `<div class="label-wrapper">
    <div class="label">
      <div class="left">
        <p>Escaneie o QR Code e<br>verifique detalhes:</p>
        <div class="qr">
          <img src="https://api.qrserver.com/v1/create-qr-code/?size=80x80&data=${encodeURIComponent(url)}&color=1B5E20" width="80" height="80" />
        </div>
      </div>
      <div class="right">
        <div class="motivo-codigo">${item.RDOMOTIVOCOD}</div>
        <div class="right-content">
          <div class="brand">GIGANTAO</div>
          <div class="sub">MOTIVO</div>
          <div class="sigla-box">
            <span class="sigla">${item.SIGLA || 'N/A'}</span>
          </div>
        </div>
      </div>
    </div>
    <div class="tag-info">${item.DESCRICAO.substring(0, 50)}${item.DESCRICAO.length > 50 ? '...' : ''} (cod:${item.RDOMOTIVOCOD})</div>
  </div>`;
}

export interface MotivoBatchPrintOptions {
  columns?: number;
}

export function printMotivosBatch(
  motivos: Motivo[],
  options?: MotivoBatchPrintOptions,
) {
  const cols = options?.columns ?? 2;
  const pw = window.open('', '_blank', 'width=800,height=600');
  if (!pw) return;

  const labels = motivos.map(labelHtml).join('\n');

  const colWidths: Record<number, { label: string; gap: string; pad: string }> = {
    1: { label: '105mm', gap: '0', pad: '10mm' },
    2: { label: '105mm', gap: '8mm', pad: '10mm' },
    3: { label: '90mm', gap: '5mm', pad: '5mm' },
    4: { label: '70mm', gap: '4mm', pad: '3mm' },
  };
  const defaultCfg = { label: '105mm', gap: '8mm', pad: '10mm' };
  const cfg = colWidths[cols] ?? defaultCfg;

  const scaleStyles = cols >= 3 ? `
    .label { width: ${cfg.label}; height: ${cols === 4 ? '30mm' : '34mm'}; }
    .left p { font-size: ${cols === 4 ? '5pt' : '5.5pt'}; }
    .left .qr img { width: ${cols === 4 ? '55px' : '65px'}; height: ${cols === 4 ? '55px' : '65px'}; }
    .brand { font-size: ${cols === 4 ? '7pt' : '8pt'}; }
    .sub { font-size: ${cols === 4 ? '3.5pt' : '4pt'}; }
    .sigla-box { width: ${cols === 4 ? '11mm' : '13mm'}; height: ${cols === 4 ? '11mm' : '13mm'}; }
    .sigla { font-size: ${cols === 4 ? '11pt' : '13pt'}; }
    .motivo-codigo { font-size: ${cols === 4 ? '6pt' : '7pt'}; }
    .tag-info { font-size: ${cols === 4 ? '5.5pt' : '6pt'}; }
  ` : '';

  pw.document.write(`<html>
<head>
  <title>Etiquetas Motivos (${motivos.length})</title>
  <style>
    * {
      margin: 0; padding: 0; box-sizing: border-box;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
      color-adjust: exact !important;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      padding: ${cfg.pad}; background: #fff;
    }
    .grid {
      display: grid;
      grid-template-columns: repeat(${cols}, 1fr);
      gap: ${cfg.gap};
      justify-items: center;
    }
    .label-wrapper {
      page-break-inside: avoid;
      text-align: center;
    }
    .label {
      width: ${cfg.label}; height: 38mm;
      display: flex; align-items: stretch;
      overflow: hidden;
      border: 0.5px solid #ccc;
    }
    .left {
      flex: 1; padding: 3mm 4mm;
      display: flex; flex-direction: column;
      justify-content: center; align-items: center;
      background: #1B5E20 !important; color: #fff !important;
    }
    .left p {
      font-size: 6.5pt; color: #fff !important;
      margin-bottom: 2mm; text-align: center; line-height: 1.2;
    }
    .left .qr {
      background: #fff !important; padding: 2mm; border-radius: 1mm;
    }
    .left .qr img { display: block; }
    .right {
      flex: 1; padding: 2mm 4mm 2mm 2mm;
      display: flex; flex-direction: column; align-items: center;
      background: #fff !important; color: #1B5E20 !important;
    }
    .motivo-codigo {
      font-size: 8pt; font-weight: 800;
      color: #666 !important; margin-bottom: 1mm;
    }
    .right-content {
      flex: 1; display: flex; flex-direction: column;
      align-items: center; justify-content: center;
    }
    .brand {
      font-size: 10pt; font-weight: 900;
      letter-spacing: 1px; color: #1B5E20 !important;
    }
    .sub {
      font-size: 4.5pt; letter-spacing: 0.4px;
      margin-top: 0.5mm; color: #333 !important;
    }
    .sigla-box {
      width: 15mm; height: 15mm;
      background: #4CAF50 !important; border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      margin-top: 1.5mm;
    }
    .sigla {
      font-size: 16pt; font-weight: 900; color: #fff !important;
    }
    .tag-info {
      font-size: 7pt; color: #999; margin-top: 1mm;
    }
    ${scaleStyles}
    @media print {
      body { padding: ${cols >= 3 ? '3mm' : '5mm'}; }
      @page { margin: ${cols >= 3 ? '3mm' : '5mm'}; }
      .label { border: none; }
    }
  </style>
</head>
<body>
  <div class="grid">
    ${labels}
  </div>
  <script>
    var imgs = document.querySelectorAll('img');
    var loaded = 0;
    function checkPrint() {
      loaded++;
      if (loaded >= imgs.length) {
        setTimeout(function() { window.print(); window.close(); }, 300);
      }
    }
    if (imgs.length === 0) {
      setTimeout(function() { window.print(); window.close(); }, 300);
    } else {
      imgs.forEach(function(img) {
        if (img.complete) checkPrint();
        else { img.onload = checkPrint; img.onerror = checkPrint; }
      });
    }
  </script>
</body>
</html>`);
  pw.document.close();
}
