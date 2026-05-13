"use client";

import React, { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Cookies from 'js-cookie';
import api from '@/lib/api';
import { toast } from 'react-hot-toast';
import Image from 'next/image';

import {
    Box, List, ListItem, ListItemButton, ListItemIcon,
    ListItemText, Typography, Avatar, Divider, IconButton
} from '@mui/material';

import DashboardIcon from '@mui/icons-material/GridViewOutlined';
import AdminIcon from '@mui/icons-material/SettingsOutlined';
import DnsIcon from '@mui/icons-material/DnsOutlined';
import RouterIcon from '@mui/icons-material/RouterOutlined';
import PeopleIcon from '@mui/icons-material/PeopleOutlined';
import LogoutIcon from '@mui/icons-material/LogoutOutlined';
import { usePermissions } from '@/hooks/usePermissions';

const menuItems = [
    { text: 'Dashboard', module: 'dashboard', icon: <DashboardIcon fontSize="small" />, path: '/home' },
    { text: 'Administracion', module: 'admin', icon: <AdminIcon fontSize='small' />, path: '/administracion' },
    { text: 'Sistemas', module: 'systems', icon: <DnsIcon fontSize="small" />, path: '/sistemas' },
    { text: 'Infraestructura', module: 'infrastructure', icon: <RouterIcon fontSize="small" />, path: '/infraestructura' },
    { text: 'Usuarios', module: 'usuarios', icon: <PeopleIcon fontSize="small" />, path: '/usuarios' },
];

export default function Sidebar() {
    const [mounted, setMounted] = useState(false);
    const [userData, setUserData] = useState(null);
    const [isHovered, setIsHovered] = useState(false); // Controla la expansión visual

    const router = useRouter();
    const pathname = usePathname();
    const { can } = usePermissions();

    // Configuración de anchos
    const drawerWidthFull = 280;
    const drawerWidthMini = 80;

    useEffect(() => {
        setMounted(true);
        const rawData = Cookies.get('user_data');
        if (rawData) {
            try { setUserData(JSON.parse(rawData)); }
            catch (error) { console.error("Error al parsear user_data:", error); }
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
            Cookies.remove('auth_token');
            Cookies.remove('user_data');
            router.push('/login');
        }
    };

    const getInitials = (name) => {
        if (!name) return "??";
        return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
    };

    return (
        <Box
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            sx={{
                width: isHovered ? drawerWidthFull : drawerWidthMini,
                height: '100vh',
                bgcolor: '#ffffff',
                display: 'flex',
                flexDirection: 'column',
                borderRight: '1px solid #e2e8f0',
                transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                overflowX: 'hidden',
                position: 'relative',
                zIndex: 1200
            }}
        >
            {/* Header / Logo */}
            <Box sx={{
                p: 2.5,
                display: 'flex',
                justifyContent: isHovered ? 'flex-start' : 'center',
                minHeight: 80,
                alignItems: 'center'
            }}>
                <div className="relative" style={{ width: isHovered ? 256 : 40, height: isHovered ? 120 : 40, transition: 'all 0.3s' }}>
                    <Image
                        src={isHovered ? "/logo_c.svg" : "/isologo.svg"}
                        alt="Logo GAIA"
                        fill
                        className="object-contain"
                        priority
                    />
                </div>
            </Box>

            {/* Navegación */}
            <List sx={{ flexGrow: 1, px: 1.5 }}>
                {menuItems
                    .filter(item => can(item.module, 'view_menu'))
                    .map((item) => {
                        const isActive = pathname === item.path;
                        return (
                            <ListItem key={item.text} disablePadding sx={{ mb: 0.5 }}>
                                <ListItemButton
                                    onClick={() => router.push(item.path)}
                                    sx={{
                                        borderRadius: 1,
                                        py: 1.5,
                                        justifyContent: isHovered ? 'initial' : 'center',
                                        px: 2.5,
                                        bgcolor: isActive ? '#f1f5f9' : 'transparent',
                                        color: isActive ? 'primary.main' : 'text.secondary',
                                        '&:hover': { bgcolor: '#f8fafc', color: 'primary.main' },
                                    }}
                                >
                                    <ListItemIcon sx={{
                                        minWidth: 0,
                                        mr: isHovered ? 2 : 'auto',
                                        justifyContent: 'center',
                                        color: isActive ? 'primary.main' : 'inherit',
                                    }}>
                                        {item.icon}
                                    </ListItemIcon>

                                    <ListItemText
                                        primary={item.text}
                                        sx={{
                                            opacity: isHovered ? 1 : 0,
                                            display: isHovered ? 'block' : 'none', // Evita que el texto ocupe espacio si está oculto
                                        }}
                                        primaryTypographyProps={{
                                            fontSize: '0.875rem',
                                            fontWeight: isActive ? 600 : 500,
                                            noWrap: true
                                        }}
                                    />
                                </ListItemButton>
                            </ListItem>
                        );
                    })}
            </List>

            <Divider sx={{ mx: 2, opacity: 0.6 }} />

            {/* Perfil Inferior */}
            <Box sx={{
                p: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: isHovered ? 'flex-start' : 'center',
                gap: isHovered ? 1.5 : 0
            }}>
                <Avatar sx={{
                    width: 36,
                    height: 36,
                    fontSize: '0.8rem',
                    bgcolor: '#f1f5f9',
                    color: 'text.primary',
                    border: '1px solid #e2e8f0',
                    flexShrink: 0
                }}>
                    {mounted && userData ? getInitials(userData.name) : '--'}
                </Avatar>

                {isHovered && (
                    <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                        {mounted && userData ? (
                            <>
                                <Typography variant="body2" fontWeight="600" color="text.primary" fontSize="0.85rem" noWrap>
                                    {userData.name}
                                </Typography>
                                <Typography variant="caption" color="text.secondary" noWrap display="block">
                                    {userData.role}
                                </Typography>
                            </>
                        ) : (
                            <Typography variant="caption" color="text.disabled">Cargando...</Typography>
                        )}
                    </Box>
                )}

                {isHovered && (
                    <IconButton onClick={logout} size="small" sx={{ color: 'text.secondary', '&:hover': { color: 'error.main' } }}>
                        <LogoutIcon fontSize="small" />
                    </IconButton>
                )}
            </Box>
        </Box>
    );
}