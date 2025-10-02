import { useMemo, useState } from 'react';
import { useTheme } from '../context/ThemeContext';

function AccessibilityMenu() {
    const { theme, toggleTheme } = useTheme();
    const [open, setOpen] = useState(false);

    const description = useMemo(
        () => ({
            titulo: 'Accesibilidad',
            items: [
                'Activa el modo oscuro para reducir el brillo de pantalla.',
                'Las páginas muestran guías rápidas para entender cada módulo.',
                'Usa el menú principal para acceder a flota, proveedores, OT y reportes.'
            ]
        }),
        []
    );

    return (
        <div className="accessibility-menu">
            <button
                type="button"
                className="btn btn-outline-secondary accessibility-trigger"
                onClick={() => setOpen((value) => !value)}
                aria-expanded={open}
                aria-controls="accessibility-panel"
            >
                ♿ Accesibilidad
            </button>

            {open && (
                <div className="card shadow accessibility-panel" id="accessibility-panel">
                    <div className="card-body">
                        <div className="d-flex justify-content-between align-items-center mb-2">
                            <h6 className="mb-0">{description.titulo}</h6>
                            <button
                                type="button"
                                className="btn-close"
                                aria-label="Cerrar panel"
                                onClick={() => setOpen(false)}
                            ></button>
                        </div>

                        <button
                            type="button"
                            className="btn btn-sm btn-primary w-100 mb-3"
                            onClick={toggleTheme}
                        >
                            Cambiar a modo {theme === 'dark' ? 'claro' : 'oscuro'}
                        </button>

                        <ul className="small text-muted mb-0">
                            {description.items.map((item) => (
                                <li key={item}>{item}</li>
                            ))}
                        </ul>
                    </div>
                </div>
            )}
        </div>
    );
}

export default AccessibilityMenu;
