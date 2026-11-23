import { useState } from 'react'

function CourseList({ token, onLogout }) {
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [hasLoaded, setHasLoaded] = useState(false)
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')

  const [editingCourseId, setEditingCourseId] = useState(null)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('')
  const [level, setLevel] = useState('beginner')
  const [estimatedDuration, setEstimatedDuration] = useState(10)
  const [formError, setFormError] = useState('')
  const [formLoading, setFormLoading] = useState(false)
  const [confirmArchiveId, setConfirmArchiveId] = useState(null)

  async function handleLoadCourses() {
    setLoading(true)
    setError('')

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/courses`, {
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

      setCourses(data.data?.courses || [])
      setHasLoaded(true)
    } catch (err) {
      setError('Impossible de se connecter au serveur.')
    } finally {
      setLoading(false)
    }
  }

  function handleEditClick(course) {
    setEditingCourseId(course._id)
    setTitle(course.title || '')
    setDescription(course.description || '')
    setCategory(course.category || '')
    setLevel(course.level || 'beginner')
    setEstimatedDuration(course.estimatedDuration || 10)
    setFormError('')
  }

  function handleResetForm() {
    setEditingCourseId(null)
    setTitle('')
    setDescription('')
    setCategory('')
    setLevel('beginner')
    setEstimatedDuration(10)
    setFormError('')
  }

  async function handleSubmitCourse(e) {
    e.preventDefault()
    setFormError('')

    if (!title.trim() || !description.trim() || !category.trim()) {
      setFormError('Titre, description et catégorie sont obligatoires.')
      return
    }

    setFormLoading(true)

    try {
      const url = editingCourseId
        ? `${import.meta.env.VITE_API_URL}/courses/${editingCourseId}`
        : `${import.meta.env.VITE_API_URL}/courses`

      const method = editingCourseId ? 'PATCH' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          title,
          description,
          category,
          level,
          estimatedDuration: Number(estimatedDuration),
          objectives: ['Objectif général']
        })
      })

      const data = await response.json()

      if (response.status === 401) {
        onLogout()
        return
      }

      if (response.status === 403) {
        setFormError('Accès refusé.')
        return
      }

      if (!response.ok) {
        setFormError(data.message || 'Erreur lors de la sauvegarde.')
        return
      }

      const savedCourse = data.data?.course || data.data
      if (editingCourseId) {
        setCourses(courses.map((c) => (c._id === editingCourseId ? savedCourse : c)))
      } else if (savedCourse && savedCourse._id) {
        setCourses([...courses, savedCourse])
      } else {
        await handleLoadCourses()
      }

      handleResetForm()
    } catch (err) {
      setFormError('Impossible de se connecter au serveur.')
    } finally {
      setFormLoading(false)
    }
  }

  async function handleArchiveCourse(courseId) {
    setError('')

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/courses/${courseId}/archived`, {
        method: 'PATCH',
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
        setError(data.message || "Erreur lors de l'archivage.")
        return
      }

      setCourses(courses.map((c) => (c._id === courseId ? { ...c, status: 'archived' } : c)))
      setConfirmArchiveId(null)
    } catch (err) {
      setError('Impossible de se connecter au serveur.')
    }
  }

  const categories = Array.from(new Set(courses.map((c) => c.category).filter(Boolean)))

  const filteredCourses = courses.filter((course) => {
    const matchesCategory = categoryFilter === 'all' || course.category === categoryFilter
    const matchesStatus = statusFilter === 'all' || course.status === statusFilter
    return matchesCategory && matchesStatus
  })

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h2>Catalogue des Cours</h2>
        <button onClick={handleLoadCourses} disabled={loading}>
          {loading ? 'Chargement...' : 'Charger les cours'}
        </button>
      </div>

      {error && <p style={{ color: '#F87171', marginBottom: '16px' }}>{error}</p>}

      {courses.length > 0 && (
        <div style={{ display: 'flex', gap: '16px', marginBottom: '20px' }}>
          <div style={{ flex: 1 }}>
            <label htmlFor="categoryFilter" style={{ display: 'block', marginBottom: '6px', fontSize: '13px' }}>
              Filtrer par Catégorie
            </label>
            <select
              id="categoryFilter"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="all">Toutes les catégories</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div style={{ flex: 1 }}>
            <label htmlFor="statusFilter" style={{ display: 'block', marginBottom: '6px', fontSize: '13px' }}>
              Filtrer par Statut
            </label>
            <select
              id="statusFilter"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">Tous les statuts</option>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
              <option value="archived">Archived</option>
            </select>
          </div>
        </div>
      )}

      {hasLoaded && filteredCourses.length === 0 && !loading && (
        <p style={{ color: 'rgba(255, 255, 255, 0.6)', fontStyle: 'italic', padding: '16px 0' }}>
          Aucun cours ne correspond aux critères.
        </p>
      )}

      {filteredCourses.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '24px' }}>
          {filteredCourses.map((course) => (
            <div key={course._id} className="item-card">
              <div>
                <strong>{course.title}</strong>
                <div style={{ fontSize: '13px', color: 'rgba(255, 255, 255, 0.6)', marginTop: '4px' }}>
                  Catégorie: {course.category} | Niveau: {course.level}
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="badge">{course.status}</span>
                <button type="button" onClick={() => handleEditClick(course)}>
                  Modifier
                </button>
                {confirmArchiveId === course._id ? (
                  <span style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                    <button type="button" onClick={() => handleArchiveCourse(course._id)} style={{ borderColor: '#F87171', color: '#F87171' }}>
                      Confirmer
                    </button>
                    <button type="button" onClick={() => setConfirmArchiveId(null)}>
                      Annuler
                    </button>
                  </span>
                ) : (
                  <button type="button" onClick={() => setConfirmArchiveId(course._id)}>
                    Archiver
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <hr />

      <h3 style={{ marginBottom: '16px', color: '#38BDF8' }}>
        {editingCourseId ? 'Modifier le cours' : 'Ajouter un nouveau cours'}
      </h3>

      <form onSubmit={handleSubmitCourse} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <div>
          <label htmlFor="courseTitle" style={{ display: 'block', marginBottom: '6px', fontSize: '13px' }}>Titre</label>
          <input
            id="courseTitle"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Titre du cours"
          />
        </div>

        <div>
          <label htmlFor="courseDescription" style={{ display: 'block', marginBottom: '6px', fontSize: '13px' }}>Description</label>
          <textarea
            id="courseDescription"
            rows="3"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Description concise du cours"
          />
        </div>

        <div style={{ display: 'flex', gap: '16px' }}>
          <div style={{ flex: 1 }}>
            <label htmlFor="courseCategory" style={{ display: 'block', marginBottom: '6px', fontSize: '13px' }}>Catégorie</label>
            <input
              id="courseCategory"
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="Ex: Database, Web"
            />
          </div>

          <div style={{ flex: 1 }}>
            <label htmlFor="courseLevel" style={{ display: 'block', marginBottom: '6px', fontSize: '13px' }}>Niveau</label>
            <select
              id="courseLevel"
              value={level}
              onChange={(e) => setLevel(e.target.value)}
            >
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>

          <div style={{ width: '140px' }}>
            <label htmlFor="courseDuration" style={{ display: 'block', marginBottom: '6px', fontSize: '13px' }}>Durée (heures)</label>
            <input
              id="courseDuration"
              type="number"
              min="1"
              value={estimatedDuration}
              onChange={(e) => setEstimatedDuration(e.target.value)}
            />
          </div>
        </div>

        {formError && <p style={{ color: '#F87171', fontSize: '13px' }}>{formError}</p>}

        <div style={{ display: 'flex', gap: '10px', marginTop: '6px' }}>
          <button type="submit" disabled={formLoading}>
            {formLoading ? 'Enregistrement...' : editingCourseId ? 'Mettre à jour' : 'Créer le cours'}
          </button>

          {editingCourseId && (
            <button type="button" onClick={handleResetForm}>
              Annuler
            </button>
          )}
        </div>
      </form>
    </div>
  )
}

export default CourseList
