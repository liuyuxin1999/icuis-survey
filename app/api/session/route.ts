import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { isSecureRequest } from "../../../lib/auth";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const token = randomUUID();
  const response = NextResponse.json({ token }, { headers: { "Cache-Control": "no-store" } });
  response.cookies.set("survey_csrf", token, {
    httpOnly: true,
    sameSite: "strict",
    secure: isSecureRequest(request),
    path: "/",
    maxAge: 600,
  });
  return response;
}
