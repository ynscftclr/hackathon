import { useEffect, useState, useCallback, useMemo } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { fetchPersons, fetchTasks, updateTask } from "@/services/api";
import { computeWorkloads } from "@/utils/effort";
import PersonCard from "@/components/PersonCard";
import TaskCard from "@/components/TaskCard";
import KanbanBoard from "@/components/KanbanBoard";
import DashboardSkeleton from "@/components/Skeleton";
import CommandPalette from "@/components/CommandPalette";
import ThemeToggle from "@/components/ThemeToggle";
import type { Person, Task, QualityScore, PersonWorkload, TaskStatus } from "@/types";

/* ------------------------------------------------------------------ */
/*  Filter options                                                     */
/* ------------------------------------------------------------------ */
const FILTERS: { key: "all" | TaskStatus; label: string }[] = [
  { key: "all", label: "Tümü" },
  { key: "todo", label: "Bekliyor" },
  { key: "in-progress", label: "Devam Ediyor" },
  { key: "done", label: "Tamamlandı" },
];

type ViewMode = "board" | "overview";

/* ------------------------------------------------------------------ */
/*  Dashboard                                                          */
/* ------------------------------------------------------------------ */
export default function Dashboard() {
  const { user, logout } = useAuth();

  const [persons, setPersons] = useState<Person[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | TaskStatus>("all");
  const [view, setView] = useState<ViewMode>("board");

  /* ── Data fetching ── */
  useEffect(() => {
    Promise.all([fetchPersons(), fetchTasks()])
      .then(([p, t]) => {
        setPersons(p);
        setTasks(t);
      })
      .finally(() => setLoading(false));
  }, []);

  /* ── Quality score güncelle ── */
  const handleScoreChange = useCallback(async (taskId: string, score: QualityScore) => {
    const updated = await updateTask(taskId, { qualityScore: score });
    setTasks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
  }, []);

  /* ── Status change (drag-and-drop) ── */
  const handleStatusChange = useCallback(async (taskId: string, newStatus: TaskStatus) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t)),
    );
    await updateTask(taskId, { status: newStatus });
  }, []);

  /* ── Command palette: task seçildiğinde kişi kartını aç ── */
  const handleSelectTask = useCallback(
    (taskId: string) => {
      const task = tasks.find((t) => t.id === taskId);
      if (task) {
        setView("overview");
        setExpandedId(task.assigneeId);
      }
    },
    [tasks],
  );

  /* ── Filtreleme & workload hesaplama ── */
  const filteredTasks = useMemo(
    () => (filter === "all" ? tasks : tasks.filter((t) => t.status === filter)),
    [tasks, filter],
  );
  const workloads: PersonWorkload[] = useMemo(
    () => computeWorkloads(persons, filteredTasks),
    [persons, filteredTasks],
  );

  /* ── Toplam istatistikler (tüm task'lar üzerinden) ── */
  const stats = useMemo(() => {
    const totalSP = tasks.reduce((s, t) => s + t.storyPoint, 0);
    const doneSP = tasks.filter((t) => t.status === "done").reduce((s, t) => s + t.storyPoint, 0);
    const inProgressCount = tasks.filter((t) => t.status === "in-progress").length;
    return { totalSP, doneSP, inProgressCount };
  }, [tasks]);

  /* ── Skeleton while loading ── */
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-zinc-950">
        <SkeletonNavbar />
        <DashboardSkeleton />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 transition-colors duration-300 dark:bg-zinc-950">
      {/* ── Command Palette ── */}
      <CommandPalette persons={persons} tasks={tasks} onSelectTask={handleSelectTask} />

      {/* ── Navbar ── */}
      <header className="sticky top-0 z-30 border-b border-gray-100 bg-white/70 backdrop-blur-xl dark:border-zinc-800/60 dark:bg-zinc-950/70">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3">
          <div className="flex items-center gap-3">
            <h1 className="text-lg font-extrabold tracking-tight text-accent-600 dark:text-accent-400">
              WorkBoard
            </h1>
            <span className="hidden text-[10px] font-medium uppercase tracking-widest text-gray-300 dark:text-zinc-700 sm:inline">
              İş Yönetimi
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* View Toggle */}
            <div className="flex rounded-xl border border-gray-100 bg-gray-50 p-0.5 dark:border-zinc-800 dark:bg-zinc-900">
              <ViewToggleBtn active={view === "board"} onClick={() => setView("board")} label="Board">
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 4.5v15m6-15v15m-10.875 0h15.75c.621 0 1.125-.504 1.125-1.125V5.625c0-.621-.504-1.125-1.125-1.125H4.125C3.504 4.5 3 5.004 3 5.625v12.75c0 .621.504 1.125 1.125 1.125z" />
                </svg>
              </ViewToggleBtn>
              <ViewToggleBtn active={view === "overview"} onClick={() => setView("overview")} label="Overview">
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                </svg>
              </ViewToggleBtn>
            </div>

            {/* Search hint */}
            <button
              onClick={() => window.dispatchEvent(new KeyboardEvent("keydown", { key: "k", ctrlKey: true }))}
              className="hidden items-center gap-2 rounded-xl border border-gray-100 bg-gray-50 px-3 py-1.5 text-xs text-gray-400 transition hover:border-gray-200 hover:text-gray-500 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-500 dark:hover:border-zinc-700 sm:flex"
            >
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              Ara…
              <kbd className="rounded border border-gray-200 bg-white px-1 py-0.5 text-[10px] font-medium dark:border-zinc-700 dark:bg-zinc-800">
                ⌘K
              </kbd>
            </button>

            <ThemeToggle />

            <div className="h-5 w-px bg-gray-100 dark:bg-zinc-800" />

            <span className="text-xs text-gray-400 dark:text-zinc-500">
              {user?.displayName}
            </span>
            <button
              onClick={logout}
              className="rounded-xl bg-gray-100 px-3 py-1.5 text-[11px] font-medium text-gray-500 transition hover:bg-red-50 hover:text-red-600 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-red-900/30 dark:hover:text-red-400"
            >
              Çıkış
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-8">
        {/* ── Stat Cards ── */}
        <section className="mb-8 grid gap-4 sm:grid-cols-3">
          <StatCard label="Toplam Story Point" value={stats.totalSP} variant="accent" delay={0} />
          <StatCard label="Tamamlanan SP" value={stats.doneSP} variant="emerald" delay={0.05} />
          <StatCard label="Devam Eden Görev" value={stats.inProgressCount} variant="blue" delay={0.1} />
        </section>

        {/* ══════════════ BOARD VIEW ══════════════ */}
        {view === "board" && (
          <KanbanBoard
            tasks={tasks}
            persons={persons}
            onStatusChange={handleStatusChange}
            onScoreChange={handleScoreChange}
          />
        )}

        {/* ══════════════ OVERVIEW VIEW ══════════════ */}
        {view === "overview" && (
          <>
            {/* Filter Pills */}
            <div className="mb-6 flex flex-wrap gap-2">
              {FILTERS.map((f) => (
                <button
                  key={f.key}
                  onClick={() => setFilter(f.key)}
                  className={`rounded-full px-4 py-1.5 text-xs font-medium transition ${
                    filter === f.key
                      ? "bg-accent-600 text-white shadow-sm dark:bg-accent-500"
                      : "bg-white text-gray-500 shadow-soft hover:bg-gray-50 dark:bg-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {/* Person Workloads */}
            <section className="space-y-4">
              {workloads.map((wl) => (
                <PersonCard
                  key={wl.person.id}
                  workload={wl}
                  expanded={expandedId === wl.person.id}
                  onToggle={() => setExpandedId((prev) => (prev === wl.person.id ? null : wl.person.id))}
                >
                  {wl.tasks.length === 0 ? (
                    <EmptyState />
                  ) : (
                    wl.tasks.map((task) => (
                      <TaskCard key={task.id} task={task} onScoreChange={handleScoreChange} />
                    ))
                  )}
                </PersonCard>
              ))}
            </section>
          </>
        )}
      </main>
    </div>
  );
}

/* ================================================================== */
/*  Sub‑components                                                     */
/* ================================================================== */

/* ── View Toggle Button ── */
function ViewToggleBtn({
  active,
  onClick,
  label,
  children,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[11px] font-medium transition ${
        active
          ? "bg-white text-gray-800 shadow-soft dark:bg-zinc-800 dark:text-zinc-100"
          : "text-gray-400 hover:text-gray-600 dark:text-zinc-500 dark:hover:text-zinc-300"
      }`}
    >
      {children}
      <span className="hidden sm:inline">{label}</span>
    </button>
  );
}

/* ── Stat Card ── */
const VARIANT_MAP: Record<string, string> = {
  accent: "from-accent-500 to-accent-600",
  emerald: "from-emerald-500 to-emerald-600",
  blue: "from-blue-500 to-blue-600",
};

function StatCard({ label, value, variant, delay }: { label: string; value: number; variant: string; delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, type: "spring", stiffness: 400, damping: 30 }}
      className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${VARIANT_MAP[variant]} p-6 text-white shadow-elevated`}
    >
      <div className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-white/10" />
      <p className="relative text-3xl font-extrabold tracking-tight">{value}</p>
      <p className="relative mt-1 text-[11px] font-medium uppercase tracking-widest opacity-75">{label}</p>
    </motion.div>
  );
}

/* ── Empty state ── */
function EmptyState() {
  return (
    <div className="col-span-full flex flex-col items-center justify-center py-8 text-center">
      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-gray-100 dark:bg-zinc-800">
        <svg className="h-5 w-5 text-gray-400 dark:text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5m6 4.125l2.25 2.25m0 0l2.25 2.25M12 13.875l2.25-2.25M12 13.875l-2.25 2.25M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
        </svg>
      </div>
      <p className="text-sm text-gray-400 dark:text-zinc-500">Bu filtrede görev yok.</p>
    </div>
  );
}

/* ── Skeleton navbar ── */
function SkeletonNavbar() {
  return (
    <header className="sticky top-0 z-30 border-b border-gray-100 bg-white/70 backdrop-blur-xl dark:border-zinc-800/60 dark:bg-zinc-950/70">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3">
        <div className="skeleton h-5 w-28" />
        <div className="flex items-center gap-3">
          <div className="skeleton h-8 w-48 !rounded-xl" />
          <div className="skeleton h-8 w-8 !rounded-xl" />
        </div>
      </div>
    </header>
  );
}
