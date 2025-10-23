// Debug script to test authentication flow
// Run this in browser console on kalkidan.de

console.log('🔍 Authentication Debug Test');
console.log('============================');

// Check current authentication state
console.log('1. Checking localStorage:');
console.log('sessionToken:', localStorage.getItem('sessionToken'));

console.log('2. Checking cookies:');
console.log('document.cookie:', document.cookie);

console.log('3. Checking current URL:');
console.log('window.location:', window.location.href);

// Test login flow
async function testLogin(email, password) {
  console.log('🧪 Testing login flow...');
  
  try {
    // Clear existing tokens
    localStorage.removeItem('sessionToken');
    document.cookie = 'sessionToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    
    console.log('Cleared existing tokens');
    
    // Navigate to login page
    if (!window.location.pathname.includes('/auth/login')) {
      window.location.href = '/auth/login';
      return;
    }
    
    // Fill login form
    const emailInput = document.querySelector('input[type="email"]');
    const passwordInput = document.querySelector('input[type="password"]');
    const submitButton = document.querySelector('button[type="submit"]');
    
    if (emailInput && passwordInput && submitButton) {
      emailInput.value = email;
      passwordInput.value = password;
      
      console.log('Filled login form');
      
      // Monitor network requests
      const originalFetch = window.fetch;
      window.fetch = function(...args) {
        console.log('🌐 Fetch request:', args[0]);
        return originalFetch.apply(this, arguments).then(response => {
          console.log('📥 Fetch response:', response.status, response.statusText);
          return response;
        });
      };
      
      // Submit form
      submitButton.click();
      
    } else {
      console.error('❌ Login form elements not found');
    }
    
  } catch (error) {
    console.error('❌ Login test error:', error);
  }
}

// Test with sample credentials
// testLogin('test@example.com', 'password123');

console.log('💡 To test login, run: testLogin("your-email", "your-password")');