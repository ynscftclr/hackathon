import { memo, useCallback, useState } from "react";
import { motion } from "framer-motion";
import type { Task, QualityScore, Person } from "@/types";

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */
const QUALITY_SCORES: QualityScore[] = [1, 2, 3, 4, 5];

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */
interface Props {
  task: Task;
  person: Person | undefined;
  onScoreChange: (taskId: string, score: QualityScore) => void;
  onDragStart: (taskId: string) => void;
}

function BoardTaskCardRaw({ task, person, onScoreChange, onDragStart }: Props) {
  const [hoveredStar, setHoveredStar] = useState(0);

  const handleScore = useCallback(
    (s: QualityScore) => onScoreChange(task.id, s),
    [onScoreChange, task.id],
  );

  return (
    <motion.div
      layout
      layoutId={task.id}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -1 }}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
      draggable
      onDragStart={() => onDragStart(task.id)}
      className="group cursor-grab rounded-xl border border-gray-100 bg-white p-4 shadow-soft transition-colors active:cursor-grabbing dark:border-zinc-800 dark:bg-zinc-900"
    >
      {/* Title */}
      <h4 className="mb-1.5 text-[13px] font-semibold leading-snug text-gray-800 dark:text-zinc-100">
        {task.title}
      </h4>

      {/* Description */}
      <p className="mb-3 line-clamp-2 text-[11px] leading-relaxed text-gray-400 dark:text-zinc-500">
        {task.description}
      </p>

      {/* Footer */}
      <div className="flex items-center justify-between">
        {/* SP badge */}
        <span className="rounded-md bg-accent-50 px-2 py-0.5 text-[10px] font-bold text-accent-600 dark:bg-accent-900/30 dark:text-accent-400">
          {task.storyPoint} SP
        </span>

        {/* Assignee avatar */}
        {person && (
          <div
            className="flex h-6 w-6 items-center justify-center rounded-full bg-accent-100 text-[9px] font-bold text-accent-600 dark:bg-accent-900/40 dark:text-accent-400"
            title={`${person.name} ${person.surname}`}
          >
            {person.name[0]}{person.surname[0]}
          </div>
        )}
      </div>

      {/* Quality Score — yalnızca done */}
      {task.status === "done" && (
        <div className="mt-3 flex items-center gap-0.5 border-t border-gray-50 pt-3 dark:border-zinc-800">
          <span className="mr-1 text-[10px] text-gray-400 dark:text-zinc-500">Kalite:</span>
          {QUALITY_SCORES.map((s) => {
            const filled = s <= (hoveredStar || task.qualityScore || 0);
            return (
              <motion.button
                key={s}
                type="button"
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.9 }}
                className={`text-sm transition-colors ${filled ? "text-amber-400" : "text-gray-200 dark:text-zinc-700"}`}
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
            <span className="ml-1 text-[9px] font-semibold text-amber-500/80 dark:text-amber-400/70">
              {task.qualityScore}/5
            </span>
          )}
        </div>
      )}
    </motion.div>
  );
}

const BoardTaskCard = memo(BoardTaskCardRaw);
export default BoardTaskCard;
