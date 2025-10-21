#!/usr/bin/env node

/**
 * Script to create an admin user for the CMS
 * Run with: node scripts/create-admin.js
 */

const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
}

async function createAdmin() {
  console.log('🚀 Admin User Creation Script');
  console.log('=====================================\n');

  try {
    const email = await askQuestion('Enter admin email: ');
    const name = await askQuestion('Enter admin name: ');
    const password = await askQuestion('Enter admin password: ');

    console.log('\n📝 Admin User Details:');
    console.log(`Email: ${email}`);
    console.log(`Name: ${name}`);
    console.log(`Role: admin`);

    console.log('\n⚠️  To complete admin creation:');
    console.log('1. Go to your Convex dashboard');
    console.log('2. Open the "Functions" tab');
    console.log('3. Run the following mutation:');
    console.log('\n```');
    console.log('// In Convex dashboard, run this mutation:');
    console.log('await ctx.runMutation("auth:registerUser", {');
    console.log(`  email: "${email}",`);
    console.log(`  name: "${name}",`);
    console.log(`  password: "${password}",`);
    console.log('  role: "admin"');
    console.log('});');
    console.log('```\n');

    console.log('✅ Admin user will be created with elevated privileges');
    console.log('🔐 They can access /admin and /dashboard routes');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    rl.close();
  }
}

createAdmin();