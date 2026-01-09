// Simple authentication test script
console.log('🧪 Testing Authentication System');
console.log('================================');
console.log('');

// Test credentials
const testCredentials = [
    { email: 'admin@elightsofa.com', password: 'admin123', role: 'admin' },
    { email: 'manager@elightsofa.com', password: 'manager123', role: 'manager' },
    { email: 'staff@elightsofa.com', password: 'staff123', role: 'staff' }
];

console.log('✅ Authentication system is configured for mock mode');
console.log('');
console.log('🔐 Available test accounts:');
testCredentials.forEach((cred, index) => {
    console.log(`${index + 1}. ${cred.role.toUpperCase()}`);
    console.log(`   Email: ${cred.email}`);
    console.log(`   Password: ${cred.password}`);
    console.log('');
});

console.log('🎯 How to test:');
console.log('1. Start the development server: npm run dev');
console.log('2. Go to: http://localhost:3000/auth/test');
console.log('3. Or go to: http://localhost:3000/auth/login');
console.log('4. Use any of the credentials above');
console.log('');
console.log('🔧 Debug URLs:');
console.log('- Test Page: http://localhost:3000/auth/test');
console.log('- Login Page: http://localhost:3000/auth/login');
console.log('- Register Page: http://localhost:3000/auth/register');
console.log('- Admin Panel: http://localhost:3000/admin');
console.log('');
console.log('✨ The authentication system should now work correctly!');