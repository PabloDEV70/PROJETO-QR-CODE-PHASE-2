interface CategoryMeta {
  label: string;
  color: string;
  description: string;
  tips: string;
}

const CATEGORY_META: Record<string, CategoryMeta> = {
  wrenchTime: {
    label: 'Wrench Time', color: '#16A34A',
    description: 'Tempo real com ferramenta na mao', tips: 'Meta: >50% do tempo total',
  },
  desloc: {
    label: 'Deslocamento', color: '#3B82F6',
    description: 'Translado entre locais de trabalho',
    tips: 'Otimizar rotas e planejar sequencia de servicos proximos',
  },
  espera: {
    label: 'Espera', color: '#F59E0B',
    description: 'Aguardando pecas, decisoes ou terceiros',
    tips: 'Melhorar planejamento de pecas e pre-aprovar servicos',
  },
  buro: {
    label: 'Burocracia', color: '#8B5CF6',
    description: 'Abertura de OS e alinhamentos',
    tips: 'Digitalizar processos e reduzir etapas de aprovacao',
  },
  trein: {
    label: 'Treinamento/Seguranca', color: '#06B6D4',
    description: 'DDS, treinamentos, 5S e EPIs',
    tips: 'Manter DDS objetivo (<15min) e treinamentos programados',
  },
  pausas: {
    label: 'Pausas/Pessoal', color: '#64748B',
    description: 'Almoco, lanche, banheiro e necessidades pessoais',
    tips: 'Pausas sao necessarias — monitorar apenas excessos',
  },
  externos: {
    label: 'Externos/Clima', color: '#EF4444',
    description: 'Condicoes climaticas e emergencias',
    tips: 'Planejar atividades internas para dias de chuva',
  },
};

const FALLBACK_META: CategoryMeta = {
  label: 'Outros', color: '#9CA3AF',
  description: 'Categoria nao mapeada', tips: '',
};

export function getCategoryMeta(cat: string): CategoryMeta {
  return CATEGORY_META[cat] ?? FALLBACK_META;
}
