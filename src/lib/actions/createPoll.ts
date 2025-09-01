"use server";
import { createClient } from "@supabase/supabase-js";
import { redirect } from "next/navigation";

type ActionState = {
  ok: boolean;
  message?: string;
  pollId?: string;
};

export async function createPollAction(_: ActionState | null, formData: FormData): Promise<ActionState> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const serviceKey = process.env.SUPABASE_SECRET_KEY || "";
  

  if (!supabaseUrl || !serviceKey) {
    return { ok: false, message: "Server is misconfigured (Supabase env)." };
  }

  const accessToken = String(formData.get("accessToken") || "").trim();
  const question = String(formData.get("question") || "").trim();
  const rawOptions = String(formData.get("options") || "");
  const options = rawOptions
    .split("\n")
    .map((o) => o.trim())
    .filter((o) => o.length > 0);

  if (!accessToken) return { ok: false, message: "Not authenticated." };
  if (!question || options.length < 2) {
    return { ok: false, message: "Enter a question and at least two options." };
  }

  const serverClient = createClient(supabaseUrl, serviceKey);

  try {
    const { data: userData, error: userErr } = await serverClient.auth.getUser(accessToken);
    if (userErr || !userData?.user?.id) {
      return { ok: false, message: "Invalid session." };
    }
    const userId = userData.user.id;
    const { data, error } = await serverClient
      .from("polls")
      .insert([{ user_id: userId, question, options }])
      .select("id")
      .single();

    if (error) return { ok: false, message: error.message };
    if (data?.id) {
      redirect(`/polls/${data.id}`);
    }
    return { ok: true, pollId: data?.id, message: "Poll created" };
  } catch (e: any) {
    return { ok: false, message: e?.message || "Unexpected error" };
  }
}


