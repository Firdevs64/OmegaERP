<img width="1919" height="902" alt="image" src="https://github.com/user-attachments/assets/72559acf-9e64-4998-9b42-1993d7266545" />


# OmegaERP

![OmegaERP Dashboard](BURAYA_MEVCUT_EKRAN_GÖRÜNTÜSÜ)

OmegaERP, temel işletme süreçlerini tek bir sistem üzerinden yönetmek amacıyla geliştirdiğim full-stack bir Mini ERP uygulamasıdır.

Ürün ve stok yönetiminden satış ve satın alma işlemlerine, müşteri ve tedarikçi hesaplarından kullanıcı yetkilendirmesine kadar temel ERP süreçlerini tek bir sistem altında toplamaktadır.

## 🌐 Canlı Demo

Frontend: https://omega-erp-sigma.vercel.app

Backend API: https://omegaerp-production.up.railway.app

Swagger API Dokümantasyonu:
https://omegaerp-production.up.railway.app/swagger/index.html

> Canlı backend Railway üzerinde barındırılmaktadır. Ücretsiz servis/deneme koşullarına bağlı olarak demo bağlantısı zaman zaman erişilemez durumda olabilir.

## ✨ Özellikler

- JWT tabanlı kimlik doğrulama
- Admin ve Employee rol yönetimi
- Ürün ve kategori yönetimi
- Müşteri yönetimi
- Tedarikçi yönetimi
- Satış işlemleri
- Satın alma işlemleri
- Satış ve satın alma işlemlerine bağlı otomatik stok güncelleme
- Manuel stok giriş ve çıkış işlemleri
- Kritik stok takibi
- Cari hesap takibi
- Müşteriden ödeme alma
- Tedarikçiye ödeme yapma
- Kullanıcı rolü değiştirme
- Kullanıcı aktif/pasif yönetimi
- Dashboard üzerinden genel sistem özeti

## 🛠️ Kullanılan Teknolojiler

### Backend

- ASP.NET Core Web API
- C#
- Entity Framework Core
- PostgreSQL
- Npgsql
- JWT Authentication
- Swagger

### Frontend

- React
- Vite
- React Router
- Axios
- CSS

### Deployment

- Vercel — Frontend
- Railway — Backend API
- Railway PostgreSQL — Veritabanı
- GitHub — Versiyon kontrolü

## 📁 Proje Yapısı

```text
OmegaERP
│
├── OmegaERP.Api
│   ├── Controllers
│   ├── Data
│   ├── DTOs
│   ├── Migrations
│   ├── Models
│   └── Program.cs
│
├── omegaerp-frontend
│   ├── src
│   │   ├── components
│   │   ├── pages
│   │   └── services
│   └── package.json
│
└── README.md
