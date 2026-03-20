/**
 * Converte formato HHMM (smallint) para string HH:MM
 * Ex: 701 -> "07:01", 1430 -> "14:30"
 */
export function hhmmToString(hhmm: number | null): string {
  if (hhmm == null) return '--:--';
  const h = Math.floor(hhmm / 100);
  const m = hhmm % 100;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

/**
 * Converte HHMM para minutos desde meia-noite
 * Ex: 701 -> 421 (7*60 + 1)
 */
export function hhmmToMinutos(hhmm: number | null): number {
  if (hhmm == null) return 0;
  return Math.floor(hhmm / 100) * 60 + (hhmm % 100);
}

/**
 * Calcula duracao em minutos entre dois HHMM
 */
export function duracaoMinutos(
  hrini: number | null,
  hrfim: number | null,
): number {
  if (hrini == null || hrfim == null) return 0;
  return hhmmToMinutos(hrfim) - hhmmToMinutos(hrini);
}

/**
 * Formata minutos em string legivel
 * Ex: 90 -> "1h30", 45 -> "45min"
 */
export function formatMinutos(minutos: number): string {
  if (minutos <= 0) return '0min';
  const h = Math.floor(minutos / 60);
  const m = minutos % 60;
  if (h === 0) return `${m}min`;
  if (m === 0) return `${h}h`;
  return `${h}h${String(m).padStart(2, '0')}`;
}

/**
 * Converte string HH:MM para formato HHMM (smallint)
 * Ex: "07:01" -> 701, "14:30" -> 1430
 */
export function stringToHhmm(str: string): number {
  const [h, m] = str.split(':').map(Number) as [number, number];
  return h * 100 + m;
}

/**
 * Retorna hora atual no formato HHMM
 * Ex: 14:35 -> 1435
 */
export function agoraHhmm(): number {
  const now = new Date();
  return now.getHours() * 100 + now.getMinutes();
}

/**
 * Formata segundos elapsed como cronometro HH:MM:SS
 * Ex: 3661 -> "01:01:01", 125 -> "00:02:05"
 */
export function formatElapsedTimer(totalSeconds: number): string {
  if (totalSeconds <= 0) return '00:00:00';
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}
