class Verifier {
    constructor() {
        this.html5QrCode = null;
        this.isScanning = false;
        
        this.init();
    }
    
    init() {
        document.getElementById('startScanBtn').addEventListener('click', () => this.startScanner());
        document.getElementById('stopScanBtn').addEventListener('click', () => this.stopScanner());
        document.getElementById('verifyManualBtn').addEventListener('click', () => this.verifyManual());
    }
    
    async startScanner() {
        try {
            const scannerContainer = document.getElementById('scannerContainer');
            scannerContainer.classList.remove('hidden');
            
            this.html5QrCode = new Html5Qrcode("reader");
            
            await this.html5QrCode.start(
                { facingMode: "environment" },
                {
                    fps: 10,
                    qrbox: { width: 250, height: 250 }
                },
                (decodedText) => {
                    this.verifyPayload(decodedText);
                    this.stopScanner();
                },
                (errorMessage) => {
                }
            );
            
            this.isScanning = true;
            document.getElementById('startScanBtn').disabled = true;
        } catch (err) {
            alert('Failed to start camera: ' + err);
            document.getElementById('scannerContainer').classList.add('hidden');
        }
    }
    
    async stopScanner() {
        if (this.html5QrCode && this.isScanning) {
            try {
                await this.html5QrCode.stop();
                this.isScanning = false;
                document.getElementById('startScanBtn').disabled = false;
                document.getElementById('scannerContainer').classList.add('hidden');
            } catch (err) {
                console.error('Error stopping scanner:', err);
            }
        }
    }
    
    verifyManual() {
        const payload = document.getElementById('manualPayload').value.trim();
        
        if (!payload) {
            alert('Please enter a payload!');
            return;
        }
        
        this.verifyPayload(payload);
    }
    
    verifyPayload(payload) {
        document.getElementById('receivedPayload').textContent = payload;
        
        const parts = payload.split('|');
        
        if (parts.length !== 3) {
            this.showError('Invalid payload format! Expected: MERCHANT_ID|NOMINAL|CRC');
            return;
        }
        
        const merchantId = parts[0];
        const nominal = parts[1];
        const receivedCRCHex = parts[2];
        
        const data = `${merchantId}|${nominal}`;
        
        document.getElementById('extractedData').textContent = data;
        document.getElementById('receivedCRC').textContent = receivedCRCHex;
        
        const calculatedCRC = CRC16.calculateCRC16(data);
        const calculatedCRCHex = CRC16.toHexString(calculatedCRC);
        
        document.getElementById('recalculatedCRC').textContent = calculatedCRCHex;
        
        const isValid = receivedCRCHex.toUpperCase() === calculatedCRCHex.toUpperCase();
        
        const resultDiv = document.getElementById('verificationResult');
        const detailsDiv = document.getElementById('transactionDetails');
        
        if (isValid) {
            resultDiv.className = 'verification-result success';
            resultDiv.innerHTML = '<div class="result-icon">✓</div><div class="result-text">VERIFICATION SUCCESSFUL<br><span class="result-subtext">Data integrity confirmed</span></div>';
            
            document.getElementById('detailMerchantId').textContent = merchantId;
            document.getElementById('detailNominal').textContent = this.formatCurrency(nominal);
            
            detailsDiv.classList.remove('hidden');
        } else {
            resultDiv.className = 'verification-result error';
            resultDiv.innerHTML = '<div class="result-icon">✗</div><div class="result-text">VERIFICATION FAILED<br><span class="result-subtext">Data has been corrupted or tampered</span></div>';
            
            detailsDiv.classList.add('hidden');
        }
        
        document.getElementById('verifierResults').classList.remove('hidden');
    }
    
    showError(message) {
        const resultDiv = document.getElementById('verificationResult');
        resultDiv.className = 'verification-result error';
        resultDiv.innerHTML = `<div class="result-icon">⚠</div><div class="result-text">${message}</div>`;
        
        document.getElementById('verifierResults').classList.remove('hidden');
        document.getElementById('transactionDetails').classList.add('hidden');
    }
    
    formatCurrency(value) {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(value);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.verifier = new Verifier();
});
