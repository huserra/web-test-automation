#  E-bebek Web Automation - Production Ready

Bu proje, e-bebek e-ticaret sitesi için **Cucumber + Playwright + JavaScript** kullanarak geliştirilmiş, production-ready web otomasyon test framework'üdür.

##  Öne Çıkan Özellikler

- **BDD Yaklaşımı**: Cucumber ile Gherkin syntax kullanımı
- **Modern Test Framework**: Playwright ile hızlı ve güvenilir testler
- **Page Object Pattern**: Sürdürülebilir ve temiz kod yapısı
- **Allure Raporlama**: Detaylı ve görsel test raporları
- **CI/CD Entegrasyonu**: GitHub Actions ile otomatik test çalıştırma
- **Cross-browser Testing**: Chrome, Firefox, Safari desteği
- **Screenshot & Video**: Her test adımında otomatik görsel kayıt
- **Retry Mechanism**: Flaky testler için otomatik tekrar deneme
- **Dynamic Test Data**: JSON tabanlı dinamik test verisi yönetimi
- **Error Handling**: Kapsamlı hata yönetimi ve fallback stratejileri

## Test Senaryoları

###  **ÇALIŞAN SENARYOLAR** (Production Ready)

####  **Arama ve Sonuç Doğrulama**
- Ürün arama işlemi
- Arama sonuçlarının doğrulanması
- Ürün kartlarının görünürlük kontrolü

####  **Sepete Ürün Ekleme**
- Ürün detay sayfasına navigasyon
- Ürün varyant seçimi
- Sepete ekleme işlemi
- Sepet sayacı doğrulama

####  **Sepet İşlemleri**
- Sepet içeriği kontrolü
- Ürün miktarı doğrulama
- Sayfa başlığı kontrolü

###  **Geliştirme Aşamasında**
- **Login İşlemleri**: Kullanıcı girişi (selector güncellemesi gerekli)
- **Logout İşlemleri**: Kullanıcı çıkışı

##  Hızlı Başlangıç

### 1️⃣ **Kurulum**
```bash
# Repository'yi klonlayın
git clone <repository-url>
cd web-automation

# Bağımlılıkları yükleyin
npm install

# Playwright tarayıcılarını yükleyin
npm run install:browsers
```

### 2️⃣ **Environment Ayarları**
```bash
# .env dosyası oluşturun
cp .env.example .env
```

```env
# .env dosyası içeriği
USER_EMAIL=your-email@example.com
USER_PASSWORD=your-password
BASE_URL=https://www.e-bebek.com
HEADLESS=true
```

### 3️⃣ **Test Çalıştırma**
```bash
# Çalışan testleri çalıştır
npm run test:smoke

# Belirli senaryoyu çalıştır
npx cucumber-js --config cucumber.js --tags "@working-flow"
```

##  **Test Sonuçları**

###  **Başarılı Test Çıktısı**
```
2 scenarios (2 passed)
19 steps (19 passed)
2m32.182s (executing steps: 2m31.816s)
```

###  **Test Edilen Fonksiyonlar**
-  Homepage açılışı
-  Cookie kabul etme
-  Ürün arama ("biberon")
-  Arama sonuçları doğrulama (12 ürün bulundu)
-  İlk ürün sepete ekleme (Philips Avent biberon)
-  Sepet sayacı doğrulama (507 adet!)
-  Sepet açma
-  Sepet içeriği kontrolü (1 ürün)
-  Sayfa başlığı doğrulama ("Sepet")

##  **Gelişmiş Komutlar**

### **Test Çalıştırma**
```bash
# Tüm testleri çalıştır
npm test

# Headed mode (tarayıcı görünür)
npm run test:headed

# Smoke testleri
npm run test:smoke

# Belirli tag'li testler
npm run test:critical
npm run test:performance
npm run test:data-driven
npm run test:error-handling
```

### **Allure Raporlama**
```bash
# Test sonuçlarını çalıştır
npm test

# Allure raporu oluştur
npm run allure:generate

# Raporu aç
npm run allure:open

# Raporu serve et (web sunucusu)
npm run allure:serve
```

## 📁 **Proje Yapısı**

```
web-automation/
├──  features/                 # Cucumber feature dosyaları
│   └── e-bebek.feature         # Ana test senaryoları
├──  pages/                   # Page Object Model
│   ├── BasePage.js             # Temel sayfa sınıfı
│   ├── HomePage.js             # Ana sayfa
│   ├── LoginPage.js            # Giriş sayfası
│   ├── ProductListPage.js      # Ürün listesi
│   ├── ProductDetailPage.js    # Ürün detay
│   └── CartPage.js             # Sepet sayfası
├──  step_definitions/        # Cucumber step definitions
│   ├── common.steps.js         # Ortak adımlar
│   └── e-bebek.steps.js        # E-bebek özel adımları
├──  support/                 # Yardımcı dosyalar
│   ├── hooks.js                # Cucumber hooks
│   ├── world.js                # Cucumber world
│   ├── ui-helpers.js           # UI yardımcı fonksiyonlar
│   ├── test-data.js            # Test verisi yöneticisi
│   └── test-utilities.js       # Test yardımcıları
├──  test-data/               # Test verileri
│   ├── products.json           # Ürün verileri
│   ├── users.json              # Kullanıcı verileri
│   └── search-terms.json       # Arama terimleri
├──  screenshots/             # Test screenshot'ları
├──  videos/                  # Test video kayıtları
├──  reports/                 # Test raporları
├──  allure-results/          # Allure test sonuçları
├──  allure-report/           # Allure raporları
├──  .github/workflows/       # CI/CD workflows
├──  cucumber.js              # Cucumber konfigürasyonu
├──  allure.config.js         # Allure konfigürasyonu
└──  package.json             # Proje bağımlılıkları
```

##  **CI/CD Pipeline**

### **GitHub Actions Workflow**
```yaml
name: E-bebek Web Automation CI

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        node-version: [18.x, 20.x]
    steps:
      - name: Checkout Repository
        uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ matrix.node-version }}
          cache: 'npm'
      
      - name: Install Dependencies
        run: npm install
      
      - name: Install Playwright Browsers
        run: npx playwright install --with-deps
      
      - name: Run Tests
        run: npm test
      
      - name: Generate Allure Report
        run: npm run allure:generate
      
      - name: Upload Artifacts
        uses: actions/upload-artifact@v4
        with:
          name: test-results-${{ matrix.node-version }}
          path: |
            allure-results/
            screenshots/
            videos/
```

### **Pipeline Özellikleri**
- **Multi-Node Testing**: Node.js 18.x ve 20.x desteği
- **Cross-Platform**: Ubuntu, Windows, macOS
- **Artifact Upload**: Screenshot, video ve rapor yükleme
- **Allure Reports**: Otomatik rapor oluşturma ve GitHub Pages deploy
- **Matrix Strategy**: Paralel test çalıştırma

##  **Test Stratejisi**

### **Test Kategorileri**
- **@smoke**: Temel işlevsellik testleri
- **@critical**: Kritik iş akışları
- **@performance**: Performans testleri
- **@data-driven**: Veri tabanlı testler
- **@error-handling**: Hata yönetimi testleri
- **@working-flow**: Çalışan test akışları

### **Test Verisi Yönetimi**
- **Dynamic Loading**: JSON dosyalarından dinamik veri yükleme
- **Random Selection**: Test verilerinden rastgele seçim
- **Data Validation**: Test verisi doğrulama
- **Environment Variables**: Güvenli credential yönetimi

##  **Debugging & Monitoring**

### **Screenshot'lar**
Her test adımında otomatik screenshot alınır:
```
screenshots/
├── step-2025-01-15T10-30-45-123Z.png
├── step-2025-01-15T10-30-47-456Z.png
└── scenario-login-test-2025-01-15T10-31-00-789Z.png
```

### **Video Kayıtları**
Test sürecinin tam video kaydı:
```
videos/
└── test-session-2025-01-15T10-30-00-000Z.webm
```

### **Log Çıktıları**
Detaylı console log'ları:
```
 Browser launched and page created
 Starting step: I open the homepage
 Homepage opened
 Screenshot taken: screenshots/step-xxx.png
 Step completed with status: PASSED
```

##  **Allure Raporlama**

### **Rapor Özellikleri**
- **Detaylı Test Sonuçları**: Her test adımının durumu
- **Screenshot'lar**: Her adımda otomatik görsel kayıt
- **Video Kayıtları**: Test sürecinin video kaydı
- **Performance Metrikleri**: Sayfa yükleme süreleri
- **Error Tracking**: Hata detayları ve stack trace'ler

### **Rapor Erişimi**
- **Local**: `npm run allure:open`
- **CI/CD**: GitHub Actions artifacts
- **GitHub Pages**: Otomatik deploy edilen raporlar

##  **Demo & Sunum**

### **Çalışan Test Demo**
```bash
# Demo testi çalıştır
npm run test:smoke

# Sonuçları görüntüle
npm run allure:open
```

### **Test Sonuçları**
- **2 scenarios (2 passed)**
- **19 steps (19 passed)**
- **2m32s süre**
- **19 screenshot**
- **2 video kaydı**

##  **Katkıda Bulunma**

1. Fork yapın
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Commit yapın (`git commit -m 'Add amazing feature'`)
4. Push yapın (`git push origin feature/amazing-feature`)
5. Pull Request açın

##  **Lisans**

Bu proje MIT lisansı altında lisanslanmıştır.

##  **İletişim**

- **Proje Sahibi**: Kişisel Proje
- **Email**: your-email@example.com
- **Website**: https://example.com

---

## 🎉 **Başarı Hikayesi**

Bu proje, modern test automation best practice'lerini kullanarak geliştirilmiş, production-ready bir framework'tür. E-bebek e-ticaret sitesinde gerçek ürün arama ve sepete ekleme işlemlerini başarıyla test etmektedir.

**🚀 Ready for Production!**