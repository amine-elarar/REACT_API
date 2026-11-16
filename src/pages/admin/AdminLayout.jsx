import ProtectedView from '../../components/ProtectedView'

function AdminLayout({ user, token, onLogout }) {
  return (
    <ProtectedView userRole={user.role} allowedRoles={['admin']}>
      <div>
        <header>
          <h1>Espace Administrateur</h1>
          <p>Bienvenue, {user.name} ({user.email})</p>
          <button onClick={onLogout}>Déconnexion</button>
        </header>
        <main>
          <p>Tableau de bord administrateur prêt.</p>
        </main>
      </div>
    </ProtectedView>
  )
}

export default AdminLayout
