class Generator {
    constructor() {
        this.merchantId = '';
        this.transactionNominal = '';
        this.originalData = '';
        this.currentData = '';
        this.crc = 0;
        this.qrCodeInstance = null;
        
        this.init();
    }
    
    init() {
        document.getElementById('generateBtn').addEventListener('click', () => this.generate());
        document.getElementById('copyPayloadBtn').addEventListener('click', () => this.copyPayload());
        document.getElementById('flipBitBtn').addEventListener('click', () => this.flipBit());
        document.getElementById('resetDataBtn').addEventListener('click', () => this.resetData());
    }
    
    generate() {
        this.merchantId = document.getElementById('merchantId').value.trim();
        this.transactionNominal = document.getElementById('transactionNominal').value.trim();
        
        if (!this.merchantId || !this.transactionNominal) {
            alert('Please fill in all fields!');
            return;
        }
        
        this.originalData = `${this.merchantId}|${this.transactionNominal}`;
        this.currentData = this.originalData;
        
        this.crc = CRC16.calculateCRC16(this.currentData);
        const crcHex = CRC16.toHexString(this.crc);
        
        document.getElementById('originalData').textContent = this.originalData;
        document.getElementById('calculatedCRC').textContent = crcHex;
        
        this.updateQRCode();
        
        document.getElementById('generatorResults').classList.remove('hidden');
    }
    
    updateQRCode() {
        const crcHex = CRC16.toHexString(this.crc);
        const payload = `${this.currentData}|${crcHex}`;
        
        document.getElementById('finalPayload').textContent = payload;
        
        const qrContainer = document.getElementById('qrcode');
        qrContainer.innerHTML = '';
        
        this.qrCodeInstance = new QRCode(qrContainer, {
            text: payload,
            width: 256,
            height: 256,
            colorDark: "#000000",
            colorLight: "#ffffff",
            correctLevel: QRCode.CorrectLevel.H
        });
    }
    
    flipBit() {
        const charPos = parseInt(document.getElementById('bitPosition').value);
        const bitIdx = parseInt(document.getElementById('bitIndex').value);
        
        if (isNaN(charPos) || isNaN(bitIdx) || charPos < 0 || charPos >= this.currentData.length || bitIdx < 0 || bitIdx > 7) {
            alert('Invalid bit position or index!');
            return;
        }
        
        const chars = this.currentData.split('');
        let charCode = chars[charPos].charCodeAt(0);
        
        charCode ^= (1 << bitIdx);
        
        chars[charPos] = String.fromCharCode(charCode);
        this.currentData = chars.join('');
        
        this.updateQRCode();
        
        alert(`Bit ${bitIdx} of character at position ${charPos} flipped!\nData is now corrupted while CRC remains unchanged.`);
    }
    
    resetData() {
        this.currentData = this.originalData;
        this.updateQRCode();
        alert('Data reset to original!');
    }
    
    copyPayload() {
        const payload = document.getElementById('finalPayload').textContent;
        
        navigator.clipboard.writeText(payload).then(() => {
            const btn = document.getElementById('copyPayloadBtn');
            const originalText = btn.textContent;
            btn.textContent = 'Copied!';
            setTimeout(() => {
                btn.textContent = originalText;
            }, 2000);
        }).catch(err => {
            alert('Failed to copy: ' + err);
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.generator = new Generator();
});
