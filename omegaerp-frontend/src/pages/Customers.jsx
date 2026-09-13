import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import api from "../services/api"
import "./Customers.css"

function Customers() {
  const navigate = useNavigate()

  const [customers, setCustomers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const [showForm, setShowForm] = useState(false)
  const [editingCustomerId, setEditingCustomerId] = useState(null)

  const [formData, setFormData] = useState({
    customerCode: "",
    name: "",
    phone: "",
    email: "",
    taxNumber: "",
    address: "",
  })

  const [formError, setFormError] = useState("")
  const [saving, setSaving] = useState(false)

  const getCustomers = async () => {
    try {
      setLoading(true)
      setError("")

      const response = await api.get("/Customers")
      setCustomers(response.data)
    } catch (err) {
      console.error(err)

      if (err.response?.status === 401) {
        localStorage.clear()
        navigate("/login")
        return
      }

      setError("Müşteriler alınamadı.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    getCustomers()
  }, [])

  const handleChange = (e) => {
    const { name, value } = e.target

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const resetForm = () => {
    setFormData({
      customerCode: "",
      name: "",
      phone: "",
      email: "",
      taxNumber: "",
      address: "",
    })

    setEditingCustomerId(null)
    setFormError("")
  }

  const openNewCustomerForm = () => {
    resetForm()
    setShowForm(true)
  }

  const openEditForm = (customer) => {
    setEditingCustomerId(customer.id)

    setFormData({
      customerCode: customer.customerCode || "",
      name: customer.name || "",
      phone: customer.phone || "",
      email: customer.email || "",
      taxNumber: customer.taxNumber || "",
      address: customer.address || "",
    })

    setFormError("")
    setShowForm(true)

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    })
  }

  const closeForm = () => {
    resetForm()
    setShowForm(false)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    setFormError("")
    setSaving(true)

    try {
      if (editingCustomerId) {
        const oldCustomer = customers.find(
          (customer) => customer.id === editingCustomerId
        )

        const customerData = {
          customerCode: formData.customerCode,
          name: formData.name,
          phone: formData.phone || null,
          email: formData.email || null,
          taxNumber: formData.taxNumber || null,
          address: formData.address || null,
          currentBalance: oldCustomer?.currentBalance || 0,
          isActive: true,
        }

        await api.put(
          `/Customers/${editingCustomerId}`,
          customerData
        )
      } else {
        const customerData = {
          customerCode: formData.customerCode,
          name: formData.name,
          phone: formData.phone || null,
          email: formData.email || null,
          taxNumber: formData.taxNumber || null,
          address: formData.address || null,
          currentBalance: 0,
          isActive: true,
        }

        await api.post("/Customers", customerData)
      }

      closeForm()
      await getCustomers()
    } catch (err) {
      console.error(err)

      if (typeof err.response?.data === "string") {
        setFormError(err.response.data)
      } else if (err.response?.data?.message) {
        setFormError(err.response.data.message)
      } else {
        setFormError(
          editingCustomerId
            ? "Müşteri güncellenirken bir hata oluştu."
            : "Müşteri eklenirken bir hata oluştu."
        )
      }
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (customer) => {
    const confirmed = window.confirm(
      `${customer.name} müşterisini silmek istediğinize emin misiniz?`
    )

    if (!confirmed) {
      return
    }

    try {
      await api.delete(`/Customers/${customer.id}`)
      await getCustomers()
    } catch (err) {
      console.error(err)

      if (err.response?.status === 401) {
        localStorage.clear()
        navigate("/login")
        return
      }

      if (typeof err.response?.data === "string") {
        alert(err.response.data)
      } else {
        alert("Müşteri silinirken bir hata oluştu.")
      }
    }
  }

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("tr-TR", {
      style: "currency",
      currency: "TRY",
    }).format(value || 0)
  }

  return (
    <div className="customers-page">

      <div className="customers-header">

        <div>
          <button
            onClick={() => navigate("/dashboard")}
            style={{
              marginBottom: "12px",
              padding: "8px 13px",
              border: "none",
              borderRadius: "7px",
              backgroundColor: "#e2e8f0",
              color: "#334155",
              fontSize: "13px",
              fontWeight: "600",
              cursor: "pointer",
            }}
          >
            ← Dashboard'a Dön
          </button>

          <h1>Müşteriler</h1>
          <p>Sistemde bulunan müşterileri görüntüleyebilirsiniz.</p>
        </div>

        <button
          className="add-customer-button"
          onClick={openNewCustomerForm}
        >
          + Yeni Müşteri
        </button>
      </div>

      {showForm && (
        <div className="customer-form-card">

          <div className="customer-form-header">
            <div>
              <h2>
                {editingCustomerId
                  ? "Müşteri Düzenle"
                  : "Yeni Müşteri Ekle"}
              </h2>

              <p>
                {editingCustomerId
                  ? "Müşteri bilgilerini güncelleyebilirsiniz."
                  : "Yeni müşteri bilgilerini giriniz."}
              </p>
            </div>

            <button
              className="close-form-button"
              onClick={closeForm}
            >
              X
            </button>
          </div>

          <form onSubmit={handleSubmit}>

            <div className="customer-form-grid">

              <div className="customer-form-group">
                <label>Müşteri Kodu</label>

                <input
                  type="text"
                  name="customerCode"
                  value={formData.customerCode}
                  onChange={handleChange}
                  placeholder="Örn: MUS-0002"
                  required
                />
              </div>

              <div className="customer-form-group">
                <label>Müşteri / Firma Adı</label>

                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Müşteri veya firma adı"
                  required
                />
              </div>

              <div className="customer-form-group">
                <label>Telefon</label>

                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="05xx xxx xx xx"
                />
              </div>

              <div className="customer-form-group">
                <label>E-posta</label>

                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="ornek@mail.com"
                />
              </div>

              <div className="customer-form-group">
                <label>Vergi Numarası</label>

                <input
                  type="text"
                  name="taxNumber"
                  value={formData.taxNumber}
                  onChange={handleChange}
                  placeholder="Vergi numarası"
                />
              </div>

              <div className="customer-form-group address-group">
                <label>Adres</label>

                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Adres bilgisi"
                />
              </div>

            </div>

            {formError && (
              <div className="customer-form-error">
                {formError}
              </div>
            )}

            <div className="customer-form-buttons">

              <button
                type="button"
                className="cancel-button"
                onClick={closeForm}
              >
                Vazgeç
              </button>

              <button
                type="submit"
                className="save-customer-button"
                disabled={saving}
              >
                {saving
                  ? "Kaydediliyor..."
                  : editingCustomerId
                    ? "Güncelle"
                    : "Kaydet"}
              </button>

            </div>

          </form>
        </div>
      )}

      <div className="customers-card">

        {loading ? (
          <p>Müşteriler yükleniyor...</p>
        ) : error ? (
          <p className="customers-error">{error}</p>
        ) : customers.length === 0 ? (
          <p className="empty-customers">
            Sistemde kayıtlı müşteri bulunmuyor.
          </p>
        ) : (
          <div className="customers-table-wrapper">

            <table className="customers-table">

              <thead>
                <tr>
                  <th>Müşteri Kodu</th>
                  <th>Müşteri / Firma</th>
                  <th>Telefon</th>
                  <th>E-posta</th>
                  <th>Vergi No</th>
                  <th>Cari Bakiye</th>
                  <th>İşlemler</th>
                </tr>
              </thead>

              <tbody>
                {customers.map((customer) => (
                  <tr key={customer.id}>

                    <td>{customer.customerCode}</td>

                    <td>
                      <strong>{customer.name}</strong>
                    </td>

                    <td>{customer.phone || "-"}</td>

                    <td>{customer.email || "-"}</td>

                    <td>{customer.taxNumber || "-"}</td>

                    <td>
                      {formatCurrency(customer.currentBalance)}
                    </td>

                    <td>
                      <div className="customer-actions">

                        <button
                          className="edit-customer-button"
                          onClick={() => openEditForm(customer)}
                        >
                          Düzenle
                        </button>

                        <button
                          className="delete-customer-button"
                          onClick={() => handleDelete(customer)}
                        >
                          Sil
                        </button>

                      </div>
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

export default Customers