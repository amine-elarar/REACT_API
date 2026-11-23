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

      if (response.status === 403) {
        setError('Accès refusé.')
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
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        <header className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ fontSize: '24px', color: '#38BDF8' }}>Espace Apprenant</h1>
            <p style={{ color: 'rgba(255, 255, 255, 0.7)', marginTop: '4px' }}>
              Bienvenue, <strong>{user.name}</strong> ({user.email})
            </p>
          </div>
          <button onClick={onLogout}>Déconnexion</button>
        </header>

        <main className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h2>Mes Cours Inscrits</h2>
            <button onClick={handleLoadCourses} disabled={loading}>
              {loading ? 'Chargement...' : 'Charger mes cours'}
            </button>
          </div>

          {error && <p style={{ color: '#F87171', marginBottom: '16px' }}>{error}</p>}

          {hasLoaded && enrollments.length === 0 && !loading && !error && (
            <p style={{ color: 'rgba(255, 255, 255, 0.6)', fontStyle: 'italic', padding: '16px 0' }}>
              Vous n'êtes inscrit à aucun cours pour le moment.
            </p>
          )}

          {enrollments.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {enrollments.map((item) => (
                <div key={item._id} className="item-card">
                  <div>
                    <strong>{item.course?.title || 'Cours sans titre'}</strong>
                    {item.course?.category && (
                      <span style={{ display: 'block', fontSize: '13px', color: 'rgba(255, 255, 255, 0.6)' }}>
                        Catégorie: {item.course.category}
                      </span>
                    )}
                  </div>
                  <span className="badge">{item.status || 'inscrit'}</span>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </ProtectedView>
  )
}

export default LearnerLayout
