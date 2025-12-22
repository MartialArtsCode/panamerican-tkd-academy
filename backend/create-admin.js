#!/usr/bin/env node

/**
 * Admin User Creation Script
 * 
 * This script creates an admin user in the database.
 * Usage: node create-admin.js <email> <password>
 */

import dotenv from 'dotenv';
dotenv.config();
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import { encrypt } from './utils/crypto.js';
import User from './models/User.js';

// Get command line arguments
const args = process.argv.slice(2);

if (args.length < 2) {
  console.error('Usage: node create-admin.js <email> <password>');
  process.exit(1);
}

const email = args[0];
const password = args[1];

// Validate email format
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
if (!emailRegex.test(email)) {
  console.error('❌ Invalid email format');
  process.exit(1);
}

// Validate password length
if (password.length < 8) {
  console.error('❌ Password must be at least 8 characters long');
  process.exit(1);
}

// Connect to MongoDB
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/app_do';

async function createAdminUser() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB');

    // Check if user already exists
    const existingUser = await User.findOne({ email: encrypt(email) });
    if (existingUser) {
      console.error('❌ User with this email already exists');
      process.exit(1);
    }

    // Hash password
    console.log('🔐 Encrypting credentials...');
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Create admin user
    const adminUser = new User({
      email: encrypt(email),
      password: encrypt(hashedPassword),
      isAdmin: true
    });

    await adminUser.save();
    
    console.log('✅ Admin user created successfully!');
    console.log('📧 Email:', email);
    console.log('🔑 Password: [hidden]');
    console.log('👤 Role: Admin');
    console.log('\n🎉 You can now login to the admin panel at /admin/admin.html');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating admin user:', error.message);
    process.exit(1);
  }
}

// Run the script
createAdminUser();
