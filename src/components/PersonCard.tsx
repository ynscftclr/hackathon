import { memo, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { PersonWorkload } from "@/types";

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */
const OVERLOAD_THRESHOLD = 20;

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */
interface Props {
  workload: PersonWorkload;
  expanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}

function PersonCardRaw({ workload, expanded, onToggle, children }: Props) {
  const { person, totalEffort, completedEffort, averageQuality } = workload;
  const progress = totalEffort > 0 ? Math.round((completedEffort / totalEffort) * 100) : 0;
  const isOverloaded = totalEffort > OVERLOAD_THRESHOLD;

  const initials = useMemo(() => `${person.name[0]}${person.surname[0]}`, [person.name, person.surname]);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={`overflow-hidden rounded-2xl border bg-white shadow-soft transition-colors dark:bg-zinc-900 ${
        isOverloaded
          ? "border-red-200 dark:border-red-900/40"
          : "border-gray-100 dark:border-zinc-800"
      }`}
    >
      {/* Header */}
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center gap-4 px-6 py-5 text-left transition hover:bg-gray-50/60 dark:hover:bg-zinc-800/40"
      >
        {/* Avatar */}
        <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-[13px] font-bold ${
          isOverloaded
            ? "bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-400"
            : "bg-accent-100 text-accent-600 dark:bg-accent-900/40 dark:text-accent-400"
        }`}>
          {initials}
        </div>

        {/* Name + Overload badge */}
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-gray-800 dark:text-zinc-100">
            {person.name} {person.surname}
          </p>
          <div className="mt-0.5 flex items-center gap-2">
            <span className="text-xs text-gray-400 dark:text-zinc-500">
              {workload.tasks.length} görev
            </span>
            {isOverloaded && (
              <motion.span
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="badge gap-1 bg-red-50 text-red-500 dark:bg-red-900/30 dark:text-red-400"
              >
                <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                </svg>
                Overloaded
              </motion.span>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="hidden gap-8 sm:flex">
          <Stat label="Toplam SP" value={totalEffort} warn={isOverloaded} />
          <Stat label="Tamamlanan" value={completedEffort} />
          <Stat label="Kalite" value={averageQuality !== null ? averageQuality.toFixed(1) : "—"} />
        </div>

        {/* Progress ring */}
        <div className="hidden flex-col items-end gap-1 lg:flex">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-medium text-gray-400 dark:text-zinc-500">{progress}%</span>
            <div className="h-1.5 w-28 overflow-hidden rounded-full bg-gray-100 dark:bg-zinc-800">
              <motion.div
                className={`h-full rounded-full ${isOverloaded ? "bg-red-500" : "bg-accent-500"}`}
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.6, ease: "easeOut" }}
              />
            </div>
          </div>
        </div>

        {/* Chevron */}
        <motion.svg
          animate={{ rotate: expanded ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="h-4 w-4 shrink-0 text-gray-300 dark:text-zinc-600"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </motion.svg>
      </button>

      {/* Expandable task list */}
      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            key="content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ type: "spring", stiffness: 350, damping: 30, opacity: { duration: 0.2 } }}
            className="overflow-hidden"
          >
            <div className="grid gap-3 border-t border-gray-50 bg-gray-50/40 p-5 dark:border-zinc-800 dark:bg-zinc-950/40 sm:grid-cols-2 lg:grid-cols-3">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

const PersonCard = memo(PersonCardRaw);
export default PersonCard;

/* ------------------------------------------------------------------ */
/*  Micro‑component                                                    */
/* ------------------------------------------------------------------ */
function Stat({ label, value, warn }: { label: string; value: string | number; warn?: boolean }) {
  return (
    <div className="text-center">
      <p className={`text-sm font-bold ${warn ? "text-red-500" : "text-gray-800 dark:text-zinc-100"}`}>
        {value}
      </p>
      <p className="text-[10px] uppercase tracking-wider text-gray-400 dark:text-zinc-500">{label}</p>
    </div>
  );
}
