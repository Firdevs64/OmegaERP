<img width="1919" height="902" alt="image" src="https://github.com/user-attachments/assets/72559acf-9e64-4998-9b42-1993d7266545" />


# OmegaERP

OmegaERP, temel işletme süreçlerini tek bir sistem üzerinden yönetmek amacıyla geliştirdiğim full-stack bir **Mini ERP** uygulamasıdır.

Proje kapsamında ürün ve stok yönetiminden satış ve satın alma işlemlerine, müşteri ve tedarikçi hesaplarından kullanıcı yönetimine kadar temel ERP süreçleri tek bir sistem altında toplanmıştır.

Projenin geliştirme sürecinde **SQL Server** kullanılmış, uygulamanın bulut ortamına taşınması sırasında veritabanı **PostgreSQL**'e migrate edilerek production ortamına uyarlanmıştır.

---

## 🌐 Canlı Demo

- **Frontend:** https://omega-erp-sigma.vercel.app
- **API Dokümantasyonu (Swagger):** https://omegaerp-production.up.railway.app/swagger/index.html

### 🔑 Demo Giriş Bilgileri

Projeyi incelemek için aşağıdaki demo Admin hesabını kullanabilirsiniz:

- **E-posta:** `admin@omegaerp.com`
- **Şifre:** `Test123!`
- **Rol:** `Admin`

> Bu hesap yalnızca OmegaERP canlı demosunun incelenmesi amacıyla oluşturulmuştur.

> Frontend Vercel üzerinde; ASP.NET Core Web API ve PostgreSQL veritabanı ise Railway üzerinde yayınlanmıştır. Railway servis koşullarına bağlı olarak canlı API bağlantısı zaman zaman erişilemez durumda olabilir.

---

## ✨ Özellikler

- JWT tabanlı kullanıcı giriş sistemi
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

---

## 🛠️ Kullanılan Teknolojiler

### Backend

- ASP.NET Core Web API
- C#
- Entity Framework Core
- JWT Authentication
- Swagger

### Veritabanı

- SQL Server — geliştirme ortamında kullanılan ilişkisel veritabanı
- PostgreSQL — production ortamında kullanılan ilişkisel veritabanı
- Npgsql — ASP.NET Core ile PostgreSQL bağlantısı
- Entity Framework Core Migrations

### Frontend

- React
- Vite
- React Router
- Axios
- CSS

### Deployment

- Vercel — Frontend
- Railway — ASP.NET Core Web API
- Railway PostgreSQL — Production veritabanı
- Git & GitHub — Versiyon kontrolü

---

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
├── .gitignore
└── README.md
```

---

## 🔐 Kimlik Doğrulama ve Yetkilendirme

OmegaERP'de kullanıcı giriş işlemleri için **JWT (JSON Web Token)** tabanlı kimlik doğrulama sistemi kullanılmaktadır.

Sistemde iki temel kullanıcı rolü bulunmaktadır:

- **Admin:** Kullanıcı yönetimi dahil olmak üzere sistem özelliklerine erişebilir.
- **Employee:** Yetkisi dahilindeki ERP işlemlerini gerçekleştirebilir.

Başarılı giriş sonrasında oluşturulan JWT token, korumalı API endpointlerine yapılan isteklerde kullanılır.

Bu yapı sayesinde sisteme yetkisiz erişimin önüne geçilmesi ve kullanıcı rollerine göre erişim kontrolünün sağlanması amaçlanmıştır.

---

## 📊 Dashboard

Dashboard ekranı, ERP sistemi içerisindeki temel bilgilerin tek noktadan görüntülenmesini sağlar.

Dashboard üzerinden:

- Toplam ürün sayısı
- Toplam müşteri sayısı
- Toplam tedarikçi sayısı
- Kritik stoktaki ürün sayısı
- Toplam satış tutarı
- Toplam satın alma tutarı
- Son satışlar
- Son satın almalar
- Kritik stoktaki ürünler

görüntülenebilir.

---

## 📦 Ürün ve Stok Yönetimi

Sistem üzerinden ürün ve kategori kayıtları oluşturulabilir ve yönetilebilir.

Her ürün için stok miktarı takip edilir.

Stok hareketleri iki farklı şekilde gerçekleştirilebilir:

- Manuel stok giriş/çıkış işlemleri
- Satış ve satın alma işlemlerine bağlı otomatik stok hareketleri

Belirlenen kritik stok seviyesinin altına düşen ürünler sistem tarafından takip edilerek Dashboard üzerinde görüntülenir.

---

## 👥 Müşteri ve Tedarikçi Yönetimi

OmegaERP üzerinden müşteri ve tedarikçi kayıtları oluşturulabilir ve mevcut kayıtlar yönetilebilir.

Müşteri ve tedarikçiler satış, satın alma ve cari hesap işlemleriyle ilişkilendirilmiştir.

Bu sayede işletmenin müşteriler ve tedarikçiler ile gerçekleştirdiği işlemler sistem içerisinde takip edilebilir.

---

## 🛒 Satış İşlemleri

Sistem üzerinden müşterilere satış kaydı oluşturulabilir.

Satış sırasında:

1. Müşteri seçilir.
2. Satışı yapılacak ürünler belirlenir.
3. Ürün miktarları girilir.
4. Satış toplamı hesaplanır.
5. Satış kaydı oluşturulur.
6. İlgili ürünlerin stok miktarı otomatik olarak azaltılır.
7. İşlem müşterinin cari hesabına yansıtılır.

Böylece satış, stok ve cari hesap işlemleri birbirleriyle bağlantılı şekilde çalışır.

---

## 🚚 Satın Alma İşlemleri

Tedarikçilerden gerçekleştirilen satın alma işlemleri sistem üzerinden kaydedilebilir.

Satın alma işlemi oluşturulduğunda:

1. Tedarikçi seçilir.
2. Satın alınan ürünler belirlenir.
3. Ürün miktarları ve fiyatları girilir.
4. Toplam satın alma tutarı hesaplanır.
5. Satın alma kaydı oluşturulur.
6. Ürünlerin stok miktarları otomatik olarak artırılır.
7. İşlem tedarikçinin cari hesabına yansıtılır.

---

## 💳 Cari Hesap Yönetimi

OmegaERP içerisinde müşteri ve tedarikçi cari hesapları takip edilebilir.

Cari hesap sistemi sayesinde:

- Satışlardan oluşan müşteri borçları
- Satın almalardan oluşan tedarikçi alacakları
- Müşteriden alınan ödemeler
- Tedarikçiye yapılan ödemeler

sistem üzerinden yönetilebilir.

Bu işlemler sonucunda müşteri ve tedarikçilerin güncel cari durumları takip edilebilir.

---

## 🔄 Temel Sistem Akışı

OmegaERP içerisindeki modüller birbirlerinden bağımsız değil, ilişkili şekilde çalışmaktadır.

Örneğin bir satın alma işlemi gerçekleştirildiğinde:

```text
Satın Alma
     ↓
Ürün Stoğu Artar
     ↓
Stok Hareketi Oluşur
     ↓
Tedarikçi Cari Hesabı Güncellenir
     ↓
Dashboard Verileri Güncellenir
```

Bir satış işlemi gerçekleştirildiğinde ise:

```text
Satış
   ↓
Ürün Stoğu Azalır
   ↓
Stok Hareketi Oluşur
   ↓
Müşteri Cari Hesabı Güncellenir
   ↓
Dashboard Verileri Güncellenir
```

Bu yapı ile temel ERP modülleri arasında bütünlük sağlanmıştır.

---

## 🗄️ Veritabanı ve Production Geçişi

OmegaERP ilk olarak geliştirme ortamında **Microsoft SQL Server** kullanılarak geliştirilmiştir.

Uygulamanın Railway üzerinde yayınlanması sırasında production veritabanı olarak **PostgreSQL** kullanılmıştır.

Bu süreçte:

- PostgreSQL desteği projeye eklendi.
- Npgsql Entity Framework Core provider kullanıldı.
- Entity Framework Core migration yapısı PostgreSQL ortamına uyarlandı.
- Veritabanı tabloları Railway PostgreSQL üzerinde oluşturuldu.
- PostgreSQL `timestamp with time zone` alanları için DateTime değerleri UTC uyumlu hale getirildi.
- ASP.NET Core API production veritabanına bağlandı.

Böylece uygulama yerel SQL Server geliştirme ortamından PostgreSQL tabanlı production ortamına taşındı.

---

## ☁️ Deployment Mimarisi

Uygulamanın canlı ortamdaki mimarisi:

```text
Kullanıcı
    ↓
React Frontend
    ↓
Vercel
    ↓
ASP.NET Core Web API
    ↓
Railway
    ↓
PostgreSQL
    ↓
Railway PostgreSQL
```

Frontend ve backend birbirinden bağımsız olarak deploy edilmiştir.

React uygulaması API isteklerini Railway üzerinde çalışan ASP.NET Core Web API'ye gönderir. Backend ise verileri Railway PostgreSQL veritabanında saklar.

---

## 🚀 Projeyi Yerel Ortamda Çalıştırma

### Backend

Projeyi klonladıktan sonra backend klasörüne geçin:

```bash
cd OmegaERP.Api
```

Bağımlılıkları yükleyin:

```bash
dotnet restore
```

Veritabanı bağlantı ayarlarını kendi ortamınıza göre yapılandırdıktan sonra uygulamayı çalıştırın:

```bash
dotnet run
```

Swagger arayüzü üzerinden API endpointleri test edilebilir.

### Frontend

Frontend klasörüne geçin:

```bash
cd omegaerp-frontend
```

Bağımlılıkları yükleyin:

```bash
npm install
```

Development sunucusunu başlatın:

```bash
npm run dev
```

> Backend API adresinin frontend yapılandırmasında çalıştırılan ortama göre ayarlanması gerekir.

---

## 📚 Projede Edinilen Deneyimler

Bu proje kapsamında:

- RESTful API geliştirme
- ASP.NET Core Web API kullanımı
- Entity Framework Core ile veritabanı işlemleri
- İlişkisel veritabanı tasarımı
- SQL Server kullanımı
- PostgreSQL kullanımı
- SQL Server'dan PostgreSQL production ortamına geçiş
- JWT tabanlı authentication
- Rol bazlı authorization
- React ile frontend geliştirme
- Axios ile API entegrasyonu
- Stok ve cari hesap iş mantığı oluşturma
- Git ve GitHub ile versiyon kontrolü
- Vercel üzerinde frontend deployment
- Railway üzerinde ASP.NET Core deployment
- Railway PostgreSQL entegrasyonu
- Development ve production ortamlarının yapılandırılması

konularında uygulamalı çalışma yapılmıştır.

---

## 🎯 Projenin Amacı

OmegaERP, ERP sistemlerinin temel çalışma mantığını öğrenmek ve full-stack web geliştirme sürecini uygulamalı olarak deneyimlemek amacıyla geliştirilmiştir.

Proje yalnızca CRUD işlemlerinden oluşan bir uygulama olarak değil; **satış, satın alma, stok ve cari hesap modüllerinin birbirleriyle ilişkili çalıştığı bir Mini ERP sistemi** olarak tasarlanmıştır.

Aynı zamanda uygulamanın geliştirme ortamından production ortamına taşınmasıyla frontend, backend ve veritabanının ayrı bulut servisleri üzerinde çalıştırılması deneyimlenmiştir.

---

## 📷 Uygulama Ekranları

### Dashboard

> Ürün, stok, müşteri, tedarikçi, satış ve satın alma verilerinin genel özetinin görüntülendiği Dashboard ekranı.

---

## 👩‍💻 Geliştirici

**Firdevs Köse**

Software Engineering Student

GitHub: https://github.com/Firdevs64
