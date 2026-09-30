"use client";

import { useEffect, useState } from "react";
import { Download, LogOut, RefreshCw } from "lucide-react";
import { sections, type Answers } from "../questions";

type Row = { id: string; created_at: number; answers: string };

function displayAnswer(value: string | string[] | undefined): string {
  return Array.isArray(value) ? value.join("、") : value ?? "";
}

export default function AdminResponses({ username }: { username: string }) {
  const [rows, setRows] = useState<Row[]>([]);
  const [total, setTotal] = useState(0);
  const [offset, setOffset] = useState(0);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [selected, setSelected] = useState<Row | null>(null);

  async function load(nextOffset = offset) {
    setBusy(true);
    setError("");
    try {
      const response = await fetch(`/api/responses?offset=${nextOffset}`, { cache: "no-store" });
      const data = await response.json() as { rows: Row[]; total: number; error?: string };
      if (!response.ok) throw new Error(data.error ?? "读取失败");
      setRows(data.rows);
      setTotal(data.total);
      setOffset(nextOffset);
      setSelected(null);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "读取失败");
    } finally {
      setBusy(false);
    }
  }

  useEffect(() => { void load(0); }, []);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.assign("/admin");
  }

  async function download() {
    setBusy(true);
    setError("");
    try {
      const all: Row[] = [];
      let next = 0;
      while (true) {
        const response = await fetch(`/api/responses?offset=${next}`, { cache: "no-store" });
        const data = await response.json() as { rows: Row[]; total: number; error?: string };
        if (!response.ok) throw new Error(data.error ?? "导出失败");
        all.push(...data.rows);
        next += data.rows.length;
        if (next >= data.total || !data.rows.length) break;
      }
      const questions = sections.flatMap((section) => section.questions);
      const cell = (value: unknown) => {
        let text = String(value ?? "");
        if (/^[\s]*[=+@-]/.test(text)) text = `'${text}`;
        return `"${text.replaceAll('"', '""')}"`;
      };
      const csv = [
        ["编号", "提交时间", ...questions.map((question) => question.label)],
        ...all.map((row) => {
          const answers: Answers = JSON.parse(row.answers);
          return [row.id, new Date(row.created_at).toLocaleString("zh-CN", { timeZone: "Asia/Shanghai" }), ...questions.map((question) => displayAnswer(answers[question.id]).replaceAll("、", "；"))];
        }),
      ].map((row) => row.map(cell).join(",")).join("\r\n");
      const url = URL.createObjectURL(new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8" }));
      const link = document.createElement("a");
      link.href = url;
      link.download = "重症护理调研答卷.csv";
      link.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "导出失败");
    } finally {
      setBusy(false);
    }
  }

  const selectedAnswers: Answers = selected ? JSON.parse(selected.answers) : {};
  return <main className="admin-shell">
    <div className="admin-header">
      <div><div className="eyebrow">NURSING INSIGHTS</div><h1>护理调研 · 答卷管理</h1><p className="muted">共收到 {total} 份答卷 · 当前账号 {username}</p></div>
      <div className="admin-actions"><a className="secondary" href="/">查看问卷</a><button className="secondary" onClick={() => void load()} disabled={busy}><RefreshCw size={16} />刷新</button><button className="primary" onClick={() => void download()} disabled={busy || total === 0}><Download size={16} />导出全部答卷</button><button className="secondary" onClick={() => void logout()} disabled={busy}><LogOut size={16} />退出登录</button></div>
    </div>
    {error && <p className="error" role="alert">{error}</p>}
    <div className="admin-grid">
      <section className="card response-list">
        {busy && <p role="status">正在读取…</p>}
        {!busy && !rows.length && !error && <div className="empty"><h2>等待第一份回答</h2><p>将问卷首页链接发给护士长，提交的答案会出现在这里。</p></div>}
        {rows.map((row) => { const summary: Answers = JSON.parse(row.answers); return <button key={row.id} className={`response-row ${selected?.id === row.id ? "chosen" : ""}`} onClick={() => setSelected(row)}><strong>{summary.hospital || "未填写医院"}</strong><span>{summary.department} · {summary.role}</span><small>{new Date(row.created_at).toLocaleString("zh-CN", { timeZone: "Asia/Shanghai" })}</small></button>; })}
        <div className="pagination"><button className="secondary" disabled={offset === 0 || busy} onClick={() => void load(offset - 100)}>上一页</button><button className="secondary" disabled={offset + 100 >= total || busy} onClick={() => void load(offset + 100)}>下一页</button></div>
      </section>
      <section className="card response-detail">
        {selected ? <><div className="eyebrow">答卷 {selected.id.slice(0, 8).toUpperCase()}</div>{sections.map((section) => <section key={section.title}><h2>{section.title}</h2>{section.questions.map((question) => <div className="answer" key={question.id}><h3>{question.label}</h3><p>{displayAnswer(selectedAnswers[question.id]) || "未填写"}{selectedAnswers[question.id] && question.unit ? ` ${question.unit}` : ""}</p></div>)}</section>)}</> : <div className="empty"><h2>选择一份答卷</h2><p>在左侧查看提交记录，并阅读完整回答。</p></div>}
      </section>
    </div>
  </main>;
}
