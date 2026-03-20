import { Box, SxProps, Theme } from '@mui/material';

export interface PlacaVeiculoProps {
  placa: string;
  tipo?: string;
  width?: number | string;
  height?: number | string;
  showTipo?: boolean;
  variant?: 'mercosur' | 'antiga';
  backgroundColor?: string;
  textColor?: string;
  borderColor?: string;
  tipoColor?: string;
  sx?: SxProps<Theme>;
}

function formatPlaca(placa: string): string {
  const cleaned = placa.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
  if (cleaned.length === 7) {
    return `${cleaned.slice(0, 3)}-${cleaned.slice(3)}`;
  }
  return cleaned;
}

function getPlacaLetters(placa: string): string {
  const cleaned = placa.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
  return cleaned.slice(0, 4);
}

function getPlacaNumbers(placa: string): string {
  const cleaned = placa.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
  return cleaned.slice(4);
}

export function PlacaVeiculo({
  placa,
  tipo = 'BRASIL',
  width = 276,
  height = 179,
  showTipo = true,
  variant = 'mercosur',
  backgroundColor,
  textColor,
  borderColor,
  tipoColor,
  sx,
}: PlacaVeiculoProps) {
  const formattedPlaca = formatPlaca(placa);
  const letters = getPlacaLetters(placa);
  const numbers = getPlacaNumbers(placa);

  const isMercosur = variant === 'mercosur';

  const bgColor = backgroundColor ?? (isMercosur ? '#1e5aa8' : '#ffffff');
  const txtColor = textColor ?? '#000000';
  const bdrColor = borderColor ?? (isMercosur ? '#ffffff' : '#000000');
  const tpColor = tipoColor ?? (isMercosur ? '#ffffff' : '#000000');

  const plateWidth = typeof width === 'number' ? width : parseInt(width as string, 10) || 276;
  const plateHeight = typeof height === 'number' ? height : parseInt(height as string, 10) || 179;

  const scaleX = plateWidth / 276;
  const scaleY = plateHeight / 179;

  const letterFontSize = 52 * Math.min(scaleX, scaleY);
  const numberFontSize = 52 * Math.min(scaleX, scaleY);
  const tipoFontSize = 12 * Math.min(scaleX, scaleY);

  return (
    <Box
      sx={{
        display: 'inline-flex',
        position: 'relative',
        borderRadius: 1,
        overflow: 'hidden',
        border: `2px solid ${bdrColor}`,
        ...sx,
      }}
    >
      <svg
        width={plateWidth}
        height={plateHeight}
        viewBox={`0 0 ${plateWidth} ${plateHeight}`}
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient
            id={`plate-gradient-${placa}`}
            x1="0%"
            y1="0%"
            x2="100%"
            y2="100%"
          >
            <stop
              offset="0%"
              stopColor={isMercosur ? '#2e7ad1' : '#ffffff'}
            />
            <stop
              offset="100%"
              stopColor={isMercosur ? '#154c8a' : '#f5f5f5'}
            />
          </linearGradient>
        </defs>

        <rect
          x="0"
          y="0"
          width={plateWidth}
          height={plateHeight}
          fill={`url(#plate-gradient-${placa})`}
        />

        {isMercosur && (
          <>
            <rect
              x={4 * scaleX}
              y={4 * scaleY}
              width={40 * scaleX}
              height={30 * scaleY}
              fill="#ffc107"
              rx={3}
            />
            <text
              x={(4 + 20) * scaleX}
              y={(4 + 18) * scaleY}
              fontSize={12 * Math.min(scaleX, scaleY)}
              fill="#000000"
              textAnchor="middle"
              fontFamily="Arial, sans-serif"
              fontWeight="bold"
            >
              {tipo.slice(0, 3)}
            </text>
            <circle cx={(28 + 8) * scaleX} cy={(4 + 15) * scaleY} r={3 * Math.min(scaleX, scaleY)} fill="#005bbb" />
            <circle cx={(28 + 12) * scaleX} cy={(4 + 15) * scaleY} r={3 * Math.min(scaleX, scaleY)} fill="#ffd700" />
          </>
        )}

        <g transform={`translate(${plateWidth / 2}, ${plateHeight / 2 + (isMercosur ? 10 : 0) * scaleY})`}>
          <text
            textAnchor="middle"
            fontFamily="'Courier New', Courier, monospace"
            fontWeight="bold"
            fontSize={letterFontSize}
            fill={isMercosur ? '#ffffff' : txtColor}
            style={{ letterSpacing: '4px' }}
          >
            {letters}
          </text>
        </g>

        <g transform={`translate(${plateWidth / 2}, ${plateHeight / 2 + 45 * scaleY})`}>
          <text
            textAnchor="middle"
            fontFamily="'Courier New', Courier, monospace"
            fontWeight="bold"
            fontSize={numberFontSize}
            fill={isMercosur ? '#ffffff' : txtColor}
            style={{ letterSpacing: '4px' }}
          >
            {numbers}
          </text>
        </g>

        {showTipo && !isMercosur && (
          <text
            x={plateWidth / 2}
            y={plateHeight - 12 * scaleY}
            textAnchor="middle"
            fontFamily="Arial, sans-serif"
            fontSize={tipoFontSize}
            fill={tpColor}
            fontWeight="bold"
          >
            {tipo}
          </text>
        )}

        {!isMercosur && (
          <>
            <line
              x1={15 * scaleX}
              y1={plateHeight - 25 * scaleY}
              x2={plateWidth - 15 * scaleX}
              y2={plateHeight - 25 * scaleY}
              stroke={txtColor}
              strokeWidth={1}
            />
            <text
              x={plateWidth / 2}
              y={plateHeight - 10 * scaleY}
              textAnchor="middle"
              fontFamily="Arial, sans-serif"
              fontSize={8 * Math.min(scaleX, scaleY)}
              fill={tpColor}
            >
              {tipo}
            </text>
          </>
        )}
      </svg>
    </Box>
  );
}

export default PlacaVeiculo;
