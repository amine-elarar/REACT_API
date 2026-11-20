function ProtectedView({ userRole, allowedRoles, children }) {
  if (!allowedRoles.includes(userRole)) {
    return (
      <div style={{ padding: '20px', border: '1px solid red', color: 'red' }}>
        <h3>Accès refusé</h3>
        <p>Vous n'avez pas l'autorisation d'accéder à cette section.</p>
      </div>
    )
  }

  return children
}

export default ProtectedView
