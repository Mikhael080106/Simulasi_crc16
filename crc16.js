class CRC16 {
    static calculateCRC16(data) {
        const bytes = CRC16.stringToBytes(data);
        let crc = 0xFFFF;
        
        for (let i = 0; i < bytes.length; i++) {
            crc ^= (bytes[i] << 8);
            
            for (let j = 0; j < 8; j++) {
                if (crc & 0x8000) {
                    crc = (crc << 1) ^ 0x1021;
                } else {
                    crc = crc << 1;
                }
                crc &= 0xFFFF;
            }
        }
        
        return crc;
    }
    
    static stringToBytes(str) {
        const bytes = [];
        for (let i = 0; i < str.length; i++) {
            bytes.push(str.charCodeAt(i) & 0xFF);
        }
        return bytes;
    }
    
    static toHexString(value) {
        return value.toString(16).toUpperCase().padStart(4, '0');
    }
    
    static fromHexString(hexStr) {
        return parseInt(hexStr, 16);
    }
}
