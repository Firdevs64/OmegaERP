import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import api from "../services/api"
import "./Dashboard.css"

function Dashboard() {
  const navigate = useNavigate()

  const [summary, setSummary] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const fullName = localStorage.getItem("fullName")
  const role = localStorage.getItem("role")

  useEffect(() => {
    const getDashboardData = async () => {
      try {
        const response = await api.get("/Dashboard/summary")
        setSummary(response.data)
      } catch (err) {
        console.error(err)

        if (err.response?.status === 401) {
          localStorage.clear()
          navigate("/login")
          return
        }

        setError("Dashboard verileri alınamadı.")
      } finally {
        setLoading(false)
      }
    }

    getDashboardData()
  }, [navigate])

  const handleLogout = () => {
    localStorage.clear()
    navigate("/login")
  }

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("tr-TR", {
      style: "currency",
      currency: "TRY",
    }).format(value || 0)
  }

  if (loading) {
    return (
      <div className="dashboard-loading">
        Dashboard yükleniyor...
      </div>
    )
  }

  if (error) {
    return (
      <div className="dashboard-loading error-text">
        {error}
      </div>
    )
  }

  return (
    <div className="dashboard-layout">

      <aside className="sidebar">

        <div className="sidebar-logo">
          <h2>OmegaERP</h2>
          <span>Yönetim Sistemi</span>
        </div>

        <nav className="sidebar-menu">

          <button
            className="menu-item active"
            onClick={() => navigate("/dashboard")}
          >
            Dashboard
          </button>

          <button
            className="menu-item"
            onClick={() => navigate("/products")}
          >
            Ürünler
          </button>

          <button
            className="menu-item"
            onClick={() => navigate("/stock")}
        >
            Stok Yönetimi
          </button>

          <button
            className="menu-item"
            onClick={() => navigate("/customers")}
          >
            Müşteriler
          </button>

          <button
            className="menu-item"
            onClick={() => navigate("/suppliers")}
          >
            Tedarikçiler
          </button>

          <button
            className="menu-item"
            onClick={() => navigate("/sales")}
        >
            Satışlar
        </button>

          <button 
            className="menu-item"
            onClick={() => navigate("/purchases")}
        >
            Satın Almalar
        </button>

          <button
            className="menu-item"
            onClick={() => navigate("/current-accounts")}
        >
            Cari Hesaplar
        </button>

          {role === "Admin" && (
            <button
                className="menu-item"
                 onClick={() => navigate("/users")}
            >
            Kullanıcılar
        </button>
        )}

        </nav>

        <button
          className="logout-button"
          onClick={handleLogout}
        >
          Çıkış Yap
        </button>

      </aside>

      <main className="dashboard-main">

        <header className="topbar">

          <div>
            <h1>Dashboard</h1>
            <p>OmegaERP genel durum özeti</p>
          </div>

          <div className="user-info">
            <strong>{fullName || "Kullanıcı"}</strong>
            <span>{role || "-"}</span>
          </div>

        </header>

        <section className="summary-grid">

          <div className="summary-card">
            <span className="card-label">Toplam Ürün</span>
            <strong className="card-value">
              {summary.totalProducts}
            </strong>
          </div>

          <div className="summary-card">
            <span className="card-label">Müşteriler</span>
            <strong className="card-value">
              {summary.totalCustomers}
            </strong>
          </div>

          <div className="summary-card">
            <span className="card-label">Tedarikçiler</span>
            <strong className="card-value">
              {summary.totalSuppliers}
            </strong>
          </div>

          <div className="summary-card critical">
            <span className="card-label">Kritik Stok</span>
            <strong className="card-value">
              {summary.criticalStockCount}
            </strong>
          </div>

          <div className="summary-card">
            <span className="card-label">Toplam Satış</span>
            <strong className="card-value money">
              {formatCurrency(summary.totalSalesAmount)}
            </strong>
          </div>

          <div className="summary-card">
            <span className="card-label">Toplam Satın Alma</span>
            <strong className="card-value money">
              {formatCurrency(summary.totalPurchasesAmount)}
            </strong>
          </div>

        </section>

        <section className="dashboard-sections">

          <div className="dashboard-panel">

            <div className="panel-header">
              <h2>Son Satışlar</h2>
            </div>

            {summary.recentSales?.length > 0 ? (
              <div className="table-wrapper">

                <table>
                  <thead>
                    <tr>
                      <th>Fatura</th>
                      <th>Müşteri</th>
                      <th>Tutar</th>
                    </tr>
                  </thead>

                  <tbody>
                    {summary.recentSales.map((sale) => (
                      <tr key={sale.id}>
                        <td>{sale.invoiceNumber}</td>
                        <td>{sale.customerName || "-"}</td>
                        <td>{formatCurrency(sale.totalAmount)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

              </div>
            ) : (
              <p className="empty-text">
                Henüz satış kaydı bulunmuyor.
              </p>
            )}

          </div>

          <div className="dashboard-panel">

            <div className="panel-header">
              <h2>Son Satın Almalar</h2>
            </div>

            {summary.recentPurchases?.length > 0 ? (
              <div className="table-wrapper">

                <table>
                  <thead>
                    <tr>
                      <th>Fatura</th>
                      <th>Tedarikçi</th>
                      <th>Tutar</th>
                    </tr>
                  </thead>

                  <tbody>
                    {summary.recentPurchases.map((purchase) => (
                      <tr key={purchase.id}>
                        <td>{purchase.invoiceNumber}</td>
                        <td>{purchase.supplierName || "-"}</td>
                        <td>{formatCurrency(purchase.totalAmount)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

              </div>
            ) : (
              <p className="empty-text">
                Henüz satın alma kaydı bulunmuyor.
              </p>
            )}

          </div>

        </section>

        <section className="dashboard-panel critical-panel">

          <div className="panel-header">
            <h2>Kritik Stoktaki Ürünler</h2>
          </div>

          {summary.criticalStockProducts?.length > 0 ? (
            <div className="table-wrapper">

              <table>
                <thead>
                  <tr>
                    <th>Kod</th>
                    <th>Ürün</th>
                    <th>Stok</th>
                    <th>Minimum</th>
                    <th>Birim</th>
                  </tr>
                </thead>

                <tbody>
                  {summary.criticalStockProducts.map((product) => (
                    <tr key={product.id}>
                      <td>{product.code}</td>
                      <td>{product.name}</td>
                      <td>{product.stockQuantity}</td>
                      <td>{product.minimumStockLevel}</td>
                      <td>{product.unit}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

            </div>
          ) : (
            <p className="empty-text success-text">
              Kritik stok seviyesinde ürün bulunmuyor.
            </p>
          )}

        </section>

      </main>

    </div>
  )
}

export default Dashboard