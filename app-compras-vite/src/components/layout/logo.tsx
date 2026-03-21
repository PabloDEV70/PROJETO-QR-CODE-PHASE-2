import { Typography } from '@mui/material';
import { Link } from 'react-router-dom';

export function Logo() {
  return (
    <Typography
      component={Link}
      to="/"
      sx={{
        fontFamily: "'STOP', 'Arial Black', sans-serif",
        fontSize: { xs: '1.1rem', sm: '1.35rem' },
        color: 'primary.main',
        letterSpacing: '0.08em',
        lineHeight: 1,
        userSelect: 'none',
        textDecoration: 'none',
        '&:hover': { opacity: 0.85 },
      }}
    >
      GIGANTAO
    </Typography>
  );
}
