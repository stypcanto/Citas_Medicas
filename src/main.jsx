import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css';
import SistemaCitasMedicas from './SistemaCitasMedicas';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <SistemaCitasMedicas />
  </StrictMode>,
)
