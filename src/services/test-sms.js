// Quick test file to verify SMS service functionality
// Run this with: node src/services/test-sms.js

const { smsAuthService } = require('./SMSAuthService');

async function testSMSService() {
  console.log('Testing SMS Service...');
  console.log('Service Status:', smsAuthService.getServiceStatus());

  const testPhone = '3001234567';
  
  try {
    console.log('\n1. Testing SMS sending...');
    const smsResponse = await smsAuthService.sendVerificationCode(testPhone);
    console.log('SMS Response:', smsResponse);
    
    if (smsResponse.success) {
      console.log('\n2. Testing code verification with correct code...');
      // The actual code would be in the console logs
      // For testing, let's try a dummy code first
      const verifyResponse = await smsAuthService.verifyCode(testPhone, '1234');
      console.log('Verify Response:', verifyResponse);
    }
    
  } catch (error) {
    console.error('Test Error:', error);
  }
}

testSMSService();
