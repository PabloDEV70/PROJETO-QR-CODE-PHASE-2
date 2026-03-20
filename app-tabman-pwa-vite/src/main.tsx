import { createRoot } from 'react-dom/client';
import { AppProvider } from '@/app/app-provider';

createRoot(document.getElementById('root')!).render(<AppProvider />);
