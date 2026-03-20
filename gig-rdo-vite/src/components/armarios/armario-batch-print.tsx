import type { ArmarioListItem } from '@/types/armario-types';

const BASE_URL = import.meta.env.VITE_PUBLIC_URL || 'https://publico.gigantao.net';

function labelHtml(item: ArmarioListItem): string {
  const url = `${BASE_URL}/p/armario/${item.codarmario}`;
  return `<div class="label-wrapper">
    <div class="label">
      <div class="left">
        <p>Escaneie o QR Code e<br>verifique o status do armario:</p>
        <div class="qr">
          <img src="https://api.qrserver.com/v1/create-qr-code/?size=80x80&data=${encodeURIComponent(url)}" width="80" height="80" />
        </div>
      </div>
      <div class="right">
        <div class="vlabel"><span>Arm\u00E1rio N\u00BA</span></div>
        <div class="right-content">
          <div class="brand">GIGANT\u00C3O</div>
          <div class="sub">ENGENHARIA DE MOVIMENTA\u00C7\u00C3O</div>
          <div class="circle">
            <span class="num">${item.nuarmario}</span>
          </div>
        </div>
      </div>
    </div>
    <div class="tag-info">${item.tagArmario} - ${item.localDescricao} (cod:${item.codarmario})</div>
  </div>`;
}

export interface BatchPrintOptions {
  columns?: number;
}

export function printArmariosBatch(
  armarios: ArmarioListItem[],
  options?: BatchPrintOptions,
) {
  const cols = options?.columns ?? 2;
  const pw = window.open('', '_blank', 'width=800,height=600');
  if (!pw) return;

  const labels = armarios.map(labelHtml).join('\n');

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
    .brand { font-size: ${cols === 4 ? '8pt' : '10pt'}; }
    .sub { font-size: ${cols === 4 ? '3pt' : '3.5pt'}; }
    .circle { width: ${cols === 4 ? '11mm' : '13mm'}; height: ${cols === 4 ? '11mm' : '13mm'}; }
    .num { font-size: ${cols === 4 ? '11pt' : '13pt'}; }
    .vlabel span { font-size: ${cols === 4 ? '5.5pt' : '6.5pt'}; }
    .tag-info { font-size: ${cols === 4 ? '5.5pt' : '6pt'}; }
  ` : '';

  pw.document.write(`<html>
<head>
  <title>Etiquetas Armarios (${armarios.length})</title>
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
      border: 1px dashed #bbb;
      padding: 1mm;
    }
    .label {
      width: ${cfg.label}; height: 38mm;
      display: flex; align-items: stretch;
      overflow: hidden;
    }
    .left {
      flex: 1; padding: 3mm 4mm;
      display: flex; flex-direction: column;
      justify-content: center; align-items: center;
      background: #1B5E20 !important; color: #fff !important;
    }
    .left p {
      font-size: 6.5pt; color: #fff !important;
      margin-bottom: 2mm; text-align: center; line-height: 1.3;
    }
    .left .qr {
      background: #fff !important; padding: 2mm; border-radius: 1mm;
    }
    .left .qr img { display: block; }
    .right {
      flex: 1; padding: 2mm 3mm 2mm 1mm;
      display: flex; flex-direction: row; align-items: center;
      background: #fff !important; color: #1B5E20 !important;
    }
    .vlabel {
      width: 5mm; display: flex; align-items: center;
      justify-content: center; flex-shrink: 0;
    }
    .vlabel span {
      transform: rotate(-90deg);
      font-size: 7pt; font-weight: 700;
      color: #1B5E20 !important; letter-spacing: 0.3px;
      white-space: nowrap;
    }
    .right-content {
      flex: 1; display: flex; flex-direction: column;
      align-items: center; justify-content: center;
    }
    .brand {
      font-size: 12pt; font-weight: 900;
      letter-spacing: 0.5px; color: #1B5E20 !important;
    }
    .sub {
      font-size: 4pt; letter-spacing: 0.4px;
      margin-top: 0.3mm; color: #555 !important; font-weight: 600;
    }
    .circle {
      width: 15mm; height: 15mm;
      background: #4CAF50 !important; border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      margin-top: 1.5mm;
    }
    .num {
      font-size: 16pt; font-weight: 900; color: #fff !important;
    }
    .tag-info {
      font-size: 7pt; color: #999; margin-top: 1mm;
    }
    ${scaleStyles}
    @media print {
      body { padding: ${cols >= 3 ? '3mm' : '5mm'}; }
      @page { margin: ${cols >= 3 ? '3mm' : '5mm'}; }
      .label-wrapper { border: 1px dashed #ccc; }
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
