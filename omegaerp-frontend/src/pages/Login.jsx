import { useState } from "react"
import { useNavigate } from "react-router-dom"
import api from "../services/api"
import "./Login.css"

function Login() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()

    setError("")
    setLoading(true)

    try {
      const response = await api.post("/Auth/login", {
        email,
        password,
      })

      const data = response.data

      // JWT token bilgilerini tarayıcıda saklıyoruz.
      localStorage.setItem("token", data.token)

      // Kullanıcı bilgilerini de sonraki ekranlarda kullanmak için saklıyoruz.
      localStorage.setItem("fullName", data.fullName)
      localStorage.setItem("email", data.email)
      localStorage.setItem("role", data.role)

      // Giriş başarılıysa Dashboard'a yönlendir.
      navigate("/dashboard")
    } catch (err) {
      console.error(err)

      if (err.response) {
        if (typeof err.response.data === "string") {
          setError(err.response.data)
        } else if (err.response.data?.message) {
          setError(err.response.data.message)
        } else {
          setError("Giriş işlemi başarısız oldu.")
        }
      } else {
        setError("Sunucuya bağlanılamadı.")
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-page">
      <div className="login-card">

        <div className="login-header">
          <h1>OmegaERP</h1>
          <p>ERP Yönetim Sistemi</p>
        </div>

        <form onSubmit={handleSubmit}>

          <div className="form-group">
            <label>E-posta</label>

            <input
              type="email"
              placeholder="E-posta adresinizi girin"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Şifre</label>

            <input
              type="password"
              placeholder="Şifrenizi girin"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error && (
            <div className="login-error">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="login-button"
            disabled={loading}
          >
            {loading ? "Giriş yapılıyor..." : "Giriş Yap"}
          </button>

        </form>
      </div>
    </div>
  )
}

export default Login