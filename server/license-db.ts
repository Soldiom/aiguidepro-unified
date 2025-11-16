import { eq, and, sql } from "drizzle-orm";
import { getDb } from "./db";
import { licenses, activations, purchases, type InsertLicense, type InsertActivation, type InsertPurchase } from "../drizzle/schema";

/**
 * Database operations for licensing system
 */

// ==================== Licenses ====================

export async function createLicense(license: InsertLicense) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');

  const result = await db.insert(licenses).values(license);
  return result;
}

export async function getLicenseByKey(licenseKey: string) {
  const db = await getDb();
  if (!db) return null;

  const result = await db.select().from(licenses).where(eq(licenses.licenseKey, licenseKey)).limit(1);
  return result[0] || null;
}

export async function getLicensesByEmail(email: string) {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(licenses).where(eq(licenses.email, email));
}

export async function updateLicenseStatus(licenseId: number, status: 'active' | 'expired' | 'revoked') {
  const db = await getDb();
  if (!db) throw new Error('Database not available');

  await db.update(licenses)
    .set({ status, updatedAt: new Date() })
    .where(eq(licenses.id, licenseId));
}

export async function incrementActivationCount(licenseId: number) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');

  await db.update(licenses)
    .set({ 
      currentActivations: sql`${licenses.currentActivations} + 1`,
      updatedAt: new Date()
    })
    .where(eq(licenses.id, licenseId));
}

export async function decrementActivationCount(licenseId: number) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');

  await db.update(licenses)
    .set({ 
      currentActivations: sql`${licenses.currentActivations} - 1`,
      updatedAt: new Date()
    })
    .where(eq(licenses.id, licenseId));
}

// ==================== Activations ====================

export async function createActivation(activation: InsertActivation) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');

  const result = await db.insert(activations).values(activation);
  return result;
}

export async function getActivationsByLicense(licenseId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(activations)
    .where(and(
      eq(activations.licenseId, licenseId),
      eq(activations.status, 'active')
    ));
}

export async function getActivationByHardwareId(licenseId: number, hardwareId: string) {
  const db = await getDb();
  if (!db) return null;

  const result = await db.select().from(activations)
    .where(and(
      eq(activations.licenseId, licenseId),
      eq(activations.hardwareId, hardwareId),
      eq(activations.status, 'active')
    ))
    .limit(1);

  return result[0] || null;
}

export async function deactivateActivation(activationId: number) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');

  await db.update(activations)
    .set({ status: 'deactivated' })
    .where(eq(activations.id, activationId));
}

export async function updateLastSeen(activationId: number) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');

  await db.update(activations)
    .set({ lastSeenAt: new Date() })
    .where(eq(activations.id, activationId));
}

// ==================== Purchases ====================

export async function createPurchase(purchase: InsertPurchase) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');

  const result = await db.insert(purchases).values(purchase);
  return result;
}

export async function getPurchaseById(id: number) {
  const db = await getDb();
  if (!db) return null;

  const result = await db.select().from(purchases).where(eq(purchases.id, id)).limit(1);
  return result[0] || null;
}

export async function getPurchaseByPaymentId(paymentId: string) {
  const db = await getDb();
  if (!db) return null;

  const result = await db.select().from(purchases).where(eq(purchases.paymentId, paymentId)).limit(1);
  return result[0] || null;
}

export async function updatePurchaseStatus(
  purchaseId: number, 
  status: 'pending' | 'completed' | 'failed' | 'refunded'
) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');

  await db.update(purchases)
    .set({ 
      status,
      completedAt: status === 'completed' ? new Date() : undefined
    })
    .where(eq(purchases.id, purchaseId));
}

export async function getPurchasesByEmail(email: string) {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(purchases).where(eq(purchases.email, email));
}

// ==================== Statistics ====================

export async function getLicenseStats() {
  const db = await getDb();
  if (!db) return null;

  const totalLicenses = await db.select({ count: sql<number>`count(*)` }).from(licenses);
  const activeLicenses = await db.select({ count: sql<number>`count(*)` })
    .from(licenses)
    .where(eq(licenses.status, 'active'));
  const expiredLicenses = await db.select({ count: sql<number>`count(*)` })
    .from(licenses)
    .where(eq(licenses.status, 'expired'));
  const totalActivations = await db.select({ count: sql<number>`count(*)` }).from(activations);
  const activeActivations = await db.select({ count: sql<number>`count(*)` })
    .from(activations)
    .where(eq(activations.status, 'active'));

  return {
    totalLicenses: totalLicenses[0].count,
    activeLicenses: activeLicenses[0].count,
    expiredLicenses: expiredLicenses[0].count,
    totalActivations: totalActivations[0].count,
    activeActivations: activeActivations[0].count
  };
}

export async function getRecentPurchases(limit: number = 10) {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(purchases)
    .orderBy(sql`${purchases.createdAt} DESC`)
    .limit(limit);
}
