import { useState } from 'react'

function CourseList({ token, onLogout }) {
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [hasLoaded, setHasLoaded] = useState(false)
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [searchKeyword, setSearchKeyword] = useState('')

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
          title: title.trim(),
          description: description.trim(),
          category: category.trim(),
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
    const matchesSearch = !searchKeyword.trim() ||
      course.title.toLowerCase().includes(searchKeyword.toLowerCase()) ||
      course.category.toLowerCase().includes(searchKeyword.toLowerCase())
    return matchesCategory && matchesStatus && matchesSearch
  })

  function getStatusBadgeClass(status) {
    if (status === 'published') return 'badge badge-success'
    if (status === 'draft') return 'badge badge-warning'
    return 'badge'
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#F8FAFC' }}>Catalogue des Cours</h2>
          <p style={{ fontSize: '13px', color: 'rgba(148, 163, 184, 0.85)', marginTop: '2px' }}>
            Consultez et gérez les cours de la plateforme
          </p>
        </div>
        <button onClick={handleLoadCourses} disabled={loading}>
          {loading ? 'Chargement...' : 'Actualiser le catalogue'}
        </button>
      </div>

      {error && (
        <div style={{ background: 'rgba(239, 68, 68, 0.12)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '10px', padding: '12px 16px', color: '#FCA5A5', marginBottom: '20px', fontSize: '14px' }}>
          {error}
        </div>
      )}

      {courses.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px', marginBottom: '22px' }}>
          <div>
            <label htmlFor="searchKeyword" style={{ display: 'block', marginBottom: '6px', fontSize: '12px', fontWeight: '500', color: '#94A3B8' }}>
              Recherche par mot-clé
            </label>
            <input
              id="searchKeyword"
              type="text"
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              placeholder="ex: React, MongoDB..."
            />
          </div>

          <div>
            <label htmlFor="categoryFilter" style={{ display: 'block', marginBottom: '6px', fontSize: '12px', fontWeight: '500', color: '#94A3B8' }}>
              Catégorie
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

          <div>
            <label htmlFor="statusFilter" style={{ display: 'block', marginBottom: '6px', fontSize: '12px', fontWeight: '500', color: '#94A3B8' }}>
              Statut
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
        <div style={{ textAlign: 'center', padding: '36px 0', color: 'rgba(148, 163, 184, 0.7)' }}>
          Aucun cours ne correspond aux filtres sélectionnés.
        </div>
      )}

      {filteredCourses.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '28px' }}>
          {filteredCourses.map((course) => (
            <div key={course._id} className="item-card">
              <div style={{ flex: 1 }}>
                <strong style={{ fontSize: '15px', color: '#F8FAFC' }}>{course.title}</strong>
                <div style={{ fontSize: '13px', color: 'rgba(148, 163, 184, 0.85)', marginTop: '4px' }}>
                  Catégorie: <span style={{ color: '#C7D2FE' }}>{course.category}</span> &bull; Niveau: <span style={{ color: '#C7D2FE' }}>{course.level}</span>
                  {course.estimatedDuration && <span> &bull; Durée: {course.estimatedDuration}h</span>}
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                <span className={getStatusBadgeClass(course.status)}>{course.status}</span>
                <button type="button" onClick={() => handleEditClick(course)}>
                  Modifier
                </button>
                {confirmArchiveId === course._id ? (
                  <span style={{ display: 'inline-flex', gap: '6px', alignItems: 'center' }}>
                    <button type="button" onClick={() => handleArchiveCourse(course._id)} style={{ borderColor: '#EF4444', color: '#FCA5A5', background: 'rgba(239, 68, 68, 0.2)' }}>
                      Confirmer
                    </button>
                    <button type="button" onClick={() => setConfirmArchiveId(null)}>
                      Annuler
                    </button>
                  </span>
                ) : (
                  <button type="button" onClick={() => setConfirmArchiveId(course._id)} style={{ color: 'rgba(248, 113, 113, 0.9)' }}>
                    Archiver
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <hr />

      <h3 style={{ marginBottom: '18px', fontSize: '17px', color: '#A5B4FC', fontWeight: '600' }}>
        {editingCourseId ? 'Modifier le cours sélectionné' : 'Ajouter un nouveau cours'}
      </h3>

      <form onSubmit={handleSubmitCourse} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div>
          <label htmlFor="courseTitle" style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '500', color: '#CBD5E1' }}>Titre du cours</label>
          <input
            id="courseTitle"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="ex: React Fondamentaux"
          />
        </div>

        <div>
          <label htmlFor="courseDescription" style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '500', color: '#CBD5E1' }}>Description</label>
          <textarea
            id="courseDescription"
            rows="3"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Description concise du contenu et des objectifs"
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px' }}>
          <div>
            <label htmlFor="courseCategory" style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '500', color: '#CBD5E1' }}>Catégorie</label>
            <input
              id="courseCategory"
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="ex: Web, Backend, Database"
            />
          </div>

          <div>
            <label htmlFor="courseLevel" style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '500', color: '#CBD5E1' }}>Niveau</label>
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

          <div>
            <label htmlFor="courseDuration" style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '500', color: '#CBD5E1' }}>Durée estimée (heures)</label>
            <input
              id="courseDuration"
              type="number"
              min="1"
              value={estimatedDuration}
              onChange={(e) => setEstimatedDuration(e.target.value)}
            />
          </div>
        </div>

        {formError && (
          <div style={{ background: 'rgba(239, 68, 68, 0.12)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '8px', padding: '10px 14px', color: '#FCA5A5', fontSize: '13px' }}>
            {formError}
          </div>
        )}

        <div style={{ display: 'flex', gap: '12px', marginTop: '4px' }}>
          <button type="submit" disabled={formLoading} style={{ background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)', borderColor: '#818CF8' }}>
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
