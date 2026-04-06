import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { config } from '../config/env';
import { User } from '../models/User.model';
import { FinanceRecord } from '../models/FinanceRecord.model';
import { UserRole, UserStatus, TransactionType } from '../types';

const seedDatabase = async (): Promise<void> => {
  try {
    console.log('🌱 Starting database seed...');

    // Connect to database
    await mongoose.connect(config.mongoUri);
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await FinanceRecord.deleteMany({});
    console.log('🗑️  Cleared existing data');

    // Create users
    const passwordHash = await bcrypt.hash('password123', 12);

    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@example.com',
      passwordHash,
      role: UserRole.ADMIN,
      status: UserStatus.ACTIVE
    });

    await User.create({
      name: 'Analyst User',
      email: 'analyst@example.com',
      passwordHash,
      role: UserRole.ANALYST,
      status: UserStatus.ACTIVE
    });

    await User.create({
      name: 'Viewer User',
      email: 'viewer@example.com',
      passwordHash,
      role: UserRole.VIEWER,
      status: UserStatus.ACTIVE
    });

    console.log('✅ Created users');

    // Create finance records
    const records = [
      {
        amount: 5000,
        type: TransactionType.INCOME,
        category: 'Salary',
        date: new Date('2024-01-01'),
        description: 'Monthly salary',
        createdBy: admin._id
      },
      {
        amount: 1500,
        type: TransactionType.EXPENSE,
        category: 'Rent',
        date: new Date('2024-01-05'),
        description: 'Monthly rent payment',
        createdBy: admin._id
      },
      {
        amount: 500,
        type: TransactionType.EXPENSE,
        category: 'Food',
        date: new Date('2024-01-10'),
        description: 'Groceries',
        createdBy: admin._id
      },
      {
        amount: 200,
        type: TransactionType.EXPENSE,
        category: 'Transportation',
        date: new Date('2024-01-12'),
        description: 'Gas and maintenance',
        createdBy: admin._id
      },
      {
        amount: 1000,
        type: TransactionType.INCOME,
        category: 'Freelance',
        date: new Date('2024-01-15'),
        description: 'Freelance project payment',
        createdBy: admin._id
      },
      {
        amount: 300,
        type: TransactionType.EXPENSE,
        category: 'Entertainment',
        date: new Date('2024-01-20'),
        description: 'Movies and dining',
        createdBy: admin._id
      },
      {
        amount: 150,
        type: TransactionType.EXPENSE,
        category: 'Utilities',
        date: new Date('2024-01-25'),
        description: 'Electricity and water',
        createdBy: admin._id
      },
      {
        amount: 5000,
        type: TransactionType.INCOME,
        category: 'Salary',
        date: new Date('2024-02-01'),
        description: 'Monthly salary',
        createdBy: admin._id
      }
    ];

    await FinanceRecord.insertMany(records);
    console.log('✅ Created finance records');

    console.log('\n📊 Seed Summary:');
    console.log('================');
    console.log('Users created:');
    console.log(`  - Admin: admin@example.com (password: password123)`);
    console.log(`  - Analyst: analyst@example.com (password: password123)`);
    console.log(`  - Viewer: viewer@example.com (password: password123)`);
    console.log(`\nFinance records: ${records.length}`);
    console.log('\n✅ Database seeded successfully!');

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  }
};

seedDatabase();
