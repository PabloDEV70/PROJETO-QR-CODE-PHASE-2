import { useState } from 'react';
import {
  Box,
  Drawer,
  Typography,
  IconButton,
  Divider,
  Chip,
  LinearProgress,
  Skeleton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Link,
  alpha,
} from '@mui/material';
import {
  Close,
  Inventory2,
  AttachFile,
  Image as ImageIcon,
  PictureAsPdf,
  InsertDriveFile,
  HideImage,
  Scale,
  LocationOn,
  Category,
  QrCode,
  LocalOffer,
} from '@mui/icons-material';
import { useProdutoDetalhes } from '@/hooks/use-locais';
import { FuncionarioAvatar } from '@/components/shared/funcionario-avatar';
import { VeiculosProdutoList } from '@/components/locais/veiculos-produto-list';
import type { EstoqueLocal, TsiAnexo, ArvoreLocal } from '@/types/local-produto';
import { getApiBaseUrl } from '@/api/client';
import { useAuthStore } from '@/stores/auth-store';

interface ProdutoDetailDrawerProps {
  open: boolean;
  onClose: () => void;
  item: EstoqueLocal | null;
  localNode?: ArvoreLocal | null;
}

function getFileIcon(nome: string) {
  const ext = nome.split('.').pop()?.toLowerCase() || '';
  if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'].includes(ext)) return <ImageIcon />;
  if (ext === 'pdf') return <PictureAsPdf />;
  return <InsertDriveFile />;
}

function InfoRow({ label, value, icon }: {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
}) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, py: 0.5 }}>
      {icon && (
        <Box sx={{ color: 'text.secondary', display: 'flex', fontSize: 16 }}>
          {icon}
        </Box>
      )}
      <Typography variant="body2" color="text.secondary" sx={{ flex: 1 }}>
        {label}
      </Typography>
      <Typography variant="body2" sx={{ fontWeight: 500, textAlign: 'right' }}>
        {value}
      </Typography>
    </Box>
  );
}

function EstoqueBar(
  { label, value, max, color }:
  { label: string; value: number; max: number; color: string },
) {
  const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0;
  return (
    <Box sx={{ mb: 1 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.25 }}>
        <Typography variant="caption" color="text.secondary">{label}</Typography>
        <Typography variant="caption" sx={{ fontWeight: 600 }}>
          {value.toLocaleString('pt-BR')}
        </Typography>
      </Box>
      <LinearProgress
        variant="determinate"
        value={pct}
        color={color as 'primary'}
        sx={{ height: 8, borderRadius: 1 }}
      />
    </Box>
  );
}

function ProdutoImage({ codProd, temImagem }: {
  codProd: number;
  temImagem: boolean;
}) {
  const [status, setStatus] = useState<'loading' | 'ok' | 'error'>('loading');
  const token = useAuthStore((s) => s.user?.token);
  const base = `${getApiBaseUrl()}/produtos/${codProd}/imagem`;
  const src = token ? `${base}?token=${token}` : base;

  if (!temImagem) {
    return (
      <Box
        sx={{
          height: 180,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: (t) => alpha(t.palette.text.disabled, 0.06),
          borderRadius: 2,
          mb: 2,
        }}
      >
        <Box sx={{ textAlign: 'center', color: 'text.disabled' }}>
          <HideImage sx={{ fontSize: 48, opacity: 0.4 }} />
          <Typography variant="caption" display="block">
            Sem imagem cadastrada
          </Typography>
        </Box>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        mb: 2,
        p: 1,
        bgcolor: '#fff',
        borderRadius: 2,
        border: '1px solid',
        borderColor: 'divider',
        minHeight: status === 'loading' ? 180 : undefined,
        alignItems: 'center',
      }}
    >
      {status === 'loading' && (
        <Skeleton variant="rounded" width="100%" height={180} />
      )}
      {status !== 'error' && (
        <Box
          component="img"
          src={src}
          alt="Produto"
          onLoad={() => setStatus('ok')}
          onError={() => setStatus('error')}
          sx={{
            maxHeight: 200,
            maxWidth: '100%',
            objectFit: 'contain',
            borderRadius: 1,
            display: status === 'ok' ? 'block' : 'none',
          }}
        />
      )}
    </Box>
  );
}

function AnexosList({ anexos }: { anexos: TsiAnexo[] }) {
  if (anexos.length === 0) return null;
  return (
    <>
      <Typography variant="subtitle2" sx={{ mt: 2, mb: 0.5, fontWeight: 600 }}>
        Anexos ({anexos.length})
      </Typography>
      <List dense disablePadding>
        {anexos.map((a) => (
          <ListItem key={a.NUATTACH} disablePadding sx={{ py: 0.25 }}>
            <ListItemIcon sx={{ minWidth: 32 }}>
              {getFileIcon(a.NOMEARQUIVO)}
            </ListItemIcon>
            <ListItemText
              primary={
                a.DOWNLOAD_URL ? (
                  <Link href={a.DOWNLOAD_URL} target="_blank" rel="noopener" variant="body2">
                    {a.NOMEARQUIVO}
                  </Link>
                ) : a.NOMEARQUIVO
              }
              secondary={a.DESCRICAO}
              primaryTypographyProps={{ variant: 'body2', noWrap: true }}
              secondaryTypographyProps={{ variant: 'caption', noWrap: true }}
            />
          </ListItem>
        ))}
      </List>
    </>
  );
}

const USO_PROD_MAP: Record<string, string> = {
  C: 'Consumo',
  R: 'Revenda',
  A: 'Ativo Imobilizado',
  I: 'Imobilizado',
  S: 'Serviço',
  M: 'Matéria-prima',
  P: 'Produto acabado',
};

export function ProdutoDetailDrawer({ open, onClose, item, localNode }: ProdutoDetailDrawerProps) {
  const { data: detalhes, isLoading } = useProdutoDetalhes(
    open && item ? item.codProd : null,
  );

  const abaixoMin = item ? item.estMin > 0 && item.estoque < item.estMin : false;
  const maxRef = item
    ? (item.estMax > 0 ? item.estMax : Math.max(item.estoque * 1.5, 1))
    : 1;

  return (
    <Drawer anchor="right" open={open} onClose={onClose}>
      <Box sx={{ width: 420, display: 'flex', flexDirection: 'column', height: '100%' }}>
        <Box
          sx={{
            bgcolor: 'primary.main',
            color: 'primary.contrastText',
            p: 2,
            display: 'flex',
            alignItems: 'center',
            gap: 1,
          }}
        >
          <Inventory2 />
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }} noWrap>
              {item?.descrProd || 'Produto'}
            </Typography>
            <Typography variant="caption" sx={{ opacity: 0.8 }}>
              #{item?.codProd}
            </Typography>
          </Box>
          <IconButton onClick={onClose} sx={{ color: 'inherit' }} size="small">
            <Close />
          </IconButton>
        </Box>

        <Box sx={{ p: 2, flex: 1, overflow: 'auto' }}>
          {isLoading ? (
            <>
              <Skeleton variant="rounded" height={180} sx={{ mb: 2 }} />
              <Skeleton height={24} width="60%" />
              <Skeleton height={20} sx={{ mt: 1 }} />
              <Skeleton height={20} />
              <Skeleton height={20} />
              <Skeleton height={40} sx={{ mt: 2 }} />
              <Skeleton height={40} />
            </>
          ) : (
            <>
              {detalhes && (
                <ProdutoImage
                  codProd={detalhes.codProd}
                  temImagem={detalhes.temImagem}
                />
              )}

              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                Identificação
              </Typography>
              <InfoRow label="Código" value={item?.codProd ?? '-'} icon={<QrCode fontSize="inherit" />} />
              {detalhes?.marca && (
                <InfoRow label="Marca" value={detalhes.marca} icon={<LocalOffer fontSize="inherit" />} />
              )}
              {detalhes?.referencia && (
                <InfoRow label="Referência" value={detalhes.referencia} />
              )}
              {detalhes?.descrGrupoProd && (
                <InfoRow
                  label="Grupo"
                  value={detalhes.descrGrupoProd}
                  icon={<Category fontSize="inherit" />}
                />
              )}
              {detalhes?.codVol && (
                <InfoRow label="Unidade" value={detalhes.codVol} />
              )}
              {detalhes?.usoProd && (
                <InfoRow
                  label="Uso"
                  value={USO_PROD_MAP[detalhes.usoProd] || detalhes.usoProd}
                />
              )}
              <InfoRow
                label="Status"
                value={detalhes?.ativo === 'S' ? 'Ativo' : 'Inativo'}
              />
              {detalhes?.ncm && (
                <InfoRow label="NCM" value={detalhes.ncm} />
              )}

              {detalhes?.complDesc && (
                <Box sx={{ mt: 1, p: 1, bgcolor: 'action.hover', borderRadius: 1 }}>
                  <Typography variant="caption" color="text.secondary">
                    Complemento
                  </Typography>
                  <Typography variant="body2">{detalhes.complDesc}</Typography>
                </Box>
              )}

              {detalhes?.localizacao && (
                <>
                  <Divider sx={{ my: 1.5 }} />
                  <InfoRow
                    label="Localização física"
                    value={detalhes.localizacao}
                    icon={<LocationOn fontSize="inherit" />}
                  />
                </>
              )}

              {(detalhes?.pesoBruto || detalhes?.pesoLiq) ? (
                <>
                  <Divider sx={{ my: 1.5 }} />
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5 }}>
                    Peso
                  </Typography>
                  {detalhes.pesoBruto ? (
                    <InfoRow
                      label="Bruto"
                      value={`${detalhes.pesoBruto.toLocaleString('pt-BR')} kg`}
                      icon={<Scale fontSize="inherit" />}
                    />
                  ) : null}
                  {detalhes.pesoLiq ? (
                    <InfoRow
                      label="Líquido"
                      value={`${detalhes.pesoLiq.toLocaleString('pt-BR')} kg`}
                    />
                  ) : null}
                </>
              ) : null}

              <Divider sx={{ my: 1.5 }} />

              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                Estoque
              </Typography>
              {item && (
                <>
                  <EstoqueBar
                    label="Estoque atual"
                    value={item.estoque}
                    max={maxRef}
                    color={abaixoMin ? 'error' : 'success'}
                  />
                  {item.reservado > 0 && (
                    <EstoqueBar
                      label="Reservado"
                      value={item.reservado}
                      max={maxRef}
                      color="warning"
                    />
                  )}
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 1 }}>
                    {item.estMin > 0 && (
                      <Chip
                        label={`Mín: ${item.estMin.toLocaleString('pt-BR')}`}
                        size="small"
                        color={abaixoMin ? 'error' : 'default'}
                        variant="outlined"
                      />
                    )}
                    {item.estMax > 0 && (
                      <Chip
                        label={`Máx: ${item.estMax.toLocaleString('pt-BR')}`}
                        size="small"
                        variant="outlined"
                      />
                    )}
                    {item.controle && (
                      <Chip
                        label={`Controle: ${item.controle}`}
                        size="small"
                        variant="outlined"
                      />
                    )}
                  </Box>
                  {abaixoMin && (
                    <Chip
                      icon={<AttachFile />}
                      label="Abaixo do estoque mínimo!"
                      color="error"
                      size="small"
                      sx={{ mt: 1 }}
                    />
                  )}
                </>
              )}

              {detalhes?.usoProd === 'I' && item && (
                <>
                  <Divider sx={{ my: 1.5 }} />
                  <VeiculosProdutoList
                    codProd={item.codProd}
                    usoProd={detalhes.usoProd}
                  />
                </>
              )}

              {localNode?.codparcUsuario && (
                <>
                  <Divider sx={{ my: 1.5 }} />
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                    Responsável do Local
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <FuncionarioAvatar
                      codparc={localNode.codparcUsuario}
                      nome={localNode.nomeUsuario || undefined}
                      size="small"
                    />
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {localNode.nomeUsuario}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {localNode.descrLocal}
                      </Typography>
                    </Box>
                  </Box>
                </>
              )}

              {detalhes?.anexos && <AnexosList anexos={detalhes.anexos} />}
            </>
          )}
        </Box>
      </Box>
    </Drawer>
  );
}
