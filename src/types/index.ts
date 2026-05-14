/* ------------------------------------------------------------------ */
/*  Domain Types — Single Source of Truth                              */
/* ------------------------------------------------------------------ */

/** Backend /api/persons şemasına birebir uyumlu */
export interface Person {
  id: string;
  name: string;
  surname: string;
  avatarUrl?: string;
}

/** Story‑point değerleri — Fibonacci subset */
export type StoryPoint = 1 | 2 | 3 | 5 | 8;

/** İş durumları */
export type TaskStatus = "todo" | "in-progress" | "done";

/** Quality score (tamamlanan işler için 1–5) */
export type QualityScore = 1 | 2 | 3 | 4 | 5;

/** Bir iş/görev kaydı */
export interface Task {
  id: string;
  title: string;
  description: string;
  assigneeId: string;
  status: TaskStatus;
  storyPoint: StoryPoint;
  qualityScore?: QualityScore;
}

/** Kişi bazlı yük özeti */
export interface PersonWorkload {
  person: Person;
  tasks: Task[];
  totalEffort: number;
  completedEffort: number;
  averageQuality: number | null;
}

/** Auth kullanıcı modeli */
export interface User {
  username: string;
  displayName: string;
}

/** API yanıt sarmalayıcısı — generic */
export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}
