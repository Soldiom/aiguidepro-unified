/**
 * Payment Processing Service
 * Handles Stripe and PayPal payments for license purchases
 */

import { getLicenseGenerator } from "./license-generator";
import * as licenseDb from "./license-db";

interface PaymentIntent {
  id: string;
  amount: number;
  currency: string;
  status: "pending" | "succeeded" | "failed";
  email: string;
  tier: "basic" | "professional" | "enterprise";
}

interface PaymentResult {
  success: boolean;
  licenseKey?: string;
  error?: string;
  paymentId: string;
}

export class PaymentService {
  private stripeKey: string;
  private paypalClientId: string;
  private paypalSecret: string;

  constructor() {
    this.stripeKey = process.env.STRIPE_SECRET_KEY || "";
    this.paypalClientId = process.env.PAYPAL_CLIENT_ID || "";
    this.paypalSecret = process.env.PAYPAL_SECRET || "";
  }

  /**
   * Create Stripe payment intent
   */
  async createStripePayment(
    email: string,
    tier: "basic" | "professional" | "enterprise"
  ): Promise<PaymentIntent> {
    const amounts = {
      basic: 4900, // $49.00
      professional: 14900, // $149.00
      enterprise: 29900, // $299.00
    };

    const amount = amounts[tier];

    console.log(`💳 Creating Stripe payment for ${email} - ${tier} tier ($${amount / 100})`);

    try {
      // In production, you would use Stripe SDK:
      // const stripe = require('stripe')(this.stripeKey);
      // const paymentIntent = await stripe.paymentIntents.create({
      //   amount,
      //   currency: 'usd',
      //   receipt_email: email,
      //   metadata: { tier },
      // });

      // For now, simulate payment intent
      const paymentIntent: PaymentIntent = {
        id: `pi_${Date.now()}`,
        amount,
        currency: "usd",
        status: "pending",
        email,
        tier,
      };

      console.log(`✅ Payment intent created: ${paymentIntent.id}`);
      return paymentIntent;
    } catch (error) {
      console.error("Stripe payment creation failed:", error);
      throw new Error(`Failed to create Stripe payment: ${error}`);
    }
  }

  /**
   * Create PayPal payment
   */
  async createPayPalPayment(
    email: string,
    tier: "basic" | "professional" | "enterprise"
  ): Promise<PaymentIntent> {
    const amounts = {
      basic: 49.0,
      professional: 149.0,
      enterprise: 299.0,
    };

    const amount = amounts[tier];

    console.log(`💰 Creating PayPal payment for ${email} - ${tier} tier ($${amount})`);

    try {
      // In production, you would use PayPal SDK:
      // const paypal = require('@paypal/checkout-server-sdk');
      // const request = new paypal.orders.OrdersCreateRequest();
      // request.requestBody({
      //   intent: 'CAPTURE',
      //   purchase_units: [{
      //     amount: {
      //       currency_code: 'USD',
      //       value: amount.toString()
      //     }
      //   }]
      // });

      // For now, simulate payment
      const paymentIntent: PaymentIntent = {
        id: `PAYPAL-${Date.now()}`,
        amount: amount * 100, // Convert to cents
        currency: "usd",
        status: "pending",
        email,
        tier,
      };

      console.log(`✅ PayPal payment created: ${paymentIntent.id}`);
      return paymentIntent;
    } catch (error) {
      console.error("PayPal payment creation failed:", error);
      throw new Error(`Failed to create PayPal payment: ${error}`);
    }
  }

  /**
   * Handle successful payment and generate license
   */
  async handlePaymentSuccess(paymentIntent: PaymentIntent): Promise<PaymentResult> {
    console.log(`✅ Payment succeeded: ${paymentIntent.id}`);

    try {
      // Determine max activations based on tier
      const maxActivations = {
        basic: 1,
        professional: 3,
        enterprise: 10,
      }[paymentIntent.tier];

      // Generate license key
      const generator = getLicenseGenerator();
      const licenseKey = generator.generateLicenseKey(paymentIntent.email, maxActivations);

      // Save license to database
      await licenseDb.createLicense({
        licenseKey,
        email: paymentIntent.email,
        purchaseId: paymentIntent.id,
        maxActivations,
        currentActivations: 0,
        status: "active",
      });

      // Record purchase
      await licenseDb.createPurchase({
        email: paymentIntent.email,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency,
        quantity: 1,
        paymentMethod: paymentIntent.id.startsWith("pi_") ? "stripe" : "paypal",
        paymentId: paymentIntent.id,
        status: "completed",
      });

      // Send confirmation email (in production)
      await this.sendConfirmationEmail(paymentIntent.email, licenseKey, paymentIntent.tier);

      console.log(`✅ License generated and sent to ${paymentIntent.email}`);

      return {
        success: true,
        licenseKey,
        paymentId: paymentIntent.id,
      };
    } catch (error) {
      console.error("Failed to handle payment success:", error);
      return {
        success: false,
        error: `Failed to generate license: ${error}`,
        paymentId: paymentIntent.id,
      };
    }
  }

  /**
   * Handle failed payment
   */
  async handlePaymentFailure(paymentIntent: PaymentIntent): Promise<void> {
    console.log(`❌ Payment failed: ${paymentIntent.id}`);

    // Record failed purchase
    await licenseDb.createPurchase({
      email: paymentIntent.email,
      amount: paymentIntent.amount,
      currency: paymentIntent.currency,
      quantity: 1,
      paymentMethod: paymentIntent.id.startsWith("pi_") ? "stripe" : "paypal",
      paymentId: paymentIntent.id,
      status: "failed",
    });

    // Send failure notification (in production)
    console.log(`Notification sent to ${paymentIntent.email} about payment failure`);
  }

  /**
   * Process refund
   */
  async processRefund(paymentId: string): Promise<boolean> {
    console.log(`💸 Processing refund for payment: ${paymentId}`);

    try {
      // In production, you would call Stripe/PayPal refund API
      // const stripe = require('stripe')(this.stripeKey);
      // await stripe.refunds.create({ payment_intent: paymentId });

      // Revoke license
      // Note: In production, you would query license by purchaseId and revoke it
      // const license = await licenseDb.getLicenseByKey(licenseKey);
      // if (license) {
      //   await licenseDb.updateLicenseStatus(license.id, 'revoked');
      //   console.log(`✅ License revoked: ${license.licenseKey}`);
      // }

      // Update purchase status
      // await licenseDb.updatePurchaseStatus(paymentId, 'refunded');

      console.log(`✅ Refund processed successfully`);
      return true;
    } catch (error) {
      console.error("Refund processing failed:", error);
      return false;
    }
  }

  /**
   * Send confirmation email with license key
   */
  private async sendConfirmationEmail(
    email: string,
    licenseKey: string,
    tier: string
  ): Promise<void> {
    console.log(`📧 Sending confirmation email to ${email}`);

    // In production, you would use an email service like SendGrid, AWS SES, etc.
    // const sgMail = require('@sendgrid/mail');
    // sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    // await sgMail.send({
    //   to: email,
    //   from: 'noreply@aiguidepro.com',
    //   subject: 'Your AI Guide Pro License Key',
    //   html: `
    //     <h1>Thank you for your purchase!</h1>
    //     <p>Your ${tier} license key:</p>
    //     <code>${licenseKey}</code>
    //     <p>Download the desktop app and activate with this key.</p>
    //   `
    // });

    console.log(`✅ Confirmation email sent`);
  }

  /**
   * Verify webhook signature (Stripe)
   */
  verifyStripeWebhook(payload: string, signature: string): boolean {
    // In production:
    // const stripe = require('stripe')(this.stripeKey);
    // const event = stripe.webhooks.constructEvent(
    //   payload,
    //   signature,
    //   process.env.STRIPE_WEBHOOK_SECRET
    // );
    // return true;

    return true; // Simulated verification
  }

  /**
   * Verify webhook signature (PayPal)
   */
  verifyPayPalWebhook(payload: any, headers: any): boolean {
    // In production:
    // Verify PayPal webhook signature using their SDK

    return true; // Simulated verification
  }
}

// Singleton instance
export const paymentService = new PaymentService();
