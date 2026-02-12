"use client";

import React, { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Cookies from 'js-cookie';
import api from '@/lib/api';
import { toast } from 'react-hot-toast';

// MUI Components
import {
    Box, List, ListItem, ListItemButton, ListItemIcon,
    ListItemText, Typography, Avatar, Divider, IconButton
} from '@mui/material';

// MUI Icons
import DashboardIcon from '@mui/icons-material/GridViewOutlined';
import DnsIcon from '@mui/icons-material/DnsOutlined';
import BookIcon from '@mui/icons-material/AutoStoriesOutlined';
import RouterIcon from '@mui/icons-material/RouterOutlined';
import InventoryIcon from '@mui/icons-material/Inventory2Outlined';
import PeopleIcon from '@mui/icons-material/PeopleOutlined';
import ShieldIcon from '@mui/icons-material/ShieldOutlined';
import LogoutIcon from '@mui/icons-material/LogoutOutlined';
import SecurityIcon from '@mui/icons-material/SecurityOutlined';

const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon fontSize="small" />, path: '/home' },
    { text: 'Sistemas', icon: <DnsIcon fontSize="small" />, path: '/sistemas' },
    { text: 'Base de Conocimientos', icon: <BookIcon fontSize="small" />, path: '/conocimiento' },
    { text: 'Infraestructura', icon: <RouterIcon fontSize="small" />, path: '/infraestructura' },
    { text: 'Activos', icon: <InventoryIcon fontSize="small" />, path: '/activos' },
    { text: 'Usuarios', icon: <PeopleIcon fontSize="small" />, path: '/usuarios' },
    { text: 'Roles', icon: <ShieldIcon fontSize="small" />, path: '/roles' },
];

export default function Sidebar() {
    // 1. Estados para hidratación y datos
    const [mounted, setMounted] = useState(false);
    const [userData, setUserData] = useState(null);

    const router = useRouter();
    const pathname = usePathname();

    // 2. Efecto para inicializar el componente solo en el cliente
    useEffect(() => {
        setMounted(true);
        const rawData = Cookies.get('user_data');
        if (rawData) {
            try {
                setUserData(JSON.parse(rawData));
            } catch (error) {
                console.error("Error al parsear user_data:", error);
            }
        }
    }, []);

    const logout = async () => {
        const loadingToast = toast.loading('Cerrando sesión...');
        try {
            await api.post('/logout');
            toast.success('Sesión finalizada', { id: loadingToast });
        } catch (error) {
            toast.error('Error al cerrar sesión', { id: loadingToast });
        } finally {
            // Limpieza completa de cookies
            Cookies.remove('auth_token');
            Cookies.remove('user_data');
            router.push('/login');
        }
    };

    // Función para obtener iniciales del nombre
    const getInitials = (name) => {
        if (!name) return "??";
        return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
    };

    return (
        <Box sx={{
            width: 280,
            height: '100vh',
            bgcolor: '#ffffff',
            display: 'flex',
            flexDirection: 'column',
            borderRight: '1px solid #e2e8f0'
        }}>
            {/* Header Limpio */}
            <Box sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Box sx={{
                    bgcolor: 'primary.main',
                    color: 'white',
                    p: 0.8,
                    borderRadius: 1,
                    display: 'flex'
                }}>
                    <SecurityIcon fontSize="small" />
                </Box>
                <Typography variant="h6" fontWeight="700" color="text.primary" sx={{ letterSpacing: '-0.5px' }}>
                    MB-360
                </Typography>
            </Box>

            {/* Navegación */}
            <List sx={{ flexGrow: 1, px: 1.5 }}>
                {menuItems.map((item) => {
                    const isActive = pathname === item.path;
                    return (
                        <ListItem key={item.text} disablePadding sx={{ mb: 0.5 }}>
                            <ListItemButton
                                onClick={() => router.push(item.path)}
                                sx={{
                                    borderRadius: 1.5,
                                    py: 1,
                                    bgcolor: isActive ? '#f1f5f9' : 'transparent',
                                    color: isActive ? 'primary.main' : 'text.secondary',
                                    '&:hover': { bgcolor: '#f8fafc', color: 'primary.main' },
                                    '& .MuiListItemIcon-root': {
                                        color: isActive ? 'primary.main' : 'inherit',
                                        minWidth: 38
                                    }
                                }}
                            >
                                <ListItemIcon>
                                    {item.icon}
                                </ListItemIcon>
                                <ListItemText
                                    primary={item.text}
                                    primaryTypographyProps={{
                                        fontSize: '0.875rem',
                                        fontWeight: isActive ? 600 : 500
                                    }}
                                />
                            </ListItemButton>
                        </ListItem>
                    );
                })}
            </List>

            <Divider sx={{ mx: 2, opacity: 0.6 }} />

            {/* Perfil Inferior */}
            <Box sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Avatar sx={{
                    width: 36,
                    height: 36,
                    fontSize: '0.8rem',
                    bgcolor: '#f1f5f9',
                    color: 'text.primary',
                    border: '1px solid #e2e8f0'
                }}>
                    {mounted && userData ? getInitials(userData.name) : '--'}
                </Avatar>

                <Box sx={{ flexGrow: 1 }}>
                    {mounted && userData ? (
                        <>
                            <Typography variant="body2" fontWeight="600" color="text.primary" fontSize="0.85rem">
                                {userData.name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                                {userData.role}
                            </Typography>
                        </>
                    ) : (
                        <Typography variant="caption" color="text.disabled">
                            Cargando...
                        </Typography>
                    )}
                </Box>

                <IconButton onClick={logout} size="small" sx={{ color: 'text.secondary', '&:hover': { color: 'error.main' } }}>
                    <LogoutIcon fontSize="small" />
                </IconButton>
            </Box>
        </Box>
    );
}