import { NextResponse } from "next/server";
import { unsubscribeByToken } from "../../../lib/data";

export async function GET(req) {
  const token = new URL(req.url).searchParams.get("token");

  if (!token) {
    return new NextResponse("Missing token.", { status: 400 });
  }

  await unsubscribeByToken(token);

  return new NextResponse(
    "<!doctype html><meta charset='utf-8'><body style='font-family:sans-serif;padding:40px;text-align:center;'>You've been unsubscribed. You won't receive any more emails for this profile.</body>",
    { headers: { "Content-Type": "text/html" } }
  );
}
