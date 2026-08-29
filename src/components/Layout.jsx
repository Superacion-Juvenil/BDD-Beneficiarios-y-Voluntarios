import { useState } from 'react';
import { Sidebar } from './Sidebar';

/**
 * Wrapper que combina la barra lateral con el contenido principal.
 * En móvil el sidebar se abre con el botón hamburguesa y se cierra
 * al tocar el backdrop o al elegir una opción.
 */
export function Layout({ items, maxWidth = '1100px', children }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="sj-layout">
      <button
        className="sj-burger"
        aria-label="Menú"
        aria-expanded={open}
        onClick={() => setOpen(o => !o)}
      >
        ☰
      </button>

      <div
        className={`sj-backdrop${open ? ' open' : ''}`}
        onClick={() => setOpen(false)}
        aria-hidden="true"
      />

      <Sidebar
        items={items}
        open={open}
        onNavigate={() => setOpen(false)}
      />

      <main className="sj-main">
        <div style={{ maxWidth, margin: '0 auto', padding: '24px 16px 40px' }}>
          {children}
        </div>
      </main>
    </div>
  );
}
