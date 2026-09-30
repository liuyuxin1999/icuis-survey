import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { ensureDatabase, getPool } from "../../../../lib/db";
import { createAdminSession, isSecureRequest, sessionCookieName, sessionCookieOptions } from "../../../../lib/auth";

export async function POST(request: Request) {
  try {
    const body = await request.json() as { username?: unknown; password?: unknown };
    const username = typeof body.username === "string" ? body.username.trim() : "";
    const password = typeof body.password === "string" ? body.password : "";
    if (!username || !password || username.length > 100 || password.length > 200) {
      return NextResponse.json({ error: "请输入账号和密码。" }, { status: 400 });
    }

    await ensureDatabase();
    const result = await getPool().query<{ password_hash: string }>(
      "SELECT password_hash FROM admin_users WHERE username = $1",
      [username],
    );
    const valid = result.rows[0] ? await bcrypt.compare(password, result.rows[0].password_hash) : false;
    if (!valid) return NextResponse.json({ error: "账号或密码错误。" }, { status: 401 });

    const response = NextResponse.json({ ok: true });
    response.cookies.set(sessionCookieName(), createAdminSession(username), sessionCookieOptions(isSecureRequest(request)));
    return response;
  } catch (error) {
    console.error("Admin login failed", error);
    return NextResponse.json({ error: "登录服务暂时不可用。" }, { status: 503 });
  }
}
