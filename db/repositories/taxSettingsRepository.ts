import { randomUUID } from "node:crypto";
import { SqliteDatabase } from "../client";

export interface TaxSettingsRecord {
  id: string;
  companyId: string;
  taxYear: number;
  socialSecurityWageBaseCents: number;
  medicareRateBps: number;
  federalWithholdingMethod: string;
  stateWithholdingMode: string;
}

export class TaxSettingsRepository {
  constructor(private readonly db: SqliteDatabase) {}

  upsert(input: Omit<TaxSettingsRecord, "id"> & { id?: string }): TaxSettingsRecord {
    const id = input.id ?? randomUUID();
    this.db.prepare(`INSERT INTO tax_settings
      (id, company_id, tax_year, social_security_wage_base_cents, medicare_rate_bps, federal_withholding_method, state_withholding_mode)
      VALUES (@id,@company_id,@tax_year,@social_security_wage_base_cents,@medicare_rate_bps,@federal_withholding_method,@state_withholding_mode)
      ON CONFLICT(company_id, tax_year) DO UPDATE SET
      social_security_wage_base_cents=excluded.social_security_wage_base_cents,
      medicare_rate_bps=excluded.medicare_rate_bps,
      federal_withholding_method=excluded.federal_withholding_method,
      state_withholding_mode=excluded.state_withholding_mode,
      updated_at=CURRENT_TIMESTAMP`).run({
      id,
      company_id: input.companyId,
      tax_year: input.taxYear,
      social_security_wage_base_cents: input.socialSecurityWageBaseCents,
      medicare_rate_bps: input.medicareRateBps,
      federal_withholding_method: input.federalWithholdingMethod,
      state_withholding_mode: input.stateWithholdingMode,
    });
    return { ...input, id };
  }

  listByCompany(companyId: string): TaxSettingsRecord[] {
    return this.db.prepare("SELECT * FROM tax_settings WHERE company_id=@company_id ORDER BY tax_year DESC").all<any>({ company_id: companyId }).map((r: any) => ({
      id: r.id, companyId: r.company_id, taxYear: r.tax_year, socialSecurityWageBaseCents: r.social_security_wage_base_cents, medicareRateBps: r.medicare_rate_bps, federalWithholdingMethod: r.federal_withholding_method, stateWithholdingMode: r.state_withholding_mode,
    }));
  }
}
