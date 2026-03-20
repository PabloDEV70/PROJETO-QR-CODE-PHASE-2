import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  Chip,
  Divider,
} from '@mui/material';
import { useServicosPorGrupo } from '@/hooks/use-servicos-grupo';

interface ServicosListaProps {
  codGrupo: number | null;
}

export function ServicosLista({ codGrupo }: ServicosListaProps) {
  const { data: servicos, isLoading } = useServicosPorGrupo(codGrupo);

  if (!codGrupo) {
    return (
      <Box
        sx={{
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Typography color="text.secondary">
          Selecione um grupo no menu à esquerda
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
        Serviços do Grupo
      </Typography>
      {isLoading && <Typography>Carregando serviços...</Typography>}
      {servicos && servicos.length === 0 && (
        <Typography color="text.secondary">Nenhum serviço encontrado</Typography>
      )}
      {servicos && servicos.length > 0 && (
        <>
          <Box sx={{ mb: 2 }}>
            <Chip
              label={`${servicos.length} serviços`}
              color="primary"
              variant="outlined"
            />
          </Box>
          <List dense>
            {servicos.map((servico, index) => (
              <Box key={servico.codProd}>
                <ListItem>
                  <ListItemText
                    primary={servico.descrProd.trim()}
                    secondary={
                      <Box
                        sx={{ display: 'flex', gap: 1, mt: 0.5 }}
                      >
                        <Chip
                          label={`Código: ${servico.codProd}`}
                          size="small"
                          variant="outlined"
                        />
                        <Chip
                          label={`${servico.utilizacoes} utilizações`}
                          size="small"
                          color="secondary"
                          variant="outlined"
                        />
                      </Box>
                    }
                  />
                </ListItem>
                {index < servicos.length - 1 && <Divider />}
              </Box>
            ))}
          </List>
        </>
      )}
    </Box>
  );
}
