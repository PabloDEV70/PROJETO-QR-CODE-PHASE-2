import {
  Box, Chip, CircularProgress, Typography,
  Table, TableBody, TableCell, TableHead, TableRow,
} from '@mui/material';
import {
  useViewDetalhe, useProcedureDetalhe, useTriggerDetalhe, useFunctionDetalhe,
} from '@/hooks/use-database-objects';
import { CodeBlock } from '@/components/shared/code-block';

export type CodeObjectType = 'view' | 'procedure' | 'trigger' | 'function';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type R = Record<string, any>;

const TYPE_LABELS: Record<string, string> = {
  view: 'View', procedure: 'Procedure', trigger: 'Trigger', function: 'Function',
};

function MetadataColumns({ colunas }: { colunas: R[] }) {
  if (colunas.length === 0) return null;
  return (
    <Box sx={{ mb: 1 }}>
      <Typography sx={{ fontSize: 12, fontWeight: 700, mb: 0.5 }}>
        Colunas ({colunas.length})
      </Typography>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell sx={{ fontSize: 11, py: 0.25, fontWeight: 700 }}>Nome</TableCell>
            <TableCell sx={{ fontSize: 11, py: 0.25, fontWeight: 700 }}>Tipo</TableCell>
            <TableCell sx={{ fontSize: 11, py: 0.25, fontWeight: 700 }}>Null</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {colunas.map((c) => (
            <TableRow key={String(c.nome)}>
              <TableCell sx={{ fontSize: 11, py: 0.15, fontFamily: 'monospace' }}>
                {c.nome}
              </TableCell>
              <TableCell sx={{ fontSize: 11, py: 0.15 }}>
                {c.tipo}{c.tamanhoMaximo ? `(${c.tamanhoMaximo})` : ''}
              </TableCell>
              <TableCell sx={{ fontSize: 11, py: 0.15 }}>
                {c.nulo ?? c.nullable ? 'YES' : 'NO'}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Box>
  );
}

function MetadataParams({ parametros }: { parametros: R[] }) {
  if (parametros.length === 0) return null;
  return (
    <Box sx={{ mb: 1 }}>
      <Typography sx={{ fontSize: 12, fontWeight: 700, mb: 0.5 }}>
        Parametros ({parametros.length})
      </Typography>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell sx={{ fontSize: 11, py: 0.25, fontWeight: 700 }}>Nome</TableCell>
            <TableCell sx={{ fontSize: 11, py: 0.25, fontWeight: 700 }}>Tipo</TableCell>
            <TableCell sx={{ fontSize: 11, py: 0.25, fontWeight: 700 }}>Dir</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {parametros.map((p) => (
            <TableRow key={String(p.nome)}>
              <TableCell sx={{ fontSize: 11, py: 0.15, fontFamily: 'monospace' }}>
                {p.nome}
              </TableCell>
              <TableCell sx={{ fontSize: 11, py: 0.15 }}>
                {p.tipo}{p.tamanhoMaximo ? `(${p.tamanhoMaximo})` : ''}
              </TableCell>
              <TableCell sx={{ fontSize: 11, py: 0.15 }}>
                {p.saida ? 'OUT' : 'IN'}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Box>
  );
}

function MetadataTrigger({ data }: { data: R }) {
  const eventos = (data.eventos as string[]) ?? [];
  if (eventos.length === 0 && !data.tabelaAlvo) return null;
  return (
    <Box sx={{ display: 'flex', gap: 0.5, mb: 1, alignItems: 'center', flexWrap: 'wrap' }}>
      {data.tabelaAlvo && (
        <Chip label={`Target: ${data.tabelaAlvo}`} size="small"
          sx={{ height: 20, fontSize: 11 }} />
      )}
      {eventos.map((e: string) => (
        <Chip key={e} label={e} size="small" variant="outlined"
          sx={{ height: 20, fontSize: 11 }} />
      ))}
    </Box>
  );
}

interface ExplorerCodeDetailProps {
  type: CodeObjectType;
  schema: string;
  nome: string;
}

export function ExplorerCodeDetail({ type, schema, nome }: ExplorerCodeDetailProps) {
  const viewQ = useViewDetalhe(type === 'view' ? schema : null, type === 'view' ? nome : null);
  const procQ = useProcedureDetalhe(
    type === 'procedure' ? schema : null, type === 'procedure' ? nome : null,
  );
  const trigQ = useTriggerDetalhe(
    type === 'trigger' ? schema : null, type === 'trigger' ? nome : null,
  );
  const funcQ = useFunctionDetalhe(
    type === 'function' ? schema : null, type === 'function' ? nome : null,
  );

  const isLoading = viewQ.isLoading || procQ.isLoading || trigQ.isLoading || funcQ.isLoading;
  const detail = ((viewQ.data || procQ.data || trigQ.data || funcQ.data) as R) ?? {};
  const definicao = (detail.definicao ?? detail.definition) as string | undefined;

  if (isLoading) return <CircularProgress size={20} />;

  return (
    <>
      <Box sx={{
        display: 'flex', alignItems: 'center', gap: 1, mb: 1, flexShrink: 0, flexWrap: 'wrap',
      }}>
        <Typography sx={{ fontFamily: 'monospace', fontWeight: 700, fontSize: 14 }}>
          {schema}.{nome}
        </Typography>
        <Chip label={TYPE_LABELS[type] ?? type} size="small" color="info" variant="outlined"
          sx={{ height: 20, fontSize: 11 }} />
        {detail.dataCriacao && (
          <Typography sx={{ fontSize: 11, color: 'text.secondary' }}>
            Criado: {new Date(String(detail.dataCriacao)).toLocaleDateString('pt-BR')}
          </Typography>
        )}
        {detail.dataModificacao && (
          <Typography sx={{ fontSize: 11, color: 'text.secondary' }}>
            Modificado: {new Date(String(detail.dataModificacao)).toLocaleDateString('pt-BR')}
          </Typography>
        )}
      </Box>

      <Box sx={{ flex: 1, minHeight: 0, overflow: 'auto' }}>
        {type === 'view' && <MetadataColumns colunas={(detail.colunas as R[]) ?? []} />}
        {(type === 'procedure' || type === 'function') && (
          <MetadataParams parametros={(detail.parametros as R[]) ?? []} />
        )}
        {type === 'trigger' && <MetadataTrigger data={detail} />}

        {definicao ? (
          <CodeBlock
            code={definicao}
            language="sql"
            fileName={`${schema}.${nome}.sql`}
            maxHeight={500}
          />
        ) : (
          <Typography color="text.secondary" sx={{ fontSize: 13 }}>
            Definicao nao disponivel
          </Typography>
        )}
      </Box>
    </>
  );
}
