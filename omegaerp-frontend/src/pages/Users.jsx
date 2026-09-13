import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import api from "../services/api"
import "./Users.css"

function Users() {
  const navigate = useNavigate()

  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [message, setMessage] = useState("")

  // Kullanıcıları backend'den getirir.
  const getUsers = async () => {
    try {
      setLoading(true)
      setError("")

      const response = await api.get("/Users")

      setUsers(response.data)
    } catch (err) {
      console.error(err)

      if (err.response?.status === 401) {
        localStorage.clear()
        navigate("/login")
        return
      }

      if (err.response?.status === 403) {
        setError(
          "Bu sayfayı görüntülemek için Admin yetkisine sahip olmalısınız."
        )
        return
      }

      setError("Kullanıcılar alınamadı.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    getUsers()
  }, [])

  // Kullanıcının rolünü değiştirir.
  const handleRoleChange = async (user, newRoleId) => {
    const newRoleName =
      Number(newRoleId) === 1 ? "Admin" : "Employee"

    const confirmed = window.confirm(
      `${user.fullName} kullanıcısının rolünü ${newRoleName} yapmak istediğinize emin misiniz?`
    )

    if (!confirmed) {
      return
    }

    try {
      setMessage("")
      setError("")

      const response = await api.put(
        `/Users/${user.id}/role`,
        {
          roleId: Number(newRoleId),
        }
      )

      setMessage(
        response.data?.message ||
          "Kullanıcı rolü güncellendi."
      )

      await getUsers()
    } catch (err) {
      console.error(err)

      if (typeof err.response?.data === "string") {
        setError(err.response.data)
      } else {
        setError("Kullanıcı rolü değiştirilemedi.")
      }
    }
  }

  // Kullanıcıyı aktif veya pasif yapar.
  const handleStatusChange = async (user) => {
    const newStatus = !user.isActive

    const confirmed = window.confirm(
      `${user.fullName} kullanıcısını ${
        newStatus ? "aktif" : "pasif"
      } hale getirmek istediğinize emin misiniz?`
    )

    if (!confirmed) {
      return
    }

    try {
      setMessage("")
      setError("")

      const response = await api.put(
        `/Users/${user.id}/status`,
        {
          isActive: newStatus,
        }
      )

      setMessage(
        response.data?.message ||
          "Kullanıcı durumu güncellendi."
      )

      await getUsers()
    } catch (err) {
      console.error(err)

      if (typeof err.response?.data === "string") {
        setError(err.response.data)
      } else {
        setError(
          "Kullanıcı durumu değiştirilemedi."
        )
      }
    }
  }

  const formatDate = (date) => {
    if (!date) {
      return "-"
    }

    return new Date(date).toLocaleString("tr-TR")
  }

  return (
    <div className="users-page">

      <div className="users-header">

        <div>
          <button
            className="back-dashboard-button"
            onClick={() => navigate("/dashboard")}
          >
            ← Dashboard'a Dön
          </button>

          <h1>Kullanıcı Yönetimi</h1>

          <p>
            Sistem kullanıcılarını ve yetkilerini
            yönetebilirsiniz.
          </p>
        </div>

      </div>

      {message && (
        <div className="users-success-message">
          {message}
        </div>
      )}

      {error && (
        <div className="users-error-message">
          {error}
        </div>
      )}

      <div className="users-card">

        {loading ? (
          <p>Kullanıcılar yükleniyor...</p>
        ) : error && users.length === 0 ? (
          <p className="users-empty">
            Kullanıcı listesi görüntülenemedi.
          </p>
        ) : users.length === 0 ? (
          <p className="users-empty">
            Sistemde kullanıcı bulunmuyor.
          </p>
        ) : (
          <div className="users-table-wrapper">

            <table className="users-table">

              <thead>
                <tr>
                  <th>ID</th>
                  <th>Ad Soyad</th>
                  <th>E-posta</th>
                  <th>Rol</th>
                  <th>Durum</th>
                  <th>Kayıt Tarihi</th>
                  <th>İşlemler</th>
                </tr>
              </thead>

              <tbody>

                {users.map((user) => (
                  <tr key={user.id}>

                    <td>{user.id}</td>

                    <td>
                      <strong>{user.fullName}</strong>
                    </td>

                    <td>{user.email}</td>

                    <td>
                      <select
                        className="role-select"
                        value={
                          user.role === "Admin"
                            ? 1
                            : 2
                        }
                        onChange={(e) =>
                          handleRoleChange(
                            user,
                            e.target.value
                          )
                        }
                      >
                        <option value={1}>
                          Admin
                        </option>

                        <option value={2}>
                          Employee
                        </option>
                      </select>
                    </td>

                    <td>
                      <span
                        className={
                          user.isActive
                            ? "status-badge active-user"
                            : "status-badge passive-user"
                        }
                      >
                        {user.isActive
                          ? "Aktif"
                          : "Pasif"}
                      </span>
                    </td>

                    <td>
                      {formatDate(user.createdAt)}
                    </td>

                    <td>
                      <button
                        className={
                          user.isActive
                            ? "deactivate-button"
                            : "activate-button"
                        }
                        onClick={() =>
                          handleStatusChange(user)
                        }
                      >
                        {user.isActive
                          ? "Pasif Yap"
                          : "Aktif Yap"}
                      </button>
                    </td>

                  </tr>
                ))}

              </tbody>

            </table>

          </div>
        )}

      </div>

    </div>
  )
}

export default Users