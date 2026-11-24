import { useState } from 'react'
import ProtectedView from '../../components/ProtectedView'
import CourseList from './CourseList'
import UserList from './UserList'

function AdminLayout({ user, token, onLogout }) {
  const [activeTab, setActiveTab] = useState('courses')

  return (
    <ProtectedView userRole={user.role} allowedRoles={['admin']}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        <header className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ fontSize: '24px', color: '#38BDF8' }}>Espace Administrateur</h1>
            <p style={{ color: 'rgba(255, 255, 255, 0.7)', marginTop: '4px' }}>
              Connecté en tant que <strong>{user.name}</strong> ({user.email})
            </p>
          </div>
          <button onClick={onLogout}>Déconnexion</button>
        </header>

        <nav style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
          <button
            type="button"
            className={activeTab === 'courses' ? 'active' : ''}
            onClick={() => setActiveTab('courses')}
          >
            Catalogue des Cours
          </button>
          <button
            type="button"
            className={activeTab === 'users' ? 'active' : ''}
            onClick={() => setActiveTab('users')}
          >
            Gestion des Utilisateurs
          </button>
        </nav>

        <main className="card">
          {activeTab === 'courses' && <CourseList token={token} onLogout={onLogout} />}
          {activeTab === 'users' && <UserList token={token} onLogout={onLogout} />}
        </main>
      </div>
    </ProtectedView>
  )
}

export default AdminLayout
