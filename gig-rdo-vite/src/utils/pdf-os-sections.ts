import type { jsPDF } from 'jspdf';
import { PDF_COLORS } from './pdf-layout';
import { FONT } from './pdf-fonts';
import type { FuncionarioPerfilEnriquecido } from '@/types/funcionario-types';
const M = 14;
const LINE_SM = 3.8;
const LINE_MD = 4.5;

export function fmtDate(iso: string | null | undefined): string {
  if (!iso) return '-';
  const d = new Date(iso);
  return isNaN(d.getTime()) ? '-' : d.toLocaleDateString('pt-BR');
}

export function fmtMinutos(min: number): string {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return h > 0 ? `${h}h ${m}min` : `${m}min`;
}

export function drawHeader(
  doc: jsPDF, periodo: { dataInicio?: string; dataFim?: string },
): number {
  const pw = doc.internal.pageSize.getWidth();

  doc.setFillColor(46, 125, 50);
  doc.rect(0, 0, pw, 3, 'F');

  let y = 12;
  doc.setFontSize(13);
  doc.setFont(FONT, 'bold');
  doc.setTextColor(...PDF_COLORS.text);
  doc.text('RELATORIO DE SERVICOS POR EXECUTOR', M, y);

  doc.setFontSize(7.5);
  doc.setFont(FONT, 'normal');
  doc.setTextColor(...PDF_COLORS.muted);
  doc.text('Sistema GIG', pw - M, y, { align: 'right' });
  y += 5;

  const ini = fmtDate(periodo.dataInicio);
  const fim = fmtDate(periodo.dataFim);
  const txt = periodo.dataInicio || periodo.dataFim
    ? `Periodo: ${ini} a ${fim}` : 'Periodo: Todos os registros';
  doc.text(txt, M, y);
  y += 3;

  doc.setDrawColor(46, 125, 50);
  doc.setLineWidth(0.4);
  doc.line(M, y, pw - M, y);
  return y + 4;
}

export function drawColabCard(
  doc: jsPDF, y: number, func: FuncionarioPerfilEnriquecido,
  fotoBase64: string | null,
): number {
  const pw = doc.internal.pageSize.getWidth();
  const cardW = pw - M * 2;
  const cardX = M;
  const fotoSize = 22;
  const padTop = 5;
  const padBot = 4;

  const v = func.vinculoAtual;
  const carga = func.cargaHoraria;

  // ---- Calculate left column height (foto + data fields) ----
  const fields: [string, string][] = [
    ['CPF', func.cgcCpf ?? '-'],
    ['Cargo', v?.cargo ?? '-'],
    ['Depto', v?.departamento ?? '-'],
    ['Empresa', v?.empresa ?? '-'],
    ['Admissao', fmtDate(v?.dtadm)],
  ];
  if (func.email) fields.push(['Email', func.email]);
  if (func.telefone) fields.push(['Tel', func.telefone]);
  // name (5mm) + fields * LINE_MD
  const dataColH = 5 + fields.length * LINE_MD;

  // ---- Calculate right column height (jornada) ----
  let jornadaH = 0;
  if (carga) {
    // title (5mm) + descricao? (4mm) + gap (2mm) + dias * LINE_SM
    jornadaH = 5 + (carga.descricao ? 4 : 0) + 2 + carga.dias.length * LINE_SM;
  }

  const contentH = Math.max(dataColH, jornadaH, fotoSize + 2);
  const cardH = padTop + contentH + padBot;
  const startY = y;

  // ---- Draw card background ----
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(210, 220, 235);
  doc.setLineWidth(0.25);
  doc.roundedRect(cardX, startY, cardW, cardH, 2, 2, 'FD');

  // Left green accent
  doc.setFillColor(46, 125, 50);
  doc.rect(cardX, startY + 2, 1.5, cardH - 4, 'F');

  // ---- Photo ----
  const fotoX = cardX + 6;
  const fotoY = startY + padTop + (contentH - fotoSize) / 2;
  if (fotoBase64) {
    doc.addImage(fotoBase64, 'JPEG', fotoX, fotoY, fotoSize, fotoSize);
  } else {
    doc.setFillColor(200, 215, 230);
    doc.roundedRect(fotoX, fotoY, fotoSize, fotoSize, 2, 2, 'F');
    doc.setFontSize(12);
    doc.setFont(FONT, 'bold');
    doc.setTextColor(90, 110, 140);
    const initials = func.nomeparc.split(' ').slice(0, 2)
      .map((n) => n[0]).join('');
    doc.text(initials, fotoX + fotoSize / 2, fotoY + fotoSize / 2 + 2,
      { align: 'center' });
  }

  // ---- Data column ----
  const dataX = fotoX + fotoSize + 6;
  let dy = startY + padTop + 4;

  doc.setFontSize(10);
  doc.setFont(FONT, 'bold');
  doc.setTextColor(...PDF_COLORS.text);
  doc.text(func.nomeparc, dataX, dy);
  dy += 5;

  doc.setFontSize(7);
  for (const [lbl, val] of fields) {
    doc.setFont(FONT, 'bold');
    doc.setTextColor(...PDF_COLORS.muted);
    const label = `${lbl}: `;
    doc.text(label, dataX, dy);
    const lw = doc.getTextWidth(label);
    doc.setFont(FONT, 'normal');
    doc.setTextColor(...PDF_COLORS.text);
    doc.text(val, dataX + lw, dy);
    dy += LINE_MD;
  }

  // ---- Jornada column (right) ----
  if (carga) {
    const jornadaW = 90;
    const jx = pw - M - jornadaW + 4;
    let jy = startY + padTop + 4;

    // Vertical divider
    doc.setDrawColor(220, 230, 240);
    doc.setLineWidth(0.15);
    doc.line(jx - 6, startY + 3, jx - 6, startY + cardH - 3);

    // Title
    doc.setFontSize(8);
    doc.setFont(FONT, 'bold');
    doc.setTextColor(46, 125, 50);
    doc.text(`JORNADA: ${carga.totalHorasSemanaFmt}`, jx, jy);
    jy += 5;

    // Description
    if (carga.descricao) {
      doc.setFontSize(6);
      doc.setFont(FONT, 'normal');
      doc.setTextColor(...PDF_COLORS.muted);
      doc.text(carga.descricao, jx, jy);
      jy += 4;
    }

    jy += 2;

    // Days table — day left-aligned, hours right-aligned
    doc.setFontSize(6.5);
    const rightEdge = jx + jornadaW - 8;
    for (const dia of carga.dias) {
      // Day label (left)
      doc.setFont(FONT, 'bold');
      doc.setTextColor(...PDF_COLORS.text);
      doc.text(dia.diasemLabel, jx, jy);

      // Hours (right-aligned)
      doc.setFont(FONT, 'normal');
      if (dia.folga) {
        doc.setTextColor(180, 180, 180);
        doc.text('Folga', rightEdge, jy, { align: 'right' });
      } else {
        doc.setTextColor(...PDF_COLORS.muted);
        const horario = dia.turnos
          ?.map((t) => `${t.entrada}-${t.saida}`).join('  ') ?? '-';
        doc.text(horario, rightEdge, jy, { align: 'right' });
      }
      jy += LINE_SM;
    }
  }

  return startY + cardH + 4;
}


