import test from "node:test";
import assert from "node:assert/strict";
import { SensitiveDataRepository } from "../db/repositories/sensitiveDataRepository";
import { EncryptionProvider } from "../db/encryption";

class FakeEncryption implements EncryptionProvider {
  calls: string[] = [];
  async encrypt(plaintext: string) { this.calls.push(plaintext); return { ciphertext: `enc:${plaintext}`, keyId: "k1", algorithm: "aes-256-gcm" }; }
  async decrypt() { return ""; }
}

class FakeStatement {
  constructor(private readonly fn: (params?: Record<string, unknown>) => void) {}
  run(params?: Record<string, unknown>) { this.fn(params); return { changes: 1 }; }
  get() { return undefined; }
  all() { return []; }
}

class FakeDb {
  writes: Array<Record<string, unknown> | undefined> = [];
  prepare() { return new FakeStatement((params) => this.writes.push(params)); }
}

test("sensitive repository encrypts SSN and bank data before write", async () => {
  const db = new FakeDb() as any;
  const encryption = new FakeEncryption();
  const repo = new SensitiveDataRepository(db, encryption);

  await repo.upsertEmployeeTaxSettings({ employeeId: "e1", filingStatus: "single", ssn: "123456789" });
  await repo.createDirectDepositAccount({
    employeeId: "e1",
    accountType: "checking",
    routingNumber: "011000015",
    accountNumber: "123456789012",
    allocationType: "percent",
    allocationValueBps: 10000,
  });

  assert.deepEqual(encryption.calls, ["123456789", "011000015", "123456789012"]);
  assert.equal((db.writes[0] as any).ssn_last4, "6789");
  assert.equal((db.writes[1] as any).account_number_last4, "9012");
});
