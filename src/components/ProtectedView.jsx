function ProtectedView({ userRole, allowedRoles, children }) {
  if (!allowedRoles.includes(userRole)) {
    return (
      <div className="card" style={{ border: '1px solid #EF4444', color: '#F87171' }}>
        <h3 style={{ marginBottom: '8px' }}>Accès refusé</h3>
        <p>Vous n'avez pas l'autorisation d'accéder à cette section.</p>
      </div>
    )
  }

  return children
}

export default ProtectedView
