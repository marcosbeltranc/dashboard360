"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import Cookies from "js-cookie";
import toast from "react-hot-toast";
import {
    Box,
    TextField,
    Button,
    Typography,
    Card,
    CardContent,
    Container,
    InputAdornment,
    IconButton
} from "@mui/material";
import { Email, Lock, Visibility, VisibilityOff } from "@mui/icons-material";
import Image from 'next/image';

export default function LoginPage() {
    const [formData, setFormData] = useState({ email: "", password: "" });
    const [showPassword, setShowPassword] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (isSubmitting) return;

        setIsSubmitting(true);
        const dataToSend = { ...formData, device_name: "dashboard" };
        const loadingToast = toast.loading('Iniciando sesión...');
        try {
            const { data } = await api.post("/login", dataToSend);
            const roleMapping = {
                0: "Administrador",
                1: "Developer",
                2: "Usuario"
            };
            data.user.role = roleMapping[data.user.level];
            toast.success(`¡Bienvenido! ${data.user.name}`, { id: loadingToast });
            Cookies.set("auth_token", data.token, { expires: 1 });
            Cookies.set("user_data", JSON.stringify(data.user), { expires: 1 });
            router.push("/home");
        } catch (error) {
            toast.error("Error: Revisa tus credenciales", { id: loadingToast });
            setIsSubmitting(false);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Box className="min-h-screen flex items-center justify-center bg-slate-900 px-4">
            <Container maxWidth="xs">
                <Card elevation={10} sx={{ borderRadius: 1, overflow: 'visible' }}>
                    <CardContent className="p-8">
                        <Image
                            src="/logo_c.svg"
                            alt="Logo"
                            width={150}
                            height={50}
                            className="mx-auto mb-4"
                            priority
                        />
                        <form onSubmit={handleSubmit}>
                            <TextField
                                fullWidth
                                label="Correo electrónico"
                                variant="outlined"
                                margin="normal"
                                type="email"
                                required
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        borderRadius: 1
                                    }
                                }}
                            />

                            <TextField
                                fullWidth
                                label="Contraseña"
                                variant="outlined"
                                margin="normal"
                                type={showPassword ? "text" : "password"}
                                required
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                InputProps={{
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                                                {showPassword ? <VisibilityOff /> : <Visibility />}
                                            </IconButton>
                                        </InputAdornment>
                                    )
                                }}
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        borderRadius: 1
                                    }
                                }}
                            />

                            <Button
                                type="submit"
                                fullWidth
                                variant="contained"
                                size="large"
                                disabled={isSubmitting}
                                disableElevation
                                sx={{
                                    mt: 4,
                                    py: 1.8,
                                    fontWeight: 'bold',
                                    borderRadius: 1,
                                    textTransform: 'none',
                                    fontSize: '1.1rem',
                                    transition: 'transform 0.1s ease-in-out',
                                    '&:active': { transform: 'scale(0.98)' }
                                }}
                            >
                                Iniciar Sesión
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </Container>
        </Box>
    );
}