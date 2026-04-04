import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react'
import axios from 'axios'
import { constants } from '../helpers/constants'

const AuthContext = createContext(null)

const API = constants.API_URL

// ── Token storage keys ────────────────────────────────────────────────────────
const ACCESS_KEY  = 'it_token'
const REFRESH_KEY = 'it_refresh_token'

// ── Axios 401 → auto-refresh interceptor ──────────────────────────────────────
// Mounted once; uses a ref-based getter for the latest refresh token so the
// closure stays fresh without re-registering the interceptor on every render.
let refreshInterceptorId = null

function setupAxiosInterceptor(getRefreshToken, onRefreshSuccess, onRefreshFail) {
    if (refreshInterceptorId !== null) {
        axios.interceptors.response.eject(refreshInterceptorId)
    }
    refreshInterceptorId = axios.interceptors.response.use(
        (res) => res,
        async (error) => {
            const original = error.config
            // Only retry once and never retry the refresh endpoint itself
            if (
                error.response?.status === 401 &&
                !original._retry &&
                !original.url?.includes('/auth/refresh-token') &&
                !original.url?.includes('/auth/login')
            ) {
                original._retry = true
                const refreshToken = getRefreshToken()
                if (!refreshToken) {
                    onRefreshFail()
                    return Promise.reject(error)
                }
                try {
                    const res = await axios.post(`${API}/auth/refresh-token`, { refreshToken })
                    const { token: newAccess, refreshToken: newRefresh } = res.data.data
                    onRefreshSuccess(newAccess, newRefresh)
                    original.headers = original.headers || {}
                    original.headers['Authorization'] = `Bearer ${newAccess}`
                    return axios(original)
                } catch {
                    onRefreshFail()
                    return Promise.reject(error)
                }
            }
            return Promise.reject(error)
        }
    )
}

// ── Provider ──────────────────────────────────────────────────────────────────
export const AuthProvider = ({ children }) => {
    const [user,    setUser]    = useState(null)
    const [token,   setToken]   = useState(() => localStorage.getItem(ACCESS_KEY))
    const [loading, setLoading] = useState(true)

    // Keep a ref to the latest refresh token so the interceptor closure always
    // reads the current value without needing to re-register on every change.
    const refreshTokenRef = useRef(localStorage.getItem(REFRESH_KEY))

    // ── Persist both tokens ──────────────────────────────────────────────────
    const persistTokens = useCallback((access, refresh) => {
        localStorage.setItem(ACCESS_KEY,  access)
        localStorage.setItem(REFRESH_KEY, refresh)
        refreshTokenRef.current = refresh
        setToken(access)
    }, [])

    const clearTokens = useCallback(() => {
        localStorage.removeItem(ACCESS_KEY)
        localStorage.removeItem(REFRESH_KEY)
        refreshTokenRef.current = null
        setToken(null)
        setUser(null)
    }, [])

    // ── Set up axios interceptor once on mount ───────────────────────────────
    useEffect(() => {
        setupAxiosInterceptor(
            () => refreshTokenRef.current,
            (newAccess, newRefresh) => persistTokens(newAccess, newRefresh),
            () => clearTokens()
        )
    }, [persistTokens, clearTokens])

    // ── Restore session from stored access token ─────────────────────────────
    useEffect(() => {
        if (token) {
            axios.get(`${API}/auth/me`, { headers: { Authorization: `Bearer ${token}` } })
                .then(res => setUser(res.data.data))
                .catch(() => clearTokens())
                .finally(() => setLoading(false))
        } else {
            setLoading(false)
        }
    }, []) // eslint-disable-line react-hooks/exhaustive-deps

    // ── Auth actions ─────────────────────────────────────────────────────────
    const login = async (email, password) => {
        const res = await axios.post(`${API}/auth/login`, { email, password })
        const { token: t, refreshToken: r, user: u } = res.data.data
        persistTokens(t, r)
        setUser(u)
        return u
    }

    const register = async (name, email, password, mobile) => {
        const res = await axios.post(`${API}/auth/register`, { name, email, password, mobile })
        const { token: t, refreshToken: r, user: u } = res.data.data
        persistTokens(t, r)
        setUser(u)
        return u
    }

    const requestOtp = async (email) => {
        const res = await axios.post(`${API}/auth/request-otp`, { email })
        return res.data
    }

    const verifyOtp = async (email, otp) => {
        const res = await axios.post(`${API}/auth/verify-otp`, { email, otp })
        const { token: t, refreshToken: r, user: u } = res.data.data
        persistTokens(t, r)
        setUser(u)
        return u
    }

    // Called by /auth/callback page after Google OAuth redirect
    const loginWithToken = useCallback((accessToken, refreshToken) => {
        if (refreshToken) persistTokens(accessToken, refreshToken)
        else localStorage.setItem(ACCESS_KEY, accessToken)
        axios.get(`${API}/auth/me`, { headers: { Authorization: `Bearer ${accessToken}` } })
            .then(res => { setUser(res.data.data) })
            .catch(() => clearTokens())
    }, [persistTokens, clearTokens])

    const loginWithGoogle = () => {
        window.location.href = `${API}/auth/google`
    }

    const logout = async () => {
        try {
            if (token) {
                await axios.post(`${API}/auth/logout`, {}, { headers: { Authorization: `Bearer ${token}` } })
            }
        } catch { /* ignore */ }
        clearTokens()
    }

    // ── Profile actions ──────────────────────────────────────────────────────
    const updateProfile = async (fields) => {
        const res = await axios.put(`${API}/auth/profile`, fields, { headers: authHeader() })
        setUser(u => ({ ...u, ...res.data.data }))
        return res.data.data
    }

    const changePassword = async (currentPassword, newPassword) => {
        const res = await axios.put(`${API}/auth/change-password`, { currentPassword, newPassword }, { headers: authHeader() })
        return res.data
    }

    const updateMobile = async (mobile) => {
        const res = await axios.put(`${API}/auth/mobile`, { mobile }, { headers: authHeader() })
        setUser(u => ({ ...u, mobile }))
        return res.data
    }

    const authHeader = () => token ? { Authorization: `Bearer ${token}` } : {}

    return (
        <AuthContext.Provider value={{
            user, token, loading,
            login, register, logout, authHeader,
            requestOtp, verifyOtp,
            loginWithGoogle, loginWithToken,
            updateProfile, changePassword, updateMobile,
        }}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => useContext(AuthContext)
