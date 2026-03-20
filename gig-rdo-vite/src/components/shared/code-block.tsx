import { useState, useCallback } from 'react';
import { copyToClipboard } from '@/utils/clipboard';
import { Box, IconButton, Tooltip, Chip, Dialog, DialogContent } from '@mui/material';
import {
  ContentCopy, Check, WrapText, FormatListNumbered,
  Download, Fullscreen,
} from '@mui/icons-material';
import { PrismLight as SyntaxHighlighter } from 'react-syntax-highlighter';
import sql from 'react-syntax-highlighter/dist/esm/languages/prism/sql';
import typescript from 'react-syntax-highlighter/dist/esm/languages/prism/typescript';
import json from 'react-syntax-highlighter/dist/esm/languages/prism/json';
import markdown from 'react-syntax-highlighter/dist/esm/languages/prism/markdown';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

SyntaxHighlighter.registerLanguage('sql', sql);
SyntaxHighlighter.registerLanguage('typescript', typescript);
SyntaxHighlighter.registerLanguage('json', json);
SyntaxHighlighter.registerLanguage('markdown', markdown);

interface CodeBlockProps {
  code: string;
  language?: 'sql' | 'typescript' | 'json' | 'markdown' | 'text';
  maxHeight?: number;
  fileName?: string;
  compact?: boolean;
}

const toolbarSx = {
  display: 'flex', alignItems: 'center', gap: 0.25,
  px: 1, py: 0.25, borderBottom: 1, borderColor: 'rgba(255,255,255,0.1)',
  bgcolor: 'rgba(0,0,0,0.2)',
} as const;

const btnSx = { color: 'grey.400', p: 0.5, '&:hover': { color: 'grey.100' } } as const;

export function CodeBlock({
  code, language = 'sql', maxHeight = 400, fileName, compact,
}: CodeBlockProps) {
  const [copied, setCopied] = useState(false);
  const [lineNumbers, setLineNumbers] = useState(!compact);
  const [wrapLines, setWrapLines] = useState(true);
  const [fullscreen, setFullscreen] = useState(false);

  const handleCopy = useCallback(() => {
    copyToClipboard(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [code]);

  const handleDownload = useCallback(() => {
    const ext = language === 'typescript' ? 'ts' : language === 'json' ? 'json' : 'sql';
    const name = fileName ?? `code.${ext}`;
    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = name;
    a.click();
    URL.revokeObjectURL(url);
  }, [code, language, fileName]);

  const lineCount = code.split('\n').length;

  const highlighterProps = {
    language,
    style: vscDarkPlus,
    showLineNumbers: lineNumbers,
    wrapLines,
    wrapLongLines: wrapLines,
    customStyle: {
      margin: 0,
      padding: '8px',
      fontSize: compact ? 10 : 11,
      lineHeight: 1.5,
      background: 'transparent',
      maxHeight: fullscreen ? undefined : maxHeight,
      overflow: 'auto',
    } as React.CSSProperties,
    lineNumberStyle: { minWidth: '2.5em', paddingRight: '1em', color: '#858585', fontSize: 10 },
  };

  const toolbar = (
    <Box sx={toolbarSx}>
      <Chip label={language.toUpperCase()} size="small"
        sx={{ height: 16, fontSize: 9, color: 'grey.400', bgcolor: 'rgba(255,255,255,0.08)' }} />
      <Chip label={`${lineCount} lines`} size="small"
        sx={{ height: 16, fontSize: 9, color: 'grey.500', bgcolor: 'transparent' }} />
      <Box sx={{ flex: 1 }} />
      <Tooltip title={wrapLines ? 'Desativar wrap' : 'Ativar wrap'} arrow>
        <IconButton size="small" sx={btnSx} onClick={() => setWrapLines(!wrapLines)}>
          <WrapText sx={{ fontSize: 14, opacity: wrapLines ? 1 : 0.4 }} />
        </IconButton>
      </Tooltip>
      <Tooltip title={lineNumbers ? 'Ocultar linhas' : 'Mostrar linhas'} arrow>
        <IconButton size="small" sx={btnSx} onClick={() => setLineNumbers(!lineNumbers)}>
          <FormatListNumbered sx={{ fontSize: 14, opacity: lineNumbers ? 1 : 0.4 }} />
        </IconButton>
      </Tooltip>
      <Tooltip title="Download" arrow>
        <IconButton size="small" sx={btnSx} onClick={handleDownload}>
          <Download sx={{ fontSize: 14 }} />
        </IconButton>
      </Tooltip>
      <Tooltip title="Fullscreen" arrow>
        <IconButton size="small" sx={btnSx} onClick={() => setFullscreen(true)}>
          <Fullscreen sx={{ fontSize: 14 }} />
        </IconButton>
      </Tooltip>
      <Tooltip title={copied ? 'Copiado!' : 'Copiar'} arrow>
        <IconButton size="small" sx={btnSx} onClick={handleCopy}>
          {copied
            ? <Check sx={{ fontSize: 14, color: 'success.main' }} />
            : <ContentCopy sx={{ fontSize: 14 }} />}
        </IconButton>
      </Tooltip>
    </Box>
  );

  return (
    <>
      <Box sx={{ borderRadius: 1, overflow: 'hidden', bgcolor: '#1e1e1e' }}>
        {toolbar}
        <SyntaxHighlighter {...highlighterProps}>
          {code}
        </SyntaxHighlighter>
      </Box>

      <Dialog open={fullscreen} onClose={() => setFullscreen(false)}
        maxWidth={false} fullWidth
        slotProps={{ paper: { sx: { bgcolor: '#1e1e1e', m: 2, maxHeight: '95vh' } } }}>
        <DialogContent sx={{ p: 0 }}>
          <Box sx={toolbarSx}>
            <Chip label={language.toUpperCase()} size="small"
              sx={{ height: 16, fontSize: 9, color: 'grey.400',
                bgcolor: 'rgba(255,255,255,0.08)' }} />
            <Chip label={fileName ?? `${lineCount} lines`} size="small"
              sx={{ height: 16, fontSize: 9, color: 'grey.500', bgcolor: 'transparent' }} />
            <Box sx={{ flex: 1 }} />
            <Tooltip title={copied ? 'Copiado!' : 'Copiar'} arrow>
              <IconButton size="small" sx={btnSx} onClick={handleCopy}>
                {copied
                  ? <Check sx={{ fontSize: 14, color: 'success.main' }} />
                  : <ContentCopy sx={{ fontSize: 14 }} />}
              </IconButton>
            </Tooltip>
          </Box>
          <SyntaxHighlighter
            language={language} style={vscDarkPlus}
            showLineNumbers wrapLines wrapLongLines
            customStyle={{
              margin: 0, padding: '12px', fontSize: 12,
              lineHeight: 1.6, background: 'transparent',
            }}
            lineNumberStyle={{ minWidth: '3em', paddingRight: '1em', color: '#858585' }}
          >
            {code}
          </SyntaxHighlighter>
        </DialogContent>
      </Dialog>
    </>
  );
}
