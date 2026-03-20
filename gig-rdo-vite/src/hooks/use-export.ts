import { useState, useCallback } from 'react';
import type { ExportColumn } from '@/utils/excel-export';
import type { PdfHeaderConfig } from '@/utils/pdf-layout';
import type { PdfSheetConfig } from '@/utils/pdf-export';

export type ExportFormat = 'xlsx' | 'csv' | 'pdf';

export interface UseExportConfig<T = Record<string, unknown>> {
  filename: string;
  sheetName?: string;
  columns: ExportColumn[];
  getData: () => T[] | Promise<T[]>;
  includeFormulas?: boolean;
  pdfHeader?: PdfHeaderConfig;
  pdfOrientation?: 'portrait' | 'landscape';
  pdfSheets?: PdfSheetConfig[];
}

function sanitizeFilename(name: string): string {
  return name
    .replace(/[/\\:*?"<>|]/g, '_')
    .replace(/\s+/g, '_')
    .slice(0, 80);
}

export function useExport<T = Record<string, unknown>>(config: UseExportConfig<T>) {
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const doExport = useCallback(async (format: ExportFormat) => {
    setIsExporting(true);
    setError(null);

    try {
      const ts = new Date().toISOString().slice(0, 10).replace(/-/g, '');
      const fname = `${sanitizeFilename(config.filename)}_${ts}`;

      // Multi-sheet PDF
      if (format === 'pdf' && config.pdfSheets?.length) {
        const { exportToPDFMultiSheet } = await import('@/utils/pdf-export');
        await exportToPDFMultiSheet({
          filename: fname,
          header: config.pdfHeader,
          orientation: config.pdfOrientation,
          sheets: config.pdfSheets,
        });
        return;
      }

      const rawData = await config.getData();
      const data = rawData as Record<string, unknown>[];

      if (data.length === 0) {
        setError('Nenhum registro para exportar');
        return;
      }

      if (format === 'xlsx') {
        const { exportToExcel } = await import('@/utils/excel-export');
        await exportToExcel({
          filename: fname,
          sheetName: config.sheetName,
          columns: config.columns,
          data,
          includeFormulas: config.includeFormulas ?? true,
        });
      } else if (format === 'csv') {
        const { exportToCSV } = await import('@/utils/csv-export');
        exportToCSV(data, config.columns, fname);
      } else if (format === 'pdf') {
        const { exportToPDF } = await import('@/utils/pdf-export');
        await exportToPDF({
          filename: fname,
          columns: config.columns,
          data,
          header: config.pdfHeader,
          orientation: config.pdfOrientation,
        });
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erro ao exportar';
      setError(msg);
      console.error('[useExport]', err);
    } finally {
      setIsExporting(false);
    }
  }, [config]);

  const exportExcel = useCallback(() => doExport('xlsx'), [doExport]);
  const exportCsv = useCallback(() => doExport('csv'), [doExport]);
  const exportPdf = useCallback(() => doExport('pdf'), [doExport]);

  return { exportExcel, exportCsv, exportPdf, doExport, isExporting, error };
}
