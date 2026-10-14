import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

const SLOT_ID = "header-abstract";

export function AbstractText({ color }: { color: string }) {
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  const load = useCallback(async () => {
    const { data, error } = await supabase
      .from("plt_links")
      .select("url")
      .eq("slot_id", SLOT_ID)
      .order("created_at", { ascending: false })
      .limit(1);
    if (!error && data && data.length > 0 && typeof data[0].url === "string") {
      setText(data[0].url);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const save = async () => {
    setBusy(true);
    setStatus(null);
    await supabase.from("plt_links").delete().eq("slot_id", SLOT_ID);
    const trimmed = text.trim();
    if (trimmed) {
      const { error } = await supabase
        .from("plt_links")
        .insert({ slot_id: SLOT_ID, url: trimmed, title: "abstract" });
      setStatus(error ? error.message : "Abstract saved.");
    } else {
      setStatus("Abstract cleared.");
    }
    setBusy(false);
  };

  return (
    <div className="flex flex-col rounded-[1.5rem] border-2 border-dashed bg-card p-5">
      <div>
        <p
          className="font-bold leading-snug"
          style={{ fontSize: "1.3rem", color, textShadow: `0 0 18px color-mix(in oklab, ${color} 55%, transparent)` }}
        >
          Abstract
        </p>

        <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
          Write the lesson abstract here, then save — it stays after you refresh.
        </p>
      </div>
      <textarea
        aria-label="Lesson abstract"
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={5}
        placeholder="Type or paste the abstract text…"
        className="mt-4 min-h-[7rem] flex-1 resize-y rounded-2xl border bg-muted px-3.5 py-3 text-xs leading-relaxed outline-none focus:border-[color:var(--ring)]"
      />
      <div className="mt-3 flex items-center gap-3">
        <button
          type="button"
          onClick={() => void save()}
          disabled={busy}
          className="rounded-xl px-4 py-2 text-xs font-bold text-[oklch(0.18_0.04_260)] shadow-soft transition-transform hover:scale-[1.03] disabled:opacity-60"
          style={{ background: color }}
        >
          {busy ? "Saving…" : "Save abstract"}
        </button>
        {status && <span className="text-xs text-muted-foreground">{status}</span>}
      </div>
    </div>
  );
}
