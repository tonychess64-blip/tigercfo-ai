import { randomUUID } from "node:crypto";
import { SqliteDatabase } from "../client";
import { EncryptionProvider, maskLast4 } from "../encryption";

export interface EmployeeTaxSensitiveInput {
  employeeId: string;
  filingStatus: string;
  federalExtraWithholdingCents?: number;
  stateAllowances?: number;
  ssn: string;
}

export interface DirectDepositSensitiveInput {
  employeeId: string;
  accountType: "checking" | "savings";
  bankName?: string;
  routingNumber: string;
  accountNumber: string;
  allocationType: "percent" | "fixed";
  allocationValueBps?: number;
}

export class SensitiveDataRepository {
  constructor(private readonly db: SqliteDatabase, private readonly encryption: EncryptionProvider) {}

  async upsertEmployeeTaxSettings(input: EmployeeTaxSensitiveInput): Promise<void> {
    const encryptedSsn = await this.encryption.encrypt(input.ssn, { scope: "employee_tax_settings", employeeId: input.employeeId });

    this.db.prepare(`INSERT INTO employee_tax_settings
      (id, employee_id, filing_status, federal_extra_withholding_cents, state_allowances, ssn_last4, encrypted_ssn_ciphertext, encrypted_ssn_key_id)
      VALUES
      (@id, @employee_id, @filing_status, @federal_extra_withholding_cents, @state_allowances, @ssn_last4, @encrypted_ssn_ciphertext, @encrypted_ssn_key_id)
      ON CONFLICT(employee_id) DO UPDATE SET
      filing_status = excluded.filing_status,
      federal_extra_withholding_cents = excluded.federal_extra_withholding_cents,
      state_allowances = excluded.state_allowances,
      ssn_last4 = excluded.ssn_last4,
      encrypted_ssn_ciphertext = excluded.encrypted_ssn_ciphertext,
      encrypted_ssn_key_id = excluded.encrypted_ssn_key_id,
      updated_at = CURRENT_TIMESTAMP`).run({
      id: randomUUID(),
      employee_id: input.employeeId,
      filing_status: input.filingStatus,
      federal_extra_withholding_cents: input.federalExtraWithholdingCents ?? 0,
      state_allowances: input.stateAllowances ?? 0,
      ssn_last4: maskLast4(input.ssn),
      encrypted_ssn_ciphertext: encryptedSsn.ciphertext,
      encrypted_ssn_key_id: encryptedSsn.keyId,
    });
  }

  async createDirectDepositAccount(input: DirectDepositSensitiveInput): Promise<void> {
    const encryptedRouting = await this.encryption.encrypt(input.routingNumber, { scope: "direct_deposit", employeeId: input.employeeId });
    const encryptedAccount = await this.encryption.encrypt(input.accountNumber, { scope: "direct_deposit", employeeId: input.employeeId });

    this.db.prepare(`INSERT INTO direct_deposit_accounts
      (id, employee_id, account_type, bank_name, routing_number_last4, account_number_last4,
      encrypted_routing_ciphertext, encrypted_account_ciphertext, encrypted_bank_key_id,
      allocation_type, allocation_value_bps)
      VALUES
      (@id, @employee_id, @account_type, @bank_name, @routing_number_last4, @account_number_last4,
      @encrypted_routing_ciphertext, @encrypted_account_ciphertext, @encrypted_bank_key_id,
      @allocation_type, @allocation_value_bps)`).run({
      id: randomUUID(),
      employee_id: input.employeeId,
      account_type: input.accountType,
      bank_name: input.bankName ?? null,
      routing_number_last4: maskLast4(input.routingNumber),
      account_number_last4: maskLast4(input.accountNumber),
      encrypted_routing_ciphertext: encryptedRouting.ciphertext,
      encrypted_account_ciphertext: encryptedAccount.ciphertext,
      encrypted_bank_key_id: encryptedAccount.keyId,
      allocation_type: input.allocationType,
      allocation_value_bps: input.allocationValueBps ?? null,
    });
  }
}
