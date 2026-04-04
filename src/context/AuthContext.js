import React, { createContext, useContext, useState, useEffect } from 'react'
import axios from 'axios'
import { constants } from '../helpers/constants'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null)
    const [token, setToken] = useState(() => localStorage.getItem('it_token'))
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (token) {
            axios.get(`${constants.API_URL}/auth/me`, { headers: { Authorization: `Bearer ${token}` } })
                .then(res => setUser(res.data.data))
                .catch(() => { localStorage.removeItem('it_token'); setToken(null) })
                .finally(() => setLoading(false))
        } else {
            setLoading(false)
        }
    }, [token])

    const login = async (email, password) => {
        const res = await axios.post(`${constants.API_URL}/auth/login`, { email, password })
        const { token: t, user: u } = res.data.data
        localStorage.setItem('it_token', t)
        setToken(t)
        setUser(u)
        return u
    }

    const register = async (name, email, password) => {
        const res = await axios.post(`${constants.API_URL}/auth/register`, { name, email, password })
        const { token: t, user: u } = res.data.data
        localStorage.setItem('it_token', t)
        setToken(t)
        setUser(u)
        return u
    }

    const logout = () => {
        localStorage.removeItem('it_token')
        setToken(null)
        setUser(null)
    }

    const authHeader = () => token ? { Authorization: `Bearer ${token}` } : {}

    return (
        <AuthContext.Provider value={{ user, token, loading, login, register, logout, authHeader }}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => useContext(AuthContext)
