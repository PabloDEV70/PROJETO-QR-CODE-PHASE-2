import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export function RodizioPage() {
  const navigate = useNavigate();

  useEffect(() => {
    navigate('/quadro', { replace: true });
  }, [navigate]);

  return null;
}
