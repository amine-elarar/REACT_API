import { useState } from 'react'

function UserList({ token, onLogout }) {
  const [users, setUsers] = useState([
    { _id: 'u1', name: 'Demo Admin', email: 'admin.demo@example.test', role: 'admin', accountStatus: 'active' },
    { _id: 'u2', name: 'Demo Trainer One', email: 'trainer.one@example.test', role: 'trainer', accountStatus: 'active' },
    { _id: 'u3', name: 'Demo Trainer Two', email: 'trainer.two@example.test', role: 'trainer', accountStatus: 'suspended' },
    { _id: 'u4', name: 'Demo Learner One', email: 'learner.one@example.test', role: 'learner', accountStatus: 'active' },
    { _id: 'u5', name: 'Demo Learner Two', email: 'learner.two@example.test', role: 'learner', accountStatus: 'active' },
  ])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [hasLoaded, setHasLoaded] = useState(true)

  const [roleFilter, setRoleFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
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

    const trimmedName = name.trim()
    const trimmedEmail = email.trim()

    if (!trimmedName || !trimmedEmail) {
      setFormError('Le nom et l\'email sont obligatoires.')
      return
    }

    if (!trimmedEmail.includes('@') || !trimmedEmail.includes('.')) {
      setFormError('Veuillez saisir une adresse email valide.')
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
            ? { ...u, name: trimmedName, email: trimmedEmail, role, accountStatus }
            : u
        )
        setUsers(updatedList)
        if (selectedUser && selectedUser._id === editingUserId) {
          setSelectedUser({ ...selectedUser, name: trimmedName, email: trimmedEmail, role, accountStatus })
        }
      } else {
        const registerResponse = await fetch(`${import.meta.env.VITE_API_URL}/auth/register`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ name: trimmedName, email: trimmedEmail, password, role })
        })

        const registerData = await registerResponse.json()

        if (!registerResponse.ok) {
          setFormError(registerData.message || 'Erreur lors de la création.')
          return
        }

        const newUser = {
          _id: registerData.data?.user?.id || registerData.data?.user?._id || String(Date.now()),
          name: trimmedName,
          email: trimmedEmail,
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
    const matchesSearch = !searchQuery.trim() ||
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesRole && matchesStatus && matchesSearch
  })

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#F8FAFC' }}>Gestion des Utilisateurs</h2>
          <p style={{ fontSize: '13px', color: 'rgba(148, 163, 184, 0.85)', marginTop: '2px' }}>
            Contrôlez les rôles, les statuts et les permissions
          </p>
        </div>
        <button onClick={handleLoadUsers} disabled={loading}>
          {loading ? 'Chargement...' : 'Actualiser'}
        </button>
      </div>

      {error && (
        <div style={{ background: 'rgba(99, 102, 241, 0.12)', border: '1px solid rgba(99, 102, 241, 0.3)', borderRadius: '10px', padding: '12px 16px', color: '#C7D2FE', marginBottom: '20px', fontSize: '13px' }}>
          {error}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px', marginBottom: '22px' }}>
        <div>
          <label htmlFor="userSearchQuery" style={{ display: 'block', marginBottom: '6px', fontSize: '12px', fontWeight: '500', color: '#94A3B8' }}>
            Recherche par nom ou email
          </label>
          <input
            id="userSearchQuery"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher un utilisateur..."
          />
        </div>

        <div>
          <label htmlFor="roleFilter" style={{ display: 'block', marginBottom: '6px', fontSize: '12px', fontWeight: '500', color: '#94A3B8' }}>
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

        <div>
          <label htmlFor="userStatusFilter" style={{ display: 'block', marginBottom: '6px', fontSize: '12px', fontWeight: '500', color: '#94A3B8' }}>
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
            <div style={{ textAlign: 'center', padding: '36px 0', color: 'rgba(148, 163, 184, 0.7)' }}>
              Aucun utilisateur trouvé.
            </div>
          )}

          {filteredUsers.map((u) => (
            <div
              key={u._id}
              className="item-card"
              style={{
                cursor: 'pointer',
                borderColor: selectedUser?._id === u._id ? '#818CF8' : undefined,
                background: selectedUser?._id === u._id ? 'rgba(99, 102, 241, 0.15)' : undefined
              }}
              onClick={() => handleSelectUser(u)}
            >
              <div>
                <strong style={{ fontSize: '15px', color: '#F8FAFC' }}>{u.name}</strong>
                <div style={{ fontSize: '13px', color: 'rgba(148, 163, 184, 0.85)', marginTop: '4px' }}>
                  {u.email}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <span className="badge">{u.role}</span>
                <span
                  className={u.accountStatus === 'active' ? 'badge badge-success' : 'badge badge-warning'}
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
          <div className="card" style={{ height: 'fit-content', borderColor: 'rgba(129, 140, 248, 0.4)', background: 'rgba(15, 23, 42, 0.85)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <h3 style={{ color: '#A5B4FC', fontSize: '17px', fontWeight: '600' }}>Fiche Détaillée</h3>
              <button type="button" onClick={() => setSelectedUser(null)} style={{ padding: '4px 10px', fontSize: '12px' }}>
                Fermer
              </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '14px', marginBottom: '18px' }}>
              <div><span style={{ color: '#94A3B8' }}>Nom:</span> <strong>{selectedUser.name}</strong></div>
              <div><span style={{ color: '#94A3B8' }}>Email:</span> <strong>{selectedUser.email}</strong></div>
              <div><span style={{ color: '#94A3B8' }}>Rôle:</span> <span className="badge" style={{ marginLeft: '6px' }}>{selectedUser.role}</span></div>
              <div><span style={{ color: '#94A3B8' }}>Statut:</span> <span className={selectedUser.accountStatus === 'active' ? 'badge badge-success' : 'badge badge-warning'} style={{ marginLeft: '6px' }}>{selectedUser.accountStatus}</span></div>
            </div>
            <button
              type="button"
              onClick={() => handleEditClick(selectedUser)}
              style={{ width: '100%', background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)', borderColor: '#818CF8' }}
            >
              Modifier ce profil
            </button>
          </div>
        )}
      </div>

      <hr />

      <h3 style={{ marginBottom: '18px', fontSize: '17px', color: '#A5B4FC', fontWeight: '600' }}>
        {editingUserId ? 'Modifier l\'utilisateur sélectionné' : 'Créer un nouvel utilisateur'}
      </h3>

      <form onSubmit={handleSubmitUser} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
          <div>
            <label htmlFor="userName" style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '500', color: '#CBD5E1' }}>Nom complet</label>
            <input
              id="userName"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="ex: Sara Mansouri"
            />
          </div>

          <div>
            <label htmlFor="userEmail" style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '500', color: '#CBD5E1' }}>Adresse email</label>
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
            <label htmlFor="userPassword" style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '500', color: '#CBD5E1' }}>Mot de passe initial</label>
            <input
              id="userPassword"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Minimum 6 caractères"
            />
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px' }}>
          <div>
            <label htmlFor="userRoleSelect" style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '500', color: '#CBD5E1' }}>Rôle utilisateur</label>
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

          <div>
            <label htmlFor="userStatusSelect" style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '500', color: '#CBD5E1' }}>Statut du compte</label>
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

        {formError && (
          <div style={{ background: 'rgba(239, 68, 68, 0.12)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '8px', padding: '10px 14px', color: '#FCA5A5', fontSize: '13px' }}>
            {formError}
          </div>
        )}

        <div style={{ display: 'flex', gap: '12px', marginTop: '4px' }}>
          <button type="submit" disabled={formLoading} style={{ background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)', borderColor: '#818CF8' }}>
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
