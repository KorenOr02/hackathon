import type { ProviderOffer, RecurringExpense } from "./types";

export const currentPlan = {
  provider: "סלקום",
  currentPrice: 150,
  previousPrice: 100,
  category: "סלולר",
};

export const recurringExpenses: RecurringExpense[] = [
  { provider: "סלקום", category: "סלולר", previousPrice: 100, currentPrice: 150, change: 50, status: "המחיר עלה" },
  { provider: "נטפליקס", category: "סטרימינג", previousPrice: 69, currentPrice: 69, change: 0, status: "יציב" },
  { provider: "חדר כושר", category: "כושר", previousPrice: 249, currentPrice: 249, change: 0, status: "יציב" },
  { provider: "בזק אינטרנט", category: "אינטרנט", previousPrice: 120, currentPrice: 120, change: 0, status: "יציב" },
  { provider: "ספוטיפיי", category: "מוזיקה", previousPrice: 22, currentPrice: 22, change: 0, status: "יציב" },
];

export const providerOffers: ProviderOffer[] = [
  { provider: "סלקום", type: "שימור", monthlyPrice: 109, data: "150GB", commitment: "ללא התחייבות", hiddenFees: "לא נמצאו", notes: "הנחת שימור לאחר משא ומתן" },
  { provider: "פרטנר", type: "חלופה", monthlyPrice: 99, data: "200GB", commitment: "ללא התחייבות", hiddenFees: "ייתכן תשלום על SIM", notes: "הצעה ללקוח חדש" },
  { provider: "פלאפון", type: "חלופה", monthlyPrice: 95, data: "300GB", commitment: "ללא התחייבות", hiddenFees: "לא נמצאו", notes: "ההצעה המשתלמת ביותר" },
];

export const bestOffer = providerOffers[2];
