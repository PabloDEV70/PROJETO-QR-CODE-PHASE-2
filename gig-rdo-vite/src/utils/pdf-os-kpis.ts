import type { jsPDF } from 'jspdf';
import { PDF_COLORS } from './pdf-layout';
import { FONT } from './pdf-fonts';
import { fmtMinutos } from './pdf-os-sections';
import type { OsColabServico } from '@/types/os-list-types';

const M = 14;
const LIMITE_MIN = 720;

const KPI_ACCENTS: [number, number, number][] = [
  [25, 118, 210], [46, 125, 50], [230, 81, 0], [123, 31, 162], [2, 119, 189],
];

export function drawKpis(
  doc: jsPDF, y: number, servicos: OsColabServico[],
): number {
  const pw = doc.internal.pageSize.getWidth();
  const normais = servicos.filter((s) => (s.tempoGastoMin ?? 0) <= LIMITE_MIN);
  const totalMin = normais.reduce((a, s) => a + (s.tempoGastoMin ?? 0), 0);
  const mediaMin = normais.length > 0 ? Math.round(totalMin / normais.length) : 0;
  const osSet = new Set(servicos.map((s) => s.NUOS)).size;
  const veicSet = new Set(
    servicos.filter((s) => s.placa).map((s) => s.placa!.trim()),
  ).size;

  const kpis = [
    { label: 'Servicos', value: String(servicos.length) },
    { label: 'Tempo Total', value: fmtMinutos(totalMin) },
    { label: 'Media/Serv', value: `${mediaMin} min` },
    { label: 'OS Atendidas', value: String(osSet) },
    { label: 'Veiculos', value: String(veicSet) },
  ];

  const gap = 4;
  const boxW = (pw - M * 2 - gap * 4) / 5;
  const boxH = 14;

  kpis.forEach((kpi, i) => {
    const x = M + i * (boxW + gap);
    const c: [number, number, number] = KPI_ACCENTS[i] ?? [25, 118, 210];

    doc.setFillColor(250, 251, 254);
    doc.setDrawColor(220, 225, 235);
    doc.setLineWidth(0.2);
    doc.roundedRect(x, y, boxW, boxH, 1.5, 1.5, 'FD');

    doc.setFillColor(c[0], c[1], c[2]);
    doc.rect(x + 2, y, boxW - 4, 1.2, 'F');

    doc.setFontSize(12);
    doc.setFont(FONT, 'bold');
    doc.setTextColor(c[0], c[1], c[2]);
    doc.text(kpi.value, x + boxW / 2, y + 7.5, { align: 'center' });

    doc.setFontSize(6);
    doc.setFont(FONT, 'normal');
    doc.setTextColor(...PDF_COLORS.muted);
    doc.text(kpi.label, x + boxW / 2, y + 11.5, { align: 'center' });
  });

  return y + boxH + 5;
}
