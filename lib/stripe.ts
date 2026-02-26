// Server-side Stripe client initialization
// This file should only be imported in server components and API routes

import Stripe from 'stripe';

// For demo purposes, allow the app to run without real Stripe keys
// In production, you would want this to fail if keys are missing
const secretKey = process.env.STRIPE_SECRET_KEY || 'sk_test_demo_key_not_configured';

export const stripe = new Stripe(secretKey, {
  apiVersion: '2024-12-18.acacia' as any,
  typescript: true,
});

// Flag to check if Stripe is properly configured
export const isStripeConfigured = process.env.STRIPE_SECRET_KEY &&
  !process.env.STRIPE_SECRET_KEY.includes('placeholder');
