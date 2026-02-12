"use client";
import { AppRouterCacheProvider } from '@mui/material-nextjs/v14-appRouter';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

const theme = createTheme({
    palette: {
        primary: {
            main: '#2563eb',
        },
        secondary: {
            main: '#64748b',
        },
        background: {
            default: '#f8fafc',
        },
    },
    typography: {
        fontFamily: 'var(--font-geist-sans), Roboto, Arial, sans-serif',
    },
    shape: {
        borderRadius: 8,
    },
});

export default function ThemeRegistry({ children }) {
    return (
        <AppRouterCacheProvider options={{ enableCssLayer: true }}>
            <ThemeProvider theme={theme}>
                {/* CssBaseline debe estar DENTRO del ThemeProvider */}
                <CssBaseline />
                {children}
            </ThemeProvider>
        </AppRouterCacheProvider>
    );
}