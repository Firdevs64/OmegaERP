import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import api from "../services/api"
import "./StockManagement.css"

function StockManagement() {
  const navigate = useNavigate()

  const [products, setProducts] = useState([])
  const [movements, setMovements] = useState([])
  const [criticalProducts, setCriticalProducts] = useState([])

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const [showForm, setShowForm] = useState(false)
  const [movementType, setMovementType] = useState("entry")

  const [formData, setFormData] = useState({
    productId: "",
    quantity: "",
    description: "",
  })

  const [formError, setFormError] = useState("")
  const [successMessage, setSuccessMessage] = useState("")
  const [saving, setSaving] = useState(false)

  const getProducts = async () => {
    try {
      const response = await api.get("/Products")
      setProducts(response.data)
    } catch (err) {
      console.error("Ürünler alınamadı:", err)
    }
  }

  const getMovements = async () => {
    try {
      const response = await api.get("/StockMovements")
      setMovements(response.data)
    } catch (err) {
      console.error(err)

      if (err.response?.status === 401) {
        localStorage.clear()
        navigate("/login")
        return
      }

      setError("Stok hareketleri alınamadı.")
    }
  }

  const getCriticalProducts = async () => {
    try {
      const response = await api.get(
        "/StockMovements/critical-stock"
      )

      setCriticalProducts(response.data)
    } catch (err) {
      console.error("Kritik stok bilgileri alınamadı:", err)
    }
  }

  const loadPageData = async () => {
    try {
      setLoading(true)
      setError("")

      await Promise.all([
        getProducts(),
        getMovements(),
        getCriticalProducts(),
      ])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadPageData()
  }, [])

  const resetForm = () => {
    setFormData({
      productId: "",
      quantity: "",
      description: "",
    })

    setFormError("")
    setSuccessMessage("")
  }

  const openForm = (type) => {
    resetForm()
    setMovementType(type)
    setShowForm(true)
  }

  const closeForm = () => {
    resetForm()
    setShowForm(false)
  }

  const handleChange = (e) => {
    const { name, value } = e.target

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    setSaving(true)
    setFormError("")
    setSuccessMessage("")

    try {
      const params = {
        productId: Number(formData.productId),
        quantity: Number(formData.quantity),
        description: formData.description || "",
      }

      const endpoint =
        movementType === "entry"
          ? "/StockMovements/entry"
          : "/StockMovements/exit"

      const response = await api.post(endpoint, null, {
        params,
      })

      setSuccessMessage(
        response.data?.message ||
          "Stok işlemi başarıyla tamamlandı."
      )

      await loadPageData()

      setTimeout(() => {
        closeForm()
      }, 800)
    } catch (err) {
      console.error(err)

      if (typeof err.response?.data === "string") {
        setFormError(err.response.data)
      } else if (err.response?.data?.message) {
        setFormError(err.response.data.message)
      } else {
        setFormError(
          "Stok işlemi sırasında bir hata oluştu."
        )
      }
    } finally {
      setSaving(false)
    }
  }

  const formatDate = (date) => {
    if (!date) return "-"

    return new Date(date).toLocaleString("tr-TR")
  }

  const getMovementLabel = (type) => {
    switch (type) {
      case "ManualEntry":
        return "Manuel Giriş"

      case "ManualExit":
        return "Manuel Çıkış"

      case "Purchase":
        return "Satın Alma"

      case "Sale":
        return "Satış"

      default:
        return type
    }
  }

  const getMovementClass = (type) => {
    if (
      type === "ManualEntry" ||
      type === "Purchase"
    ) {
      return "movement-entry"
    }

    return "movement-exit"
  }

  return (
    <div className="stock-page">

      <div className="stock-header">

        <div>
          <button
            className="back-dashboard-button"
            onClick={() => navigate("/dashboard")}
          >
            ← Dashboard'a Dön
          </button>

          <h1>Stok Yönetimi</h1>

          <p>
            Stok hareketlerini görüntüleyebilir ve manuel
            stok giriş-çıkış işlemleri yapabilirsiniz.
          </p>
        </div>

        <div className="stock-header-buttons">

          <button
            className="stock-entry-button"
            onClick={() => openForm("entry")}
          >
            + Stok Girişi
          </button>

          <button
            className="stock-exit-button"
            onClick={() => openForm("exit")}
          >
            - Stok Çıkışı
          </button>

        </div>

      </div>

      {showForm && (
        <div className="stock-form-card">

          <div className="stock-form-header">

            <div>
              <h2>
                {movementType === "entry"
                  ? "Manuel Stok Girişi"
                  : "Manuel Stok Çıkışı"}
              </h2>

              <p>
                İşlem yapılacak ürünü ve miktarı giriniz.
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

            <div className="stock-form-grid">

              <div className="stock-form-group">

                <label>Ürün</label>

                <select
                  name="productId"
                  value={formData.productId}
                  onChange={handleChange}
                  required
                >
                  <option value="">
                    Ürün seçin
                  </option>

                  {products.map((product) => (
                    <option
                      key={product.id}
                      value={product.id}
                    >
                      {product.code} - {product.name}
                      {" "}
                      (Stok: {product.stockQuantity})
                    </option>
                  ))}

                </select>

              </div>

              <div className="stock-form-group">

                <label>Miktar</label>

                <input
                  type="number"
                  name="quantity"
                  min="1"
                  value={formData.quantity}
                  onChange={handleChange}
                  required
                />

              </div>

              <div className="stock-form-group description-group">

                <label>Açıklama</label>

                <input
                  type="text"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="İsteğe bağlı açıklama"
                />

              </div>

            </div>

            {formError && (
              <div className="stock-form-error">
                {formError}
              </div>
            )}

            {successMessage && (
              <div className="stock-success">
                {successMessage}
              </div>
            )}

            <div className="stock-form-buttons">

              <button
                type="button"
                className="cancel-button"
                onClick={closeForm}
              >
                Vazgeç
              </button>

              <button
                type="submit"
                className={
                  movementType === "entry"
                    ? "save-entry-button"
                    : "save-exit-button"
                }
                disabled={saving}
              >
                {saving
                  ? "Kaydediliyor..."
                  : movementType === "entry"
                    ? "Stok Girişi Yap"
                    : "Stok Çıkışı Yap"}
              </button>

            </div>

          </form>

        </div>
      )}

      <div className="critical-stock-card">

        <div className="section-title">
          <h2>Kritik Stoktaki Ürünler</h2>
        </div>

        {criticalProducts.length === 0 ? (
          <p className="critical-empty">
            Kritik stok seviyesinde ürün bulunmuyor.
          </p>
        ) : (
          <div className="critical-grid">

            {criticalProducts.map((product) => (
              <div
                className="critical-product"
                key={product.id}
              >
                <strong>{product.name}</strong>

                <span>
                  {product.code}
                </span>

                <p>
                  Stok: {product.stockQuantity} / Minimum:{" "}
                  {product.minimumStockLevel}
                </p>
              </div>
            ))}

          </div>
        )}

      </div>

      <div className="stock-movements-card">

        <div className="section-title">
          <h2>Stok Hareketleri</h2>
        </div>

        {loading ? (
          <p>Stok hareketleri yükleniyor...</p>
        ) : error ? (
          <p className="stock-error">
            {error}
          </p>
        ) : movements.length === 0 ? (
          <p>Henüz stok hareketi bulunmuyor.</p>
        ) : (
          <div className="stock-table-wrapper">

            <table className="stock-table">

              <thead>
                <tr>
                  <th>Tarih</th>
                  <th>Ürün Kodu</th>
                  <th>Ürün</th>
                  <th>İşlem Türü</th>
                  <th>Miktar</th>
                  <th>Açıklama</th>
                </tr>
              </thead>

              <tbody>

                {movements.map((movement) => (
                  <tr key={movement.id}>

                    <td>
                      {formatDate(
                        movement.transactionDate
                      )}
                    </td>

                    <td>
                      {movement.product?.code || "-"}
                    </td>

                    <td>
                      <strong>
                        {movement.product?.name || "-"}
                      </strong>
                    </td>

                    <td>
                      <span
                        className={`movement-badge ${getMovementClass(
                          movement.movementType
                        )}`}
                      >
                        {getMovementLabel(
                          movement.movementType
                        )}
                      </span>
                    </td>

                    <td>
                      {movement.quantity}
                    </td>

                    <td>
                      {movement.description || "-"}
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

export default StockManagement