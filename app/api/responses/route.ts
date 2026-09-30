import { NextResponse } from "next/server";
import { ensureDatabase, getPool } from "../../../lib/db";
import { currentAdmin } from "../../../lib/auth";
import { validateAnswers } from "../../../lib/survey";

const headers = { "Cache-Control": "no-store" };

function surveyCookie(request: Request): string | undefined {
  return request.headers.get("cookie")?.split(";").map((item) => item.trim()).find((item) => item.startsWith("survey_csrf="))?.slice("survey_csrf=".length);
}

export async function POST(request: Request) {
  const token = request.headers.get("x-survey-token");
  const cookie = surveyCookie(request);
  if (!token || token !== cookie || request.headers.get("sec-fetch-site") === "cross-site") {
    return NextResponse.json({ error: "会话已失效，请重新提交。" }, { status: 403, headers });
  }

  try {
    const text = await request.text();
    if (text.length > 60_000) throw new Error("validation");
    const body = JSON.parse(text) as { id?: unknown; answers?: unknown; consent?: unknown };
    if (typeof body.id !== "string" || !/^[0-9a-f-]{36}$/i.test(body.id) || body.consent !== true) throw new Error("validation");
    const answers = validateAnswers(body.answers);
    await ensureDatabase();
    await getPool().query(
      `INSERT INTO responses (id, created_at, answers, version)
       VALUES ($1, NOW(), $2::jsonb, 1)
       ON CONFLICT (id) DO NOTHING`,
      [body.id, JSON.stringify(answers)],
    );
    return NextResponse.json({ id: body.id }, { status: 201, headers });
  } catch (error) {
    if (error instanceof SyntaxError || error instanceof Error && error.message === "validation") {
      return NextResponse.json({ error: "请检查必填项和数字格式后重试。" }, { status: 400, headers });
    }
    console.error("Response save failed", error);
    return NextResponse.json({ error: "暂时无法保存，您填写的内容仍在当前页面，请稍后重试。" }, { status: 503, headers });
  }
}

export async function GET(request: Request) {
  if (!await currentAdmin()) return NextResponse.json({ error: "无权查看答卷" }, { status: 403, headers });
  try {
    await ensureDatabase();
    const url = new URL(request.url);
    const offset = Math.max(0, Math.min(1_000_000, Math.floor(Number(url.searchParams.get("offset")) || 0)));
    const database = getPool();
    const result = await database.query(
      `SELECT id, created_at, answers::text AS answers
       FROM responses ORDER BY created_at DESC LIMIT 100 OFFSET $1`,
      [offset],
    );
    const count = await database.query<{ total: number }>("SELECT COUNT(*)::int AS total FROM responses");
    return NextResponse.json({
      rows: result.rows.map((row) => ({ ...row, created_at: new Date(row.created_at).getTime() })),
      total: count.rows[0]?.total ?? 0,
    }, { headers });
  } catch (error) {
    console.error("Response list failed", error);
    return NextResponse.json({ error: "暂时无法读取答卷，请稍后重试。" }, { status: 503, headers });
  }
}
