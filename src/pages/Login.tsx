import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    const ok = login(username, password);
    if (ok) {
      navigate("/", { replace: true });
    } else {
      setError("Geçersiz kullanıcı adı. En az 2 karakter giriniz.");
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-zinc-950">
      {/* Animated gradient blobs */}
      <div className="pointer-events-none absolute -left-40 -top-40 h-[500px] w-[500px] animate-pulse rounded-full bg-accent-600/20 blur-[120px]" />
      <div className="pointer-events-none absolute -bottom-40 -right-40 h-[500px] w-[500px] animate-pulse rounded-full bg-purple-600/20 blur-[120px] [animation-delay:1s]" />

      <motion.form
        onSubmit={handleSubmit}
        initial={{ opacity: 0, y: 20, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
        className="relative z-10 w-full max-w-md rounded-3xl border border-white/10 bg-white/[0.06] p-10 shadow-glass backdrop-blur-2xl"
      >
        {/* Logo */}
        <div className="mb-2 flex items-center justify-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent-600">
            <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
            </svg>
          </div>
        </div>

        <h1 className="mb-1 text-center text-2xl font-extrabold text-white">WorkBoard</h1>
        <p className="mb-8 text-center text-sm text-zinc-400">İş yönetim platformuna giriş yapın</p>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-5 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-2.5 text-sm text-red-400"
          >
            {error}
          </motion.div>
        )}

        <label className="mb-1.5 block text-xs font-medium text-zinc-400">Kullanıcı Adı</label>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="mb-5 w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-accent-500/50 focus:ring-2 focus:ring-accent-500/20"
          placeholder="örn. ahmet.yilmaz"
          autoFocus
        />

        <label className="mb-1.5 block text-xs font-medium text-zinc-400">Şifre</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mb-7 w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-accent-500/50 focus:ring-2 focus:ring-accent-500/20"
          placeholder="••••••••"
        />

        <motion.button
          type="submit"
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
          className="w-full rounded-xl bg-accent-600 py-3 text-sm font-semibold text-white shadow-glow transition hover:bg-accent-500"
        >
          Giriş Yap
        </motion.button>

        <p className="mt-6 text-center text-[11px] text-zinc-600">
          Demo — herhangi bir kullanıcı adı ile giriş yapabilirsiniz
        </p>
      </motion.form>
    </div>
  );
}
