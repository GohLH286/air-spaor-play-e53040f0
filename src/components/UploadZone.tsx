import { useCallback, useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export type UploadSlotSpec = {
  id: string;
  title: string;
  hint?: string;
  accept?: string;
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

  useEffect(() => {
    void load();
  }, [load]);

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
