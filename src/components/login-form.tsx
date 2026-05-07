"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { LogIn } from "lucide-react";

export function LoginForm() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password })
    });
    const payload = (await response.json().catch(() => ({}))) as { error?: string };

    if (!response.ok) {
      setError(payload.error || "Usuário ou senha inválidos.");
      setIsSubmitting(false);
      return;
    }

    router.replace("/dashboard");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="mt-8 space-y-5">
      <label className="block text-sm font-medium text-gi-ink">
        Usuário
        <input
          value={username}
          onChange={(event) => setUsername(event.target.value)}
          className="gi-input"
          autoComplete="username"
          required
        />
      </label>

      <label className="block text-sm font-medium text-gi-ink">
        Senha
        <input
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className="gi-input"
          autoComplete="current-password"
          required
        />
      </label>

      {error ? (
        <p className="rounded-md border border-rose-200 bg-rose-50 p-3 text-sm leading-6 text-rose-700">
          {error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={isSubmitting}
        className="gi-button-primary h-11 w-full"
      >
        <LogIn className="h-4 w-4" aria-hidden={true} />
        {isSubmitting ? "Entrando" : "Entrar"}
      </button>
    </form>
  );
}
