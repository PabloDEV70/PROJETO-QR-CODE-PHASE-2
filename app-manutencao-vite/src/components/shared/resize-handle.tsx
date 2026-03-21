import { useCallback, useRef } from 'react';
import { Box } from '@mui/material';

interface ResizeHandleProps {
  onResize: (delta: number) => void;
}

export function ResizeHandle({ onResize }: ResizeHandleProps) {
  const startX = useRef(0);
  const dragging = useRef(false);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    startX.current = e.clientX;
    dragging.current = true;

    const handleMouseMove = (ev: MouseEvent) => {
      if (!dragging.current) return;
      const delta = ev.clientX - startX.current;
      startX.current = ev.clientX;
      onResize(delta);
    };

    const handleMouseUp = () => {
      dragging.current = false;
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };

    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, [onResize]);

  return (
    <Box
      onMouseDown={handleMouseDown}
      sx={{
        width: 6, flexShrink: 0, cursor: 'col-resize',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        bgcolor: 'transparent', position: 'relative', zIndex: 10,
        '&:hover': { '& .handle-line': { bgcolor: 'primary.main', opacity: 0.5 } },
        '&:active': { '& .handle-line': { bgcolor: 'primary.main', opacity: 0.8 } },
      }}
    >
      <Box
        className="handle-line"
        sx={{
          width: 2, height: 40, borderRadius: 1,
          bgcolor: 'divider', opacity: 0.6,
          transition: 'background-color 0.15s, opacity 0.15s',
        }}
      />
    </Box>
  );
}
