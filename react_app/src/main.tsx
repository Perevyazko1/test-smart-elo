import {createRoot} from 'react-dom/client';
import {App} from '@/app/ui/App.tsx';

import '@/shared/styles/index.css';

createRoot(document.getElementById('root')!).render(
    <App/>
)
