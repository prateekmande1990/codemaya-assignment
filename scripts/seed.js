const mongoose = require('mongoose');
const { connectDb } = require('../src/config/db');
const Document = require('../src/models/Document');

const docs = [
  {
    title: 'Refund Policy',
    content:
      'Customers can request refunds within 14 days of purchase. Approved refunds are processed to the original payment method within 5-7 business days after verification.',
    tags: ['billing', 'refund', 'payments'],
  },
  {
    title: 'Shipping Timeline',
    content:
      'Standard shipping takes 3-5 business days domestically. Express shipping takes 1-2 business days. Delays may happen during holidays.',
    tags: ['shipping', 'delivery', 'orders'],
  },
  {
    title: 'Account Cancellation',
    content:
      'Users may cancel subscriptions anytime from account settings. Access remains active until the current billing cycle ends. No prorated refunds for partial months.',
    tags: ['account', 'subscription', 'billing'],
  },
  {
    title: 'Technical Support SLA',
    content:
      'Support tickets are acknowledged within 4 business hours. Critical incidents are prioritized with an estimated resolution target of 24 hours.',
    tags: ['support', 'sla', 'technical'],
  },
  {
    title: 'Data Retention',
    content:
      'User activity logs are retained for 90 days. Billing records are retained for 7 years to comply with financial regulations.',
    tags: ['compliance', 'data', 'security'],
  },
  {
    title: 'Password Reset',
    content:
      'Password reset links expire after 30 minutes. Users can request a new link from the login page if the original link expires.',
    tags: ['security', 'account', 'authentication'],
  },
];

async function run() {
  try {
    await connectDb();
    await Document.deleteMany({});
    const inserted = await Document.insertMany(docs);
    console.log(`Seeded ${inserted.length} documents.`);
  } catch (err) {
    console.error('Seed failed:', err.message);
    process.exitCode = 1;
  } finally {
    await mongoose.connection.close();
  }
}

run();
