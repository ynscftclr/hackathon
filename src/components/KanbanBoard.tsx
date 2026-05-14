import { useState, useCallback, useMemo, memo } from "react";
import { AnimatePresence } from "framer-motion";
import BoardTaskCard from "@/components/BoardTaskCard";
import type { Task, Person, QualityScore, TaskStatus } from "@/types";

/* ------------------------------------------------------------------ */
/*  Column config                                                      */
/* ------------------------------------------------------------------ */
interface ColumnDef {
  status: TaskStatus;
  title: string;
  dot: string;
  dropBg: string;
  headerBg: string;
}

const COLUMNS: ColumnDef[] = [
  {
    status: "todo",
    title: "Bekliyor",
    dot: "bg-amber-400",
    dropBg: "border-amber-300 bg-amber-50/40 dark:border-amber-700/40 dark:bg-amber-950/20",
    headerBg: "text-amber-600 dark:text-amber-400",
  },
  {
    status: "in-progress",
    title: "Devam Ediyor",
    dot: "bg-blue-400",
    dropBg: "border-blue-300 bg-blue-50/40 dark:border-blue-700/40 dark:bg-blue-950/20",
    headerBg: "text-blue-600 dark:text-blue-400",
  },
  {
    status: "done",
    title: "Tamamlandı",
    dot: "bg-emerald-400",
    dropBg: "border-emerald-300 bg-emerald-50/40 dark:border-emerald-700/40 dark:bg-emerald-950/20",
    headerBg: "text-emerald-600 dark:text-emerald-400",
  },
];

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */
interface Props {
  tasks: Task[];
  persons: Person[];
  onStatusChange: (taskId: string, newStatus: TaskStatus) => void;
  onScoreChange: (taskId: string, score: QualityScore) => void;
}

function KanbanBoardRaw({ tasks, persons, onStatusChange, onScoreChange }: Props) {
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [hoverCol, setHoverCol] = useState<TaskStatus | null>(null);

  const personMap = useMemo(() => {
    const m = new Map<string, Person>();
    for (const p of persons) m.set(p.id, p);
    return m;
  }, [persons]);

  const tasksByStatus = useMemo(() => {
    const map: Record<TaskStatus, Task[]> = { todo: [], "in-progress": [], done: [] };
    for (const t of tasks) map[t.status].push(t);
    return map;
  }, [tasks]);

  const handleDragStart = useCallback((taskId: string) => {
    setDraggingId(taskId);
  }, []);

  const handleDragOver = useCallback(
    (e: React.DragEvent, status: TaskStatus) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = "move";
      if (hoverCol !== status) setHoverCol(status);
    },
    [hoverCol],
  );

  const handleDragLeave = useCallback(() => {
    setHoverCol(null);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent, targetStatus: TaskStatus) => {
      e.preventDefault();
      setHoverCol(null);
      if (draggingId) {
        const task = tasks.find((t) => t.id === draggingId);
        if (task && task.status !== targetStatus) {
          onStatusChange(draggingId, targetStatus);
        }
      }
      setDraggingId(null);
    },
    [draggingId, tasks, onStatusChange],
  );

  const handleDragEnd = useCallback(() => {
    setDraggingId(null);
    setHoverCol(null);
  }, []);

  return (
    <div
      className="grid min-h-[60vh] gap-5 lg:grid-cols-3"
      onDragEnd={handleDragEnd}
    >
      {COLUMNS.map((col) => {
        const colTasks = tasksByStatus[col.status];
        const isHover = hoverCol === col.status;
        const totalSP = colTasks.reduce((s, t) => s + t.storyPoint, 0);

        return (
          <div
            key={col.status}
            onDragOver={(e) => handleDragOver(e, col.status)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, col.status)}
            className={`flex flex-col rounded-2xl border-2 border-dashed transition-colors duration-200 ${
              isHover
                ? col.dropBg
                : "border-transparent bg-gray-50/50 dark:bg-zinc-900/30"
            }`}
          >
            {/* Column header */}
            <div className="flex items-center justify-between px-4 pb-3 pt-4">
              <div className="flex items-center gap-2.5">
                <span className={`h-2.5 w-2.5 rounded-full ${col.dot}`} />
                <h3 className={`text-sm font-bold ${col.headerBg}`}>{col.title}</h3>
                <span className="rounded-md bg-gray-100 px-1.5 py-0.5 text-[10px] font-semibold text-gray-500 dark:bg-zinc-800 dark:text-zinc-400">
                  {colTasks.length}
                </span>
              </div>
              <span className="text-[10px] font-medium text-gray-400 dark:text-zinc-500">
                {totalSP} SP
              </span>
            </div>

            {/* Task cards */}
            <div className="custom-scrollbar flex flex-1 flex-col gap-2.5 overflow-y-auto px-3 pb-4">
              <AnimatePresence mode="popLayout">
                {colTasks.map((task) => (
                  <BoardTaskCard
                    key={task.id}
                    task={task}
                    person={personMap.get(task.assigneeId)}
                    onScoreChange={onScoreChange}
                    onDragStart={handleDragStart}
                  />
                ))}
              </AnimatePresence>

              {colTasks.length === 0 && (
                <div className="flex flex-1 items-center justify-center rounded-xl border border-dashed border-gray-200 py-12 dark:border-zinc-800">
                  <p className="text-xs text-gray-400 dark:text-zinc-600">
                    Sürükle & bırak ile görev ekle
                  </p>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

const KanbanBoard = memo(KanbanBoardRaw);
export default KanbanBoard;
