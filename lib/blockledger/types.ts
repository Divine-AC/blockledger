export type RecordType = "production" | "sale" | "expense" | "delivery" | "payment" | "materialPurchase" | "materialUsage" | "cementSale" | "stockAdjustment" | "historyRow";

export type LocalRecord = {
  id: string;
  businessId: string;
  recordType: RecordType;
  payload: Record<string, string | number | boolean | null>;
  clientCreatedAt: string;
  createdBy: string;
  syncStatus: "pending" | "synced" | "error";
  syncError?: string;
};

export type NewRecordInput = {
  recordType: RecordType;
  payload: Record<string, string | number | boolean | null>;
};
