import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto";

export interface EncryptedValue {
  ciphertext: string;
  keyId: string;
  algorithm: string;
}

export interface EncryptionProvider {
  encrypt(plaintext: string, context: Record<string, string>): Promise<EncryptedValue>;
  decrypt(payload: EncryptedValue, context: Record<string, string>): Promise<string>;
}

export interface KeyProvider {
  getActiveKey(): { keyId: string; key: Buffer };
  getKeyById(keyId: string): Buffer;
}

export class EnvKeyProvider implements KeyProvider {
  constructor(private readonly envVar = "PAYROLLPRO_ENCRYPTION_KEY_B64", private readonly keyId = "local-env-key") {}

  getActiveKey() {
    const b64 = process.env[this.envVar];
    if (!b64) throw new Error(`Missing ${this.envVar}`);
    const key = Buffer.from(b64, "base64");
    if (key.length !== 32) throw new Error("Encryption key must be 32 bytes (base64 encoded)");
    return { keyId: this.keyId, key };
  }

  getKeyById(keyId: string): Buffer {
    const active = this.getActiveKey();
    if (keyId !== active.keyId) throw new Error(`Unknown key id: ${keyId}`);
    return active.key;
  }
}

export class AesGcmEncryptionProvider implements EncryptionProvider {
  constructor(private readonly keys: KeyProvider) {}

  async encrypt(plaintext: string, _context: Record<string, string>): Promise<EncryptedValue> {
    const { keyId, key } = this.keys.getActiveKey();
    const iv = randomBytes(12);
    const cipher = createCipheriv("aes-256-gcm", key, iv);
    const ciphertext = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
    const tag = cipher.getAuthTag();

    return {
      keyId,
      algorithm: "aes-256-gcm",
      ciphertext: Buffer.concat([iv, tag, ciphertext]).toString("base64"),
    };
  }

  async decrypt(payload: EncryptedValue, _context: Record<string, string>): Promise<string> {
    if (payload.algorithm !== "aes-256-gcm") throw new Error(`Unsupported algorithm: ${payload.algorithm}`);
    const key = this.keys.getKeyById(payload.keyId);
    const packed = Buffer.from(payload.ciphertext, "base64");
    const iv = packed.subarray(0, 12);
    const tag = packed.subarray(12, 28);
    const ciphertext = packed.subarray(28);

    const decipher = createDecipheriv("aes-256-gcm", key, iv);
    decipher.setAuthTag(tag);
    return Buffer.concat([decipher.update(ciphertext), decipher.final()]).toString("utf8");
  }
}

export function maskLast4(value: string): string {
  return value.slice(-4);
}
