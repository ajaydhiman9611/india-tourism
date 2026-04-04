import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { TextField, Button, Paper, Typography, Box, Alert } from '@mui/material'
import { useAuth } from '../../context/AuthContext'

const LoginPage = () => {
    const { login } = useAuth()
    const navigate = useNavigate()
    const [form, setForm] = useState({ email: '', password: '' })
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')
        setLoading(true)
        try {
            await login(form.email, form.password)
            navigate('/')
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed')
        } finally {
            setLoading(false)
        }
    }

    return (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
            <Paper elevation={3} sx={{ p: 4, width: '100%', maxWidth: 420 }}>
                <Typography variant="h5" mb={3} fontWeight={700}>Sign In</Typography>
                {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                <form onSubmit={handleSubmit}>
                    <TextField
                        label="Email" type="email" fullWidth required
                        value={form.email}
                        onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                        sx={{ mb: 2 }}
                    />
                    <TextField
                        label="Password" type="password" fullWidth required
                        value={form.password}
                        onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                        sx={{ mb: 3 }}
                    />
                    <Button type="submit" variant="contained" fullWidth size="large" disabled={loading}>
                        {loading ? 'Signing in…' : 'Sign In'}
                    </Button>
                </form>
                <Typography mt={2} textAlign="center">
                    No account? <Link to="/register">Register</Link>
                </Typography>
            </Paper>
        </Box>
    )
}

export default LoginPage
