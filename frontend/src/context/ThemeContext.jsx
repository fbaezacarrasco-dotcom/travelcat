import { createContext, useContext, useEffect, useMemo, useState } from 'react';

const ThemeContext = createContext(null);

const storageKey = 'appTheme';

function getPreferredTheme() {
    const stored = localStorage.getItem(storageKey);
    if (stored === 'light' || stored === 'dark') {
        return stored;
    }
    const prefersDark = window.matchMedia?.('(prefers-color-scheme: dark)').matches;
    return prefersDark ? 'dark' : 'light';
}

export function ThemeProvider({ children }) {
    const [theme, setTheme] = useState(() => getPreferredTheme());

    useEffect(() => {
        document.documentElement.classList.toggle('theme-dark', theme === 'dark');
        document.documentElement.classList.toggle('theme-light', theme === 'light');
        localStorage.setItem(storageKey, theme);
    }, [theme]);

    useEffect(() => {
        const listener = (event) => {
            if (localStorage.getItem(storageKey)) {
                return;
            }
            setTheme(event.matches ? 'dark' : 'light');
        };

        const media = window.matchMedia('(prefers-color-scheme: dark)');
        media.addEventListener('change', listener);
        return () => media.removeEventListener('change', listener);
    }, []);

    const toggleTheme = () => {
        setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
    };

    const value = useMemo(() => ({ theme, setTheme, toggleTheme }), [theme]);

    return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme debe usarse dentro de ThemeProvider');
    }
    return context;
}
