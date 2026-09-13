import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import api from "../services/api"
import "./Products.css"

function Products() {
  const navigate = useNavigate()

  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const [showForm, setShowForm] = useState(false)
  const [editingProductId, setEditingProductId] = useState(null)

  const [formData, setFormData] = useState({
    code: "",
    name: "",
    categoryId: "",
    purchasePrice: "",
    salePrice: "",
    stockQuantity: "",
    minimumStockLevel: "",
    unit: "Adet",
  })

  const [formError, setFormError] = useState("")
  const [saving, setSaving] = useState(false)

  // Ürünleri backend'den getirir.
  const getProducts = async () => {
    try {
      setLoading(true)
      setError("")

      const response = await api.get("/Products")
      setProducts(response.data)
    } catch (err) {
      console.error(err)

      if (err.response?.status === 401) {
        localStorage.clear()
        navigate("/login")
        return
      }

      setError("Ürünler alınamadı.")
    } finally {
      setLoading(false)
    }
  }

  // Kategorileri backend'den getirir.
  const getCategories = async () => {
    try {
      const response = await api.get("/Categories")
      setCategories(response.data)
    } catch (err) {
      console.error("Kategoriler alınamadı:", err)
    }
  }

  useEffect(() => {
    getProducts()
    getCategories()
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
      code: "",
      name: "",
      categoryId: "",
      purchasePrice: "",
      salePrice: "",
      stockQuantity: "",
      minimumStockLevel: "",
      unit: "Adet",
    })

    setEditingProductId(null)
    setFormError("")
  }

  const openNewProductForm = () => {
    resetForm()
    setShowForm(true)
  }

  const openEditForm = (product) => {
    setEditingProductId(product.id)

    setFormData({
      code: product.code,
      name: product.name,
      categoryId: product.categoryId,
      purchasePrice: product.purchasePrice,
      salePrice: product.salePrice,
      stockQuantity: product.stockQuantity,
      minimumStockLevel: product.minimumStockLevel,
      unit: product.unit,
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
      const productData = {
        code: formData.code,
        name: formData.name,
        categoryId: Number(formData.categoryId),
        purchasePrice: Number(formData.purchasePrice),
        salePrice: Number(formData.salePrice),
        stockQuantity: Number(formData.stockQuantity),
        minimumStockLevel: Number(formData.minimumStockLevel),
        unit: formData.unit,
        isActive: true,
      }

      if (editingProductId) {
        await api.put(`/Products/${editingProductId}`, productData)
      } else {
        await api.post("/Products", productData)
      }

      closeForm()
      await getProducts()
    } catch (err) {
      console.error(err)

      if (typeof err.response?.data === "string") {
        setFormError(err.response.data)
      } else if (err.response?.data?.message) {
        setFormError(err.response.data.message)
      } else {
        setFormError(
          editingProductId
            ? "Ürün güncellenirken bir hata oluştu."
            : "Ürün eklenirken bir hata oluştu."
        )
      }
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (product) => {
    const confirmed = window.confirm(
      `${product.name} ürününü silmek istediğinize emin misiniz?`
    )

    if (!confirmed) {
      return
    }

    try {
      await api.delete(`/Products/${product.id}`)
      await getProducts()
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
        alert("Ürün silinirken bir hata oluştu.")
      }
    }
  }

  return (
    <div className="products-page">

      <div className="products-header">

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

          <h1>Ürünler</h1>
          <p>Sistemde bulunan ürünleri görüntüleyebilirsiniz.</p>
        </div>

        <button
          className="add-product-button"
          onClick={openNewProductForm}
        >
          + Yeni Ürün
        </button>
      </div>

      {showForm && (
        <div className="product-form-card">

          <div className="product-form-header">
            <div>
              <h2>
                {editingProductId
                  ? "Ürün Düzenle"
                  : "Yeni Ürün Ekle"}
              </h2>

              <p>
                {editingProductId
                  ? "Ürün bilgilerini güncelleyebilirsiniz."
                  : "Yeni ürün bilgilerini giriniz."}
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

            <div className="product-form-grid">

              <div className="product-form-group">
                <label>Ürün Kodu</label>

                <input
                  type="text"
                  name="code"
                  value={formData.code}
                  onChange={handleChange}
                  placeholder="Örn: URN-0004"
                  required
                />
              </div>

              <div className="product-form-group">
                <label>Ürün Adı</label>

                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Ürün adını girin"
                  required
                />
              </div>

              <div className="product-form-group">
                <label>Kategori</label>

                <select
                  name="categoryId"
                  value={formData.categoryId}
                  onChange={handleChange}
                  required
                >
                  <option value="">
                    Kategori seçin
                  </option>

                  {categories.map((category) => (
                    <option
                      key={category.id}
                      value={category.id}
                    >
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="product-form-group">
                <label>Birim</label>

                <select
                  name="unit"
                  value={formData.unit}
                  onChange={handleChange}
                >
                  <option value="Adet">Adet</option>
                  <option value="Kutu">Kutu</option>
                  <option value="Paket">Paket</option>
                  <option value="Kg">Kg</option>
                  <option value="Metre">Metre</option>
                </select>
              </div>

              <div className="product-form-group">
                <label>Alış Fiyatı</label>

                <input
                  type="number"
                  name="purchasePrice"
                  value={formData.purchasePrice}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  required
                />
              </div>

              <div className="product-form-group">
                <label>Satış Fiyatı</label>

                <input
                  type="number"
                  name="salePrice"
                  value={formData.salePrice}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  required
                />
              </div>

              <div className="product-form-group">
                <label>Stok Miktarı</label>

                <input
                  type="number"
                  name="stockQuantity"
                  value={formData.stockQuantity}
                  onChange={handleChange}
                  min="0"
                  required
                />
              </div>

              <div className="product-form-group">
                <label>Minimum Stok</label>

                <input
                  type="number"
                  name="minimumStockLevel"
                  value={formData.minimumStockLevel}
                  onChange={handleChange}
                  min="0"
                  required
                />
              </div>

            </div>

            {formError && (
              <div className="product-form-error">
                {formError}
              </div>
            )}

            <div className="product-form-buttons">

              <button
                type="button"
                className="cancel-button"
                onClick={closeForm}
              >
                Vazgeç
              </button>

              <button
                type="submit"
                className="save-product-button"
                disabled={saving}
              >
                {saving
                  ? "Kaydediliyor..."
                  : editingProductId
                    ? "Güncelle"
                    : "Kaydet"}
              </button>

            </div>

          </form>
        </div>
      )}

      <div className="products-card">

        {loading ? (
          <p>Ürünler yükleniyor...</p>
        ) : error ? (
          <p className="products-error">{error}</p>
        ) : products.length === 0 ? (
          <p className="empty-products">
            Sistemde kayıtlı ürün bulunmuyor.
          </p>
        ) : (
          <div className="products-table-wrapper">

            <table className="products-table">

              <thead>
                <tr>
                  <th>Ürün Kodu</th>
                  <th>Ürün Adı</th>
                  <th>Kategori</th>
                  <th>Alış Fiyatı</th>
                  <th>Satış Fiyatı</th>
                  <th>Stok</th>
                  <th>Birim</th>
                  <th>İşlemler</th>
                </tr>
              </thead>

              <tbody>
                {products.map((product) => (
                  <tr key={product.id}>

                    <td>{product.code}</td>

                    <td>
                      <strong>{product.name}</strong>
                    </td>

                    <td>
                      {product.category?.name || "-"}
                    </td>

                    <td>
                      ₺{Number(product.purchasePrice).toLocaleString("tr-TR")}
                    </td>

                    <td>
                      ₺{Number(product.salePrice).toLocaleString("tr-TR")}
                    </td>

                    <td>
                      {product.stockQuantity}
                    </td>

                    <td>
                      {product.unit}
                    </td>

                    <td>
                      <div className="product-actions">

                        <button
                          className="edit-button"
                          onClick={() => openEditForm(product)}
                        >
                          Düzenle
                        </button>

                        <button
                          className="delete-button"
                          onClick={() => handleDelete(product)}
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

export default Products