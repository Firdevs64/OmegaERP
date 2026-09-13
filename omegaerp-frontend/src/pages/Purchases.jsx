import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import api from "../services/api"
import "./Purchases.css"

function Purchases() {
  const navigate = useNavigate()

  const [purchases, setPurchases] = useState([])
  const [suppliers, setSuppliers] = useState([])
  const [products, setProducts] = useState([])

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState("")
  const [successMessage, setSuccessMessage] = useState("")

  const [supplierId, setSupplierId] = useState("")

  // Bir satın almada birden fazla ürün eklenebilir.
  const [items, setItems] = useState([
    {
      productId: "",
      quantity: 1,
      unitPrice: "",
    },
  ])

  // Satın almaları getirir.
  const getPurchases = async () => {
    try {
      setLoading(true)
      setError("")

      const response = await api.get("/Purchases")
      setPurchases(response.data)
    } catch (err) {
      console.error(err)

      if (err.response?.status === 401) {
        localStorage.clear()
        navigate("/login")
        return
      }

      setError("Satın alma kayıtları alınamadı.")
    } finally {
      setLoading(false)
    }
  }

  // Aktif tedarikçileri getirir.
  const getSuppliers = async () => {
    try {
      const response = await api.get("/Suppliers")
      setSuppliers(response.data)
    } catch (err) {
      console.error("Tedarikçiler alınamadı:", err)
    }
  }

  // Aktif ürünleri getirir.
  const getProducts = async () => {
    try {
      const response = await api.get("/Products")
      setProducts(response.data)
    } catch (err) {
      console.error("Ürünler alınamadı:", err)
    }
  }

  useEffect(() => {
    getPurchases()
    getSuppliers()
    getProducts()
  }, [])

  const resetForm = () => {
    setSupplierId("")

    setItems([
      {
        productId: "",
        quantity: 1,
        unitPrice: "",
      },
    ])

    setFormError("")
    setSuccessMessage("")
  }

  const openForm = () => {
    resetForm()
    setShowForm(true)
  }

  const closeForm = () => {
    resetForm()
    setShowForm(false)
  }

  // Ürün satırındaki alanları günceller.
  const handleItemChange = (index, field, value) => {
    const newItems = [...items]

    newItems[index] = {
      ...newItems[index],
      [field]: value,
    }

    // Ürün seçildiğinde ürünün alış fiyatını otomatik getir.
    if (field === "productId") {
      const selectedProduct = products.find(
        (product) => product.id === Number(value)
      )

      if (selectedProduct) {
        newItems[index].unitPrice = selectedProduct.purchasePrice
      }
    }

    setItems(newItems)
  }

  // Yeni ürün satırı ekler.
  const addItem = () => {
    setItems([
      ...items,
      {
        productId: "",
        quantity: 1,
        unitPrice: "",
      },
    ])
  }

  // Ürün satırını kaldırır.
  const removeItem = (index) => {
    if (items.length === 1) {
      return
    }

    const newItems = items.filter((_, i) => i !== index)
    setItems(newItems)
  }

  const calculateLineTotal = (item) => {
    const quantity = Number(item.quantity) || 0
    const unitPrice = Number(item.unitPrice) || 0

    return quantity * unitPrice
  }

  const calculateGrandTotal = () => {
    return items.reduce(
      (total, item) => total + calculateLineTotal(item),
      0
    )
  }

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("tr-TR", {
      style: "currency",
      currency: "TRY",
    }).format(value || 0)
  }

  const formatDate = (date) => {
    if (!date) return "-"

    return new Date(date).toLocaleString("tr-TR")
  }

  // Yeni satın alma oluşturur.
  const handleSubmit = async (e) => {
    e.preventDefault()

    setSaving(true)
    setFormError("")
    setSuccessMessage("")

    try {
      const purchaseData = {
        supplierId: Number(supplierId),

        items: items.map((item) => ({
          productId: Number(item.productId),
          quantity: Number(item.quantity),
          unitPrice: Number(item.unitPrice),
        })),
      }

      const response = await api.post(
        "/Purchases",
        purchaseData
      )

      setSuccessMessage(
        response.data?.message ||
          "Satın alma işlemi başarıyla oluşturuldu."
      )

      await getPurchases()

      // Ürün stokları değiştiği için ürünleri de tekrar çek.
      await getProducts()

      // Biraz bekleyip formu kapat.
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
          "Satın alma işlemi sırasında bir hata oluştu."
        )
      }
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="purchases-page">

      <div className="purchases-header">

        <div>
          <button
            className="back-dashboard-button"
            onClick={() => navigate("/dashboard")}
          >
            ← Dashboard'a Dön
          </button>

          <h1>Satın Almalar</h1>

          <p>
            Satın alma kayıtlarını görüntüleyebilir ve yeni
            satın alma işlemi oluşturabilirsiniz.
          </p>
        </div>

        <button
          className="add-purchase-button"
          onClick={openForm}
        >
          + Yeni Satın Alma
        </button>

      </div>

      {showForm && (
        <div className="purchase-form-card">

          <div className="purchase-form-header">

            <div>
              <h2>Yeni Satın Alma</h2>
              <p>
                Tedarikçi ve ürün bilgilerini giriniz.
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

            <div className="supplier-selection">

              <label>Tedarikçi</label>

              <select
                value={supplierId}
                onChange={(e) =>
                  setSupplierId(e.target.value)
                }
                required
              >
                <option value="">
                  Tedarikçi seçin
                </option>

                {suppliers.map((supplier) => (
                  <option
                    key={supplier.id}
                    value={supplier.id}
                  >
                    {supplier.supplierCode} - {supplier.name}
                  </option>
                ))}

              </select>

            </div>

            <div className="purchase-items-header">
              <h3>Ürünler</h3>

              <button
                type="button"
                className="add-item-button"
                onClick={addItem}
              >
                + Ürün Ekle
              </button>
            </div>

            <div className="purchase-items">

              {items.map((item, index) => (
                <div
                  className="purchase-item-row"
                  key={index}
                >

                  <div className="purchase-field product-field">

                    <label>Ürün</label>

                    <select
                      value={item.productId}
                      onChange={(e) =>
                        handleItemChange(
                          index,
                          "productId",
                          e.target.value
                        )
                      }
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
                        </option>
                      ))}

                    </select>

                  </div>

                  <div className="purchase-field">

                    <label>Miktar</label>

                    <input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) =>
                        handleItemChange(
                          index,
                          "quantity",
                          e.target.value
                        )
                      }
                      required
                    />

                  </div>

                  <div className="purchase-field">

                    <label>Birim Fiyat</label>

                    <input
                      type="number"
                      min="0.01"
                      step="0.01"
                      value={item.unitPrice}
                      onChange={(e) =>
                        handleItemChange(
                          index,
                          "unitPrice",
                          e.target.value
                        )
                      }
                      required
                    />

                  </div>

                  <div className="purchase-field">

                    <label>Toplam</label>

                    <div className="line-total">
                      {formatCurrency(
                        calculateLineTotal(item)
                      )}
                    </div>

                  </div>

                  <button
                    type="button"
                    className="remove-item-button"
                    onClick={() => removeItem(index)}
                    disabled={items.length === 1}
                  >
                    Sil
                  </button>

                </div>
              ))}

            </div>

            <div className="purchase-grand-total">

              <span>Genel Toplam</span>

              <strong>
                {formatCurrency(calculateGrandTotal())}
              </strong>

            </div>

            {formError && (
              <div className="purchase-form-error">
                {formError}
              </div>
            )}

            {successMessage && (
              <div className="purchase-success">
                {successMessage}
              </div>
            )}

            <div className="purchase-form-buttons">

              <button
                type="button"
                className="cancel-button"
                onClick={closeForm}
              >
                Vazgeç
              </button>

              <button
                type="submit"
                className="save-purchase-button"
                disabled={saving}
              >
                {saving
                  ? "Kaydediliyor..."
                  : "Satın Almayı Kaydet"}
              </button>

            </div>

          </form>

        </div>
      )}

      <div className="purchases-card">

        {loading ? (
          <p>Satın almalar yükleniyor...</p>
        ) : error ? (
          <p className="purchases-error">
            {error}
          </p>
        ) : purchases.length === 0 ? (
          <p className="empty-purchases">
            Henüz satın alma kaydı bulunmuyor.
          </p>
        ) : (
          <div className="purchases-table-wrapper">

            <table className="purchases-table">

              <thead>
                <tr>
                  <th>Fatura No</th>
                  <th>Tedarikçi</th>
                  <th>Tarih</th>
                  <th>Ürünler</th>
                  <th>Toplam</th>
                  <th>Durum</th>
                </tr>
              </thead>

              <tbody>

                {purchases.map((purchase) => (
                  <tr key={purchase.id}>

                    <td>
                      {purchase.invoiceNumber}
                    </td>

                    <td>
                      <strong>
                        {purchase.supplier?.supplierName || "-"}
                      </strong>
                    </td>

                    <td>
                      {formatDate(purchase.purchaseDate)}
                    </td>

                    <td>
                      {purchase.items?.length > 0 ? (
                        purchase.items.map((item) => (
                          <div
                            className="purchase-product-line"
                            key={item.id}
                          >
                            {item.productName} x {item.quantity}
                          </div>
                        ))
                      ) : (
                        "-"
                      )}
                    </td>

                    <td>
                      {formatCurrency(purchase.totalAmount)}
                    </td>

                    <td>
                      <span className="purchase-status">
                        {purchase.status}
                      </span>
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

export default Purchases