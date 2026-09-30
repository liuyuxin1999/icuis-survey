"use client";

import { FormEvent, useState } from "react";
import { LockKeyhole, LogIn } from "lucide-react";

export default function Login() {
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("admin123");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await response.json() as { error?: string };
      if (!response.ok) throw new Error(data.error ?? "登录失败，请稍后重试。");
      window.location.assign("/admin");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "登录失败，请稍后重试。");
    } finally {
      setBusy(false);
    }
  }

  return <main className="login-card card">
    <div className="eyebrow">NURSING INSIGHTS</div>
    <h1><LockKeyhole size={24} /> 答卷管理登录</h1>
    <p>登录后可以查看答卷并导出 CSV。填写问卷不需要登录。</p>
    <form className="login-form" onSubmit={submit}>
      <label>管理员账号<input autoComplete="username" value={username} onChange={(event) => setUsername(event.target.value)} /></label>
      <label>管理员密码<input type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} /></label>
      {error && <div className="error" role="alert">{error}</div>}
      <button className="primary" type="submit" disabled={busy}><LogIn size={17} />{busy ? "正在登录…" : "登录后台"}</button>
    </form>
    <a className="back-link" href="/">返回问卷</a>
  </main>;
}
