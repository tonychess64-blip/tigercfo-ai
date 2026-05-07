export interface Company {
  id: string;
  name: string;
  state: string;
  payFrequency: "weekly" | "biweekly" | "semi-monthly" | "monthly";
  ein?: string;
}
