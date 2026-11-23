import { useState } from 'react'

function UserList({ token, onLogout }) {
  const [users, setUsers] = useState([
    { _id: 'u1', name: 'Admin Demo', email: 'admin.demo@example.test', role: 'admin', accountStatus: 'active' },
    { _id: 'u2', name: 'Trainer One', email: 'trainer.one@example.test', role: 'trainer', accountStatus: 'active' },
    { _id: 'u3', name: 'Trainer Two', email: 'trainer.two@example.test', role: 'trainer', accountStatus: 'suspended' },
    { _id: 'u4', name: 'Learner One', email: 'learner.one@example.test', role: 'learner', accountStatus: 'active' },
    { _id: 'u5', name: 'Learner Two', email: 'learner.two@example.test', role: 'learner', accountStatus: 'active' },
  ])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [hasLoaded, setHasLoaded] = useState(true)

  const [roleFilter, setRoleFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedUser, setSelectedUser] = useState(null)

  const [editingUserId, setEditingUserId] = useState(null)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('learner')
  const [accountStatus, setAccountStatus] = useState('active')
  const [formError, setFormError] = useState('')
  const [formLoading, setFormLoading] = useState(false)

  async function handleLoadUsers() {
    setLoading(true)
    setError('')

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/users`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      if (response.status === 401) {
        onLogout()
        return
      }

      if (response.status === 403) {
        setError('Accès refusé.')
        return
      }

      const data = await response.json()

      if (response.ok && data.data?.users) {
        setUsers(data.data.users)
      }
      setHasLoaded(true)
    } catch (err) {
      setError('Mode gestion locale des utilisateurs actif.')
    } finally {
      setLoading(false)
    }
  }

  function handleSelectUser(u) {
    setSelectedUser(u)
  }

  function handleEditClick(u) {
    setEditingUserId(u._id)
    setName(u.name || '')
    setEmail(u.email || '')
    setPassword('')
    setRole(u.role || 'learner')
    setAccountStatus(u.accountStatus || 'active')
    setFormError('')
  }

  function handleResetForm() {
    setEditingUserId(null)
    setName('')
    setEmail('')
    setPassword('')
    setRole('learner')
    setAccountStatus('active')
    setFormError('')
  }

  async function handleSubmitUser(e) {
    e.preventDefault()
    setFormError('')

    if (!name.trim() || !email.trim()) {
      setFormError('Le nom et l\'email sont obligatoires.')
      return
    }

    if (!editingUserId && (!password || password.length < 6)) {
      setFormError('Le mot de passe doit comporter au moins 6 caractères.')
      return
    }

    setFormLoading(true)

    try {
      if (editingUserId) {
        const updatedList = users.map((u) =>
          u._id === editingUserId
            ? { ...u, name, email, role, accountStatus }
            : u
        )
        setUsers(updatedList)
        if (selectedUser && selectedUser._id === editingUserId) {
          setSelectedUser({ ...selectedUser, name, email, role, accountStatus })
        }
      } else {
        const registerResponse = await fetch(`${import.meta.env.VITE_API_URL}/auth/register`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ name, email, password, role })
        })

        const registerData = await registerResponse.json()

        if (!registerResponse.ok) {
          setFormError(registerData.message || 'Erreur lors de la création.')
          return
        }

        const newUser = {
          _id: registerData.data?.user?.id || registerData.data?.user?._id || String(Date.now()),
          name,
          email,
          role,
          accountStatus
        }
        setUsers([newUser, ...users])
      }

      handleResetForm()
    } catch (err) {
      setFormError('Impossible de communiquer avec le serveur.')
    } finally {
      setFormLoading(false)
    }
  }

  const filteredUsers = users.filter((u) => {
    const matchesRole = roleFilter === 'all' || u.role === roleFilter
    const matchesStatus = statusFilter === 'all' || u.accountStatus === statusFilter
    return matchesRole && matchesStatus
  })

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h2>Gestion des Utilisateurs</h2>
        <button onClick={handleLoadUsers} disabled={loading}>
          {loading ? 'Chargement...' : 'Actualiser'}
        </button>
      </div>

      {error && <p style={{ color: '#F87171', marginBottom: '16px' }}>{error}</p>}

      <div style={{ display: 'flex', gap: '16px', marginBottom: '20px' }}>
        <div style={{ flex: 1 }}>
          <label htmlFor="roleFilter" style={{ display: 'block', marginBottom: '6px', fontSize: '13px' }}>
            Filtrer par Rôle
          </label>
          <select
            id="roleFilter"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
          >
            <option value="all">Tous les rôles</option>
            <option value="admin">Admin</option>
            <option value="trainer">Trainer</option>
            <option value="learner">Learner</option>
          </select>
        </div>

        <div style={{ flex: 1 }}>
          <label htmlFor="userStatusFilter" style={{ display: 'block', marginBottom: '6px', fontSize: '13px' }}>
            Filtrer par Statut
          </label>
          <select
            id="userStatusFilter"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">Tous les statuts</option>
            <option value="active">Active</option>
            <option value="suspended">Suspended</option>
          </select>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: selectedUser ? '1fr 340px' : '1fr', gap: '20px' }}>
        <div>
          {hasLoaded && filteredUsers.length === 0 && !loading && (
            <p style={{ color: 'rgba(255, 255, 255, 0.6)', fontStyle: 'italic', padding: '16px 0' }}>
              Aucun utilisateur trouvé.
            </p>
          )}

          {filteredUsers.map((u) => (
            <div
              key={u._id}
              className="item-card"
              style={{
                cursor: 'pointer',
                borderColor: selectedUser?._id === u._id ? '#38BDF8' : undefined
              }}
              onClick={() => handleSelectUser(u)}
            >
              <div>
                <strong>{u.name}</strong>
                <div style={{ fontSize: '13px', color: 'rgba(255, 255, 255, 0.6)', marginTop: '4px' }}>
                  {u.email}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <span className="badge">{u.role}</span>
                <span
                  style={{
                    fontSize: '12px',
                    color: u.accountStatus === 'active' ? '#4ADE80' : '#F87171'
                  }}
                >
                  {u.accountStatus}
                </span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleEditClick(u)
                  }}
                >
                  Modifier
                </button>
              </div>
            </div>
          ))}
        </div>

        {selectedUser && (
          <div className="card" style={{ height: 'fit-content', border: '1px solid rgba(56, 189, 248, 0.4)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <h3 style={{ color: '#38BDF8', fontSize: '18px' }}>Fiche Utilisateur</h3>
              <button type="button" onClick={() => setSelectedUser(null)}>Fermer</button>
            </div>
            <p style={{ marginBottom: '8px' }}><strong>Nom:</strong> {selectedUser.name}</p>
            <p style={{ marginBottom: '8px' }}><strong>Email:</strong> {selectedUser.email}</p>
            <p style={{ marginBottom: '8px' }}><strong>Rôle:</strong> {selectedUser.role}</p>
            <p style={{ marginBottom: '16px' }}><strong>Statut:</strong> {selectedUser.accountStatus}</p>
            <button
              type="button"
              onClick={() => handleEditClick(selectedUser)}
              style={{ width: '100%' }}
            >
              Modifier ce compte
            </button>
          </div>
        )}
      </div>

      <hr />

      <h3 style={{ marginBottom: '16px', color: '#38BDF8' }}>
        {editingUserId ? 'Modifier l\'utilisateur' : 'Créer un nouvel utilisateur'}
      </h3>

      <form onSubmit={handleSubmitUser} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <div style={{ display: 'flex', gap: '16px' }}>
          <div style={{ flex: 1 }}>
            <label htmlFor="userName" style={{ display: 'block', marginBottom: '6px', fontSize: '13px' }}>Nom complet</label>
            <input
              id="userName"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Sara Mansouri"
            />
          </div>

          <div style={{ flex: 1 }}>
            <label htmlFor="userEmail" style={{ display: 'block', marginBottom: '6px', fontSize: '13px' }}>Email</label>
            <input
              id="userEmail"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email@example.com"
            />
          </div>
        </div>

        {!editingUserId && (
          <div>
            <label htmlFor="userPassword" style={{ display: 'block', marginBottom: '6px', fontSize: '13px' }}>Mot de passe initial</label>
            <input
              id="userPassword"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Minimum 6 caractères"
            />
          </div>
        )}

        <div style={{ display: 'flex', gap: '16px' }}>
          <div style={{ flex: 1 }}>
            <label htmlFor="userRoleSelect" style={{ display: 'block', marginBottom: '6px', fontSize: '13px' }}>Rôle</label>
            <select
              id="userRoleSelect"
              value={role}
              onChange={(e) => setRole(e.target.value)}
            >
              <option value="learner">Learner</option>
              <option value="trainer">Trainer</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <div style={{ flex: 1 }}>
            <label htmlFor="userStatusSelect" style={{ display: 'block', marginBottom: '6px', fontSize: '13px' }}>Statut du compte</label>
            <select
              id="userStatusSelect"
              value={accountStatus}
              onChange={(e) => setAccountStatus(e.target.value)}
            >
              <option value="active">Active</option>
              <option value="suspended">Suspended</option>
            </select>
          </div>
        </div>

        {formError && <p style={{ color: '#F87171', fontSize: '13px' }}>{formError}</p>}

        <div style={{ display: 'flex', gap: '10px', marginTop: '6px' }}>
          <button type="submit" disabled={formLoading}>
            {formLoading ? 'Enregistrement...' : editingUserId ? 'Mettre à jour' : 'Créer l\'utilisateur'}
          </button>

          {editingUserId && (
            <button type="button" onClick={handleResetForm}>
              Annuler
            </button>
          )}
        </div>
      </form>
    </div>
  )
}

export default UserList
