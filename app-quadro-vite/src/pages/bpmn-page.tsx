import { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import {
  Box, Typography, Stack, IconButton, Tooltip, Paper, alpha,
  ToggleButtonGroup, ToggleButton, Chip, Divider,
} from '@mui/material';
import {
  ZoomIn, ZoomOut, CenterFocusStrong, Fullscreen, FullscreenExit,
  LocalShipping, Build, Storefront, Security, CalendarMonth,
  PrecisionManufacturing, Engineering, Inventory,
} from '@mui/icons-material';
import mermaid from 'mermaid';

// ═══════════════════════════════════════════════════════════════
// BPMN DIAGRAMS — Processos Operacionais Gigantao
// ═══════════════════════════════════════════════════════════════

const DIAGRAMS: Record<string, { title: string; description: string; icon: React.ElementType; color: string; diagram: string }> = {

  // ── 1. CICLO COMPLETO DO VEICULO ──
  ciclo: {
    title: 'Ciclo Completo do Veiculo',
    description: 'Fluxo completo desde a chegada do veiculo ate a proxima mobilizacao',
    icon: LocalShipping,
    color: '#00838f',
    diagram: `
flowchart TD
  START(("INICIO")):::start --> A

  subgraph CHEGADA["🚛 CHEGADA / LOGISTICA"]
    direction TB
    A["Veiculo chega\\nao patio"] --> B["Registrar chegada\\nno sistema"]
    B --> C["Checklist de\\noportunidade"]
    C --> D{"Impeditivos\\nencontrados?"}
  end

  subgraph MANUTENCAO["⚙️ MANUTENCAO"]
    direction TB
    D -->|"Sim"| E["Abrir OS\\nManutencao"]
    E --> F["Avaliar\\nproblema"]
    F --> G{"Precisa\\npeca?"}
    G -->|"Sim"| H["Solicitar peca\\n(Compras)"]
    H --> I["Aguardar\\npeca"]
    I --> J["Executar\\nreparo"]
    G -->|"Nao"| J
    J --> K["Testar e\\nvalidar"]
    K --> L{"Aprovado?"}
    L -->|"Nao"| F
    L -->|"Sim"| M["Fechar OS\\nManutencao"]
  end

  subgraph DISPONIVEL["✅ DISPONIBILIDADE"]
    direction TB
    D -->|"Nao"| N["Marcar como\\nDISPONIVEL"]
    M --> N
  end

  subgraph COMERCIAL["💼 COMERCIAL"]
    direction TB
    N --> O["Alocar para\\ncontrato/cliente"]
    O --> P["Emitir OS\\nComercial"]
    P --> Q["Definir operador\\ne acessorios"]
  end

  subgraph SEGURANCA["🛡️ SEGURANCA"]
    direction TB
    Q --> R["Separar materiais\\nda OS"]
    R --> S["Inspecao de\\nseguranca"]
    S --> T{"Conforme?"}
    T -->|"Nao"| U["Corrigir\\nnao-conformidade"]
    U --> S
    T -->|"Sim"| V["Liberar para\\ncarregamento"]
  end

  subgraph PROGRAMACAO["📋 PROGRAMACAO"]
    direction TB
    V --> W["Definir rota\\ne data"]
    W --> X["Confirmar\\nlogistica"]
  end

  subgraph OPERACAO["🏗️ OPERACAO"]
    direction TB
    X --> Y["Mobilizar\\npara cliente"]
    Y --> Z["Executar\\nservico"]
    Z --> AA{"Prazo\\nexpirado?"}
    AA -->|"Nao"| Z
    AA -->|"Sim"| AB{"Renovar\\ncontrato?"}
    AB -->|"Sim"| Z
    AB -->|"Nao"| AC["Desmobilizar"]
  end

  AC --> A

  classDef start fill:#4caf50,stroke:#2e7d32,color:#fff,stroke-width:2px
  classDef default fill:#f5f5f5,stroke:#bdbdbd,color:#212121,rx:8,ry:8

  style CHEGADA fill:#e0f7fa,stroke:#00838f,stroke-width:2px,rx:12,ry:12
  style MANUTENCAO fill:#fff3e0,stroke:#ff9800,stroke-width:2px,rx:12,ry:12
  style DISPONIVEL fill:#e8f5e9,stroke:#4caf50,stroke-width:2px,rx:12,ry:12
  style COMERCIAL fill:#ffebee,stroke:#c62828,stroke-width:2px,rx:12,ry:12
  style SEGURANCA fill:#f3e5f5,stroke:#6a1b9a,stroke-width:2px,rx:12,ry:12
  style PROGRAMACAO fill:#e1f5fe,stroke:#0277bd,stroke-width:2px,rx:12,ry:12
  style OPERACAO fill:#e0f7fa,stroke:#00bcd4,stroke-width:2px,rx:12,ry:12
`,
  },

  // ── 2. PROCESSO DE MANUTENCAO ──
  manutencao: {
    title: 'Processo de Manutencao',
    description: 'Fluxo detalhado da abertura ao fechamento de uma OS de manutencao',
    icon: Build,
    color: '#ff9800',
    diagram: `
flowchart TD
  START(("OS\\nAberta")):::start --> A

  subgraph TRIAGEM["📋 TRIAGEM"]
    A["Receber\\nveiculo"] --> B["Avaliar\\ntipo de servico"]
    B --> C{"Tipo?"}
  end

  subgraph PREVENTIVA["🔄 PREVENTIVA"]
    C -->|"Preventiva"| D["Consultar plano\\npreventivo"]
    D --> E["Listar servicos\\nprogramados"]
    E --> F["Alocar\\nmecanicos"]
  end

  subgraph CORRETIVA["🔧 CORRETIVA"]
    C -->|"Corretiva"| G["Diagnosticar\\nproblema"]
    G --> H["Orcamento\\nde pecas"]
    H --> I{"Peca em\\nestoque?"}
    I -->|"Sim"| J["Reservar\\npeca"]
    I -->|"Nao"| K["Requisicao\\nde compra"]
    K --> L["Aguardar\\nfornecedor"]
    L --> J
    J --> F
  end

  subgraph EXECUCAO["⚡ EXECUCAO"]
    F --> M["Iniciar\\nservico"]
    M --> N["Registrar\\napontamentos"]
    N --> O["Registrar\\npecas utilizadas"]
    O --> P["Finalizar\\nservico"]
  end

  subgraph QUALIDADE["✅ QUALIDADE"]
    P --> Q["Teste de\\nqualidade"]
    Q --> R{"Aprovado?"}
    R -->|"Nao"| S["Retrabalho"]
    S --> M
    R -->|"Sim"| T["Fechar OS"]
  end

  T --> FIM(("DISPONIVEL")):::fim

  classDef start fill:#ff9800,stroke:#e65100,color:#fff,stroke-width:2px
  classDef fim fill:#4caf50,stroke:#2e7d32,color:#fff,stroke-width:2px

  style TRIAGEM fill:#fff8e1,stroke:#ffc107,stroke-width:2px,rx:12,ry:12
  style PREVENTIVA fill:#e3f2fd,stroke:#1976d2,stroke-width:2px,rx:12,ry:12
  style CORRETIVA fill:#fff3e0,stroke:#ff9800,stroke-width:2px,rx:12,ry:12
  style EXECUCAO fill:#fce4ec,stroke:#e91e63,stroke-width:2px,rx:12,ry:12
  style QUALIDADE fill:#e8f5e9,stroke:#4caf50,stroke-width:2px,rx:12,ry:12
`,
  },

  // ── 3. PROCESSO COMERCIAL ──
  comercial: {
    title: 'Processo Comercial',
    description: 'Fluxo da demanda do cliente ate a mobilizacao do equipamento',
    icon: Storefront,
    color: '#c62828',
    diagram: `
flowchart TD
  START(("DEMANDA\\nCLIENTE")):::start --> A

  subgraph PROSPECCAO["📞 PROSPECCAO"]
    A["Receber\\nsolicitacao"] --> B["Identificar\\nnecessidade"]
    B --> C["Verificar\\ndisponibilidade"]
    C --> D{"Equipamento\\ndisponivel?"}
  end

  subgraph PROPOSTA["📄 PROPOSTA"]
    D -->|"Sim"| E["Elaborar\\nproposta"]
    D -->|"Nao"| F["Informar prazo\\nou alternativa"]
    F --> E
    E --> G["Enviar ao\\ncliente"]
    G --> H{"Aprovada?"}
    H -->|"Nao"| I["Negociar\\ncondicoes"]
    I --> E
  end

  subgraph CONTRATO["📝 CONTRATO"]
    H -->|"Sim"| J["Emitir\\nOS Comercial"]
    J --> K["Definir operador\\ne periodo"]
    K --> L["Vincular\\nequipamento"]
    L --> M["Definir\\nacessorios"]
  end

  subgraph MOBILIZACAO["🚛 MOBILIZACAO"]
    M --> N["Checklist\\nde saida"]
    N --> O["Separacao de\\nmateriais"]
    O --> P["Definir rota\\ne transporte"]
    P --> Q["Mobilizar para\\no cliente"]
  end

  subgraph ATENDIMENTO["🏗️ ATENDIMENTO"]
    Q --> R["Equipamento\\nem operacao"]
    R --> S["Acompanhar\\nexecucao"]
    S --> T{"Periodo\\nencerrado?"}
    T -->|"Nao"| S
    T -->|"Sim"| U{"Renovar?"}
    U -->|"Sim"| K
  end

  U -->|"Nao"| V["Desmobilizar"] --> FIM(("RETORNO\\nAO PATIO")):::fim

  classDef start fill:#c62828,stroke:#b71c1c,color:#fff,stroke-width:2px
  classDef fim fill:#00838f,stroke:#006064,color:#fff,stroke-width:2px

  style PROSPECCAO fill:#ffebee,stroke:#c62828,stroke-width:2px,rx:12,ry:12
  style PROPOSTA fill:#fce4ec,stroke:#e91e63,stroke-width:2px,rx:12,ry:12
  style CONTRATO fill:#fff3e0,stroke:#ff9800,stroke-width:2px,rx:12,ry:12
  style MOBILIZACAO fill:#e0f7fa,stroke:#00838f,stroke-width:2px,rx:12,ry:12
  style ATENDIMENTO fill:#e8f5e9,stroke:#4caf50,stroke-width:2px,rx:12,ry:12
`,
  },

  // ── 4. CHAMADOS INTERNOS ──
  chamados: {
    title: 'Chamados Internos',
    description: 'Fluxo de abertura, atribuicao e resolucao de chamados',
    icon: Engineering,
    color: '#1565c0',
    diagram: `
flowchart TD
  START(("CHAMADO\\nABERTO")):::start --> A

  subgraph ABERTURA["📬 ABERTURA"]
    A["Solicitante\\nregistra chamado"] --> B["Definir tipo\\ne prioridade"]
    B --> C["Descrever\\nproblema"]
    C --> D["Anexar\\nevidencias"]
  end

  subgraph TRIAGEM["📋 TRIAGEM"]
    D --> E["Gestor recebe\\nnotificacao"]
    E --> F["Avaliar\\nprioridade"]
    F --> G["Atribuir\\nresponsavel"]
  end

  subgraph EXECUCAO["⚡ EXECUCAO"]
    G --> H["Responsavel\\nanalisa"]
    H --> I{"Precisa de\\ninformacao?"}
    I -->|"Sim"| J["Solicitar ao\\nsolicitante"]
    J --> K["Aguardar\\nresposta"]
    K --> H
    I -->|"Nao"| L["Executar\\nsolucao"]
    L --> M["Registrar\\nsolucao"]
  end

  subgraph ENCERRAMENTO["✅ ENCERRAMENTO"]
    M --> N["Notificar\\nsolicitante"]
    N --> O{"Solicitante\\naprova?"}
    O -->|"Nao"| P["Reabrir\\nchamado"]
    P --> H
    O -->|"Sim"| Q["Fechar\\nchamado"]
  end

  Q --> FIM(("RESOLVIDO")):::fim

  classDef start fill:#1565c0,stroke:#0d47a1,color:#fff,stroke-width:2px
  classDef fim fill:#4caf50,stroke:#2e7d32,color:#fff,stroke-width:2px

  style ABERTURA fill:#e3f2fd,stroke:#1565c0,stroke-width:2px,rx:12,ry:12
  style TRIAGEM fill:#fff8e1,stroke:#ffc107,stroke-width:2px,rx:12,ry:12
  style EXECUCAO fill:#fff3e0,stroke:#ff9800,stroke-width:2px,rx:12,ry:12
  style ENCERRAMENTO fill:#e8f5e9,stroke:#4caf50,stroke-width:2px,rx:12,ry:12
`,
  },

  // ── 5. COMPRAS / REQUISICOES ──
  compras: {
    title: 'Requisicoes de Compras',
    description: 'Fluxo de requisicao, aprovacao e recebimento de materiais',
    icon: Inventory,
    color: '#f57f17',
    diagram: `
flowchart TD
  START(("NECESSIDADE")):::start --> A

  subgraph REQUISICAO["📝 REQUISICAO"]
    A["Identificar\\nnecessidade"] --> B["Criar requisicao\\nno Sankhya"]
    B --> C["Detalhar itens\\ne quantidades"]
    C --> D["Vincular a OS\\n(se aplicavel)"]
  end

  subgraph APROVACAO["✅ APROVACAO"]
    D --> E["Enviar para\\naprovacao"]
    E --> F{"Gestor\\naprova?"}
    F -->|"Nao"| G["Devolver com\\njustificativa"]
    G --> C
    F -->|"Sim"| H["Requisicao\\naprovada"]
  end

  subgraph COTACAO["💰 COTACAO"]
    H --> I["Compras recebe"]
    I --> J["Cotar com\\nfornecedores"]
    J --> K["Comparar\\npropostas"]
    K --> L["Selecionar\\nfornecedor"]
  end

  subgraph PEDIDO["📦 PEDIDO"]
    L --> M["Emitir pedido\\nde compra"]
    M --> N["Acompanhar\\nentrega"]
    N --> O{"Recebido?"}
    O -->|"Nao"| P["Cobrar\\nfornecedor"]
    P --> N
  end

  subgraph RECEBIMENTO["📥 RECEBIMENTO"]
    O -->|"Sim"| Q["Conferir\\nmaterial"]
    Q --> R{"Conforme?"}
    R -->|"Nao"| S["Devolver ao\\nfornecedor"]
    S --> N
    R -->|"Sim"| T["Dar entrada\\nno estoque"]
    T --> U["Disponibilizar\\npara OS"]
  end

  U --> FIM(("CONCLUIDO")):::fim

  classDef start fill:#f57f17,stroke:#e65100,color:#fff,stroke-width:2px
  classDef fim fill:#4caf50,stroke:#2e7d32,color:#fff,stroke-width:2px

  style REQUISICAO fill:#fffde7,stroke:#f57f17,stroke-width:2px,rx:12,ry:12
  style APROVACAO fill:#e8f5e9,stroke:#4caf50,stroke-width:2px,rx:12,ry:12
  style COTACAO fill:#fff3e0,stroke:#ff9800,stroke-width:2px,rx:12,ry:12
  style PEDIDO fill:#e3f2fd,stroke:#1976d2,stroke-width:2px,rx:12,ry:12
  style RECEBIMENTO fill:#f3e5f5,stroke:#7b1fa2,stroke-width:2px,rx:12,ry:12
`,
  },

  // ── 6. SEGURANCA DO TRABALHO ──
  seguranca: {
    title: 'Seguranca do Trabalho',
    description: 'Fluxo de inspecao, conformidade e liberacao de equipamentos',
    icon: Security,
    color: '#6a1b9a',
    diagram: `
flowchart TD
  START(("EQUIPAMENTO\\nPARA SAIR")):::start --> A

  subgraph CHECKLIST["📋 CHECKLIST DE SAIDA"]
    A["Receber OS\\ncom acessorios"] --> B["Verificar\\ndocumentacao"]
    B --> C["Inspecionar\\nequipamento"]
    C --> D["Verificar EPI\\ndo operador"]
    D --> E["Checar\\nacessorios"]
  end

  subgraph CONFORMIDADE["✅ CONFORMIDADE"]
    E --> F{"Tudo\\nconforme?"}
    F -->|"Nao"| G["Registrar\\nnao-conformidade"]
    G --> H{"Impeditivo?"}
    H -->|"Sim"| I["Bloquear\\nsaida"]
    I --> J["Notificar\\nmanutencao"]
    J --> K["Aguardar\\ncorrecao"]
    K --> C
    H -->|"Nao"| L["Registrar\\nobservacao"]
    L --> M["Liberar com\\nressalva"]
  end

  subgraph LIBERACAO["🚛 LIBERACAO"]
    F -->|"Sim"| N["Assinar\\nliberacao"]
    M --> N
    N --> O["Registrar\\nno sistema"]
    O --> P["Liberar\\ncarregamento"]
  end

  P --> FIM(("EQUIPAMENTO\\nLIBERADO")):::fim

  classDef start fill:#6a1b9a,stroke:#4a148c,color:#fff,stroke-width:2px
  classDef fim fill:#4caf50,stroke:#2e7d32,color:#fff,stroke-width:2px

  style CHECKLIST fill:#f3e5f5,stroke:#6a1b9a,stroke-width:2px,rx:12,ry:12
  style CONFORMIDADE fill:#fff8e1,stroke:#ffc107,stroke-width:2px,rx:12,ry:12
  style LIBERACAO fill:#e8f5e9,stroke:#4caf50,stroke-width:2px,rx:12,ry:12
`,
  },

  // ── 7. PROGRAMACAO / LOGISTICA ──
  programacao: {
    title: 'Programacao e Logistica',
    description: 'Fluxo de agendamento, roteirizacao e mobilizacao',
    icon: CalendarMonth,
    color: '#0277bd',
    diagram: `
flowchart TD
  START(("OS COMERCIAL\\nAPROVADA")):::start --> A

  subgraph PLANEJAMENTO["📋 PLANEJAMENTO"]
    A["Receber OS\\ncomercial"] --> B["Verificar\\nrecursos"]
    B --> C["Definir\\ndata/hora"]
    C --> D["Selecionar\\noperador"]
    D --> E["Definir\\nveiculo de transporte"]
  end

  subgraph ROTEIRIZACAO["🗺️ ROTEIRIZACAO"]
    E --> F["Calcular\\nrota"]
    F --> G["Estimar\\ntempo de viagem"]
    G --> H["Verificar\\nrestricoes"]
    H --> I{"Viavel?"}
    I -->|"Nao"| J["Ajustar\\ndata/rota"]
    J --> C
  end

  subgraph MOBILIZACAO["🚛 MOBILIZACAO"]
    I -->|"Sim"| K["Confirmar\\nagendamento"]
    K --> L["Notificar\\noperador"]
    L --> M["Notificar\\ncliente"]
    M --> N["Carregar\\nequipamento"]
    N --> O["Iniciar\\ntransporte"]
  end

  subgraph ENTREGA["📍 ENTREGA"]
    O --> P["Chegar ao\\ncliente"]
    P --> Q["Descarregar\\ne posicionar"]
    Q --> R["Confirmar\\nentrega"]
    R --> S["Iniciar\\noperacao"]
  end

  S --> FIM(("EM\\nOPERACAO")):::fim

  classDef start fill:#0277bd,stroke:#01579b,color:#fff,stroke-width:2px
  classDef fim fill:#00bcd4,stroke:#006064,color:#fff,stroke-width:2px

  style PLANEJAMENTO fill:#e1f5fe,stroke:#0277bd,stroke-width:2px,rx:12,ry:12
  style ROTEIRIZACAO fill:#fff3e0,stroke:#ff9800,stroke-width:2px,rx:12,ry:12
  style MOBILIZACAO fill:#e0f7fa,stroke:#00838f,stroke-width:2px,rx:12,ry:12
  style ENTREGA fill:#e8f5e9,stroke:#4caf50,stroke-width:2px,rx:12,ry:12
`,
  },
};

// ═══════════════════════════════════════════════════════════════
// BPMN VIEWER COMPONENT
// ═══════════════════════════════════════════════════════════════

function BpmnViewer({ diagram, id }: { diagram: string; id: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [svgContent, setSvgContent] = useState<string>('');
  const [zoom, setZoom] = useState(100);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0, panX: 0, panY: 0 });
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    mermaid.initialize({
      startOnLoad: false,
      theme: 'default',
      securityLevel: 'loose',
      flowchart: {
        curve: 'basis',
        padding: 20,
        htmlLabels: true,
        useMaxWidth: false,
        nodeSpacing: 30,
        rankSpacing: 50,
      },
    });
    mermaid.render(`bpmn-${id}`, diagram).then(({ svg }) => setSvgContent(svg)).catch(console.error);
  }, [diagram, id]);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    setZoom((z) => Math.max(30, Math.min(300, z + (e.deltaY > 0 ? -10 : 10))));
  }, []);

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    setDragging(true);
    dragStart.current = { x: e.clientX, y: e.clientY, panX: pan.x, panY: pan.y };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  }, [pan]);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!dragging) return;
    setPan({
      x: dragStart.current.panX + (e.clientX - dragStart.current.x),
      y: dragStart.current.panY + (e.clientY - dragStart.current.y),
    });
  }, [dragging]);

  const handlePointerUp = useCallback(() => setDragging(false), []);

  const reset = useCallback(() => { setZoom(100); setPan({ x: 0, y: 0 }); }, []);

  const toggleFullscreen = useCallback(() => {
    if (!containerRef.current) return;
    if (document.fullscreenElement) {
      document.exitFullscreen();
      setIsFullscreen(false);
    } else {
      containerRef.current.requestFullscreen();
      setIsFullscreen(true);
    }
  }, []);

  return (
    <Box ref={containerRef} sx={{
      flex: 1, display: 'flex', flexDirection: 'column',
      bgcolor: 'background.paper', borderRadius: 2, overflow: 'hidden',
      border: '1px solid', borderColor: 'divider',
    }}>
      {/* Toolbar */}
      <Stack direction="row" alignItems="center" spacing={0.5} sx={{ px: 1.5, py: 0.75, borderBottom: '1px solid', borderColor: 'divider' }}>
        <Tooltip title="Diminuir"><IconButton size="small" onClick={() => setZoom((z) => Math.max(30, z - 10))}><ZoomOut fontSize="small" /></IconButton></Tooltip>
        <Typography sx={{ fontSize: 11, fontWeight: 600, minWidth: 40, textAlign: 'center' }}>{zoom}%</Typography>
        <Tooltip title="Aumentar"><IconButton size="small" onClick={() => setZoom((z) => Math.min(300, z + 10))}><ZoomIn fontSize="small" /></IconButton></Tooltip>
        <Tooltip title="Resetar"><IconButton size="small" onClick={reset}><CenterFocusStrong fontSize="small" /></IconButton></Tooltip>
        <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />
        <Tooltip title={isFullscreen ? 'Sair do fullscreen' : 'Fullscreen'}>
          <IconButton size="small" onClick={toggleFullscreen}>
            {isFullscreen ? <FullscreenExit fontSize="small" /> : <Fullscreen fontSize="small" />}
          </IconButton>
        </Tooltip>
        <Box sx={{ flex: 1 }} />
        <Typography sx={{ fontSize: 10, color: 'text.disabled' }}>Arraste para mover | Scroll para zoom</Typography>
      </Stack>

      {/* Diagram */}
      <Box
        onWheel={handleWheel}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        sx={{
          flex: 1, overflow: 'hidden', cursor: dragging ? 'grabbing' : 'grab',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          bgcolor: (t) => t.palette.mode === 'dark' ? '#1a1a2e' : '#fafafa',
          touchAction: 'none',
        }}
      >
        {svgContent ? (
          <Box
            dangerouslySetInnerHTML={{ __html: svgContent }}
            sx={{
              transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom / 100})`,
              transformOrigin: 'center center',
              transition: dragging ? 'none' : 'transform 0.1s ease-out',
              '& svg': { maxWidth: 'none', maxHeight: 'none' },
            }}
          />
        ) : (
          <Typography sx={{ color: 'text.disabled' }}>Carregando diagrama...</Typography>
        )}
      </Box>
    </Box>
  );
}

// ═══════════════════════════════════════════════════════════════
// PAGE
// ═══════════════════════════════════════════════════════════════

export function BpmnPage() {
  const [selected, setSelected] = useState('ciclo');
  const current = DIAGRAMS[selected];

  const diagramKeys = useMemo(() => Object.keys(DIAGRAMS), []);

  return (
    <Box sx={{ display: 'flex', flex: 1, minHeight: 0, overflow: 'hidden' }}>
      {/* Sidebar */}
      <Box sx={{
        width: 260, flexShrink: 0, borderRight: '1px solid', borderColor: 'divider',
        overflowY: 'auto', bgcolor: 'background.paper',
      }}>
        <Box sx={{ px: 2, py: 1.5, borderBottom: '1px solid', borderColor: 'divider' }}>
          <Typography sx={{ fontSize: 14, fontWeight: 800, letterSpacing: 1, textTransform: 'uppercase' }}>
            Processos BPMN
          </Typography>
          <Typography sx={{ fontSize: 11, color: 'text.secondary', mt: 0.5 }}>
            {diagramKeys.length} processos mapeados
          </Typography>
        </Box>

        <Stack spacing={0.5} sx={{ p: 1 }}>
          {diagramKeys.map((key) => {
            const d = DIAGRAMS[key];
            const Icon = d.icon;
            const active = selected === key;
            return (
              <Paper
                key={key}
                onClick={() => setSelected(key)}
                elevation={0}
                sx={{
                  p: 1.5, cursor: 'pointer', borderRadius: 1.5,
                  border: '1px solid',
                  borderColor: active ? d.color : 'transparent',
                  bgcolor: active ? alpha(d.color, 0.08) : 'transparent',
                  transition: 'all 0.15s',
                  '&:hover': active ? {} : { bgcolor: 'action.hover', borderColor: 'divider' },
                }}
              >
                <Stack direction="row" alignItems="center" spacing={1}>
                  <Box sx={{
                    width: 32, height: 32, borderRadius: '50%',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    bgcolor: alpha(d.color, active ? 0.15 : 0.08),
                  }}>
                    <Icon sx={{ fontSize: 18, color: d.color }} />
                  </Box>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography sx={{ fontSize: 12, fontWeight: 700, color: active ? d.color : 'text.primary' }} noWrap>
                      {d.title}
                    </Typography>
                    <Typography sx={{ fontSize: 10, color: 'text.secondary', lineHeight: 1.3 }} noWrap>
                      {d.description}
                    </Typography>
                  </Box>
                </Stack>
              </Paper>
            );
          })}
        </Stack>
      </Box>

      {/* Main */}
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, p: 1.5 }}>
        {/* Header */}
        <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 1.5 }}>
          {(() => { const Icon = current.icon; return (
            <Box sx={{ width: 40, height: 40, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: alpha(current.color, 0.1) }}>
              <Icon sx={{ fontSize: 22, color: current.color }} />
            </Box>
          ); })()}
          <Box>
            <Typography sx={{ fontSize: 18, fontWeight: 700 }}>{current.title}</Typography>
            <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>{current.description}</Typography>
          </Box>
        </Stack>

        {/* Viewer */}
        <BpmnViewer diagram={current.diagram} id={selected} />
      </Box>
    </Box>
  );
}
