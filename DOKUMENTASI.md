# DOKUMENTASI SISTEM VERIFIKASI TRANSAKSI CRC-16

## Daftar Isi
1. [Pengenalan](#pengenalan)
2. [Cara Kerja Aplikasi Web](#cara-kerja-aplikasi-web)
3. [Algoritma CRC-16](#algoritma-crc-16)
4. [Manipulasi Bit](#manipulasi-bit)
5. [Penjelasan Kode](#penjelasan-kode)

---

## Pengenalan

Aplikasi web ini adalah **Sistem Verifikasi Transaksi CRC-16** yang menggunakan teknologi QR Code untuk mendemonstrasikan deteksi kesalahan data (error detection). Sistem ini terdiri dari dua komponen utama:

1. **Generator**: Menghasilkan QR code yang berisi data transaksi dan checksum CRC-16
2. **Verifier**: Memverifikasi integritas data dengan membandingkan CRC-16 yang diterima dengan yang dihitung ulang

### Fitur Utama
- Perhitungan CRC-16 otomatis untuk data transaksi
- Generasi QR Code dengan payload terenkripsi
- Simulasi korupsi data melalui bit manipulation
- Pemindaian QR Code menggunakan kamera
- Verifikasi integritas data secara real-time
- Input manual untuk testing

---

## Cara Kerja Aplikasi Web

### 1. Alur Kerja Generator

```
Input Data → Perhitungan CRC-16 → Pembentukan Payload → Generasi QR Code
```

**Langkah-langkah:**

1. **Input Data Transaksi**
   - User memasukkan **Merchant ID** (contoh: M12345)
   - User memasukkan **Nominal Transaksi** (contoh: 50000)

2. **Pembentukan Data Original**
   - Data digabung dengan format: `MERCHANT_ID|NOMINAL`
   - Contoh: `M12345|50000`

3. **Perhitungan CRC-16**
   - Sistem menghitung nilai CRC-16 dari data original
   - Hasil berupa nilai 16-bit yang dikonversi ke hexadecimal (4 karakter)
   - Contoh: `A3F2`

4. **Pembentukan Payload Final**
   - Format: `MERCHANT_ID|NOMINAL|CRC`
   - Contoh: `M12345|50000|A3F2`

5. **Generasi QR Code**
   - Payload dienkode menjadi QR Code
   - QR Code ditampilkan dengan ukuran 256x256 pixels
   - Menggunakan error correction level HIGH untuk ketahanan maksimal

### 2. Simulasi Korupsi Data (Bit Manipulation)

Fitur ini memungkinkan simulasi kerusakan data untuk mendemonstrasikan kemampuan deteksi error:

**Parameter:**
- **Character Position**: Posisi karakter dalam string data (0-based index)
- **Bit Index**: Posisi bit dalam byte (0-7)

**Proses:**
1. User memilih posisi karakter yang akan dimanipulasi
2. User memilih bit mana yang akan di-flip (0-7)
3. Sistem melakukan operasi XOR untuk membalik bit tersebut
4. QR Code di-generate ulang dengan data yang sudah terkorupsi
5. **Penting**: CRC tetap menggunakan nilai original, sehingga terjadi ketidakcocokan

### 3. Alur Kerja Verifier

```
Scan/Input QR → Ekstraksi Data → Perhitungan Ulang CRC → Perbandingan → Hasil Verifikasi
```

**Langkah-langkah:**

1. **Input Payload**
   - Scan QR Code menggunakan kamera, ATAU
   - Input manual payload string

2. **Parsing Payload**
   - Sistem memisahkan payload berdasarkan delimiter `|`
   - Mengekstrak: Merchant ID, Nominal, dan CRC yang diterima
   - Format yang diharapkan: `MERCHANT_ID|NOMINAL|CRC`

3. **Rekonstruksi Data**
   - Menggabung kembali Merchant ID dan Nominal
   - Data: `MERCHANT_ID|NOMINAL`

4. **Perhitungan CRC Baru**
   - Menghitung CRC-16 dari data yang diekstrak
   - Mengkonversi hasil ke format hexadecimal

5. **Perbandingan CRC**
   - **Received CRC**: CRC yang diterima dari payload
   - **Calculated CRC**: CRC yang dihitung ulang dari data
   - Membandingkan kedua nilai secara case-insensitive

6. **Hasil Verifikasi**
   - **SUKSES** ✓: Jika CRC cocok → Data valid dan tidak terkorupsi
   - **GAGAL** ✗: Jika CRC tidak cocok → Data telah terkorupsi atau dimanipulasi

---

## Algoritma CRC-16

### Apa itu CRC-16?

**CRC (Cyclic Redundancy Check)** adalah algoritma deteksi error yang menghasilkan nilai checksum dari data input. CRC-16 menghasilkan nilai 16-bit (2 bytes) yang digunakan untuk memverifikasi integritas data.

### Varian yang Digunakan

Aplikasi ini menggunakan **CRC-16 CCITT (Consultative Committee for International Telephony and Telegraphy)** dengan parameter:
- **Polynomial**: `0x1021` (binary: 0001 0000 0010 0001)
- **Initial Value**: `0xFFFF` (semua bit diset ke 1)
- **Width**: 16 bits

### Cara Kerja Algoritma

#### 1. Inisialisasi
```
CRC = 0xFFFF (1111111111111111 dalam binary)
```

#### 2. Proses Setiap Byte

Untuk setiap byte dalam data:

**Langkah A: XOR dengan CRC**
```
CRC = CRC XOR (byte << 8)
```
- Byte digeser 8 bit ke kiri (menempatkannya di high byte)
- Hasil di-XOR dengan CRC saat ini

**Langkah B: Proses 8 Bit**

Untuk setiap bit (0-7):
```
Jika bit paling kiri (MSB) adalah 1:
    CRC = (CRC << 1) XOR 0x1021
Jika tidak:
    CRC = CRC << 1

CRC = CRC AND 0xFFFF  // Pastikan tetap 16-bit
```

#### 3. Hasil Akhir

Setelah semua byte diproses, nilai CRC final adalah checksum 16-bit.

### Contoh Perhitungan Manual

**Data**: `"AB"` (2 karakter)

**Byte 1: 'A' (ASCII 65 = 0x41)**
```
Initial CRC: 0xFFFF
CRC ^= (0x41 << 8) = 0xFFFF ^ 0x4100 = 0xBEFF

Bit 0: 0xBEFF, MSB=1 → (0xBEFF << 1) ^ 0x1021 = 0x7DFE ^ 0x1021 = 0x6DDF
Bit 1: 0x6DDF, MSB=0 → (0x6DDF << 1) = 0xDBBE
Bit 2: 0xDBBE, MSB=1 → (0xDBBE << 1) ^ 0x1021 = 0xB77C ^ 0x1021 = 0xA75D
... (lanjut sampai bit 7)
```

**Byte 2: 'B' (ASCII 66 = 0x42)**
```
Proses serupa dengan byte 'A'
```

**Hasil**: Nilai CRC-16 final dalam hexadecimal (4 digit)

### Properti Matematika CRC

1. **Linearity**: CRC(A + B) = CRC(A) ⊕ CRC(B)
2. **Deteksi Error**:
   - 100% deteksi untuk error 1 bit
   - 100% deteksi untuk error 2 bit
   - 99.998% deteksi untuk error lebih dari 2 bit
3. **Tidak Bisa Mendeteksi**: Manipulasi yang menghasilkan remainder sama

---

## Manipulasi Bit

### Konsep Bit dan Byte

**1 Byte = 8 Bits**

Contoh karakter 'M' (ASCII 77):
```
Decimal: 77
Binary:  01001101
Bit:     76543210  (posisi dari kanan ke kiri)
```

### Operasi Bit yang Digunakan

#### 1. XOR (Exclusive OR) - Operator `^`

**Truth Table:**
```
A | B | A XOR B
--|---|--------
0 | 0 |   0
0 | 1 |   1
1 | 0 |   1
1 | 1 |   0
```

**Penggunaan:**
- Membalik bit tertentu (flip bit)
- Jika XOR dengan 1, bit akan di-flip
- Jika XOR dengan 0, bit tetap sama

#### 2. Left Shift - Operator `<<`

**Contoh:**
```
0101 << 1 = 1010  (geser 1 posisi ke kiri)
0101 << 2 = 0100  (geser 2 posisi ke kiri)
```

**Penggunaan:**
- Menggeser semua bit ke kiri
- Bit yang keluar dari kiri hilang
- Bit baru di kanan adalah 0

#### 3. AND - Operator `&`

**Truth Table:**
```
A | B | A AND B
--|---|--------
0 | 0 |   0
0 | 1 |   0
1 | 0 |   0
1 | 1 |   1
```

**Penggunaan:**
- Masking (memfilter bit tertentu)
- `& 0xFFFF` memastikan hanya 16 bit terendah yang dipertahankan
- `& 0xFF` memastikan hanya 8 bit terendah yang dipertahankan

### Implementasi Bit Flip

**Tujuan**: Membalik 1 bit spesifik dalam sebuah karakter

**Contoh**: Flip bit ke-2 dari karakter 'M' (77 = 01001101)

```javascript
// Langkah 1: Buat mask dengan bit ke-2 diset
mask = 1 << 2 = 00000100

// Langkah 2: XOR dengan karakter original
hasil = 01001101 XOR 00000100 = 01001001

// Hasil: 73 = 'I' (karakter berubah dari 'M' menjadi 'I')
```

**Kode:**
```javascript
charCode ^= (1 << bitIndex);
```

**Penjelasan:**
- `1 << bitIndex`: Membuat mask dengan hanya 1 bit yang di-set
- `^=`: XOR assignment, membalik bit yang di-mask

### Contoh Praktis dalam Aplikasi

**Scenario**: Data transaksi `M12345|50000`

**Manipulasi**: Flip bit ke-3 dari karakter posisi 0 ('M')

```
Original: 'M' = 77 = 01001101
Mask:          8 = 00001000 (1 << 3)
Result:   'E' = 69 = 01000101 (XOR)

Data berubah menjadi: E12345|50000
CRC tetap: A3F2 (dari data original M12345|50000)
Payload: E12345|50000|A3F2
```

**Saat Verifikasi:**
```
Data diterima: E12345|50000
CRC diterima: A3F2
CRC dihitung dari E12345|50000: B4E1 (berbeda!)
Hasil: VERIFIKASI GAGAL ✗
```

---

## Penjelasan Kode

### 1. File: `crc16.js`

#### Class CRC16

**Method: `calculateCRC16(data)`**
```javascript
static calculateCRC16(data) {
    const bytes = CRC16.stringToBytes(data);  // Konversi string ke array bytes
    let crc = 0xFFFF;  // Inisialisasi CRC dengan 0xFFFF
    
    // Loop setiap byte
    for (let i = 0; i < bytes.length; i++) {
        crc ^= (bytes[i] << 8);  // XOR byte dengan high byte CRC
        
        // Process 8 bits
        for (let j = 0; j < 8; j++) {
            if (crc & 0x8000) {  // Cek MSB (bit ke-15)
                crc = (crc << 1) ^ 0x1021;  // Shift dan XOR dengan polynomial
            } else {
                crc = crc << 1;  // Hanya shift
            }
            crc &= 0xFFFF;  // Mask ke 16 bits
        }
    }
    
    return crc;  // Return nilai CRC 16-bit
}
```

**Penjelasan Detail:**

1. **`const bytes = CRC16.stringToBytes(data)`**
   - Mengkonversi string input menjadi array of bytes (angka 0-255)
   - Contoh: "AB" → [65, 66]

2. **`let crc = 0xFFFF`**
   - Inisialisasi register CRC dengan semua bit = 1
   - 0xFFFF = 1111111111111111 (binary)

3. **`crc ^= (bytes[i] << 8)`**
   - `bytes[i] << 8`: Geser byte 8 posisi ke kiri (tempatkan di high byte)
   - `^=`: XOR dengan CRC saat ini
   - Contoh: `0xFFFF ^ (0x41 << 8)` = `0xFFFF ^ 0x4100` = `0xBEFF`

4. **`if (crc & 0x8000)`**
   - `0x8000` = 1000000000000000 (binary)
   - AND operation untuk cek apakah bit ke-15 (MSB) adalah 1
   - Jika hasil > 0, maka MSB = 1

5. **`crc = (crc << 1) ^ 0x1021`**
   - `crc << 1`: Geser semua bit ke kiri 1 posisi
   - `^ 0x1021`: XOR dengan polynomial CRC-16 CCITT
   - Operasi polynomial division dalam modulo-2 arithmetic

6. **`crc &= 0xFFFF`**
   - Masking untuk memastikan nilai tetap 16-bit
   - Buang bit yang overflow di posisi 17+

**Method: `stringToBytes(str)`**
```javascript
static stringToBytes(str) {
    const bytes = [];
    for (let i = 0; i < str.length; i++) {
        bytes.push(str.charCodeAt(i) & 0xFF);  // Ambil ASCII code, mask ke 8 bit
    }
    return bytes;
}
```

**Penjelasan:**
- `charCodeAt(i)`: Mendapatkan nilai ASCII/Unicode dari karakter
- `& 0xFF`: Mask ke 8 bit (0-255) untuk memastikan 1 byte
- Contoh: 'A' → 65, 'B' → 66

**Method: `toHexString(value)`**
```javascript
static toHexString(value) {
    return value.toString(16).toUpperCase().padStart(4, '0');
}
```

**Penjelasan:**
- `toString(16)`: Konversi angka ke string hexadecimal
- `toUpperCase()`: Ubah ke huruf besar (A-F)
- `padStart(4, '0')`: Tambahkan leading zeros sampai 4 karakter
- Contoh: 41970 → "A3F2"

**Method: `fromHexString(hexStr)`**
```javascript
static fromHexString(hexStr) {
    return parseInt(hexStr, 16);  // Parse string hex ke integer
}
```

---

### 2. File: `generator.js`

#### Class Generator

**Constructor**
```javascript
constructor() {
    this.merchantId = '';           // Menyimpan Merchant ID
    this.transactionNominal = '';   // Menyimpan nominal transaksi
    this.originalData = '';         // Data original (tidak terkorupsi)
    this.currentData = '';          // Data saat ini (mungkin terkorupsi)
    this.crc = 0;                   // Nilai CRC yang dihitung
    this.qrCodeInstance = null;     // Instance QR Code
    
    this.init();  // Inisialisasi event listeners
}
```

**Method: `generate()`**
```javascript
generate() {
    // Ambil input dari form
    this.merchantId = document.getElementById('merchantId').value.trim();
    this.transactionNominal = document.getElementById('transactionNominal').value.trim();
    
    // Validasi input
    if (!this.merchantId || !this.transactionNominal) {
        alert('Please fill in all fields!');
        return;
    }
    
    // Bentuk data dengan format MERCHANT_ID|NOMINAL
    this.originalData = `${this.merchantId}|${this.transactionNominal}`;
    this.currentData = this.originalData;  // Set current = original
    
    // Hitung CRC-16 dari data
    this.crc = CRC16.calculateCRC16(this.currentData);
    const crcHex = CRC16.toHexString(this.crc);  // Konversi ke hex string
    
    // Tampilkan hasil di UI
    document.getElementById('originalData').textContent = this.originalData;
    document.getElementById('calculatedCRC').textContent = crcHex;
    
    // Generate QR Code
    this.updateQRCode();
    
    // Show results section
    document.getElementById('generatorResults').classList.remove('hidden');
}
```

**Method: `flipBit()`**
```javascript
flipBit() {
    // Ambil input posisi
    const charPos = parseInt(document.getElementById('bitPosition').value);
    const bitIdx = parseInt(document.getElementById('bitIndex').value);
    
    // Validasi input
    if (isNaN(charPos) || isNaN(bitIdx) || 
        charPos < 0 || charPos >= this.currentData.length || 
        bitIdx < 0 || bitIdx > 7) {
        alert('Invalid bit position or index!');
        return;
    }
    
    // Konversi string ke array karakter
    const chars = this.currentData.split('');
    
    // Ambil ASCII code dari karakter target
    let charCode = chars[charPos].charCodeAt(0);
    
    // FLIP BIT: XOR dengan mask
    // (1 << bitIdx) membuat mask dengan hanya 1 bit yang di-set
    charCode ^= (1 << bitIdx);
    
    // Konversi kembali ke karakter dan update string
    chars[charPos] = String.fromCharCode(charCode);
    this.currentData = chars.join('');
    
    // Re-generate QR Code dengan data terkorupsi
    this.updateQRCode();
    
    alert(`Bit ${bitIdx} of character at position ${charPos} flipped!\n` +
          `Data is now corrupted while CRC remains unchanged.`);
}
```

**Penjelasan Bit Flip:**
```
Contoh: charPos=0, bitIdx=3, currentData="M12345|50000"

1. chars = ['M','1','2','3','4','5','|','5','0','0','0','0']
2. charCode = 'M'.charCodeAt(0) = 77 = 01001101
3. mask = 1 << 3 = 8 = 00001000
4. charCode ^= mask → 01001101 XOR 00001000 = 01000101 = 69 = 'E'
5. chars[0] = 'E'
6. currentData = "E12345|50000"
7. QR Code di-update dengan data terkorupsi tetapi CRC original
```

**Method: `updateQRCode()`**
```javascript
updateQRCode() {
    const crcHex = CRC16.toHexString(this.crc);
    
    // Bentuk payload: DATA|CRC
    const payload = `${this.currentData}|${crcHex}`;
    
    // Update tampilan payload
    document.getElementById('finalPayload').textContent = payload;
    
    // Clear QR container
    const qrContainer = document.getElementById('qrcode');
    qrContainer.innerHTML = '';
    
    // Generate QR Code baru
    this.qrCodeInstance = new QRCode(qrContainer, {
        text: payload,              // Text yang akan di-encode
        width: 256,                 // Lebar QR Code
        height: 256,                // Tinggi QR Code
        colorDark: "#000000",       // Warna module (hitam)
        colorLight: "#ffffff",      // Warna background (putih)
        correctLevel: QRCode.CorrectLevel.H  // Error correction level HIGH
    });
}
```

**Penjelasan QR Code Error Correction:**
- **Level L (Low)**: ~7% recovery
- **Level M (Medium)**: ~15% recovery
- **Level Q (Quartile)**: ~25% recovery
- **Level H (High)**: ~30% recovery - **Digunakan dalam aplikasi ini**

---

### 3. File: `verifier.js`

#### Class Verifier

**Method: `verifyPayload(payload)`**
```javascript
verifyPayload(payload) {
    // Tampilkan payload yang diterima
    document.getElementById('receivedPayload').textContent = payload;
    
    // Split payload dengan delimiter '|'
    const parts = payload.split('|');
    
    // Validasi format payload
    if (parts.length !== 3) {
        this.showError('Invalid payload format! Expected: MERCHANT_ID|NOMINAL|CRC');
        return;
    }
    
    // Ekstraksi komponen
    const merchantId = parts[0];          // Bagian 1: Merchant ID
    const nominal = parts[1];             // Bagian 2: Nominal
    const receivedCRCHex = parts[2];      // Bagian 3: CRC (hex)
    
    // Rekonstruksi data original
    const data = `${merchantId}|${nominal}`;
    
    // Tampilkan data yang diekstrak
    document.getElementById('extractedData').textContent = data;
    document.getElementById('receivedCRC').textContent = receivedCRCHex;
    
    // HITUNG ULANG CRC dari data yang diterima
    const calculatedCRC = CRC16.calculateCRC16(data);
    const calculatedCRCHex = CRC16.toHexString(calculatedCRC);
    
    // Tampilkan CRC yang dihitung
    document.getElementById('recalculatedCRC').textContent = calculatedCRCHex;
    
    // BANDINGKAN CRC (case-insensitive)
    const isValid = receivedCRCHex.toUpperCase() === calculatedCRCHex.toUpperCase();
    
    const resultDiv = document.getElementById('verificationResult');
    const detailsDiv = document.getElementById('transactionDetails');
    
    if (isValid) {
        // DATA VALID - CRC COCOK
        resultDiv.className = 'verification-result success';
        resultDiv.innerHTML = 
            '<div class="result-icon">✓</div>' +
            '<div class="result-text">VERIFICATION SUCCESSFUL<br>' +
            '<span class="result-subtext">Data integrity confirmed</span></div>';
        
        // Tampilkan detail transaksi
        document.getElementById('detailMerchantId').textContent = merchantId;
        document.getElementById('detailNominal').textContent = this.formatCurrency(nominal);
        detailsDiv.classList.remove('hidden');
        
    } else {
        // DATA TIDAK VALID - CRC TIDAK COCOK
        resultDiv.className = 'verification-result error';
        resultDiv.innerHTML = 
            '<div class="result-icon">✗</div>' +
            '<div class="result-text">VERIFICATION FAILED<br>' +
            '<span class="result-subtext">Data has been corrupted or tampered</span></div>';
        
        // Sembunyikan detail transaksi
        detailsDiv.classList.add('hidden');
    }
    
    // Show results
    document.getElementById('verifierResults').classList.remove('hidden');
}
```

**Alur Verifikasi:**
```
Input: "M12345|50000|A3F2"

1. Split: ["M12345", "50000", "A3F2"]
2. Extract:
   - merchantId = "M12345"
   - nominal = "50000"
   - receivedCRC = "A3F2"

3. Reconstruct data: "M12345|50000"

4. Calculate CRC: CRC16.calculateCRC16("M12345|50000")
   - Result: 41970 (decimal)
   - Hex: "A3F2"

5. Compare:
   - Received: "A3F2"
   - Calculated: "A3F2"
   - Match: TRUE ✓

6. Show SUCCESS with transaction details
```

**Method: `startScanner()`**
```javascript
async startScanner() {
    try {
        // Show scanner container
        const scannerContainer = document.getElementById('scannerContainer');
        scannerContainer.classList.remove('hidden');
        
        // Inisialisasi Html5Qrcode scanner
        this.html5QrCode = new Html5Qrcode("reader");
        
        // Start scanning dengan kamera
        await this.html5QrCode.start(
            { facingMode: "environment" },  // Gunakan kamera belakang
            {
                fps: 10,                     // Frame per second
                qrbox: { width: 250, height: 250 }  // Scan box size
            },
            (decodedText) => {
                // Callback saat QR code berhasil di-scan
                this.verifyPayload(decodedText);  // Verifikasi payload
                this.stopScanner();                // Stop scanner
            },
            (errorMessage) => {
                // Callback saat error (ignore, normal saat tidak detect QR)
            }
        );
        
        this.isScanning = true;
        document.getElementById('startScanBtn').disabled = true;
        
    } catch (err) {
        alert('Failed to start camera: ' + err);
        document.getElementById('scannerContainer').classList.add('hidden');
    }
}
```

---

### 4. File: `index.html`

**Struktur Utama:**

```html
<div class="container">
    <header>
        <!-- Judul dan subtitle -->
    </header>
    
    <div class="main-content">
        <!-- Grid 2 kolom untuk Generator dan Verifier -->
        
        <section class="generator-section">
            <!-- Form input Merchant ID dan Nominal -->
            <!-- Button generate -->
            <!-- Hasil: Original Data, CRC, Payload -->
            <!-- Panel manipulasi bit -->
            <!-- QR Code display -->
        </section>
        
        <section class="verifier-section">
            <!-- Scanner dengan kamera -->
            <!-- Input manual -->
            <!-- Hasil verifikasi -->
            <!-- Perbandingan CRC -->
            <!-- Detail transaksi -->
        </section>
    </div>
</div>
```

**Libraries yang Digunakan:**

1. **qrcodejs (1.0.0)**
   - Generate QR Code dari text
   - Mendukung berbagai level error correction

2. **html5-qrcode (2.3.8)**
   - Scan QR Code menggunakan kamera device
   - Support untuk mobile dan desktop
   - Real-time detection

---

### 5. File: `styles.css`

**Key Design Elements:**

1. **Layout Responsif**
```css
.main-content {
    display: grid;
    grid-template-columns: 1fr 1fr;  /* 2 kolom sama lebar */
    gap: 30px;
}

@media (max-width: 1024px) {
    .main-content {
        grid-template-columns: 1fr;  /* 1 kolom di layar kecil */
    }
}
```

2. **Visual Feedback untuk Verifikasi**
```css
.verification-result.success {
    background: #d4edda;        /* Hijau muda */
    border: 3px solid #28a745;  /* Border hijau */
}

.verification-result.error {
    background: #f8d7da;        /* Merah muda */
    border: 3px solid #dc3545;  /* Border merah */
}
```

3. **Styling untuk CRC Display**
```css
.crc-value {
    font-family: 'Courier New', monospace;  /* Monospace font */
    font-weight: bold;
    color: #667eea;                          /* Warna ungu */
    font-size: 1.3rem;
}
```

---

## Kesimpulan

### Keunggulan Sistem

1. **Error Detection**: Mampu mendeteksi hampir semua jenis korupsi data
2. **Real-time Verification**: Verifikasi instan menggunakan QR Code
3. **Educational**: Visualisasi bit manipulation untuk pembelajaran
4. **User Friendly**: Interface intuitif dengan feedback visual jelas
5. **Portable**: Web-based, bisa diakses dari berbagai device

### Limitasi CRC-16

1. **Tidak Bisa Memperbaiki**: Hanya mendeteksi error, tidak bisa recovery
2. **Collision Possible**: Kemungkinan kecil 2 data berbeda punya CRC sama
3. **Tidak Aman untuk Security**: CRC bukan algoritma kriptografi, mudah dipalsukan
4. **Fixed Size**: Selalu 16-bit, tidak peduli ukuran data

### Use Cases

1. **Point of Sale Systems**: Verifikasi transaksi pembayaran
2. **Data Transmission**: Validasi integritas data yang dikirim
3. **QR Payment**: Verifikasi authenticity QR code pembayaran
4. **Educational**: Belajar tentang error detection dan bit manipulation

---

## Referensi

- **CRC-16 CCITT Polynomial**: 0x1021 (X^16 + X^12 + X^5 + 1)
- **ASCII Table**: Mapping karakter ke nilai numerik
- **Bitwise Operations**: XOR, AND, Shift operatornominal
- **QR Code Error Correction**: Reed-Solomon algorithm

---

*Dokumentasi ini dibuat untuk membantu pemahaman tentang implementasi CRC-16 dalam sistem verifikasi transaksi menggunakan QR Code.*
