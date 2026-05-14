import axios from "axios";
import type { Person, Task } from "@/types";

/* ------------------------------------------------------------------ */
/*  Axios Instance                                                     */
/*                                                                     */
/*  Dev ortamında Vite dev server mock endpoint'leri kullanır.          */
/*  Production'da baseURL'i gerçek backend adresine çevirin.            */
/*                                                                     */
/*  Endpoint'ler (tarayıcıdan doğrudan erişilebilir):                  */
/*    GET  /api/persons          → Person[]                            */
/*    GET  /api/tasks            → Task[]                              */
/*    PATCH /api/tasks/:id       → Task (partial update)               */
/* ------------------------------------------------------------------ */
const api = axios.create({
  baseURL: "/api",
  headers: { "Content-Type": "application/json" },
  timeout: 10000,
});

/* ------------------------------------------------------------------ */
/*  Service Functions                                                  */
/* ------------------------------------------------------------------ */
export async function fetchPersons(): Promise<Person[]> {
  const { data } = await api.get<Person[]>("/persons");
  return data;
}

export async function fetchTasks(): Promise<Task[]> {
  const { data } = await api.get<Task[]>("/tasks");
  return data;
}

export async function updateTask(id: string, payload: Partial<Task>): Promise<Task> {
  const { data } = await api.patch<Task>(`/tasks/${id}`, payload);
  return data;
}

export default api;
