import { Typography } from '@mui/material';
import { Link } from 'react-router-dom';

const STOP_FONT = "'STOP', 'Arial Black', sans-serif";

export function Logo() {
  return (
    <Typography
      component={Link}
      to="/"
      sx={{
        fontFamily: STOP_FONT,
        fontSize: { xs: '1.1rem', sm: '1.35rem', md: '1.5rem' },
        fontWeight: 400,
        color: 'primary.main',
        letterSpacing: '0.08em',
        lineHeight: 1,
        userSelect: 'none',
        textTransform: 'uppercase',
        textDecoration: 'none',
        '&:hover': { opacity: 0.85 },
      }}
    >
      GIGANTÃO
    </Typography>
  );
}
