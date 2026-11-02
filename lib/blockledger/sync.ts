import { localDb } from "./local-db";
import { getSupabaseBrowserClient } from "./supabase-browser";

/**
 * Append-only pilot sync:
 * - Local writes happen first.
 * - The same UUID is reused on every retry.
 * - Server insert conflicts (23505) mean the ID already exists and are treated
 *   as synced. We intentionally don't overwrite server rows from offline clients.
 * - A later audited edit workflow should use versioning/conflict resolution.
 */
export async function syncPendingRecords() {
  const supabase = getSupabaseBrowserClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError) throw authError;
  if (!user) throw new Error("Sign in before syncing records.");

  const pending = await localDb.records.where("syncStatus").anyOf("pending", "error").toArray();
  let synced = 0;
  let failed = 0;

  for (const local of pending) {
    if (local.createdBy !== user.id) {
      await localDb.records.update(local.id, {
        syncStatus: "error",
        syncError: "Record belongs to a different signed-in user.",
      });
      failed++;
      continue;
    }

    const { error } = await supabase.from("records").insert({
      id: local.id,
      business_id: local.businessId,
      record_type: local.recordType,
      payload: local.payload,
      client_created_at: local.clientCreatedAt,
      created_by: local.createdBy,
    });

    if (!error || error.code === "23505") {
      await localDb.records.update(local.id, { syncStatus: "synced", syncError: undefined });
      synced++;
    } else {
      await localDb.records.update(local.id, { syncStatus: "error", syncError: error.message });
      failed++;
    }
  }

  return { synced, failed };
}
