import { Box, Typography, Stack, Chip, Tooltip, Skeleton } from '@mui/material';
import {
  InsertDriveFileRounded, ImageRounded, PictureAsPdfRounded,
  TableChartRounded, DescriptionRounded, AttachFileRounded,
  OpenInNewRounded,
} from '@mui/icons-material';
import { FuncionarioAvatar } from '@/components/shared/funcionario-avatar';

export interface AnexoItem {
  NUATTACH: number;
  NOMEARQUIVO: string;
  DESCRICAO: string | null;
  DHCAD: string;
  LINK: string | null;
  NOMEUPLOADER: string | null;
  CODPARCUPLOADER: number | null;
  DOWNLOAD_URL: string | null;
}

interface AnexosListProps {
  anexos: AnexoItem[];
  isLoading: boolean;
}

const EXT_ICONS: Record<string, { icon: React.ReactNode; color: string }> = {
  jpg: { icon: <ImageRounded sx={{ fontSize: 18 }} />, color: '#0ea5e9' },
  jpeg: { icon: <ImageRounded sx={{ fontSize: 18 }} />, color: '#0ea5e9' },
  png: { icon: <ImageRounded sx={{ fontSize: 18 }} />, color: '#0ea5e9' },
  webp: { icon: <ImageRounded sx={{ fontSize: 18 }} />, color: '#0ea5e9' },
  gif: { icon: <ImageRounded sx={{ fontSize: 18 }} />, color: '#0ea5e9' },
  pdf: { icon: <PictureAsPdfRounded sx={{ fontSize: 18 }} />, color: '#ef4444' },
  xls: { icon: <TableChartRounded sx={{ fontSize: 18 }} />, color: '#16a34a' },
  xlsx: { icon: <TableChartRounded sx={{ fontSize: 18 }} />, color: '#16a34a' },
  csv: { icon: <TableChartRounded sx={{ fontSize: 18 }} />, color: '#16a34a' },
  doc: { icon: <DescriptionRounded sx={{ fontSize: 18 }} />, color: '#2563eb' },
  docx: { icon: <DescriptionRounded sx={{ fontSize: 18 }} />, color: '#2563eb' },
};

function getFileExt(filename: string): string {
  const parts = filename.split('.');
  return parts.length > 1 ? parts.pop()!.toLowerCase() : '';
}

function formatDate(val: string): string {
  return new Date(val).toLocaleDateString('pt-BR', {
    day: '2-digit', month: '2-digit', year: '2-digit',
    hour: '2-digit', minute: '2-digit',
  });
}

function formatSize(filename: string): string {
  const ext = getFileExt(filename);
  const images = ['jpg', 'jpeg', 'png', 'webp', 'gif'];
  if (images.includes(ext)) return 'Imagem';
  if (ext === 'pdf') return 'PDF';
  if (['xls', 'xlsx', 'csv'].includes(ext)) return 'Planilha';
  if (['doc', 'docx'].includes(ext)) return 'Documento';
  return ext.toUpperCase() || 'Arquivo';
}

function AnexoRow({ anexo }: { anexo: AnexoItem }) {
  const ext = getFileExt(anexo.NOMEARQUIVO);
  const fileInfo = EXT_ICONS[ext] ?? {
    icon: <InsertDriveFileRounded sx={{ fontSize: 18 }} />,
    color: '#64748b',
  };
  const url = anexo.DOWNLOAD_URL ?? anexo.LINK;
  const handleClick = () => { if (url) window.open(url, '_blank', 'noopener'); };

  return (
    <Box onClick={handleClick} sx={{
      display: 'flex', alignItems: 'center', gap: 1.25, py: 1,
      borderBottom: '1px solid rgba(148,163,184,0.1)',
      '&:last-child': { borderBottom: 0 },
      cursor: url ? 'pointer' : 'default',
      borderRadius: '8px', px: 0.5,
      '&:hover': url ? { bgcolor: 'rgba(148,163,184,0.06)' } : {},
    }}>
      {/* File icon */}
      <Box sx={{
        width: 36, height: 36, borderRadius: '8px',
        bgcolor: `${fileInfo.color}12`, color: fileInfo.color,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
      }}>
        {fileInfo.icon}
      </Box>

      {/* File info */}
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Tooltip title={anexo.NOMEARQUIVO} placement="top">
          <Typography sx={{
            fontSize: 12, fontWeight: 600, color: '#1e293b',
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>
            {anexo.NOMEARQUIVO}
          </Typography>
        </Tooltip>
        <Stack direction="row" spacing={0.75} alignItems="center">
          <Chip
            label={formatSize(anexo.NOMEARQUIVO)}
            size="small"
            sx={{
              height: 16, fontSize: 9.5, fontWeight: 600,
              bgcolor: `${fileInfo.color}15`, color: fileInfo.color,
              '& .MuiChip-label': { px: 0.5 },
            }}
          />
          <Typography sx={{ fontSize: 10.5, color: '#94a3b8' }}>
            {formatDate(anexo.DHCAD)}
          </Typography>
        </Stack>
        {anexo.DESCRICAO && (
          <Typography sx={{ fontSize: 11, color: '#64748b', mt: 0.25 }}>
            {anexo.DESCRICAO}
          </Typography>
        )}
      </Box>

      {/* Uploader avatar */}
      {anexo.NOMEUPLOADER && (
        <Tooltip title={`Enviado por: ${anexo.NOMEUPLOADER}`} placement="top" arrow>
          <Box component="span">
            <FuncionarioAvatar
              codparc={anexo.CODPARCUPLOADER}
              nome={anexo.NOMEUPLOADER}
              size="small"
              sx={{ width: 24, height: 24, fontSize: 10 }}
            />
          </Box>
        </Tooltip>
      )}
      {url && <OpenInNewRounded sx={{ fontSize: 14, color: '#94a3b8', flexShrink: 0 }} />}
    </Box>
  );
}

export function AnexosList({ anexos, isLoading }: AnexosListProps) {
  if (isLoading) {
    return (
      <Stack spacing={1}>
        {[1, 2].map((i) => (
          <Skeleton key={i} variant="rounded" height={48} sx={{ borderRadius: '8px' }} />
        ))}
      </Stack>
    );
  }

  if (!anexos.length) {
    return (
      <Box sx={{ py: 2, textAlign: 'center' }}>
        <AttachFileRounded sx={{ fontSize: 28, color: '#cbd5e1', mb: 0.5 }} />
        <Typography sx={{ fontSize: 12, color: '#94a3b8' }}>
          Nenhum anexo encontrado
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      {anexos.map((a) => <AnexoRow key={a.NUATTACH} anexo={a} />)}
    </Box>
  );
}
