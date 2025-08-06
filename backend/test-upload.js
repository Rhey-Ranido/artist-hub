import fetch from 'node-fetch';
import FormData from 'form-data';
import fs from 'fs';
import path from 'path';

const testUpload = async () => {
  try {
    // Create a simple test image (1x1 pixel PNG)
    const testImagePath = path.join(process.cwd(), 'test-image.png');
    
    // Create a minimal PNG file for testing
    const pngData = Buffer.from([
      0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, // PNG signature
      0x00, 0x00, 0x00, 0x0D, // IHDR chunk length
      0x49, 0x48, 0x44, 0x52, // IHDR
      0x00, 0x00, 0x00, 0x01, // width: 1
      0x00, 0x00, 0x00, 0x01, // height: 1
      0x08, 0x02, 0x00, 0x00, 0x00, // bit depth, color type, etc.
      0x90, 0x77, 0x53, 0xDE, // CRC
      0x00, 0x00, 0x00, 0x0C, // IDAT chunk length
      0x49, 0x44, 0x41, 0x54, // IDAT
      0x08, 0x99, 0x01, 0x01, 0x00, 0x00, 0x00, 0xFF, 0xFF, 0x00, 0x00, 0x00, 0x02, 0x00, 0x01, // compressed data
      0x00, 0x00, 0x00, 0x00, // IEND chunk length
      0x49, 0x45, 0x4E, 0x44, // IEND
      0xAE, 0x42, 0x60, 0x82  // CRC
    ]);
    
    fs.writeFileSync(testImagePath, pngData);
    
    const formData = new FormData();
    formData.append('image', fs.createReadStream(testImagePath));
    
    console.log('Testing upload endpoint...');
    
    const response = await fetch('http://localhost:5000/api/upload/profile/user', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer test-token',
        ...formData.getHeaders()
      },
      body: formData
    });
    
    console.log('Response status:', response.status);
    const data = await response.text();
    console.log('Response data:', data);
    
    // Clean up test file
    fs.unlinkSync(testImagePath);
    
  } catch (error) {
    console.error('Test failed:', error);
  }
};

testUpload();
