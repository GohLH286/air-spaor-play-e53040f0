import { useCallback, useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export type LinkField = {
  key: string;
  label: string;
  hint?: string;
  placeholder?: string;
};

export type UploadSlotSpec = {
  id: string;
  title: string;
  hint?: string;
  accept?: string;
  allowLink?: boolean;
  linkHint?: string;
  linkFields?: LinkField[];
};

type StoredLink = {
  id: string;
  url: string;
  title: string | null;
};

type StoredFile = {
  id: string;
  name: string;
  size: number;
  path: string;
};

const BUCKET = "plt-uploads";

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function Slot({ spec, color }: { spec: UploadSlotSpec; color: string }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<StoredFile[]>([]);
  const [dragging, setDragging] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [links, setLinks] = useState<StoredLink[]>([]);
  const [linkDrafts, setLinkDrafts] = useState<Record<string, string>>({});

  const linkFields: LinkField[] =
    spec.linkFields ??
    (spec.allowLink
      ? [{ key: "default", label: "SLS link", hint: spec.linkHint }]
      : []);
  const hasLinks = linkFields.length > 0;

  const load = useCallback(async () => {
    const { data, error: err } = await supabase
      .from("plt_uploads")
      .select("id, file_name, file_size, storage_path")
      .eq("slot_id", spec.id)
      .order("created_at", { ascending: true });
    if (err) {
      setError(err.message);
      return;
    }
    setFiles(
      (data ?? []).map((r) => ({
        id: r.id,
        name: r.file_name,
        size: Number(r.file_size),
        path: r.storage_path,
      })),
    );
  }, [spec.id]);

  const loadLinks = useCallback(async () => {
    if (!hasLinks) return;
    const { data } = await supabase
      .from("plt_links")
      .select("id, url, title")
      .eq("slot_id", spec.id)
      .order("created_at", { ascending: true });
    setLinks((data ?? []).map((r) => ({ id: r.id, url: r.url, title: r.title })));
  }, [spec.id, hasLinks]);

  useEffect(() => {
    void load();
    void loadLinks();
  }, [load, loadLinks]);

  const addLink = async (fieldKey: string) => {
    const raw = (linkDrafts[fieldKey] ?? "").trim();
    if (!raw) return;
    const url = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
    const { error: err } = await supabase
      .from("plt_links")
      .insert({ slot_id: spec.id, url, title: fieldKey });
    if (err) {
      setError(err.message);
      return;
    }
    setLinkDrafts((d) => ({ ...d, [fieldKey]: "" }));
    await loadLinks();
  };

  const removeLink = async (id: string) => {
    await supabase.from("plt_links").delete().eq("id", id);
    await loadLinks();
  };

  const add = async (list: FileList | null) => {
    if (!list || list.length === 0) return;
    setBusy(true);
    setError(null);
    for (const file of Array.from(list)) {
      const path = `${spec.id}/${crypto.randomUUID()}-${file.name.replace(/[^\w.\-]/g, "_")}`;
      const { error: upErr } = await supabase.storage.from(BUCKET).upload(path, file);
      if (upErr) {
        setError(upErr.message);
        continue;
      }
      const { error: insErr } = await supabase.from("plt_uploads").insert({
        slot_id: spec.id,
        file_name: file.name,
        file_size: file.size,
        storage_path: path,
      });
      if (insErr) setError(insErr.message);
    }
    await load();
    setBusy(false);
  };

  const remove = async (f: StoredFile) => {
    await supabase.storage.from(BUCKET).remove([f.path]);
    await supabase.from("plt_uploads").delete().eq("id", f.id);
    await load();
  };

  const open = async (f: StoredFile) => {
    const { data } = await supabase.storage.from(BUCKET).createSignedUrl(f.path, 3600);
    if (data?.signedUrl) window.open(data.signedUrl, "_blank", "noopener");
  };

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragging(false);
        void add(e.dataTransfer.files);
      }}
      className="flex flex-col rounded-[1.5rem] border-2 border-dashed bg-card p-5 transition-all duration-300"
      style={{
        borderColor: dragging ? color : "var(--border)",
        background: dragging ? "color-mix(in oklab, white 92%, " + color + ")" : "var(--card)",
      }}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold leading-snug">{spec.title}</p>
          {spec.hint && (
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{spec.hint}</p>
          )}
        </div>
        <button
          type="button"
          aria-label={`Upload ${spec.title}`}
          disabled={busy}
          onClick={() => inputRef.current?.click()}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-lg font-bold text-[oklch(0.18_0.04_260)] shadow-soft transition-transform hover:scale-105 disabled:opacity-60"
          style={{ background: color }}
        >
          +
        </button>
      </div>

      <input
        ref={inputRef}
        type="file"
        multiple
        accept={spec.accept}
        className="hidden"
        onChange={(e) => {
          void add(e.target.files);
          e.target.value = "";
        }}
      />

      {files.length > 0 ? (
        <ul className="mt-4 space-y-2">
          {files.map((f) => (
            <li
              key={f.id}
              className="flex items-center justify-between gap-3 rounded-2xl bg-muted px-3.5 py-2.5"
            >
              <button
                type="button"
                onClick={() => void open(f)}
                className="truncate text-left text-xs font-medium underline-offset-2 hover:underline"
              >
                {f.name}
              </button>
              <span className="flex items-center gap-2">
                <span className="text-[10px] text-muted-foreground">{formatSize(f.size)}</span>
                <button
                  type="button"
                  aria-label={`Remove ${f.name}`}
                  onClick={() => void remove(f)}
                  className="text-xs text-muted-foreground transition-colors hover:text-foreground"
                >
                  ✕
                </button>
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="mt-4 rounded-2xl bg-muted px-4 py-3 text-xs font-medium text-muted-foreground transition-colors hover:bg-background"
        >
          {busy ? "Uploading…" : "Drag & drop or click + to upload"}
        </button>
      )}

      {linkFields.map((field) => {
        const fieldLinks = links.filter((l) =>
          field.key === "default" ? !l.title || l.title === "default" : l.title === field.key,
        );
        const inputId = `link-${spec.id}-${field.key}`;
        return (
          <div key={field.key} className="mt-4 rounded-2xl bg-muted p-3.5">
            <label className="text-xs font-semibold" htmlFor={inputId}>
              {field.label}
            </label>
            <p className="mt-1 text-xs text-muted-foreground">
              {field.hint ?? "Paste the SLS URL here."}
            </p>
            <div className="mt-2 flex gap-2">
              <input
                id={inputId}
                type="url"
                value={linkDrafts[field.key] ?? ""}
                placeholder={field.placeholder ?? "https://vle.learning.moe.edu.sg/..."}
                onChange={(e) =>
                  setLinkDrafts((d) => ({ ...d, [field.key]: e.target.value }))
                }
                onKeyDown={(e) => {
                  if (e.key === "Enter") void addLink(field.key);
                }}
                className="min-w-0 flex-1 rounded-xl border bg-background px-3 py-2 text-xs outline-none focus:border-[color:var(--ring)]"
              />
              <button
                type="button"
                onClick={() => void addLink(field.key)}
                className="rounded-xl px-3.5 py-2 text-xs font-bold text-[oklch(0.18_0.04_260)]"
                style={{ background: color }}
              >
                Save
              </button>
            </div>
            {fieldLinks.length > 0 && (
              <ul className="mt-3 space-y-2">
                {fieldLinks.map((l) => (
                  <li key={l.id} className="flex items-center justify-between gap-3">
                    <a
                      href={l.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="truncate text-xs font-medium underline underline-offset-2"
                    >
                      {l.url}
                    </a>
                    <button
                      type="button"
                      aria-label="Remove link"
                      onClick={() => void removeLink(l.id)}
                      className="text-xs text-muted-foreground hover:text-foreground"
                    >
                      ✕
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        );
      })}

      {error && <p className="mt-3 text-[11px] text-[var(--problem)]">{error}</p>}
    </div>
  );
}

export function UploadZone({
  label,
  color,
  slots,
  columns = 2,
}: {
  label: string;
  color: string;
  slots: UploadSlotSpec[];
  columns?: 1 | 2;
}) {
  return (
    <section className="rounded-[2rem] border bg-card/60 p-6 shadow-[var(--shadow-soft)] md:p-8">
      <div className="flex items-center gap-3">
        <span className="h-2.5 w-2.5 rounded-full" style={{ background: color }} />
        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
          {label}
        </p>
      </div>
      <div
        className={`mt-5 grid gap-4 ${columns === 2 ? "md:grid-cols-2" : "md:grid-cols-1"}`}
      >
        {slots.map((s) => (
          <Slot key={s.id} spec={s} color={color} />
        ))}
      </div>
      <p className="mt-4 text-[11px] text-muted-foreground">
        Files are saved to your project storage — they stay after you refresh or reopen the page.
      </p>
    </section>
  );
}
