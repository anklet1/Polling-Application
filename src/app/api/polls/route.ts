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
  const question = (body?.question ?? "").toString().trim();
  const options = Array.isArray(body?.options) ? body.options.map((o: unknown) => String(o)) : [];

  if (!question || options.filter(Boolean).length < 2) {
    return NextResponse.json(
      { error: "Question and at least two options are required" },
      { status: 400 }
    );
  }

  const { data, error } = await supabase
    .from("polls")
    .insert([
      {
        question,
        options: options.filter(Boolean),
        owner_id: userData.user.id,
      },
    ])
    .select("id")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ id: data?.id }, { status: 201 });
}



