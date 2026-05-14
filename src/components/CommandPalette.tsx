import { useState, useEffect, useCallback, useRef, useMemo, memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Person, Task } from "@/types";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */
interface Props {
  persons: Person[];
  tasks: Task[];
  onSelectTask: (taskId: string) => void;
}

type SearchResult =
  | { type: "person"; person: Person }
  | { type: "task"; task: Task };

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */
function CommandPaletteRaw({ persons, tasks, onSelectTask }: Props) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedIdx, setSelectedIdx] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  /* ── Keyboard shortcut: Ctrl+K ── */
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  /* ── Focus input when opened ── */
  useEffect(() => {
    if (open) {
      setQuery("");
      setSelectedIdx(0);
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [open]);

  /* ── Search logic ── */
  const results = useMemo<SearchResult[]>(() => {
    const q = query.toLowerCase().trim();
    if (!q) return [];

    const personResults: SearchResult[] = persons
      .filter((p) => `${p.name} ${p.surname}`.toLowerCase().includes(q))
      .map((person) => ({ type: "person", person }));

    const taskResults: SearchResult[] = tasks
      .filter((t) => t.title.toLowerCase().includes(q) || t.description.toLowerCase().includes(q))
      .map((task) => ({ type: "task", task }));

    return [...personResults, ...taskResults].slice(0, 12);
  }, [query, persons, tasks]);

  /* ── Keyboard navigation ── */
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIdx((i) => Math.min(i + 1, results.length - 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIdx((i) => Math.max(i - 1, 0));
      } else if (e.key === "Enter" && results[selectedIdx]) {
        const r = results[selectedIdx];
        if (r.type === "task") onSelectTask(r.task.id);
        setOpen(false);
      }
    },
    [results, selectedIdx, onSelectTask],
  );

  /* ── Scroll selected into view ── */
  useEffect(() => {
    const el = listRef.current?.children[selectedIdx] as HTMLElement | undefined;
    el?.scrollIntoView({ block: "nearest" });
  }, [selectedIdx]);

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />

          {/* Palette */}
          <motion.div
            key="palette"
            initial={{ opacity: 0, scale: 0.96, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -10 }}
            transition={{ type: "spring", stiffness: 500, damping: 35 }}
            className="fixed inset-x-0 top-[18%] z-50 mx-auto w-full max-w-xl"
          >
            <div className="overflow-hidden rounded-2xl border border-gray-200/60 bg-white/95 shadow-glass backdrop-blur-2xl dark:border-zinc-700/60 dark:bg-zinc-900/95">
              {/* Input */}
              <div className="flex items-center gap-3 border-b border-gray-100 px-5 dark:border-zinc-800">
                <svg className="h-4 w-4 shrink-0 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  ref={inputRef}
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    setSelectedIdx(0);
                  }}
                  onKeyDown={handleKeyDown}
                  className="w-full bg-transparent py-4 text-sm text-gray-800 outline-none placeholder:text-gray-400 dark:text-zinc-200 dark:placeholder:text-zinc-500"
                  placeholder="Kişi veya görev ara…"
                />
                <kbd className="shrink-0 rounded-md border border-gray-200 bg-gray-50 px-1.5 py-0.5 text-[10px] font-medium text-gray-400 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-500">
                  ESC
                </kbd>
              </div>

              {/* Results */}
              {results.length > 0 && (
                <div ref={listRef} className="custom-scrollbar max-h-72 overflow-y-auto p-2">
                  {results.map((r, i) => (
                    <button
                      key={r.type === "person" ? `p-${r.person.id}` : `t-${r.task.id}`}
                      onClick={() => {
                        if (r.type === "task") onSelectTask(r.task.id);
                        setOpen(false);
                      }}
                      className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition ${
                        i === selectedIdx
                          ? "bg-accent-50 text-accent-700 dark:bg-accent-900/30 dark:text-accent-300"
                          : "text-gray-600 hover:bg-gray-50 dark:text-zinc-400 dark:hover:bg-zinc-800/60"
                      }`}
                    >
                      {r.type === "person" ? (
                        <>
                          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-accent-100 text-[10px] font-bold text-accent-600 dark:bg-accent-900/40 dark:text-accent-400">
                            {r.person.name[0]}{r.person.surname[0]}
                          </div>
                          <span className="font-medium">{r.person.name} {r.person.surname}</span>
                          <span className="ml-auto text-[10px] uppercase tracking-wider text-gray-400 dark:text-zinc-600">Kişi</span>
                        </>
                      ) : (
                        <>
                          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gray-100 text-[10px] font-bold text-gray-500 dark:bg-zinc-800 dark:text-zinc-400">
                            T
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="truncate font-medium">{r.task.title}</p>
                            <p className="truncate text-xs text-gray-400 dark:text-zinc-500">{r.task.description}</p>
                          </div>
                          <span className="ml-2 shrink-0 rounded bg-gray-100 px-1.5 py-0.5 text-[10px] font-semibold text-gray-500 dark:bg-zinc-800 dark:text-zinc-500">
                            SP {r.task.storyPoint}
                          </span>
                        </>
                      )}
                    </button>
                  ))}
                </div>
              )}

              {/* Empty state */}
              {query.length > 0 && results.length === 0 && (
                <div className="p-8 text-center text-sm text-gray-400 dark:text-zinc-500">
                  <p>Sonuç bulunamadı.</p>
                </div>
              )}

              {/* Footer hint */}
              {query.length === 0 && (
                <div className="p-6 text-center text-xs text-gray-400 dark:text-zinc-600">
                  Kişi adı veya görev başlığı yazarak arama yapın
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

const CommandPalette = memo(CommandPaletteRaw);
export default CommandPalette;
