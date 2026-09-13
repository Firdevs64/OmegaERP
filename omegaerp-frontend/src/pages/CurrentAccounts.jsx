import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import api from "../services/api"
import "./CurrentAccounts.css"

function CurrentAccounts() {
  const navigate = useNavigate()

  const [transactions, setTransactions] = useState([])
  const [customers, setCustomers] = useState([])
  const [suppliers, setSuppliers] = useState([])

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const [showPaymentForm, setShowPaymentForm] = useState(false)
  const [paymentType, setPaymentType] = useState("customer")

  const [selectedAccountId, setSelectedAccountId] = useState("")
  const [amount, setAmount] = useState("")
  const [description, setDescription] = useState("")

  const [formError, setFormError] = useState("")
  const [successMessage, setSuccessMessage] = useState("")
  const [saving, setSaving] = useState(false)

  // Tüm cari hareketleri getirir.
  const getTransactions = async () => {
    try {
      const response = await api.get("/CurrentAccounts")
      setTransactions(response.data)
    } catch (err) {
      console.error(err)

      if (err.response?.status === 401) {
        localStorage.clear()
        navigate("/login")
        return
      }

      setError("Cari hareketler alınamadı.")
    }
  }

  // Müşterileri getirir.
  const getCustomers = async () => {
    try {
      const response = await api.get("/Customers")
      setCustomers(response.data)
    } catch (err) {
      console.error("Müşteriler alınamadı:", err)
    }
  }

  // Tedarikçileri getirir.
  const getSuppliers = async () => {
    try {
      const response = await api.get("/Suppliers")
      setSuppliers(response.data)
    } catch (err) {
      console.error("Tedarikçiler alınamadı:", err)
    }
  }

  const loadData = async () => {
    try {
      setLoading(true)
      setError("")

      await Promise.all([
        getTransactions(),
        getCustomers(),
        getSuppliers(),
      ])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const resetPaymentForm = () => {
    setSelectedAccountId("")
    setAmount("")
    setDescription("")
    setFormError("")
    setSuccessMessage("")
  }

  // Müşteriden ödeme alma formunu açar.
  const openCustomerPayment = () => {
    resetPaymentForm()
    setPaymentType("customer")
    setShowPaymentForm(true)
  }

  // Tedarikçiye ödeme yapma formunu açar.
  const openSupplierPayment = () => {
    resetPaymentForm()
    setPaymentType("supplier")
    setShowPaymentForm(true)
  }

  const closePaymentForm = () => {
    resetPaymentForm()
    setShowPaymentForm(false)
  }

  const handlePayment = async (e) => {
    e.preventDefault()

    setSaving(true)
    setFormError("")
    setSuccessMessage("")

    try {
      const paymentData = {
        amount: Number(amount),
        description:
          description ||
          (paymentType === "customer"
            ? "Müşteri ödemesi"
            : "Tedarikçi ödemesi"),
      }

      const endpoint =
        paymentType === "customer"
          ? `/CurrentAccounts/customer/${selectedAccountId}/payment`
          : `/CurrentAccounts/supplier/${selectedAccountId}/payment`

      const response = await api.post(
        endpoint,
        paymentData
      )

      setSuccessMessage(
        response.data?.message ||
          "Ödeme başarıyla kaydedildi."
      )

      await loadData()

      setTimeout(() => {
        closePaymentForm()
      }, 900)
    } catch (err) {
      console.error(err)

      if (typeof err.response?.data === "string") {
        setFormError(err.response.data)
      } else if (err.response?.data?.message) {
        setFormError(err.response.data.message)
      } else {
        setFormError(
          "Ödeme işlemi sırasında bir hata oluştu."
        )
      }
    } finally {
      setSaving(false)
    }
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

  const getTransactionLabel = (type) => {
    switch (type) {
      case "Sale":
        return "Satış"

      case "Purchase":
        return "Satın Alma"

      case "CustomerPayment":
        return "Müşteri Ödemesi"

      case "SupplierPayment":
        return "Tedarikçi Ödemesi"

      default:
        return type
    }
  }

  const getTransactionClass = (type) => {
    if (
      type === "CustomerPayment" ||
      type === "SupplierPayment"
    ) {
      return "transaction-payment"
    }

    if (type === "Sale") {
      return "transaction-sale"
    }

    return "transaction-purchase"
  }

  const selectedAccounts =
    paymentType === "customer"
      ? customers
      : suppliers

  return (
    <div className="current-page">

      <div className="current-header">

        <div>
          <button
            className="back-dashboard-button"
            onClick={() => navigate("/dashboard")}
          >
            ← Dashboard'a Dön
          </button>

          <h1>Cari Hesaplar</h1>

          <p>
            Müşteri ve tedarikçi cari hareketlerini
            görüntüleyebilirsiniz.
          </p>
        </div>

        <div className="current-header-buttons">

          <button
            className="customer-payment-button"
            onClick={openCustomerPayment}
          >
            + Müşteriden Ödeme Al
          </button>

          <button
            className="supplier-payment-button"
            onClick={openSupplierPayment}
          >
            - Tedarikçiye Ödeme Yap
          </button>

        </div>

      </div>

      {showPaymentForm && (
        <div className="payment-form-card">

          <div className="payment-form-header">

            <div>
              <h2>
                {paymentType === "customer"
                  ? "Müşteriden Ödeme Al"
                  : "Tedarikçiye Ödeme Yap"}
              </h2>

              <p>
                Cari hesaba işlenecek ödeme bilgilerini giriniz.
              </p>
            </div>

            <button
              className="close-form-button"
              onClick={closePaymentForm}
            >
              X
            </button>

          </div>

          <form onSubmit={handlePayment}>

            <div className="payment-form-grid">

              <div className="payment-form-group">

                <label>
                  {paymentType === "customer"
                    ? "Müşteri"
                    : "Tedarikçi"}
                </label>

                <select
                  value={selectedAccountId}
                  onChange={(e) =>
                    setSelectedAccountId(e.target.value)
                  }
                  required
                >
                  <option value="">
                    Seçim yapın
                  </option>

                  {selectedAccounts.map((account) => (
                    <option
                      key={account.id}
                      value={account.id}
                    >
                      {paymentType === "customer"
                        ? account.customerCode
                        : account.supplierCode}
                      {" - "}
                      {account.name}
                      {" - Bakiye: "}
                      {formatCurrency(
                        account.currentBalance
                      )}
                    </option>
                  ))}

                </select>

              </div>

              <div className="payment-form-group">

                <label>Ödeme Tutarı</label>

                <input
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={amount}
                  onChange={(e) =>
                    setAmount(e.target.value)
                  }
                  required
                />

              </div>

              <div className="payment-form-group description-group">

                <label>Açıklama</label>

                <input
                  type="text"
                  value={description}
                  onChange={(e) =>
                    setDescription(e.target.value)
                  }
                  placeholder="İsteğe bağlı açıklama"
                />

              </div>

            </div>

            {formError && (
              <div className="payment-error">
                {formError}
              </div>
            )}

            {successMessage && (
              <div className="payment-success">
                {successMessage}
              </div>
            )}

            <div className="payment-form-buttons">

              <button
                type="button"
                className="cancel-button"
                onClick={closePaymentForm}
              >
                Vazgeç
              </button>

              <button
                type="submit"
                className={
                  paymentType === "customer"
                    ? "save-customer-payment"
                    : "save-supplier-payment"
                }
                disabled={saving}
              >
                {saving
                  ? "Kaydediliyor..."
                  : "Ödemeyi Kaydet"}
              </button>

            </div>

          </form>

        </div>
      )}

      <div className="account-summary-grid">

        <div className="account-summary-card">

          <h2>Müşteri Bakiyeleri</h2>

          {customers.map((customer) => (
            <div
              className="account-row"
              key={customer.id}
            >
              <div>
                <strong>{customer.name}</strong>
                <span>{customer.customerCode}</span>
              </div>

              <b>
                {formatCurrency(
                  customer.currentBalance
                )}
              </b>
            </div>
          ))}

        </div>

        <div className="account-summary-card">

          <h2>Tedarikçi Bakiyeleri</h2>

          {suppliers.map((supplier) => (
            <div
              className="account-row"
              key={supplier.id}
            >
              <div>
                <strong>{supplier.name}</strong>
                <span>{supplier.supplierCode}</span>
              </div>

              <b>
                {formatCurrency(
                  supplier.currentBalance
                )}
              </b>
            </div>
          ))}

        </div>

      </div>

      <div className="transactions-card">

        <h2>Cari Hareketler</h2>

        {loading ? (
          <p>Cari hareketler yükleniyor...</p>
        ) : error ? (
          <p className="current-error">
            {error}
          </p>
        ) : transactions.length === 0 ? (
          <p>Henüz cari hareket bulunmuyor.</p>
        ) : (
          <div className="transactions-table-wrapper">

            <table className="transactions-table">

              <thead>
                <tr>
                  <th>Tarih</th>
                  <th>Hesap</th>
                  <th>Tür</th>
                  <th>Tutar</th>
                  <th>Açıklama</th>
                </tr>
              </thead>

              <tbody>

                {transactions.map((transaction) => (
                  <tr key={transaction.id}>

                    <td>
                      {formatDate(
                        transaction.transactionDate
                      )}
                    </td>

                    <td>
                      <strong>
                        {transaction.customerName ||
                          transaction.supplierName ||
                          "-"}
                      </strong>
                    </td>

                    <td>
                      <span
                        className={`transaction-badge ${getTransactionClass(
                          transaction.transactionType
                        )}`}
                      >
                        {getTransactionLabel(
                          transaction.transactionType
                        )}
                      </span>
                    </td>

                    <td>
                      {formatCurrency(
                        transaction.amount
                      )}
                    </td>

                    <td>
                      {transaction.description || "-"}
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

export default CurrentAccounts