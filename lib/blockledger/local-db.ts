import Dexie, { type EntityTable } from "dexie";
import type { LocalRecord } from "./types";

class BlockLedgerDB extends Dexie {
  records!: EntityTable<LocalRecord, "id">;

  constructor() {
    super("blockledger-local");
    this.version(1).stores({
      records: "id, businessId, recordType, clientCreatedAt, syncStatus",
    });
  }
}

export const localDb = new BlockLedgerDB();
