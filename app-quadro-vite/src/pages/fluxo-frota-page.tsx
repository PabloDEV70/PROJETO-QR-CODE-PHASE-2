import { useEffect, useState, useId, useRef, useCallback } from 'react';
import { Box, Typography, Stack, IconButton, Tooltip } from '@mui/material';
import { ArrowBack, ZoomIn, ZoomOut, CenterFocusStrong } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import mermaid from 'mermaid';

const DIAGRAM = `
flowchart TD
  subgraph OPERADOR["🔧 OPERADOR"]
    A["Necessidade de\\nequipamento alocado"] --> B{"Atendimento\\nexpirado?"}
    B -->|Sim| D["PRC - Programacao"]
    B -->|Nao| C{"Aumentar\\ntempo?"}
    C -->|Sim| A
    C -->|Nao| E["Prosseguir\\ncom atividade"]
    E --> D
    Z["Realizar o\\natendimento"] --> ZZ{"Prazo\\nexpirado?"}
    ZZ -->|Sim| B
    ZZ -->|Nao| Z
  end

  subgraph LOGISTICA["🚛 LOGISTICA"]
    D --> F["Desmobilizar\\nequipamento"]
    F --> G["Chegar ao\\npatio Gigantao"]
    G --> H["Checklist por\\noportunidade"]
    H --> I{"Apontamento\\nimpeditivo?"}
    I -->|Nao| K["Equipamento\\nDISPONIVEL"]
    R["Mobilizar equipamento\\npara o cliente"] --> Z
  end

  subgraph MANUTENCAO["⚙️ MANUTENCAO"]
    I -->|Sim| J["Solucionar\\napontamentos"]
    J --> K2["Retornar ao patio\\ncomo disponivel"]
    K2 --> K
  end

  subgraph COMERCIAL["💼 COMERCIAL"]
    K --> L["Inserir em O.S\\nde outro cliente"]
    L --> M["Checklist\\nde saida"]
    M --> N["Inserir operadores\\ne acessorios na O.S"]
  end

  subgraph SEGURANCA["🛡️ SEGURANCA"]
    N --> O["Separacao dos\\nmateriais da O.S"]
    O --> P["Carregamento\\ndos materiais"]
  end

  subgraph PROGRAMACAO["📋 PROGRAMACAO"]
    P --> Q["Definir rota\\ne programacao"]
    Q --> R
  end

  style OPERADOR fill:#e0f7fa,stroke:#00838f,stroke-width:2px,color:#006064
  style LOGISTICA fill:#e8f5e9,stroke:#2e7d32,stroke-width:2px,color:#1b5e20
  style MANUTENCAO fill:#fff3e0,stroke:#f57c00,stroke-width:2px,color:#e65100
  style COMERCIAL fill:#e3f2fd,stroke:#1565c0,stroke-width:2px,color:#0d47a1
  style SEGURANCA fill:#fce4ec,stroke:#c62828,stroke-width:2px,color:#b71c1c
  style PROGRAMACAO fill:#f3e5f5,stroke:#7b1fa2,stroke-width:2px,color:#4a148c

  style A fill:#fff,stroke:#00838f,stroke-width:2px
  style K fill:#c8e6c9,stroke:#2e7d32,stroke-width:3px,color:#1b5e20
  style Z fill:#bbdefb,stroke:#1565c0,stroke-width:2px
`;

mermaid.initialize({
  startOnLoad: false,
  theme: 'base',
  themeVariables: {
    primaryColor: '#e8f5e9',
    primaryTextColor: '#1a1a1a',
    primaryBorderColor: '#2e7d32',
    lineColor: '#616161',
    fontSize: '13px',
    fontFamily: 'Inter, Roboto, sans-serif',
  },
  flowchart: {
    htmlLabels: true,
    curve: 'basis',
    nodeSpacing: 30,
    rankSpacing: 40,
    padding: 12,
  },
});

let svgCache: string | null = null;

export function FluxoFrotaPage() {
  const navigate = useNavigate();
  const reactId = useId().replace(/:/g, '');
  const [svgHtml, setSvgHtml] = useState<string>(svgCache ?? '');
  const [zoom, setZoom] = useState(120);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const isDragging = useRef(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const panStart = useRef({ x: 0, y: 0 });
  const viewportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (svgCache) { setSvgHtml(svgCache); return; }
    const id = `mmd-${reactId}-${Date.now()}`;
    mermaid.render(id, DIAGRAM).then(({ svg }) => {
      svgCache = svg;
      setSvgHtml(svg);
    }).catch((err) => {
      console.error('Mermaid render error:', err);
    });
  }, [reactId]);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -10 : 10;
    setZoom((z) => Math.max(30, Math.min(400, z + delta)));
  }, []);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button !== 0) return;
    isDragging.current = true;
    dragStart.current = { x: e.clientX, y: e.clientY };
    panStart.current = { ...pan };
    document.body.style.cursor = 'grabbing';
    document.body.style.userSelect = 'none';
  }, [pan]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging.current) return;
    setPan({
      x: panStart.current.x + (e.clientX - dragStart.current.x),
      y: panStart.current.y + (e.clientY - dragStart.current.y),
    });
  }, []);

  const handleMouseUp = useCallback(() => {
    isDragging.current = false;
    document.body.style.cursor = '';
    document.body.style.userSelect = '';
  }, []);

  const handleReset = useCallback(() => {
    setZoom(120);
    setPan({ x: 0, y: 0 });
  }, []);

  return (
    <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* Header */}
      <Stack direction="row" alignItems="center" spacing={1.5} sx={{ px: 3, py: 1.5, borderBottom: '1px solid', borderColor: 'divider', bgcolor: 'background.paper' }}>
        <Tooltip title="Voltar">
          <IconButton size="small" onClick={() => navigate(-1)}><ArrowBack /></IconButton>
        </Tooltip>
        <Box sx={{ flex: 1 }}>
          <Typography sx={{ fontSize: 16, fontWeight: 700 }}>Fluxo da Frota</Typography>
          <Typography sx={{ fontSize: 11, color: 'text.secondary' }}>
            Ciclo de vida do veiculo — BPMN baseado no processo da Gigantao (v1.0, yara.souza)
          </Typography>
        </Box>
        <Stack direction="row" spacing={0.5} alignItems="center">
          <Tooltip title="Diminuir (ou scroll down)">
            <IconButton size="small" onClick={() => setZoom((z) => Math.max(30, z - 15))}><ZoomOut fontSize="small" /></IconButton>
          </Tooltip>
          <Typography sx={{ fontSize: 11, fontWeight: 600, minWidth: 40, textAlign: 'center' }}>{zoom}%</Typography>
          <Tooltip title="Aumentar (ou scroll up)">
            <IconButton size="small" onClick={() => setZoom((z) => Math.min(400, z + 15))}><ZoomIn fontSize="small" /></IconButton>
          </Tooltip>
          <Tooltip title="Resetar zoom e posicao">
            <IconButton size="small" onClick={handleReset}><CenterFocusStrong fontSize="small" /></IconButton>
          </Tooltip>
        </Stack>
      </Stack>

      {/* Diagram viewport — pan with drag, zoom with scroll */}
      <Box
        ref={viewportRef}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        sx={{
          flex: 1, overflow: 'hidden', bgcolor: 'background.default',
          cursor: isDragging.current ? 'grabbing' : 'grab',
          position: 'relative',
        }}
      >
        {svgHtml ? (
          <Box dangerouslySetInnerHTML={{ __html: svgHtml }} sx={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom / 100})`,
            transformOrigin: 'top left',
            '& svg': { display: 'block' },
          }} />
        ) : (
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
            <Typography sx={{ color: 'text.disabled' }}>Carregando diagrama...</Typography>
          </Box>
        )}
      </Box>

      {/* Legend */}
      <Stack direction="row" spacing={3} sx={{ px: 3, py: 1, borderTop: '1px solid', borderColor: 'divider', bgcolor: 'background.paper' }}>
        <LegendItem color="#00838f" label="Operador" />
        <LegendItem color="#2e7d32" label="Logistica" />
        <LegendItem color="#f57c00" label="Manutencao" />
        <LegendItem color="#1565c0" label="Comercial" />
        <LegendItem color="#c62828" label="Seguranca" />
        <LegendItem color="#7b1fa2" label="Programacao" />
        <Box sx={{ flex: 1 }} />
        <Typography sx={{ fontSize: 10, color: 'text.disabled' }}>Fonte: BPMN Bizagi Modeler — 20/03/2026</Typography>
      </Stack>
    </Box>
  );
}

function LegendItem({ color, label }: { color: string; label: string }) {
  return (
    <Stack direction="row" spacing={0.5} alignItems="center">
      <Box sx={{ width: 12, height: 12, borderRadius: 0.5, bgcolor: color, flexShrink: 0 }} />
      <Typography sx={{ fontSize: 11, fontWeight: 600 }}>{label}</Typography>
    </Stack>
  );
}
