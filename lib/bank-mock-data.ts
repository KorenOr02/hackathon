export const bankSummary = [
  { label: "שווי כולל", value: "₪187,430", note: "+₪312 היום", tone: "positive" },
  { label: "בקרן כספית", value: "₪94,200", note: "תשואה שנתית 4.7%", tone: "positive" },
  { label: "בעו״ש", value: "₪93,230", note: "נזיל לחלוטין", tone: "neutral" },
  { label: "תשואה החודש", value: "₪1,580", note: "+12% לעומת החודש הקודם", tone: "positive" },
];

export const monthlyYield = [
  { month: "ינו׳", value: 700, height: 42 },
  { month: "פבר׳", value: 900, height: 58 },
  { month: "מרץ", value: 850, height: 54 },
  { month: "אפר׳", value: 1200, height: 76 },
  { month: "מאי", value: 1100, height: 67 },
  { month: "יוני", value: 1600, height: 96 },
  { month: "יולי", value: 1400, height: 84 },
];

export const transactions = [
  { description: "זיכוי תשואה", category: "תשואה", date: "היום, 02:00", amount: "+₪42.80", positive: true },
  { description: "העברה אוטומטית לקרן כספית", category: "השקעה", date: "אתמול, 23:55", amount: "₪12,000", positive: false },
  { description: "סלקום", category: "סלולר", date: "9 ביוני 2026", amount: "₪150", positive: false, flagged: true },
  { description: "משכורת", category: "הכנסה", date: "1 ביוני 2026", amount: "+₪18,500", positive: true },
  { description: "בזק אינטרנט", category: "תקשורת", date: "28 במאי 2026", amount: "₪120", positive: false },
  { description: "נטפליקס", category: "סטרימינג", date: "24 במאי 2026", amount: "₪69", positive: false },
];

export const holdings = [
  { name: "קרן כספית ממשלתית", type: "קרן כספית", value: "₪94,200", allocation: 50.3, yield: "+4.7%" },
  { name: "יתרת עו״ש", type: "מזומן", value: "₪63,230", allocation: 33.7, yield: "0%" },
  { name: "אג״ח קצרות", type: "אג״ח", value: "₪30,000", allocation: 16, yield: "+3.9%" },
];
