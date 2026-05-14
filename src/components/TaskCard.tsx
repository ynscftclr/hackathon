import { useState, memo, useCallback } from "react";
import { motion } from "framer-motion";
import type { Task, QualityScore } from "@/types";

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */
const STATUS_CFG: Record<Task["status"], { label: string; dot: string; bg: string }> = {
  todo: { label: "Bekliyor", dot: "bg-amber-400", bg: "bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400" },
  "in-progress": { label: "Devam Ediyor", dot: "bg-blue-400", bg: "bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400" },
  done: { label: "Tamamlandı", dot: "bg-emerald-400", bg: "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400" },
};

const QUALITY_SCORES: QualityScore[] = [1, 2, 3, 4, 5];

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */
interface Props {
  task: Task;
  onScoreChange: (taskId: string, score: QualityScore) => void;
}

function TaskCardRaw({ task, onScoreChange }: Props) {
  const [hoveredStar, setHoveredStar] = useState(0);
  const cfg = STATUS_CFG[task.status];

  const handleScore = useCallback(
    (s: QualityScore) => onScoreChange(task.id, s),
    [onScoreChange, task.id],
  );

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -4 }}
      whileHover={{ y: -2, boxShadow: "0 8px 30px rgba(0,0,0,0.08)" }}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
      className="group relative cursor-default rounded-2xl border border-gray-100 bg-white p-5 shadow-soft transition-colors dark:border-zinc-800 dark:bg-zinc-900"
    >
      {/* Subtle top accent line */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent-400/40 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />

      {/* Header */}
      <div className="mb-3 flex items-start justify-between gap-3">
        <h4 className="text-[13px] font-semibold leading-snug text-gray-800 dark:text-zinc-100">
          {task.title}
        </h4>
        <span className={`badge shrink-0 gap-1.5 ${cfg.bg}`}>
          <span className={`h-1.5 w-1.5 rounded-full ${cfg.dot}`} />
          {cfg.label}
        </span>
      </div>

      {/* Description */}
      <p className="mb-4 text-xs leading-relaxed text-gray-400 dark:text-zinc-500">
        {task.description}
      </p>

      {/* Footer: Story Point + Quality */}
      <div className="flex items-center justify-between">
        <motion.span
          whileTap={{ scale: 0.92 }}
          className="rounded-lg bg-accent-50 px-2.5 py-1 text-[11px] font-bold text-accent-600 dark:bg-accent-900/30 dark:text-accent-400"
        >
          {task.storyPoint} SP
        </motion.span>

        {/* Quality Score — yalnızca tamamlanan işler */}
        {task.status === "done" && (
          <div className="flex items-center gap-0.5">
            {QUALITY_SCORES.map((s) => {
              const filled = s <= (hoveredStar || task.qualityScore || 0);
              return (
                <motion.button
                  key={s}
                  type="button"
                  whileHover={{ scale: 1.25 }}
                  whileTap={{ scale: 0.9 }}
                  className={`text-base transition-colors ${filled ? "text-amber-400" : "text-gray-200 dark:text-zinc-700"}`}
                  onMouseEnter={() => setHoveredStar(s)}
                  onMouseLeave={() => setHoveredStar(0)}
                  onClick={() => handleScore(s)}
                  aria-label={`${s} puan ver`}
                >
                  ★
                </motion.button>
              );
            })}
            {task.qualityScore && (
              <span className="ml-1.5 text-[10px] font-semibold text-amber-500/80 dark:text-amber-400/70">
                {task.qualityScore}/5
              </span>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}

const TaskCard = memo(TaskCardRaw);
export default TaskCard;
