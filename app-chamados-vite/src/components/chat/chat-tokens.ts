// WhatsApp-inspired color tokens for chat view
// Supports both light and dark themes

export const chatColors = {
  light: {
    // Sidebar / list
    sidebarBg: '#fff',
    sidebarHeaderBg: '#f0f2f5',
    searchBg: '#f0f2f5',
    searchInputBg: '#fff',
    listItemHover: '#f5f6f6',
    listItemSelected: '#f0f2f5',
    listDivider: '#e9edef',
    // Text
    textPrimary: '#111b21',
    textSecondary: '#667781',
    textMuted: '#8696a0',
    // Accent
    accent: '#00a884',
    accentHover: '#008069',
    accentBg: '#e7fce3',
    // Conversation
    convBg: '#efeae2',
    convPattern: 'rgba(0,0,0,0.03)',
    headerBg: '#f0f2f5',
    headerBorder: '#d1d7db',
    inputBarBg: '#f0f2f5',
    inputFieldBg: '#fff',
    inputFieldBorder: '#d1d7db',
    // Bubbles
    bubbleOwn: '#d9fdd3',
    bubbleOther: '#fff',
    bubbleOwnText: '#111b21',
    bubbleOtherText: '#111b21',
    bubbleOwnName: '#0d7c44',
    bubbleOtherName: '#5e35b1',
    bubbleMeta: '#667781',
    // Ticket bubble
    ticketBg: '#fff',
    ticketBorder: '#d1d7db',
    // Empty state
    emptyBg: '#f0f2f5',
    emptyText: '#667781',
    // Logo
    logoBg: '#f0f2f5',
    logoText: '#00a884',
    // Scrollbar
    scrollbarThumb: '#cccccc',
    // Unread
    unreadDot: '#00a884',
    unreadTime: '#00a884',
    // Skeleton
    skeletonBg: '#e9edef',
    // Button disabled
    btnDisabledBg: '#e9edef',
    btnDisabledColor: '#8696a0',
  },
  dark: {
    sidebarBg: '#111b21',
    sidebarHeaderBg: '#202c33',
    searchBg: '#111b21',
    searchInputBg: '#202c33',
    listItemHover: '#202c33',
    listItemSelected: '#2a3942',
    listDivider: '#2a3942',
    textPrimary: '#e9edef',
    textSecondary: '#8696a0',
    textMuted: '#667781',
    accent: '#00a884',
    accentHover: '#008069',
    accentBg: '#025144',
    convBg: '#0b141a',
    convPattern: 'rgba(255,255,255,0.02)',
    headerBg: '#202c33',
    headerBorder: '#2a3942',
    inputBarBg: '#202c33',
    inputFieldBg: '#2a3942',
    inputFieldBorder: 'transparent',
    bubbleOwn: '#005c4b',
    bubbleOther: '#202c33',
    bubbleOwnText: '#e9edef',
    bubbleOtherText: '#e9edef',
    bubbleOwnName: '#6bc9a5',
    bubbleOtherName: '#a8a0d6',
    bubbleMeta: '#8696a0',
    ticketBg: '#202c33',
    ticketBorder: '#2a3942',
    emptyBg: '#222e35',
    emptyText: '#8696a0',
    logoBg: '#202c33',
    logoText: '#00a884',
    scrollbarThumb: '#374045',
    unreadDot: '#00a884',
    unreadTime: '#00a884',
    skeletonBg: '#2a3942',
    btnDisabledBg: '#2a3942',
    btnDisabledColor: '#667781',
  },
} as const;

export type ChatColorScheme = typeof chatColors.light;
