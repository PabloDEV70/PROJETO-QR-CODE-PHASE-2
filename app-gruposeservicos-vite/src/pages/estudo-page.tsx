import { Box, Typography, Paper, Stack, Chip, Divider, Alert } from '@mui/material';
import { Description, Warning, CheckCircle, TrendingUp } from '@mui/icons-material';

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Paper sx={{ p: 2.5, mb: 2 }}>
      <Typography variant="h6" fontWeight={700} sx={{ mb: 1.5, fontSize: 16 }}>
        {title}
      </Typography>
      {children}
    </Paper>
  );
}

function DataTable({ headers, rows }: { headers: string[]; rows: (string | number)[][] }) {
  return (
    <Box sx={{ overflowX: 'auto', mb: 1.5 }}>
      <Box
        component="table"
        sx={{
          width: '100%',
          borderCollapse: 'collapse',
          fontSize: 13,
          '& th': {
            textAlign: 'left', fontWeight: 700, py: 0.8, px: 1.2,
            borderBottom: '2px solid', borderColor: 'divider',
            fontSize: 12, color: 'text.secondary',
          },
          '& td': {
            py: 0.6, px: 1.2,
            borderBottom: '1px solid', borderColor: 'divider',
          },
          '& tr:hover td': { bgcolor: 'action.hover' },
        }}
      >
        <thead>
          <tr>
            {headers.map((h) => (
              <th key={h}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i}>
              {row.map((cell, j) => (
                <td key={j} style={j === headers.length - 1 ? { textAlign: 'right' } : undefined}>
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </Box>
    </Box>
  );
}

function KpiRow({ items }: { items: { value: string | number; label: string; color?: string }[] }) {
  return (
    <Stack direction="row" spacing={1.5} sx={{ mb: 2 }} flexWrap="wrap" useFlexGap>
      {items.map((item) => (
        <Paper
          key={item.label}
          sx={{ flex: 1, minWidth: 120, p: 1.5, textAlign: 'center' }}
        >
          <Typography sx={{ fontSize: 22, fontWeight: 700, color: item.color || 'primary.main', lineHeight: 1 }}>
            {item.value}
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ fontSize: 10 }}>
            {item.label}
          </Typography>
        </Paper>
      ))}
    </Stack>
  );
}

export function EstudoPage() {
  return (
    <Box sx={{ p: 3, overflow: 'auto', maxWidth: 900, mx: 'auto' }}>
      {/* Header */}
      <Stack direction="row" spacing={1.5} alignItems="flex-start" sx={{ mb: 3 }}>
        <Description sx={{ fontSize: 32, color: 'primary.main', mt: 0.3 }} />
        <Box>
          <Typography variant="h5" fontWeight={700}>
            Estudo de Viabilidade
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Reclassificacao de Servicos por Grupos
          </Typography>
          <Stack direction="row" spacing={0.5} sx={{ mt: 0.5 }}>
            <Chip label="2026-03-18" size="small" variant="outlined" sx={{ fontSize: 11 }} />
            <Chip label="Somente leitura" size="small" color="info" sx={{ fontSize: 11 }} />
            <Chip label="Foco: Mecanica" size="small" color="warning" sx={{ fontSize: 11 }} />
          </Stack>
        </Box>
      </Stack>

      <Alert severity="info" sx={{ mb: 2 }}>
        Este documento eh um estudo de viabilidade. Nenhuma alteracao sera feita no banco de dados sem aprovacao.
      </Alert>

      {/* 1. Diagnostico */}
      <Section title="1. Diagnostico Atual">
        <KpiRow
          items={[
            { value: '1.717', label: 'Servicos ativos', color: 'primary.main' },
            { value: 618, label: 'Nunca utilizados', color: '#ed6c02' },
            { value: '36%', label: 'Taxa sem uso', color: '#d32f2f' },
            { value: 103, label: 'Grupos ativos' },
            { value: 452, label: 'Servicos APOIO MEC', color: '#ed6c02' },
          ]}
        />

        <Typography variant="subtitle2" fontWeight={700} sx={{ mt: 2, mb: 1 }}>
          Servicos Nunca Utilizados — Top 15 por Grupo
        </Typography>
        <DataTable
          headers={['Grupo', 'Total', 'Nao usados', '%']}
          rows={[
            ['SERVICOS TOMADOS (10800)', 177, 104, '59%'],
            ['LOCACAO BENS MOVEIS (10501)', 68, 67, '99%'],
            ['APOIO MECANICO (10101)', 452, 59, '13%'],
            ['OPERAC. EQUIPAMENTO (10502)', 53, 52, '98%'],
            ['MOBILIZ. E DESMOBILIZ. (10504)', 41, 41, '100%'],
            ['TORNEARIA (10116)', 35, 24, '69%'],
            ['RETIFICA MOTORES (10114)', 35, 21, '60%'],
            ['CALDEIRARIA (10105)', 65, 18, '28%'],
            ['ELETRICA AUTOMOTIVA (10107)', 156, 18, '12%'],
            ['HIDRAULICA (10118)', 29, 11, '38%'],
            ['SOFTWARE (10202)', 12, 11, '92%'],
            ['BOMBISTA (10103)', 15, 10, '67%'],
            ['VIDRACARIA (10117)', 50, 9, '18%'],
            ['CONSTRUCAO CIVIL (10404)', 8, 8, '100%'],
            ['PREV. MECANICA (10121)', 123, 8, '7%'],
          ]}
        />

        <Alert severity="warning" sx={{ mt: 1 }}>
          Grupos com 90%+ sem uso (LOCACAO, MOBILIZACAO, OPERACIONALIZACAO) sao candidatos a limpeza ou desativacao em massa.
        </Alert>
      </Section>

      {/* Campo ATIVO */}
      <Section title="2. Desativar Servicos (TGFPRO.ATIVO)">
        <Typography variant="body2" sx={{ mb: 1 }}>
          O campo <strong>TGFPRO.ATIVO</strong> (S/N) funciona como soft delete. Apenas 17 servicos estao inativos hoje.
        </Typography>
        <Stack spacing={0.5} sx={{ mb: 1.5 }}>
          {[
            { icon: <CheckCircle sx={{ fontSize: 16, color: 'success.main' }} />, text: 'Servico inativo NAO aparece em telas de cadastro de OS' },
            { icon: <CheckCircle sx={{ fontSize: 16, color: 'success.main' }} />, text: 'Servico inativo NAO aparece na busca de produtos Sankhya' },
            { icon: <CheckCircle sx={{ fontSize: 16, color: 'success.main' }} />, text: 'Historico preservado — OS antigas continuam intactas' },
            { icon: <CheckCircle sx={{ fontSize: 16, color: 'success.main' }} />, text: 'Pode ser reativado a qualquer momento' },
          ].map((item) => (
            <Stack key={item.text} direction="row" spacing={1} alignItems="center">
              {item.icon}
              <Typography variant="body2" sx={{ fontSize: 13 }}>{item.text}</Typography>
            </Stack>
          ))}
        </Stack>
      </Section>

      {/* O Problema */}
      <Section title="3. O Problema Central">
        <Alert severity="error" sx={{ mb: 1.5 }}>
          APOIO MECANICO (10101) tem 452 servicos sem sub-classificacao. "TROCAR PASTILHA DE FREIO" esta no mesmo grupo que "CHECAR PRESSAO DE AR" e "HH DESLOCAMENTO".
        </Alert>
        <Typography variant="body2" sx={{ mb: 1 }}>
          Isso impede:
        </Typography>
        <Stack spacing={0.3} sx={{ mb: 1.5, pl: 2 }}>
          {[
            'Analise de custos por tipo de atividade',
            'Planejamento de preventivas por natureza do servico',
            'Indicadores de produtividade por especialidade',
          ].map((t) => (
            <Typography key={t} variant="body2" sx={{ fontSize: 13 }}>
              - {t}
            </Typography>
          ))}
        </Stack>

        <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1 }}>
          Analise por Verbo (679 servicos mecanicos)
        </Typography>
        <DataTable
          headers={['Classificacao', 'Quantidade', '%']}
          rows={[
            ['VERIFICAR / CHECAR', 153, '22,5%'],
            ['REGULAR / REPARAR', 127, '18,7%'],
            ['MONTAR / INSTALAR', 46, '6,8%'],
            ['LUBRIFICAR / ABASTECER', 18, '2,6%'],
            ['DESMONTAR / RETIRAR', 14, '2,1%'],
            ['LIMPAR', 9, '1,3%'],
            ['FIXAR / APERTAR', 7, '1,0%'],
            ['FABRICAR', 5, '0,7%'],
            ['OUTROS (sem verbo padrao)', 300, '44,2%'],
          ]}
        />
      </Section>

      {/* Restricoes */}
      <Section title="4. Restricoes — O Passado eh Inviolavel">
        <Typography variant="subtitle2" fontWeight={700} color="error.main" sx={{ mb: 1 }}>
          43 tabelas referenciam CODGRUPOPROD
        </Typography>
        <DataTable
          headers={['Tabela', 'Descricao', 'Impacto']}
          rows={[
            ['TGFPRO', 'Cadastro de Produtos/Servicos', 'FK direta'],
            ['AD_TCFEXEC', 'Execucao de servicos em OS', 'Filtros'],
            ['AD_SOLCOMPRAOS', 'Solicitacoes de compra via OS', 'Referencia'],
            ['TGFMET / VGFMET', 'Metas por grupo', 'Financeiro'],
            ['TGMAPO / TGMFCT', 'Apontamentos de producao', 'Apontamentos'],
            ['TGFCTTPRO', 'Contabilizacao por grupo', 'Fiscal'],
          ]}
        />
        <Divider sx={{ my: 1.5 }} />
        <Stack spacing={0.5}>
          <Stack direction="row" spacing={1} alignItems="center">
            <Warning sx={{ fontSize: 16, color: 'error.main' }} />
            <Typography variant="body2" sx={{ fontSize: 13 }}>
              <strong>NAO pode mudar:</strong> CODGRUPOPROD de servicos existentes, codigos de grupos, estrutura hierarquica
            </Typography>
          </Stack>
          <Stack direction="row" spacing={1} alignItems="center">
            <CheckCircle sx={{ fontSize: 16, color: 'success.main' }} />
            <Typography variant="body2" sx={{ fontSize: 13 }}>
              <strong>PODE mudar:</strong> Criar novos grupos, criar novos servicos, desativar servicos antigos
            </Typography>
          </Stack>
        </Stack>
      </Section>

      {/* Estrategias */}
      <Section title="5. Estrategias Propostas">
        {/* A */}
        <Paper sx={{ p: 2, mb: 1.5, border: '2px solid', borderColor: 'success.main' }}>
          <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
            <Chip label="RECOMENDADA" size="small" color="success" sx={{ fontSize: 10, fontWeight: 700 }} />
            <Typography variant="subtitle2" fontWeight={700}>
              Estrategia A — "Espelho Novo"
            </Typography>
          </Stack>
          <Typography variant="body2" sx={{ fontSize: 13, mb: 1 }}>
            Criar hierarquia paralela dentro de 10100 com novos codigos. Servicos antigos ficam em 10101 (congelado).
          </Typography>
          <Box
            sx={{
              bgcolor: 'action.hover', p: 1.5, borderRadius: '6px',
              fontFamily: 'monospace', fontSize: 12, whiteSpace: 'pre', overflow: 'auto',
            }}
          >
{`MANUTENCAO DE EQUIPAMENTOS (10100)
├── APOIO MECANICO (10101) ─── [congelado]
├── ★ MECANICA MOTOR (10130)
│   ├── DESMONTAR MOTOR (10131)
│   ├── VERIFICAR MOTOR (10132)
│   ├── REGULAR/AJUSTAR MOTOR (10133)
│   └── MONTAR MOTOR (10134)
├── ★ MECANICA TRANSMISSAO (10140)
├── ★ MECANICA FREIOS (10150)
├── ★ MECANICA DIRECAO (10160)
├── ★ MECANICA SUSPENSAO (10170)
├── ★ MECANICA ARREFECIMENTO (10180)
└── ★ MECANICA LUBRIFICACAO (10190)`}
          </Box>
          <Stack direction="row" spacing={1} sx={{ mt: 1 }} flexWrap="wrap" useFlexGap>
            <Chip label="Historico intacto" size="small" color="success" variant="outlined" sx={{ fontSize: 11 }} />
            <Chip label="Migra aos poucos" size="small" color="success" variant="outlined" sx={{ fontSize: 11 }} />
            <Chip label="Grau 4 na arvore" size="small" color="info" variant="outlined" sx={{ fontSize: 11 }} />
          </Stack>
        </Paper>

        {/* B */}
        <Paper sx={{ p: 2, mb: 1.5 }}>
          <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 0.5 }}>
            Estrategia B — "Reclassificacao Direta"
          </Typography>
          <Typography variant="body2" sx={{ fontSize: 13 }}>
            Criar subgrupos e mover servicos diretamente. Risco: relatorios historicos por grupo mudam retroativamente.
          </Typography>
          <Chip label="Risco medio-alto" size="small" color="warning" variant="outlined" sx={{ fontSize: 11, mt: 0.5 }} />
        </Paper>

        {/* C */}
        <Paper sx={{ p: 2 }}>
          <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 0.5 }}>
            Estrategia C — "Campo Auxiliar"
          </Typography>
          <Typography variant="body2" sx={{ fontSize: 13 }}>
            Criar campos AD_* em TGFPRO para classificacao paralela, sem mexer em CODGRUPOPROD. Zero impacto, mas nao aparece em relatorios Sankhya nativos.
          </Typography>
          <Chip label="Mais segura" size="small" color="info" variant="outlined" sx={{ fontSize: 11, mt: 0.5 }} />
        </Paper>
      </Section>

      {/* Modelo de Verbos */}
      <Section title="6. Modelo de Verbos — Servicos Mecanicos">
        <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1 }}>
          Taxonomia de 4 Verbos
        </Typography>
        <DataTable
          headers={['#', 'Verbo', 'Descricao', 'Exemplos']}
          rows={[
            [1, 'DESMONTAR', 'Remover, extrair, desacoplar', 'Desmontar motor, Retirar caixa'],
            [2, 'VERIFICAR', 'Inspecionar, diagnosticar, medir', 'Checar pressao, Testar alternador'],
            [3, 'REGULAR/AJUSTAR', 'Calibrar, alinhar, trocar pecas', 'Ajustar freio, Trocar pastilha'],
            [4, 'MONTAR', 'Instalar, acoplar, aplicar', 'Montar motor, Instalar filtro'],
          ]}
        />

        <Typography variant="subtitle2" fontWeight={700} sx={{ mt: 2, mb: 1 }}>
          12 Sistemas Mecanicos
        </Typography>
        <DataTable
          headers={['Sistema', 'Servicos est.', 'Componentes tipicos']}
          rows={[
            ['Motor/Powertrain', '~80', 'Bloco, cabecote, valvulas, pistoes, injecao'],
            ['Transmissao/Cambio', '~40', 'Cambio, embreagem, cardan, diferencial'],
            ['Freios', '~35', 'Pastilhas, discos, tambores, flexiveis'],
            ['Direcao', '~25', 'Caixa de direcao, terminais, barra, bomba'],
            ['Suspensao', '~30', 'Molas, amortecedores, buchas, feixes'],
            ['Arrefecimento', '~20', 'Radiador, mangueiras, valvula termostatica'],
            ['Hidraulica', '~30', 'Bombas, cilindros, mangueiras, comandos'],
            ['Pneumatica', '~15', 'Valvulas, compressor, secador'],
            ['Lubrificacao', '~20', 'Filtros, oleo motor/cambio/hidraulico'],
            ['Estrutura/Chassi', '~25', 'Chassi, longarinas, travessas'],
            ['Acessorios/Cabine', '~40', 'Bancos, vidros, portas, painel'],
            ['Lancas/Guindastes', '~50', 'Lancas, giro, patolas, cabos, polias'],
          ]}
        />

        <Alert severity="info" sx={{ mt: 1 }}>
          Recomendacao: Agrupar por sistema (12 grupos) e usar verbo como atributo do servico. Evitar 48 grupos (12 x 4).
        </Alert>
      </Section>

      {/* Plano */}
      <Section title="7. Plano de Trabalho">
        {[
          {
            fase: 'Fase 0',
            titulo: 'Limpeza de Servicos Nao Utilizados',
            icon: <TrendingUp sx={{ fontSize: 16, color: 'warning.main' }} />,
            cor: 'warning.main',
            items: [
              'Identificar os 618 servicos sem uso (tela "Nao Utilizados")',
              'Classificar: desativar (lixo) vs manter (valido)',
              'Desativar em lotes (TESTE primeiro)',
              'Grupos 90%+ sem uso → desativacao em massa',
              'Servicos administrativos em APOIO MEC → mover ou desativar',
              'Resultado: reduzir de 1.717 para ~1.100 ativos',
            ],
          },
          {
            fase: 'Fase 1',
            titulo: 'Preparacao (sem tocar banco)',
            cor: 'info.main',
            items: [
              'Mapear 452 servicos APOIO MEC por sistema + verbo',
              'Definir com gestor: sistema, verbo, ou ambos?',
              'Definir faixa de codigos (ex: 10130-10199)',
              'Validar se relatorios agrupam por CODPROD ou CODGRUPOPROD',
            ],
          },
          {
            fase: 'Fase 2',
            titulo: 'Piloto em TESTE',
            cor: 'secondary.main',
            items: [
              'Criar novos grupos em TGFGRU (TESTE)',
              'Mover servicos selecionados',
              'Verificar impacto em OS e relatorios',
              'Criar servicos padronizados (com verbo no nome)',
            ],
          },
          {
            fase: 'Fase 3',
            titulo: 'Rollout em PROD',
            cor: 'success.main',
            items: [
              'Criar grupos novos em PROD',
              'Novos servicos nos novos grupos',
              'Servicos antigos: decidir caso a caso',
              'Bloquear 10101 para novos cadastros',
            ],
          },
        ].map((f) => (
          <Paper key={f.fase} sx={{ p: 1.5, mb: 1 }}>
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.5 }}>
              <Chip label={f.fase} size="small" sx={{ fontWeight: 700, fontSize: 11, bgcolor: f.cor, color: '#fff' }} />
              <Typography variant="subtitle2" fontWeight={700} sx={{ fontSize: 14 }}>
                {f.titulo}
              </Typography>
            </Stack>
            {f.items.map((item, i) => (
              <Typography key={i} variant="body2" sx={{ fontSize: 13, pl: 1, py: 0.15 }}>
                {i + 1}. {item}
              </Typography>
            ))}
          </Paper>
        ))}
      </Section>

      {/* Riscos */}
      <Section title="8. Riscos e Mitigacoes">
        <DataTable
          headers={['Risco', 'Prob.', 'Impacto', 'Mitigacao']}
          rows={[
            ['Relatorios mudam retroativamente', 'Media', 'Alto', 'Investigar BI: CODPROD ou CODGRUPOPROD'],
            ['Telas Sankhya nao encontram servico', 'Baixa', 'Medio', 'Testar em TESTE antes'],
            ['Usuarios criam no grupo antigo', 'Alta', 'Medio', 'Bloquear 10101 (ANALITICO=N)'],
            ['Muitos grupos novos', 'Media', 'Baixo', 'Limitar a 2 niveis'],
            ['Duplicidade de servicos', 'Media', 'Medio', 'Desativacao com prazo'],
          ]}
        />
      </Section>

      {/* Perguntas */}
      <Section title="9. Perguntas para Decisao">
        {[
          'Qual o objetivo principal? Custo por sistema, por tipo de acao (verbo), ou ambos?',
          'Quais relatorios agrupam por grupo de produto? Podem ser adaptados?',
          'Servicos antigos: mover para novos grupos ou desativar + criar copias?',
          'Granularidade: "MECANICA MOTOR" vs "MECANICA MOTOR > CABECOTE"?',
          'Faixa de codigos: manter 101xx ou abrir nova faixa?',
          'Prazo: quando bloquear APOIO MECANICO (10101) para novos servicos?',
          'Outros grupos alem de mecanica tambem serao reestruturados?',
          'Servicos administrativos (DIARIA, HH DESLOCAMENTO, IMPOSTOS) devem sair de APOIO MEC?',
        ].map((q, i) => (
          <Stack key={i} direction="row" spacing={1} sx={{ py: 0.5 }}>
            <Chip label={i + 1} size="small" sx={{ minWidth: 28, fontWeight: 700, fontSize: 12 }} />
            <Typography variant="body2" sx={{ fontSize: 13 }}>{q}</Typography>
          </Stack>
        ))}
      </Section>

      {/* Anexo */}
      <Section title="Anexo: Servicos com Classificacao Duvidosa em APOIO MEC">
        <DataTable
          headers={['CODPROD', 'Descricao', 'Sugestao']}
          rows={[
            [5468, 'APERTO DE CONEXAO', 'REGULAR (fixar)'],
            [11270, 'AQUECIMENTO/ALTA TEMP EQUIPAM', 'VERIFICAR (diagnostico)'],
            [5590, 'ARRUMAR VAZAMENTO OLEO CARDAN', 'REGULAR (reparar)'],
            [12951, 'CARTUCHO GRANULADO DO FILTRO', 'Material? Nao servico'],
            [12793, 'DIARIA', 'Administrativo — mover'],
            [2132, 'ENGRAXAR E LUBRIFICAR', 'REGULAR (lubrificar)'],
            [5045, 'HH DESLOCAMENTO', 'Administrativo — mover'],
            [13288, 'IMPOSTOS', 'Nao eh servico mecanico'],
            [5044, 'KM RODADO', 'Administrativo — mover'],
            [5918, 'DIAGNOSTICO FALHAS PAINEL', 'VERIFICAR'],
          ]}
        />
      </Section>
    </Box>
  );
}
