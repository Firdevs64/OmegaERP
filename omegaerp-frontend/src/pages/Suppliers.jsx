import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import api from "../services/api"
import "./Suppliers.css"

function Suppliers() {
  const navigate = useNavigate()

  const [suppliers, setSuppliers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const [showForm, setShowForm] = useState(false)
  const [editingSupplierId, setEditingSupplierId] = useState(null)

  const [formData, setFormData] = useState({
    supplierCode: "",
    name: "",
    phone: "",
    email: "",
    taxNumber: "",
    address: "",
  })

  const [formError, setFormError] = useState("")
  const [saving, setSaving] = useState(false)

  // Tedarikçileri backend'den getirir.
  const getSuppliers = async () => {
    try {
      setLoading(true)
      setError("")

      const response = await api.get("/Suppliers")
      setSuppliers(response.data)
    } catch (err) {
      console.error(err)

      if (err.response?.status === 401) {
        localStorage.clear()
        navigate("/login")
        return
      }

      setError("Tedarikçiler alınamadı.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    getSuppliers()
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
      supplierCode: "",
      name: "",
      phone: "",
      email: "",
      taxNumber: "",
      address: "",
    })

    setEditingSupplierId(null)
    setFormError("")
  }

  const openNewSupplierForm = () => {
    resetForm()
    setShowForm(true)
  }

  const openEditForm = (supplier) => {
    setEditingSupplierId(supplier.id)

    setFormData({
      supplierCode: supplier.supplierCode || "",
      name: supplier.name || "",
      phone: supplier.phone || "",
      email: supplier.email || "",
      taxNumber: supplier.taxNumber || "",
      address: supplier.address || "",
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

  // Yeni tedarikçi ekler veya mevcut tedarikçiyi günceller.
  const handleSubmit = async (e) => {
    e.preventDefault()

    setFormError("")
    setSaving(true)

    try {
      if (editingSupplierId) {
        const oldSupplier = suppliers.find(
          (supplier) => supplier.id === editingSupplierId
        )

        const supplierData = {
          supplierCode: formData.supplierCode,
          name: formData.name,
          phone: formData.phone || null,
          email: formData.email || null,
          taxNumber: formData.taxNumber || null,
          address: formData.address || null,
          currentBalance: oldSupplier?.currentBalance || 0,
          isActive: true,
        }

        await api.put(
          `/Suppliers/${editingSupplierId}`,
          supplierData
        )
      } else {
        const supplierData = {
          supplierCode: formData.supplierCode,
          name: formData.name,
          phone: formData.phone || null,
          email: formData.email || null,
          taxNumber: formData.taxNumber || null,
          address: formData.address || null,
          currentBalance: 0,
          isActive: true,
        }

        await api.post("/Suppliers", supplierData)
      }

      closeForm()
      await getSuppliers()
    } catch (err) {
      console.error(err)

      if (typeof err.response?.data === "string") {
        setFormError(err.response.data)
      } else if (err.response?.data?.message) {
        setFormError(err.response.data.message)
      } else {
        setFormError(
          editingSupplierId
            ? "Tedarikçi güncellenirken bir hata oluştu."
            : "Tedarikçi eklenirken bir hata oluştu."
        )
      }
    } finally {
      setSaving(false)
    }
  }

  // Tedarikçiyi siler.
  const handleDelete = async (supplier) => {
    const confirmed = window.confirm(
      `${supplier.name} tedarikçisini silmek istediğinize emin misiniz?`
    )

    if (!confirmed) {
      return
    }

    try {
      await api.delete(`/Suppliers/${supplier.id}`)
      await getSuppliers()
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
        alert("Tedarikçi silinirken bir hata oluştu.")
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
    <div className="suppliers-page">

      <div className="suppliers-header">

        <div>
          <button
            className="back-dashboard-button"
            onClick={() => navigate("/dashboard")}
          >
            ← Dashboard'a Dön
          </button>

          <h1>Tedarikçiler</h1>
          <p>Sistemde bulunan tedarikçileri görüntüleyebilirsiniz.</p>
        </div>

        <button
          className="add-supplier-button"
          onClick={openNewSupplierForm}
        >
          + Yeni Tedarikçi
        </button>

      </div>

      {showForm && (
        <div className="supplier-form-card">

          <div className="supplier-form-header">
            <div>
              <h2>
                {editingSupplierId
                  ? "Tedarikçi Düzenle"
                  : "Yeni Tedarikçi Ekle"}
              </h2>

              <p>
                {editingSupplierId
                  ? "Tedarikçi bilgilerini güncelleyebilirsiniz."
                  : "Yeni tedarikçi bilgilerini giriniz."}
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

            <div className="supplier-form-grid">

              <div className="supplier-form-group">
                <label>Tedarikçi Kodu</label>

                <input
                  type="text"
                  name="supplierCode"
                  value={formData.supplierCode}
                  onChange={handleChange}
                  placeholder="Örn: TED-0002"
                  required
                />
              </div>

              <div className="supplier-form-group">
                <label>Tedarikçi / Firma Adı</label>

                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Tedarikçi veya firma adı"
                  required
                />
              </div>

              <div className="supplier-form-group">
                <label>Telefon</label>

                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="05xx xxx xx xx"
                />
              </div>

              <div className="supplier-form-group">
                <label>E-posta</label>

                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="ornek@mail.com"
                />
              </div>

              <div className="supplier-form-group">
                <label>Vergi Numarası</label>

                <input
                  type="text"
                  name="taxNumber"
                  value={formData.taxNumber}
                  onChange={handleChange}
                  placeholder="Vergi numarası"
                />
              </div>

              <div className="supplier-form-group address-group">
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
              <div className="supplier-form-error">
                {formError}
              </div>
            )}

            <div className="supplier-form-buttons">

              <button
                type="button"
                className="cancel-button"
                onClick={closeForm}
              >
                Vazgeç
              </button>

              <button
                type="submit"
                className="save-supplier-button"
                disabled={saving}
              >
                {saving
                  ? "Kaydediliyor..."
                  : editingSupplierId
                    ? "Güncelle"
                    : "Kaydet"}
              </button>

            </div>

          </form>
        </div>
      )}

      <div className="suppliers-card">

        {loading ? (
          <p>Tedarikçiler yükleniyor...</p>
        ) : error ? (
          <p className="suppliers-error">{error}</p>
        ) : suppliers.length === 0 ? (
          <p className="empty-suppliers">
            Sistemde kayıtlı tedarikçi bulunmuyor.
          </p>
        ) : (
          <div className="suppliers-table-wrapper">

            <table className="suppliers-table">

              <thead>
                <tr>
                  <th>Tedarikçi Kodu</th>
                  <th>Tedarikçi / Firma</th>
                  <th>Telefon</th>
                  <th>E-posta</th>
                  <th>Vergi No</th>
                  <th>Cari Bakiye</th>
                  <th>İşlemler</th>
                </tr>
              </thead>

              <tbody>
                {suppliers.map((supplier) => (
                  <tr key={supplier.id}>

                    <td>{supplier.supplierCode}</td>

                    <td>
                      <strong>{supplier.name}</strong>
                    </td>

                    <td>{supplier.phone || "-"}</td>

                    <td>{supplier.email || "-"}</td>

                    <td>{supplier.taxNumber || "-"}</td>

                    <td>
                      {formatCurrency(supplier.currentBalance)}
                    </td>

                    <td>
                      <div className="supplier-actions">

                        <button
                          className="edit-supplier-button"
                          onClick={() => openEditForm(supplier)}
                        >
                          Düzenle
                        </button>

                        <button
                          className="delete-supplier-button"
                          onClick={() => handleDelete(supplier)}
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

export default Suppliers