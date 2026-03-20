import type { jsPDF } from 'jspdf';

export const PDF_COLORS = {
  primary: [25, 118, 210] as [number, number, number],
  headerText: [255, 255, 255] as [number, number, number],
  altRow: [245, 248, 255] as [number, number, number],
  text: [33, 33, 33] as [number, number, number],
  muted: [117, 117, 117] as [number, number, number],
};

export interface PdfHeaderConfig {
  title: string;
  subtitle?: string;
  infoPairs?: [string, string][];
}

export function drawPdfHeader(doc: jsPDF, config: PdfHeaderConfig): number {
  const pageW = doc.internal.pageSize.getWidth();
  let y = 15;

  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...PDF_COLORS.text);
  doc.text(config.title, 14, y);
  y += 7;

  if (config.subtitle) {
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...PDF_COLORS.muted);
    doc.text(config.subtitle, 14, y);
    y += 6;
  }

  if (config.infoPairs?.length) {
    doc.setFontSize(9);
    let x = 14;
    for (const [label, value] of config.infoPairs) {
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...PDF_COLORS.muted);
      doc.text(`${label}: `, x, y);
      const labelW = doc.getTextWidth(`${label}: `);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...PDF_COLORS.text);
      doc.text(value, x + labelW, y);
      x += labelW + doc.getTextWidth(value) + 10;
      if (x > pageW - 30) { x = 14; y += 5; }
    }
    y += 4;
  }

  doc.setDrawColor(...PDF_COLORS.primary);
  doc.setLineWidth(0.5);
  doc.line(14, y, pageW - 14, y);
  return y + 6;
}

export function addPdfFooter(doc: jsPDF): void {
  const pageCount = doc.getNumberOfPages();
  const pageH = doc.internal.pageSize.getHeight();
  const pageW = doc.internal.pageSize.getWidth();
  const ts = new Date().toLocaleString('pt-BR');

  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(...PDF_COLORS.muted);
    doc.setFont('helvetica', 'normal');
    doc.text(`Pagina ${i} de ${pageCount}`, 14, pageH - 8);
    doc.text('Sistema GIG', pageW / 2, pageH - 8, { align: 'center' });
    doc.text(ts, pageW - 14, pageH - 8, { align: 'right' });
  }
}

export function formatValuePtBr(val: unknown, numFmt?: string): string {
  if (val == null) return '';
  if (typeof val === 'boolean') return val ? 'Sim' : 'Nao';
  if (typeof val === 'number') {
    if (numFmt === '0"%"') return `${Math.round(val)}%`;
    if (numFmt?.includes('%')) return `${(val * 100).toFixed(1)}%`;
    if (numFmt?.includes('#,##0.00')) return val.toFixed(2).replace('.', ',');
    if (numFmt?.includes('#,##0')) return Math.round(val).toLocaleString('pt-BR');
    if (numFmt?.includes('hh:mm') || numFmt?.includes('[h]:mm')) return String(val);
    return String(val).replace('.', ',');
  }
  return String(val);
}
