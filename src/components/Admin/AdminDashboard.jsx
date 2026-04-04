import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import {
    Box, Tabs, Tab, Typography, Paper, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, Button, IconButton, TextField,
    Dialog, DialogTitle, DialogContent, DialogActions, CircularProgress,
    Chip, Alert, Snackbar
} from '@mui/material'
import DeleteIcon from '@mui/icons-material/Delete'
import EditIcon from '@mui/icons-material/Edit'
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings'
import { constants } from '../../helpers/constants'
import { useAuth } from '../../context/AuthContext'

const AdminDashboard = () => {
    const { user, authHeader, loading: authLoading } = useAuth()
    const navigate = useNavigate()
    const [tab, setTab] = useState(0)
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' })

    const [states, setStates] = useState([])
    const [places, setPlaces] = useState([])
    const [users, setUsers] = useState([])
    const [reviews, setReviews] = useState([])
    const [dataLoading, setDataLoading] = useState(false)

    const [editDialog, setEditDialog] = useState({ open: false, type: null, item: null })
    const [editForm, setEditForm] = useState({})

    useEffect(() => {
        if (!authLoading && (!user || !user.isAdmin)) {
            navigate('/')
        }
    }, [user, authLoading, navigate])

    const fetchData = async (type) => {
        setDataLoading(true)
        try {
            const res = await axios.get(`${constants.API_URL}/admin/${type}`, { headers: authHeader() })
            const data = res.data.data
            if (type === 'states') setStates(Array.isArray(data) ? data : [])
            else if (type === 'places') setPlaces(data?.places || [])
            else if (type === 'users') setUsers(Array.isArray(data) ? data : [])
            else if (type === 'reviews') setReviews(Array.isArray(data) ? data : [])
        } catch (err) {
            setSnackbar({ open: true, message: `Failed to load ${type}`, severity: 'error' })
        } finally {
            setDataLoading(false)
        }
    }

    useEffect(() => {
        if (!user?.isAdmin) return
        const tabMap = ['states', 'places', 'users', 'reviews']
        fetchData(tabMap[tab])
    }, [tab, user])

    const handleDelete = async (type, id) => {
        if (!window.confirm('Are you sure?')) return
        try {
            await axios.delete(`${constants.API_URL}/admin/${type}/${id}`, { headers: authHeader() })
            setSnackbar({ open: true, message: 'Deleted successfully', severity: 'success' })
            const tabMap = ['states', 'places', 'users', 'reviews']
            fetchData(tabMap[tab])
        } catch (err) {
            setSnackbar({ open: true, message: 'Delete failed', severity: 'error' })
        }
    }

    const handleToggleAdmin = async (userId) => {
        try {
            const res = await axios.put(`${constants.API_URL}/admin/users/${userId}/toggle-admin`, {}, { headers: authHeader() })
            setUsers(prev => prev.map(u => u._id === userId ? { ...u, isAdmin: res.data.data.isAdmin } : u))
            setSnackbar({ open: true, message: 'Admin status updated', severity: 'success' })
        } catch (err) {
            setSnackbar({ open: true, message: 'Failed to update admin status', severity: 'error' })
        }
    }

    const openEdit = (type, item) => {
        setEditForm({ ...item })
        setEditDialog({ open: true, type, item })
    }

    const handleEditSave = async () => {
        const { type, item } = editDialog
        const endpoint = type === 'state' ? 'states' : 'places'
        try {
            await axios.put(`${constants.API_URL}/admin/${endpoint}/${item._id}`, editForm, { headers: authHeader() })
            setSnackbar({ open: true, message: 'Updated successfully', severity: 'success' })
            setEditDialog({ open: false, type: null, item: null })
            const tabMap = ['states', 'places', 'users', 'reviews']
            fetchData(tabMap[tab])
        } catch (err) {
            setSnackbar({ open: true, message: 'Update failed', severity: 'error' })
        }
    }

    if (authLoading) return <Box display="flex" justifyContent="center" mt={8}><CircularProgress /></Box>
    if (!user?.isAdmin) return null

    return (
        <Box>
            <Typography variant="h4" fontWeight={700} mb={3} display="flex" alignItems="center" gap={1}>
                <AdminPanelSettingsIcon /> Admin Dashboard
            </Typography>

            <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 3, borderBottom: 1, borderColor: 'divider' }}>
                <Tab label={`States (${states.length})`} />
                <Tab label={`Places (${places.length})`} />
                <Tab label={`Users (${users.length})`} />
                <Tab label={`Reviews (${reviews.length})`} />
            </Tabs>

            {dataLoading && <Box display="flex" justifyContent="center" py={4}><CircularProgress /></Box>}

            {/* STATES */}
            {tab === 0 && !dataLoading && (
                <TableContainer component={Paper}>
                    <Table size="small">
                        <TableHead>
                            <TableRow>
                                <TableCell>Name</TableCell>
                                <TableCell>Code</TableCell>
                                <TableCell>Best Time</TableCell>
                                <TableCell>Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {states.map(state => (
                                <TableRow key={state._id}>
                                    <TableCell>{state.name}</TableCell>
                                    <TableCell>{state.code}</TableCell>
                                    <TableCell>{state.bestTimeToVisit || '—'}</TableCell>
                                    <TableCell>
                                        <IconButton size="small" onClick={() => openEdit('state', state)}><EditIcon fontSize="small" /></IconButton>
                                        <IconButton size="small" color="error" onClick={() => handleDelete('states', state._id)}><DeleteIcon fontSize="small" /></IconButton>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}

            {/* PLACES */}
            {tab === 1 && !dataLoading && (
                <TableContainer component={Paper}>
                    <Table size="small">
                        <TableHead>
                            <TableRow>
                                <TableCell>Name</TableCell>
                                <TableCell>State</TableCell>
                                <TableCell>Best Time</TableCell>
                                <TableCell>Featured</TableCell>
                                <TableCell>Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {places.map(place => (
                                <TableRow key={place._id}>
                                    <TableCell>{place.name}</TableCell>
                                    <TableCell>{place.state}</TableCell>
                                    <TableCell>{place.bestTimeToVisit || '—'}</TableCell>
                                    <TableCell>
                                        {place.isFeatured ? <Chip label="Yes" color="success" size="small" /> : <Chip label="No" size="small" />}
                                    </TableCell>
                                    <TableCell>
                                        <IconButton size="small" onClick={() => openEdit('place', place)}><EditIcon fontSize="small" /></IconButton>
                                        <IconButton size="small" color="error" onClick={() => handleDelete('places', place._id)}><DeleteIcon fontSize="small" /></IconButton>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}

            {/* USERS */}
            {tab === 2 && !dataLoading && (
                <TableContainer component={Paper}>
                    <Table size="small">
                        <TableHead>
                            <TableRow>
                                <TableCell>Name</TableCell>
                                <TableCell>Email</TableCell>
                                <TableCell>Admin</TableCell>
                                <TableCell>Joined</TableCell>
                                <TableCell>Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {users.map(u => (
                                <TableRow key={u._id}>
                                    <TableCell>{u.name}</TableCell>
                                    <TableCell>{u.email}</TableCell>
                                    <TableCell>
                                        {u.isAdmin ? <Chip label="Admin" color="primary" size="small" /> : <Chip label="User" size="small" />}
                                    </TableCell>
                                    <TableCell>{new Date(u.createdAt).toLocaleDateString()}</TableCell>
                                    <TableCell>
                                        <Button size="small" onClick={() => handleToggleAdmin(u._id)}>
                                            {u.isAdmin ? 'Revoke Admin' : 'Make Admin'}
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}

            {/* REVIEWS */}
            {tab === 3 && !dataLoading && (
                <TableContainer component={Paper}>
                    <Table size="small">
                        <TableHead>
                            <TableRow>
                                <TableCell>Place</TableCell>
                                <TableCell>User</TableCell>
                                <TableCell>Rating</TableCell>
                                <TableCell>Comment</TableCell>
                                <TableCell>Date</TableCell>
                                <TableCell>Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {reviews.map(r => (
                                <TableRow key={r._id}>
                                    <TableCell>{r.place?.name}</TableCell>
                                    <TableCell>{r.user?.name} ({r.user?.email})</TableCell>
                                    <TableCell>{'★'.repeat(r.rating)}</TableCell>
                                    <TableCell sx={{ maxWidth: 200 }}><Typography noWrap variant="body2">{r.comment}</Typography></TableCell>
                                    <TableCell>{new Date(r.createdAt).toLocaleDateString()}</TableCell>
                                    <TableCell>
                                        <IconButton size="small" color="error" onClick={() => handleDelete('reviews', r._id)}><DeleteIcon fontSize="small" /></IconButton>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}

            {/* Edit Dialog */}
            <Dialog open={editDialog.open} onClose={() => setEditDialog({ open: false, type: null, item: null })} maxWidth="sm" fullWidth>
                <DialogTitle>Edit {editDialog.type === 'state' ? 'State' : 'Place'}</DialogTitle>
                <DialogContent>
                    {Object.keys(editForm).filter(k => !['_id', '__v', 'coordinates', 'images', 'tags', 'savedPlaces', 'savedItineraries'].includes(k)).map(key => (
                        <TextField
                            key={key}
                            label={key}
                            value={editForm[key] ?? ''}
                            onChange={e => setEditForm(f => ({ ...f, [key]: e.target.value }))}
                            fullWidth
                            size="small"
                            sx={{ mb: 1, mt: 1 }}
                            multiline={key === 'desc' || key === 'heroDescription'}
                            rows={key === 'desc' || key === 'heroDescription' ? 3 : 1}
                        />
                    ))}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setEditDialog({ open: false, type: null, item: null })}>Cancel</Button>
                    <Button onClick={handleEditSave} variant="contained">Save</Button>
                </DialogActions>
            </Dialog>

            <Snackbar
                open={snackbar.open}
                autoHideDuration={3000}
                onClose={() => setSnackbar(s => ({ ...s, open: false }))}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert severity={snackbar.severity} onClose={() => setSnackbar(s => ({ ...s, open: false }))}>
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    )
}

export default AdminDashboard
