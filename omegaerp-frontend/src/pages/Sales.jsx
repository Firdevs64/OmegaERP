import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import api from "../services/api"
import "./Sales.css"

function Sales() {
  const navigate = useNavigate()

  const [sales, setSales] = useState([])
  const [customers, setCustomers] = useState([])
  const [products, setProducts] = useState([])

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)

  const [formError, setFormError] = useState("")
  const [successMessage, setSuccessMessage] = useState("")

  const [customerId, setCustomerId] = useState("")

  const [items, setItems] = useState([
    {
      productId: "",
      quantity: 1,
      unitPrice: "",
    },
  ])

  // Satış kayıtlarını getirir.
  const getSales = async () => {
    try {
      setLoading(true)
      setError("")

      const response = await api.get("/Sales")
      setSales(response.data)
    } catch (err) {
      console.error(err)

      if (err.response?.status === 401) {
        localStorage.clear()
        navigate("/login")
        return
      }

      setError("Satış kayıtları alınamadı.")
    } finally {
      setLoading(false)
    }
  }

  // Aktif müşterileri getirir.
  const getCustomers = async () => {
    try {
      const response = await api.get("/Customers")
      setCustomers(response.data)
    } catch (err) {
      console.error("Müşteriler alınamadı:", err)
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
    getSales()
    getCustomers()
    getProducts()
  }, [])

  const resetForm = () => {
    setCustomerId("")

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

    // Ürün seçildiğinde satış fiyatını otomatik getirir.
    if (field === "productId") {
      const selectedProduct = products.find(
        (product) => product.id === Number(value)
      )

      if (selectedProduct) {
        newItems[index].unitPrice = selectedProduct.salePrice
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

  // Yeni satış işlemi oluşturur.
  const handleSubmit = async (e) => {
    e.preventDefault()

    setSaving(true)
    setFormError("")
    setSuccessMessage("")

    try {
      const saleData = {
        customerId: Number(customerId),

        items: items.map((item) => ({
          productId: Number(item.productId),
          quantity: Number(item.quantity),
          unitPrice: Number(item.unitPrice),
        })),
      }

      const response = await api.post("/Sales", saleData)

      setSuccessMessage(
        response.data?.message ||
          "Satış işlemi başarıyla oluşturuldu."
      )

      await getSales()

      // Satıştan sonra stok değişeceği için ürünleri tekrar çek.
      await getProducts()

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
          "Satış işlemi sırasında bir hata oluştu."
        )
      }
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="sales-page">

      <div className="sales-header">

        <div>
          <button
            className="back-dashboard-button"
            onClick={() => navigate("/dashboard")}
          >
            ← Dashboard'a Dön
          </button>

          <h1>Satışlar</h1>

          <p>
            Satış kayıtlarını görüntüleyebilir ve yeni satış
            işlemi oluşturabilirsiniz.
          </p>
        </div>

        <button
          className="add-sale-button"
          onClick={openForm}
        >
          + Yeni Satış
        </button>

      </div>

      {showForm && (
        <div className="sale-form-card">

          <div className="sale-form-header">

            <div>
              <h2>Yeni Satış</h2>
              <p>Müşteri ve ürün bilgilerini giriniz.</p>
            </div>

            <button
              className="close-form-button"
              onClick={closeForm}
            >
              X
            </button>

          </div>

          <form onSubmit={handleSubmit}>

            <div className="customer-selection">

              <label>Müşteri</label>

              <select
                value={customerId}
                onChange={(e) =>
                  setCustomerId(e.target.value)
                }
                required
              >
                <option value="">
                  Müşteri seçin
                </option>

                {customers.map((customer) => (
                  <option
                    key={customer.id}
                    value={customer.id}
                  >
                    {customer.customerCode} - {customer.name}
                  </option>
                ))}

              </select>

            </div>

            <div className="sale-items-header">
              <h3>Ürünler</h3>

              <button
                type="button"
                className="add-item-button"
                onClick={addItem}
              >
                + Ürün Ekle
              </button>
            </div>

            <div className="sale-items">

              {items.map((item, index) => (
                <div
                  className="sale-item-row"
                  key={index}
                >

                  <div className="sale-field product-field">

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
                          {" "}
                          (Stok: {product.stockQuantity})
                        </option>
                      ))}

                    </select>

                  </div>

                  <div className="sale-field">

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

                  <div className="sale-field">

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

                  <div className="sale-field">

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

            <div className="sale-grand-total">

              <span>Genel Toplam</span>

              <strong>
                {formatCurrency(calculateGrandTotal())}
              </strong>

            </div>

            {formError && (
              <div className="sale-form-error">
                {formError}
              </div>
            )}

            {successMessage && (
              <div className="sale-success">
                {successMessage}
              </div>
            )}

            <div className="sale-form-buttons">

              <button
                type="button"
                className="cancel-button"
                onClick={closeForm}
              >
                Vazgeç
              </button>

              <button
                type="submit"
                className="save-sale-button"
                disabled={saving}
              >
                {saving
                  ? "Kaydediliyor..."
                  : "Satışı Kaydet"}
              </button>

            </div>

          </form>

        </div>
      )}

      <div className="sales-card">

        {loading ? (
          <p>Satışlar yükleniyor...</p>
        ) : error ? (
          <p className="sales-error">
            {error}
          </p>
        ) : sales.length === 0 ? (
          <p className="empty-sales">
            Henüz satış kaydı bulunmuyor.
          </p>
        ) : (
          <div className="sales-table-wrapper">

            <table className="sales-table">

              <thead>
                <tr>
                  <th>Fatura No</th>
                  <th>Müşteri</th>
                  <th>Tarih</th>
                  <th>Ürünler</th>
                  <th>Toplam</th>
                  <th>Durum</th>
                </tr>
              </thead>

              <tbody>

                {sales.map((sale) => (
                  <tr key={sale.id}>

                    <td>
                      {sale.invoiceNumber}
                    </td>

                    <td>
                      <strong>
                        {sale.customer?.customerName || "-"}
                      </strong>
                    </td>

                    <td>
                      {formatDate(sale.saleDate)}
                    </td>

                    <td>
                      {sale.items?.length > 0 ? (
                        sale.items.map((item) => (
                          <div
                            className="sale-product-line"
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
                      {formatCurrency(sale.totalAmount)}
                    </td>

                    <td>
                      <span className="sale-status">
                        {sale.status}
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

export default Sales