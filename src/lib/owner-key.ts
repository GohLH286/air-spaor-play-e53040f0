import { supabase } from "@/integrations/supabase/client";

const KEY = "plt-owner-key";

export function getOwnerKey(): string {
  let k = localStorage.getItem(KEY);
  if (!k) {
    k = crypto.randomUUID() + crypto.randomUUID();
    localStorage.setItem(KEY, k);
  }
  return k;
}

export async function getOwnerHash(): Promise<string> {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(getOwnerKey()));
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/** Deletes a row only if it was added from this browser. Returns true on success. */
export async function deleteOwned(table: "uploads" | "links", id: string): Promise<boolean> {
  const { data } = await supabase.rpc("delete_plt_item", { _table: table, _id: id, _key: getOwnerKey() });
  return data === true;
}
