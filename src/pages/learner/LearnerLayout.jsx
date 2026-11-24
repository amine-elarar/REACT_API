import { useState } from 'react'
import ProtectedView from '../../components/ProtectedView'

function LearnerLayout({ user, token, onLogout }) {
  const [enrollments, setEnrollments] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [hasLoaded, setHasLoaded] = useState(false)
  const [filterCategory, setFilterCategory] = useState('all')

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

  const categories = Array.from(
    new Set(enrollments.map((item) => item.course?.category).filter(Boolean))
  )

  const filteredEnrollments = enrollments.filter((item) => {
    if (filterCategory === 'all') return true
    return item.course?.category === filterCategory
  })

  return (
    <ProtectedView userRole={user.role} allowedRoles={['learner']}>
      <div style={{ maxWidth: '960px', margin: '0 auto' }}>
        <header className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h1 style={{ fontSize: '24px', fontWeight: '700', color: '#F8FAFC' }}>Espace Apprenant</h1>
            <p style={{ color: 'rgba(148, 163, 184, 0.85)', marginTop: '4px', fontSize: '14px' }}>
              Bienvenue, <strong>{user.name}</strong> ({user.email})
            </p>
          </div>
          <button onClick={onLogout}>Déconnexion</button>
        </header>

        <main className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#F8FAFC' }}>Mes Cours Inscrits</h2>
              <p style={{ fontSize: '13px', color: 'rgba(148, 163, 184, 0.85)', marginTop: '2px' }}>
                Suivez votre progression pédagogique
              </p>
            </div>
            <button onClick={handleLoadCourses} disabled={loading}>
              {loading ? 'Chargement...' : 'Charger mes cours'}
            </button>
          </div>

          {error && (
            <div style={{ background: 'rgba(239, 68, 68, 0.12)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '10px', padding: '12px 16px', color: '#FCA5A5', marginBottom: '20px', fontSize: '14px' }}>
              {error}
            </div>
          )}

          {enrollments.length > 0 && categories.length > 0 && (
            <div style={{ marginBottom: '20px', maxWidth: '280px' }}>
              <label htmlFor="learnerCatFilter" style={{ display: 'block', marginBottom: '6px', fontSize: '12px', fontWeight: '500', color: '#94A3B8' }}>
                Filtrer par catégorie
              </label>
              <select
                id="learnerCatFilter"
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
              >
                <option value="all">Toutes les catégories</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          )}

          {hasLoaded && filteredEnrollments.length === 0 && !loading && !error && (
            <div style={{ textAlign: 'center', padding: '48px 20px', color: 'rgba(148, 163, 184, 0.75)' }}>
              <p style={{ fontSize: '15px', marginBottom: '6px' }}>Vous n'êtes inscrit à aucun cours pour le moment.</p>
              <p style={{ fontSize: '13px', color: 'rgba(148, 163, 184, 0.55)' }}>Consultez le catalogue pour découvrir les formations disponibles.</p>
            </div>
          )}

          {filteredEnrollments.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {filteredEnrollments.map((item) => (
                <div key={item._id} className="item-card">
                  <div>
                    <strong style={{ fontSize: '15px', color: '#F8FAFC' }}>{item.course?.title || 'Cours sans titre'}</strong>
                    <div style={{ display: 'flex', gap: '12px', fontSize: '13px', color: 'rgba(148, 163, 184, 0.85)', marginTop: '4px' }}>
                      {item.course?.category && (
                        <span>Catégorie: <span style={{ color: '#C7D2FE' }}>{item.course.category}</span></span>
                      )}
                      {item.course?.level && (
                        <span>Niveau: <span style={{ color: '#C7D2FE' }}>{item.course.level}</span></span>
                      )}
                    </div>
                  </div>
                  <span className={item.status === 'completed' ? 'badge badge-success' : 'badge'}>
                    {item.status || 'inscrit'}
                  </span>
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
