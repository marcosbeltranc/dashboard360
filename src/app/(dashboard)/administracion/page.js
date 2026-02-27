'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { Box, Typography } from '@mui/material';

export default function Sistemas() {
    return (
        <Box sx={{ p: 4, bgcolor: '#f8fafc', minHeight: '100vh' }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
                <Box>
                    <Typography variant="h4" fontWeight="bold" color="#1e293b">Administracion</Typography>
                    <Typography color="text.secondary">Gestiona listas de sistema</Typography>
                </Box>
            </Box>
        </Box>
    )
}