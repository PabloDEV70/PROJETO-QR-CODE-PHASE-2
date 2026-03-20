import {
  Box, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Typography,
} from '@mui/material';
import type { RdoListItem } from '@/types/rdo-types';
import type { HorasEsperadasResponse } from '@/types/horas-esperadas-types';

export interface DebugCalcProps {
  esperadoRawH: number | undefined;
  jornadaMin: number;
  metaEfMin: number;
  tolRatio: number;
  esperadoAjustado: string | null;
  diagnostico: string | undefined;
}

function Row({ label, value, formula }: {
  label: string; value: string | number; formula?: string;
}) {
  return (
    <TableRow>
      <TableCell sx={{ fontWeight: 600, width: 260, py: 0.5 }}>{label}</TableCell>
      <TableCell sx={{ fontFamily: 'monospace', py: 0.5 }}>{value}</TableCell>
      {formula && (
        <TableCell sx={{ color: 'text.secondary', fontSize: 11, py: 0.5 }}>{formula}</TableCell>
      )}
    </TableRow>
  );
}

function fmtMin(min: number): string {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return h > 0 ? `${h}h${m.toString().padStart(2, '0')}m (${min}min)` : `${m}min`;
}

export function SectionTitle({ title }: { title: string }) {
  return (
    <Typography variant="overline" fontWeight="bold" color="text.secondary">
      {title}
    </Typography>
  );
}

export function TempoSection({ m }: { m: RdoListItem }) {
  return (
    <Box>
      <SectionTitle title="1. Tempo Bruto" />
      <TableContainer>
        <Table size="small">
          <TableBody>
            <Row label="Total Itens" value={m.totalItens} />
            <Row label="Primeira Hora" value={m.primeiraHora ?? '-'} />
            <Row label="Ultima Hora" value={m.ultimaHora ?? '-'} />
            <Row label="Total Bruto" value={fmtMin(m.totalBrutoMin)}
              formula="soma de todos HRFIM-HRINI" />
            <Row label="Tempo no Trabalho" value={fmtMin(m.tempoNoTrabalho)}
              formula="ultimaHora - primeiraHora" />
            <Row label="Jornada Prevista (carga hor.)" value={fmtMin(m.minutosPrevistosDia)}
              formula={`codcargahor=${m.codcargahor ?? '?'}`} />
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}

export function DeducoesSection({ m }: { m: RdoListItem }) {
  return (
    <Box>
      <SectionTitle title="2. Deducoes (almoco / banheiro / fumar)" />
      <TableContainer>
        <Table size="small">
          <TableBody>
            <Row label="Almoco Qtd" value={m.almocoQtd} />
            <Row label="Almoco Real" value={fmtMin(m.almocoMin)}
              formula="soma dos apontos de almoco" />
            <Row label="Intervalo Almoco (escala)" value={fmtMin(m.intervaloAlmocoMin)}
              formula="da carga horaria" />
            <Row label="Almoco Descontado" value={fmtMin(m.almocoDescontadoMin)}
              formula="min(almocoReal, intervaloAlmoco)" />
            <Row label="Banheiro Qtd" value={m.banheiroQtd} />
            <Row label="Banheiro Real" value={fmtMin(m.banheiroMin)}
              formula="soma dos apontos de banheiro" />
            <Row label="Banheiro Descontado" value={fmtMin(m.banheiroDescontadoMin)}
              formula="min(banheiroReal, tolerancia)" />
            <Row label="Fumar Qtd" value={m.fumarQtd} />
            <Row label="Fumar Real" value={fmtMin(m.fumarMinReal)} />
            <Row label="Fumar Penalidade" value={fmtMin(m.minutosFumarPenalidade)}
              formula="penalidade aplicada (subtrai da prod)" />
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}

export function ProdutividadeSection({ m }: {
  m: RdoListItem;
}) {
  return (
    <Box>
      <SectionTitle title="3. Calculo de Produtividade" />
      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 700 }}>Variavel</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Valor</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Formula</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <Row label="Minutos Produtivos" value={fmtMin(m.minutosProdu)}
              formula="soma HRFIM-HRINI dos motivos produtivos" />
            <Row label="Minutos Nao-Produtivos" value={fmtMin(m.minutosNaoProdu)}
              formula="soma dos motivos nao-produtivos" />
            <Row label="Tempo no Trabalho (base)" value={fmtMin(m.tempoNoTrabalho)}
              formula={`totalBruto - almocoDescontado = ${m.totalBrutoMin} - ${m.almocoDescontadoMin}`} />
            <Row label="Minutos Contabilizados" value={fmtMin(m.minutosContabilizados)}
              formula="tempoNoTrabalho - banheiroDescontado" />
            <Row label="Produtividade %" value={`${m.produtividadePercent.toFixed(1)}%`}
              formula={`minutosProdu / tempoNoTrabalho * 100 = ${m.minutosProdu} / ${m.tempoNoTrabalho} * 100`} />
            <Row label="Atingiu Meta?" value={m.atingiuMeta ? 'SIM' : 'NAO'}
              formula="produtividade >= 85%" />
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}

export function HorasEsperadasSection({ calc, he }: {
  calc: DebugCalcProps; he: HorasEsperadasResponse | undefined;
}) {
  return (
    <Box>
      <SectionTitle title="4. Capacidade Esperada (horas-esperadas API)" />
      <TableContainer>
        <Table size="small">
          <TableBody>
            <Row label="Horas Esperadas (raw)" value={
              calc.esperadoRawH != null ? `${calc.esperadoRawH}h` : 'N/A'
            } formula="totalHorasEsperadas da API horas-esperadas" />
            <Row label="Jornada Min (escala)" value={fmtMin(calc.jornadaMin)} />
            <Row label="Tempo no Trabalho" value={fmtMin(calc.metaEfMin)} />
            <Row label="Esperado Ajustado" value={
              calc.esperadoAjustado ? `${calc.esperadoAjustado}h` : 'N/A'
            } formula="horas esperadas da API" />
            {he && (
              <>
                <Row label="Total Funcionarios" value={he.resumo.totalFuncionarios} />
                <Row label="Total Min Esperados" value={fmtMin(he.resumo.totalMinutosEsperados)} />
                <Row label="Dias Uteis" value={he.resumo.totalDiasUteis} />
                <Row label="Dias Excluidos" value={he.resumo.totalDiasExcluidos} />
              </>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}

export function DiagnosticoSection({ m, calc }: {
  m: RdoListItem; calc: DebugCalcProps;
}) {
  return (
    <Box>
      <SectionTitle title="5. Diagnostico & Hora Extra" />
      <TableContainer>
        <Table size="small">
          <TableBody>
            <Row label="Diagnostico" value={calc.diagnostico ?? '-'}
              formula="faixa baseada na produtividade %" />
            <Row label="Hora Extra" value={fmtMin(m.horaExtraMin)}
              formula="tempo alem da jornada prevista" />
            <Row label="Saldo Jornada" value={`${m.saldoJornadaMin}min`}
              formula="contabilizados - jornada prevista" />
            <Row label="Total Horas" value={`${Number(m.totalHoras).toFixed(2)}h`}
              formula="totalMinutos / 60" />
            <Row label="Total Minutos" value={fmtMin(m.totalMinutos)} />
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}

