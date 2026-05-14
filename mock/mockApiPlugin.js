/**
 * Vite Server Mock Plugin
 * ─────────────────────────
 * Dev server üzerinde gerçek HTTP endpoint'leri oluşturur.
 * Tarayıcıdan doğrudan erişilebilir:
 *   GET  http://localhost:5173/api/persons
 *   GET  http://localhost:5173/api/tasks
 *   PATCH http://localhost:5173/api/tasks/:id
 */

/** @typedef {import("vite").Plugin} VitePlugin */

/** @type {import("../src/types").Person[]} */
const persons = [
  { id: "p1", name: "Ahmet", surname: "Yılmaz" },
  { id: "p2", name: "Elif", surname: "Demir" },
  { id: "p3", name: "Mehmet", surname: "Kaya" },
  { id: "p4", name: "Zeynep", surname: "Çelik" },
  { id: "p5", name: "Can", surname: "Öztürk" },
];

/** @type {import("../src/types").Task[]} */
const tasks = [
  { id: "t1", title: "Login Sayfası Tasarımı", description: "Kullanıcı giriş ekranının UI tasarımı", assigneeId: "p1", status: "done", storyPoint: 3, qualityScore: 4 },
  { id: "t2", title: "API Entegrasyonu", description: "Backend servislerine bağlantı kurulması", assigneeId: "p1", status: "in-progress", storyPoint: 5 },
  { id: "t3", title: "Dashboard Grafikleri", description: "Yönetim paneli grafik bileşenleri", assigneeId: "p2", status: "todo", storyPoint: 8 },
  { id: "t4", title: "Bildirim Sistemi", description: "Push notification altyapısı", assigneeId: "p2", status: "done", storyPoint: 5, qualityScore: 5 },
  { id: "t5", title: "Veritabanı Optimizasyonu", description: "Sorgu performans iyileştirmesi", assigneeId: "p3", status: "in-progress", storyPoint: 8 },
  { id: "t6", title: "Unit Test Yazımı", description: "Kritik modüller için test coverage", assigneeId: "p3", status: "todo", storyPoint: 3 },
  { id: "t7", title: "Responsive Tasarım", description: "Mobil uyumluluk düzenlemeleri", assigneeId: "p4", status: "done", storyPoint: 2, qualityScore: 3 },
  { id: "t8", title: "CI/CD Pipeline", description: "Otomatik deploy sürecinin kurulması", assigneeId: "p4", status: "in-progress", storyPoint: 5 },
  { id: "t9", title: "Kullanıcı Yetkilendirme", description: "Role-based access control sistemi", assigneeId: "p5", status: "todo", storyPoint: 5 },
  { id: "t10", title: "Raporlama Modülü", description: "PDF ve Excel export özellikleri", assigneeId: "p5", status: "done", storyPoint: 3, qualityScore: 2 },
  { id: "t11", title: "Performans İyileştirme", description: "Bundle size ve lazy loading optimizasyonu", assigneeId: "p1", status: "todo", storyPoint: 2 },
  { id: "t12", title: "Tema Desteği", description: "Dark / Light mode toggle", assigneeId: "p2", status: "in-progress", storyPoint: 1 },
];

/** Body'yi parse eder */
function readBody(req) {
  return new Promise((resolve) => {
    let body = "";
    req.on("data", (chunk) => (body += chunk));
    req.on("end", () => {
      try { resolve(JSON.parse(body)); }
      catch { resolve({}); }
    });
  });
}

/** JSON response helper */
function json(res, status, data) {
  res.writeHead(status, { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" });
  res.end(JSON.stringify(data, null, 2));
}

/** @returns {VitePlugin} */
export default function mockApiPlugin() {
  return {
    name: "mock-api",
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const url = req.url ?? "";

        // ── CORS preflight ──
        if (req.method === "OPTIONS" && url.startsWith("/api/")) {
          res.writeHead(204, {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, PATCH, POST, PUT, DELETE, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type",
          });
          return res.end();
        }

        // ── GET /api/persons ──
        if (req.method === "GET" && url === "/api/persons") {
          return json(res, 200, persons);
        }

        // ── GET /api/tasks ──
        if (req.method === "GET" && url === "/api/tasks") {
          return json(res, 200, tasks);
        }

        // ── PATCH /api/tasks/:id ──
        const patchMatch = url.match(/^\/api\/tasks\/(\w+)$/);
        if (req.method === "PATCH" && patchMatch) {
          const id = patchMatch[1];
          const task = tasks.find((t) => t.id === id);
          if (!task) return json(res, 404, { message: "Task not found" });

          const body = await readBody(req);
          if (body.qualityScore !== undefined) task.qualityScore = body.qualityScore;
          if (body.status !== undefined) task.status = body.status;
          return json(res, 200, { ...task });
        }

        next();
      });
    },
  };
}
