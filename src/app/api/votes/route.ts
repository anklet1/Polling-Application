import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

export async function POST(request: Request) {
  if (!supabaseUrl || !supabaseAnonKey) {
    return NextResponse.json(
      { error: "Supabase env vars not configured" },
      { status: 500 }
    );
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey);
  const authHeader = request.headers.get("authorization") || request.headers.get("Authorization");
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : undefined;
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: userData, error: userError } = await supabase.auth.getUser(token);
  if (userError || !userData?.user) {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const poll_id = String(body?.poll_id || "");
  const option_index = Number(body?.option_index);
  if (!poll_id || Number.isNaN(option_index)) {
    return NextResponse.json({ error: "Missing poll_id or option_index" }, { status: 400 });
  }

  // Enforce one vote per user via upsert-like behavior
  // Rely on db unique index; catch conflict
  const { error } = await supabase.from("votes").insert([
    {
      poll_id,
      option_index,
      voter_id: userData.user.id,
    },
  ]);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true }, { status: 201 });
}



