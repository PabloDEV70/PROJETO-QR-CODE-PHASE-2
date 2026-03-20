import type { jsPDF } from 'jspdf';
import { addPdfFooter } from './pdf-layout';
import { registerJetBrainsMono } from './pdf-fonts';
import { drawHeader, drawColabCard } from './pdf-os-sections';
import { drawKpis } from './pdf-os-kpis';
import { drawTable } from './pdf-os-table';
import { getFuncionarioFotoUrl } from '@/api/funcionarios';
import { useAuthStore } from '@/stores/auth-store';
import type { FuncionarioPerfilEnriquecido } from '@/types/funcionario-types';
import type { OsColabServico } from '@/types/os-list-types';

interface OsExecutorPdfConfig {
  funcionario: FuncionarioPerfilEnriquecido;
  servicos: OsColabServico[];
  periodo: { dataInicio?: string; dataFim?: string };
}

async function loadFotoBase64(codparc: number): Promise<string | null> {
  try {
    const { user } = useAuthStore.getState();
    const url = getFuncionarioFotoUrl(codparc);
    const res = await fetch(url, {
      headers: user?.token ? { Authorization: `Bearer ${user.token}` } : {},
    });
    if (!res.ok) return null;
    const blob = await res.blob();
    if (blob.size < 100) return null;
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
}

export async function exportOsExecutorPdf(config: OsExecutorPdfConfig): Promise<void> {
  const [{ jsPDF: JsPDF }, autoTableModule, fotoBase64] = await Promise.all([
    import('jspdf'),
    import('jspdf-autotable'),
    loadFotoBase64(config.funcionario.codparc),
  ]);

  const autoTable = autoTableModule.default as unknown as (
    d: jsPDF, o: Record<string, unknown>
  ) => void;
  const doc = new JsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });

  await registerJetBrainsMono(doc);

  let y = drawHeader(doc, config.periodo);
  y = drawColabCard(doc, y, config.funcionario, fotoBase64);
  y = drawKpis(doc, y, config.servicos);
  drawTable(doc, y, config.servicos, autoTable);

  addPdfFooter(doc);

  const nome = config.funcionario.nomeparc.replace(/\s+/g, '_').substring(0, 30);
  const ts = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  doc.save(`Servicos_Executor_${nome}_${ts}.pdf`);
}
