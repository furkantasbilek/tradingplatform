# Trading Platform

Basit ve modern bir kripto trading platform web arayüzü.

## Özellikler

- **Gerçek Zamanlı Fiyat Takibi**: Kripto para çiftlerinin anlık fiyatlarını görüntüleyin
- **Portfolio Yönetimi**: Varlıklarınızı takip edin ve kar/zarar durumunuzu görün
- **Hızlı Alım-Satım**: Kullanıcı dostu arayüz ile hızlı işlem yapın
- **İşlem Geçmişi**: Tüm alım-satım işlemlerinizi görüntüleyin
- **Piyasa İstatistikleri**: Güncel piyasa verilerini takip edin
- **Responsive Tasarım**: Mobil ve masaüstü uyumlu

## Teknolojiler

- **Backend**: Node.js + Express
- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **API**: RESTful API
- **Stil**: Modern gradient tasarım, animasyonlar

## Kurulum

### Gereksinimler

- Node.js (v14 veya üzeri)
- npm veya yarn

### Adımlar

1. Bağımlılıkları yükleyin:
```bash
npm install
```

2. Sunucuyu başlatın:
```bash
npm start
```

3. Tarayıcınızda açın:
```
http://localhost:3000
```

## API Endpoints

### Trading Pairs
- `GET /api/pairs` - Tüm trading çiftlerini getir
- `GET /api/pairs/:symbol` - Belirli bir trading çiftini getir

### Portfolio
- `GET /api/portfolio` - Kullanıcı portföyünü getir

### Orders
- `GET /api/orders` - İşlem geçmişini getir
- `POST /api/orders` - Yeni işlem oluştur

### Stats
- `GET /api/stats` - Piyasa istatistiklerini getir

## Kullanım

### Alım/Satım İşlemi

1. Trading Pairs tablosundan bir kripto seçin
2. "Buy" butonuna tıklayın
3. Miktar ve fiyat girin
4. İşlemi onaylayın

### Portfolio Takibi

- "My Portfolio" bölümünde tüm varlıklarınızı görebilirsiniz
- Her varlık için kar/zarar yüzdesi otomatik hesaplanır
- Toplam portfolio değeri header'da gösterilir

### Gerçek Zamanlı Güncelleme

- Veriler otomatik olarak her 5 saniyede bir güncellenir
- Manuel güncelleme için "Refresh" butonunu kullanabilirsiniz

## Proje Yapısı

```
tradingplatform/
├── server.js           # Express sunucu ve API
├── package.json        # Proje bağımlılıkları
├── README.md          # Dokümantasyon
└── public/            # Frontend dosyaları
    ├── index.html     # Ana sayfa
    ├── styles.css     # Stiller
    └── app.js         # Frontend JavaScript
```

## Özelleştirme

### Yeni Trading Çifti Ekleme

`server.js` dosyasındaki `tradingPairs` dizisini düzenleyin:

```javascript
const tradingPairs = [
  { id: 6, symbol: 'XRP/USD', name: 'Ripple', price: 0.56, change: 1.23, volume: '123M' }
];
```

### Port Değiştirme

Varsayılan port 3000'dir. Değiştirmek için:

```bash
PORT=8080 npm start
```

## Notlar

- Bu demo bir projedir, gerçek para ile işlem yapmaz
- Tüm veriler simüle edilmiştir
- Production kullanımı için güvenlik önlemleri eklenmeli
- Veritabanı entegrasyonu eklenebilir

## Lisans

MIT
