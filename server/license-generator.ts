import crypto from 'crypto';

/**
 * License Key Generator with RSA encryption
 * Generates secure, offline-verifiable license keys
 */

export class LicenseGenerator {
  private privateKey: string;
  private publicKey: string;

  constructor() {
    // Generate RSA key pair (in production, load from secure storage)
    const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
      modulusLength: 2048,
      publicKeyEncoding: {
        type: 'spki',
        format: 'pem'
      },
      privateKeyEncoding: {
        type: 'pkcs8',
        format: 'pem'
      }
    });

    this.publicKey = publicKey;
    this.privateKey = privateKey;
  }

  /**
   * Generate a unique license key
   */
  generateLicenseKey(email: string, maxActivations: number = 1, expiresInDays?: number): string {
    const payload = {
      email,
      maxActivations,
      expiresAt: expiresInDays ? Date.now() + (expiresInDays * 24 * 60 * 60 * 1000) : null,
      issuedAt: Date.now(),
      nonce: crypto.randomBytes(16).toString('hex')
    };

    // Sign the payload with private key
    const payloadString = JSON.stringify(payload);
    const signature = crypto.sign('sha256', Buffer.from(payloadString), {
      key: this.privateKey,
      padding: crypto.constants.RSA_PKCS1_PSS_PADDING,
    });

    // Combine payload and signature
    const licenseData = {
      payload: Buffer.from(payloadString).toString('base64'),
      signature: signature.toString('base64')
    };

    // Encode to base64 and format
    const licenseKey = Buffer.from(JSON.stringify(licenseData)).toString('base64');
    
    // Format as XXXXX-XXXXX-XXXXX-XXXXX
    return this.formatLicenseKey(licenseKey);
  }

  /**
   * Validate a license key (offline verification)
   */
  validateLicenseKey(licenseKey: string): { valid: boolean; payload?: any; error?: string } {
    try {
      // Remove formatting
      const cleanKey = licenseKey.replace(/-/g, '');
      
      // Decode license data
      const licenseData = JSON.parse(Buffer.from(cleanKey, 'base64').toString('utf-8'));
      const payloadString = Buffer.from(licenseData.payload, 'base64').toString('utf-8');
      const signature = Buffer.from(licenseData.signature, 'base64');

      // Verify signature with public key
      const isValid = crypto.verify(
        'sha256',
        Buffer.from(payloadString),
        {
          key: this.publicKey,
          padding: crypto.constants.RSA_PKCS1_PSS_PADDING,
        },
        signature
      );

      if (!isValid) {
        return { valid: false, error: 'Invalid signature' };
      }

      // Parse payload
      const payload = JSON.parse(payloadString);

      // Check expiration
      if (payload.expiresAt && Date.now() > payload.expiresAt) {
        return { valid: false, error: 'License expired' };
      }

      return { valid: true, payload };
    } catch (error) {
      return { valid: false, error: 'Invalid license key format' };
    }
  }

  /**
   * Format license key as XXXXX-XXXXX-XXXXX-XXXXX
   */
  private formatLicenseKey(key: string): string {
    // Take first 20 characters and format
    const cleaned = key.replace(/[^A-Z0-9]/gi, '').toUpperCase().slice(0, 20);
    const parts = [];
    for (let i = 0; i < cleaned.length; i += 5) {
      parts.push(cleaned.slice(i, i + 5));
    }
    return parts.join('-');
  }

  /**
   * Generate hardware ID from machine characteristics
   */
  static generateHardwareId(): string {
    const os = require('os');
    
    const components = [
      os.hostname(),
      os.platform(),
      os.arch(),
      os.cpus()[0].model,
      os.totalmem().toString()
    ];

    const hash = crypto.createHash('sha256');
    hash.update(components.join('|'));
    return hash.digest('hex');
  }

  /**
   * Validate hardware ID matches
   */
  static validateHardwareId(storedId: string): boolean {
    const currentId = this.generateHardwareId();
    return storedId === currentId;
  }

  /**
   * Get public key for offline validation
   */
  getPublicKey(): string {
    return this.publicKey;
  }

  /**
   * Create activation token
   */
  createActivationToken(licenseKey: string, hardwareId: string): string {
    const data = {
      licenseKey,
      hardwareId,
      activatedAt: Date.now()
    };

    const signature = crypto.sign('sha256', Buffer.from(JSON.stringify(data)), {
      key: this.privateKey,
      padding: crypto.constants.RSA_PKCS1_PSS_PADDING,
    });

    return Buffer.from(JSON.stringify({
      data: Buffer.from(JSON.stringify(data)).toString('base64'),
      signature: signature.toString('base64')
    })).toString('base64');
  }

  /**
   * Verify activation token
   */
  verifyActivationToken(token: string): { valid: boolean; data?: any; error?: string } {
    try {
      const tokenData = JSON.parse(Buffer.from(token, 'base64').toString('utf-8'));
      const dataString = Buffer.from(tokenData.data, 'base64').toString('utf-8');
      const signature = Buffer.from(tokenData.signature, 'base64');

      const isValid = crypto.verify(
        'sha256',
        Buffer.from(dataString),
        {
          key: this.publicKey,
          padding: crypto.constants.RSA_PKCS1_PSS_PADDING,
        },
        signature
      );

      if (!isValid) {
        return { valid: false, error: 'Invalid activation token' };
      }

      const data = JSON.parse(dataString);
      return { valid: true, data };
    } catch (error) {
      return { valid: false, error: 'Invalid token format' };
    }
  }
}

// Singleton instance
let licenseGenerator: LicenseGenerator | null = null;

export function getLicenseGenerator(): LicenseGenerator {
  if (!licenseGenerator) {
    licenseGenerator = new LicenseGenerator();
  }
  return licenseGenerator;
}
