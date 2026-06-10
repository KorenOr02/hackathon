export type ExpenseStatus = "המחיר עלה" | "יציב";

export interface RecurringExpense {
  provider: string;
  category: string;
  previousPrice: number;
  currentPrice: number;
  change: number;
  status: ExpenseStatus;
}

export interface ProviderOffer {
  provider: string;
  type: "שימור" | "חלופה";
  monthlyPrice: number;
  data: string;
  commitment: string;
  hiddenFees: string;
  notes: string;
}
