import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { TextField, Button, Paper, Typography, Box, Alert } from '@mui/material'
import { useAuth } from '../../context/AuthContext'

const RegisterPage = () => {
    const { register } = useAuth()
    const navigate = useNavigate()
    const [form, setForm] = useState({ name: '', email: '', password: '' })
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')
        setLoading(true)
        try {
            await register(form.name, form.email, form.password)
            navigate('/')
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed')
        } finally {
            setLoading(false)
        }
    }

    return (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
            <Paper elevation={3} sx={{ p: 4, width: '100%', maxWidth: 420 }}>
                <Typography variant="h5" mb={3} fontWeight={700}>Create Account</Typography>
                {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                <form onSubmit={handleSubmit}>
                    <TextField
                        label="Name" fullWidth required
                        value={form.name}
                        onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                        sx={{ mb: 2 }}
                    />
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
                        {loading ? 'Creating account…' : 'Register'}
                    </Button>
                </form>
                <Typography mt={2} textAlign="center">
                    Already have an account? <Link to="/login">Sign in</Link>
                </Typography>
            </Paper>
        </Box>
    )
}

export default RegisterPage
