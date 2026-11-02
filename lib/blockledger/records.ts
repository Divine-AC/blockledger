import { localDb } from "./local-db";
import type { LocalRecord, NewRecordInput } from "./types";

type TrackerRow = {
  sourceRow: number; date: string | null; customer: string; supplyStatus: string;
  supplyDetail: string; blockType: string; blocksProduced: number | null;
  blocksSold: number | null; unitPrice: number | null; revenue: number | null;
  cementCost: number | null; dustCost: number | null; labourCost: number | null;
  fuelTransportCost: number | null; otherCost: number | null; totalCost: number | null;
  profit: number | null; amountPaid: number | null; debt: number | null;
};

export async function importTrackerHistory(rows: TrackerRow[], businessId: string) {
  if (!rows.length) return false;
  const firstId = `tracker-history-${String(rows[0].sourceRow).padStart(3, "0")}`;
  return localDb.transaction("rw", localDb.records, async () => {
    if (await localDb.records.get(firstId)) return false;
    const records: LocalRecord[] = rows.map((row) => ({
      id: `tracker-history-${String(row.sourceRow).padStart(3, "0")}`,
      businessId,
      recordType: "historyRow",
      payload: row as unknown as Record<string, string | number | boolean | null>,
      clientCreatedAt: `${row.date || "2026-01-01"}T12:00:00.000Z`,
      createdBy: "tracker-history-import",
      syncStatus: "synced",
      syncError: undefined,
    }));
    await localDb.records.bulkAdd(records);
    return true;
  });
}

function uuid() {
  return crypto.randomUUID();
}

export async function addLocalRecord(
  input: NewRecordInput,
  context: { businessId: string; userId: string },
): Promise<LocalRecord> {
  const record: LocalRecord = {
    id: uuid(),
    businessId: context.businessId,
    recordType: input.recordType,
    payload: input.payload,
    clientCreatedAt: new Date().toISOString(),
    createdBy: context.userId,
    syncStatus: "pending",
  };

  await localDb.records.add(record);
  return record;
}

export async function listLocalRecords(businessId: string) {
  return localDb.records
    .where("businessId")
    .equals(businessId)
    .reverse()
    .sortBy("clientCreatedAt");
}
