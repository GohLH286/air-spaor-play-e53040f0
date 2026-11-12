import { test, expect } from "bun:test";
import postgres from "postgres";

const url = process.env.SUPABASE_DB_URL;
if (!url) throw new Error("Database test connection is required");
const db = postgres(url, { max: 1 });
for (const table of ["plt_links", "plt_uploads"]) {
  test(`${table}: unsigned visitors have no read or insert grants`, async () => {
    const [access] = await db`SELECT has_table_privilege('anon', ${'public.' + table}, 'SELECT') AS read, has_table_privilege('anon', ${'public.' + table}, 'INSERT') AS write`;
    expect(access.read).toBe(false);
    expect(access.write).toBe(false);
  });
  test(`${table}: existing unassigned materials are preserved`, async () => {
    const [rows] = await db.unsafe(`SELECT count(*)::int AS n FROM public.${table} WHERE user_id IS NULL`);
    expect(rows.n).toBeGreaterThan(0);
    const [policy] = await db`SELECT roles, qual FROM pg_policies WHERE schemaname='public' AND tablename=${table} AND cmd='SELECT'`;
    expect(policy.roles).toEqual(["authenticated"]);
    expect(policy.qual).toContain("auth.uid()");
  });
  test(`${table}: insert policy binds the owner to the verified caller`, async () => {
    const [policy] = await db`SELECT roles, with_check FROM pg_policies WHERE schemaname='public' AND tablename=${table} AND cmd='INSERT'`;
    expect(policy.roles).toEqual(["authenticated"]);
    expect(policy.with_check).toContain("user_id =");
    expect(policy.with_check).toContain("auth.uid()");
  });
}

test("storage uploads are restricted to the authenticated owner and folder", async () => {
  const [policy] = await db`SELECT roles, with_check FROM pg_policies WHERE schemaname='storage' AND tablename='objects' AND policyname='Teachers upload to their own folder'`;
  expect(policy.roles).toEqual(["authenticated"]);
  expect(policy.with_check).toContain("owner_id");
  expect(policy.with_check).toContain("auth.uid()");
  expect(policy.with_check).toContain("storage.foldername(name)");
});
