<img width="1919" height="902" alt="image" src="https://github.com/user-attachments/assets/72559acf-9e64-4998-9b42-1993d7266545" />


# OmegaERP

OmegaERP, temel işletme süreçlerini tek bir sistem üzerinden yönetmek amacıyla geliştirdiğim full-stack bir Mini ERP projesidir.

Proje kapsamında ürün, stok, müşteri, tedarikçi, satış, satın alma, cari hesap ve kullanıcı yönetimi gibi temel ERP işlemleri geliştirilmiştir.

Backend tarafında ASP.NET Core Web API ve SQL Server, frontend tarafında ise React kullanılmıştır.

## Özellikler

- JWT tabanlı kullanıcı giriş sistemi
- Admin ve Employee rol yönetimi
- Ürün ve kategori yönetimi
- Müşteri yönetimi
- Tedarikçi yönetimi
- Satış işlemleri
- Satın alma işlemleri
- Otomatik stok güncelleme
- Manuel stok giriş ve çıkış işlemleri
- Kritik stok takibi
- Cari hesap takibi
- Müşteriden ödeme alma
- Tedarikçiye ödeme yapma
- Kullanıcı rolü değiştirme
- Kullanıcı aktif/pasif yönetimi
- Dashboard üzerinden genel sistem özeti

## Kullanılan Teknolojiler

### Backend

- ASP.NET Core Web API
- C#
- Entity Framework Core
- SQL Server
- JWT Authentication
- Swagger

### Frontend

- React
- Vite
- React Router
- Axios
- CSS

## Proje Yapısı

```text
OmegaERP
│
├── OmegaERP.Api
│   ├── Controllers
│   ├── Data
│   ├── DTOs
│   ├── Models
│   └── Program.cs
│
└── omegaerp-frontend
    ├── src
    │   ├── components
    │   ├── pages
    │   └── services
    │
    └── package.json
