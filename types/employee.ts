export type PayType = "hourly" | "salary";

export interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  state: string;
  payType: PayType;
  hourlyRate?: number;
  salaryPerPeriod?: number;
  hoursWorked?: number;
  additionalIncome?: number;
  preTaxBenefits?: number;
  postTaxGarnishments?: number;
}
