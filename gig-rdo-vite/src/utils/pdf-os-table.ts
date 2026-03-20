import type { jsPDF } from 'jspdf';
import { PDF_COLORS } from './pdf-layout';
import { FONT } from './pdf-fonts';
import { fmtDate, fmtMinutos } from './pdf-os-sections';
import type { OsColabServico } from '@/types/os-list-types';

const M = 14;
const LIMITE_MIN = 720;

function fmtTime(iso: string | null | undefined): string {
  if (!iso) return '-';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '-';
  return d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

export function drawTable(
  doc: jsPDF, y: number, servicos: OsColabServico[],
  autoTable: (doc: jsPDF, opts: Record<string, unknown>) => void,
): number {
  const head = [[
    'OS/Seq', 'Abertura', 'Servico', 'Veiculo',
    'Tipo', 'Manutencao', 'Local', 'Inicio', 'Fim', 'Tempo', 'Status',
  ]];

  const body = servicos.map((s) => {
    const anom = (s.tempoGastoMin ?? 0) > LIMITE_MIN;
    return [
      `${s.NUOS}/${s.sequencia}`, fmtDate(s.DTABERTURA),
      (s.nomeServico ?? '-').substring(0, 40), s.placa ?? '-',
      s.tipoLabel ?? s.TIPO ?? '-',
      s.manutencaoLabel ?? s.MANUTENCAO ?? '-',
      s.localManutencaoLabel ?? '-',
      fmtTime(s.dtInicio), fmtTime(s.dtFim),
      anom ? `${fmtMinutos(s.tempoGastoMin)}*` : fmtMinutos(s.tempoGastoMin),
      s.statusLabel ?? s.STATUS,
    ];
  });

  autoTable(doc, {
    head, body, startY: y, theme: 'striped',
    headStyles: {
      fillColor: [46, 125, 50], textColor: [255, 255, 255],
      fontSize: 6.5, fontStyle: 'bold', halign: 'center', font: FONT,
    },
    bodyStyles: { fontSize: 6.5, textColor: PDF_COLORS.text, font: FONT },
    alternateRowStyles: { fillColor: [245, 248, 245] },
    styles: {
      cellPadding: 1.5, overflow: 'linebreak', lineWidth: 0.1, font: FONT,
    },
    columnStyles: {
      0: { halign: 'center', cellWidth: 18 },
      1: { halign: 'center', cellWidth: 18 },
      2: { cellWidth: 'auto' },
      3: { halign: 'center', cellWidth: 22 },
      4: { halign: 'center', cellWidth: 16 },
      5: { halign: 'center', cellWidth: 24 },
      6: { halign: 'center', cellWidth: 16 },
      7: { halign: 'center', cellWidth: 14 },
      8: { halign: 'center', cellWidth: 14 },
      9: { halign: 'right', cellWidth: 18 },
      10: { halign: 'center', cellWidth: 18 },
    },
    margin: { top: 15, bottom: 18, left: M, right: M },
    didParseCell: (data: {
      section: string; column: { index: number };
      cell: { text: string[]; styles: { textColor: number[] } };
    }) => {
      if (data.section === 'body' && data.column.index === 9) {
        if (data.cell.text[0]?.endsWith('*')) {
          data.cell.styles.textColor = [237, 108, 2];
        }
      }
    },
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (doc as any).lastAutoTable?.finalY ?? y + 20;
}
