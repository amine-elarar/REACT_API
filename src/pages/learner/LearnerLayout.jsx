import ProtectedView from '../../components/ProtectedView'

function LearnerLayout({ user, token, onLogout }) {
  return (
    <ProtectedView userRole={user.role} allowedRoles={['learner']}>
      <div>
        <header>
          <h1>Espace Apprenant</h1>
          <p>Bienvenue, {user.name} 👋</p>
          <button onClick={onLogout}>Déconnexion</button>
        </header>
        <main>
          <p>Espace personnel apprenant prêt.</p>
        </main>
      </div>
    </ProtectedView>
  )
}

export default LearnerLayout
