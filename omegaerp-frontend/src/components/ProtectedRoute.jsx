import { Navigate } from "react-router-dom"

function ProtectedRoute({ children }) {
  const token = localStorage.getItem("token")

  // Token yoksa kullanıcı giriş ekranına gönderilir.
  if (!token) {
    return <Navigate to="/login" replace />
  }

  return children
}

export default ProtectedRoute