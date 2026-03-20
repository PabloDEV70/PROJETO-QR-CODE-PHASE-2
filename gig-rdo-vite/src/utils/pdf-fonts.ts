import type { jsPDF } from 'jspdf';

const FONT_NAME = 'JetBrainsMono';
const BASE_URL = '/fonts';
let fontsLoaded = false;

async function fetchFontAsBase64(url: string): Promise<string> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Font fetch failed: ${res.status}`);
  const buf = await res.arrayBuffer();
  const bytes = new Uint8Array(buf);
  let binary = '';
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]!);
  return btoa(binary);
}

export async function registerJetBrainsMono(doc: jsPDF): Promise<void> {
  if (fontsLoaded) {
    doc.addFont('JBM-Regular.ttf', FONT_NAME, 'normal');
    doc.addFont('JBM-Bold.ttf', FONT_NAME, 'bold');
    doc.setFont(FONT_NAME);
    return;
  }

  const [regularB64, boldB64] = await Promise.all([
    fetchFontAsBase64(`${BASE_URL}/JetBrainsMono-Regular.ttf`),
    fetchFontAsBase64(`${BASE_URL}/JetBrainsMono-Bold.ttf`),
  ]);

  doc.addFileToVFS('JBM-Regular.ttf', regularB64);
  doc.addFileToVFS('JBM-Bold.ttf', boldB64);
  doc.addFont('JBM-Regular.ttf', FONT_NAME, 'normal');
  doc.addFont('JBM-Bold.ttf', FONT_NAME, 'bold');
  doc.setFont(FONT_NAME);
  fontsLoaded = true;
}

export const FONT = FONT_NAME;
