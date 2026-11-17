import { useState } from 'react'
import ProtectedView from '../../components/ProtectedView'

function LearnerLayout({ user, token, onLogout }) {
  const [enrollments, setEnrollments] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [hasLoaded, setHasLoaded] = useState(false)

  async function handleLoadCourses() {
    setLoading(true)
    setError('')

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/enrollments/me`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      const data = await response.json()

      if (response.status === 401) {
        onLogout()
        return
      }

      if (!response.ok) {
        setError(data.message || 'Erreur lors du chargement des cours.')
        return
      }

      setEnrollments(data.data?.enrollments || [])
      setHasLoaded(true)
    } catch (err) {
      setError('Impossible de se connecter au serveur.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <ProtectedView userRole={user.role} allowedRoles={['learner']}>
      <div>
        <header>
          <h1>Espace Apprenant</h1>
          <p>Bienvenue, {user.name} 👋</p>
          <button onClick={onLogout}>Déconnexion</button>
        </header>

        <main>
          <h2>Mes Cours</h2>

          <button onClick={handleLoadCourses} disabled={loading}>
            {loading ? 'Chargement...' : 'Charger mes cours'}
          </button>

          {error && <p style={{ color: 'red' }}>{error}</p>}

          {hasLoaded && enrollments.length === 0 && !loading && !error && (
            <p>Vous n'êtes inscrit à aucun cours pour le moment.</p>
          )}

          {enrollments.length > 0 && (
            <ul>
              {enrollments.map((item) => (
                <li key={item._id}>
                  <strong>{item.course?.title || 'Cours sans titre'}</strong>
                  {item.course?.category && <span> - Catégorie: {item.course.category}</span>}
                  {item.status && <span> - Statut: {item.status}</span>}
                </li>
              ))}
            </ul>
          )}
        </main>
      </div>
    </ProtectedView>
  )
}

export default LearnerLayout
