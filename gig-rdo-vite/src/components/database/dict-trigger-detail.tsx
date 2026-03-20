import { Box, Typography, Chip } from '@mui/material';
import { CodeBlock } from '@/components/shared/code-block';
import type { TableTrigger } from '@/types/database-types';

interface Props {
  trigger: TableTrigger;
  tableName: string;
}

export function DictTriggerDetail({ trigger, tableName }: Props) {
  return (
    <Box sx={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
      <Box sx={{
        display: 'flex', gap: 0.5, alignItems: 'center',
        mb: 0.5, flexShrink: 0, flexWrap: 'wrap',
      }}>
        <Typography sx={{ fontFamily: 'monospace', fontSize: 13, fontWeight: 700 }}>
          {trigger.nome}
        </Typography>
        <Typography sx={{ fontSize: 11, color: 'text.secondary' }}>
          {tableName}
        </Typography>
        <Chip label={trigger.tipo} size="small" variant="outlined"
          sx={{ height: 18, fontSize: 9 }} />
        {trigger.eventos.split(',').filter(Boolean).map((ev) => (
          <Chip key={ev} label={ev.trim()} size="small" color="info"
            variant="outlined" sx={{ height: 16, fontSize: 8 }} />
        ))}
        <Chip
          label={trigger.ativo ? 'ENABLED' : 'DISABLED'}
          size="small"
          color={trigger.ativo ? 'success' : 'error'}
          variant={trigger.ativo ? 'filled' : 'outlined'}
          sx={{ height: 18, fontSize: 9 }}
        />
        <Box sx={{ flex: 1 }} />
        <Typography sx={{ fontSize: 10, color: 'text.disabled' }}>
          Criado: {trigger.dataCriacao?.slice(0, 10)}
          {' · '}
          Modificado: {trigger.dataModificacao?.slice(0, 10)}
        </Typography>
      </Box>
      <Box sx={{ flex: 1, minHeight: 0, overflow: 'auto' }}>
        {trigger.definicao ? (
          <CodeBlock
            code={trigger.definicao}
            language="sql"
            fileName={`${trigger.nome}.sql`}
            maxHeight={9999}
          />
        ) : (
          <Typography sx={{ fontSize: 11, color: 'text.secondary', p: 1 }}>
            Codigo nao disponivel
          </Typography>
        )}
      </Box>
    </Box>
  );
}
