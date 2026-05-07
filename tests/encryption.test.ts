import test from "node:test";
import assert from "node:assert/strict";
import { AesGcmEncryptionProvider, EnvKeyProvider } from "../db/encryption";

test("aes gcm encrypt/decrypt roundtrip", async () => {
  process.env.PAYROLLPRO_ENCRYPTION_KEY_B64 = Buffer.alloc(32, 7).toString("base64");
  const provider = new AesGcmEncryptionProvider(new EnvKeyProvider());

  const enc = await provider.encrypt("123456789", { scope: "test" });
  assert.equal(enc.algorithm, "aes-256-gcm");

  const dec = await provider.decrypt(enc, { scope: "test" });
  assert.equal(dec, "123456789");
});
