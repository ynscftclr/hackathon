import type { Task, PersonWorkload, Person } from "@/types";

/** Kişi bazlı toplam efor yükünü hesaplar */
export function computeWorkloads(persons: Person[], tasks: Task[]): PersonWorkload[] {
  const tasksByPerson = new Map<string, Task[]>();
  for (const task of tasks) {
    const list = tasksByPerson.get(task.assigneeId) ?? [];
    list.push(task);
    tasksByPerson.set(task.assigneeId, list);
  }

  return persons.map((person) => {
    const personTasks = tasksByPerson.get(person.id) ?? [];
    const totalEffort = personTasks.reduce((sum, t) => sum + t.storyPoint, 0);

    const doneTasks = personTasks.filter((t) => t.status === "done");
    const completedEffort = doneTasks.reduce((sum, t) => sum + t.storyPoint, 0);

    const scored = doneTasks.filter((t) => t.qualityScore !== undefined);
    const averageQuality =
      scored.length > 0
        ? scored.reduce((sum, t) => sum + t.qualityScore!, 0) / scored.length
        : null;

    return { person, tasks: personTasks, totalEffort, completedEffort, averageQuality };
  });
}
