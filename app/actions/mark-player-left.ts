"use server";

import { createClient } from "@/lib/supabase/server";

export async function markPlayerAsLeft(sessionId: string, playerName: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("game_answers")
    .update({ is_active: false })
    .eq("session_id", sessionId)
    .eq("player_name", playerName)
    .select();

  if (error) {
    console.error("Error marking player as left:", error);
    return { success: false, error };
  }

  console.log(
    "Player marked as left successfully, updated records:",
    data?.length,
  );
  return { success: true, recordsUpdated: data?.length };
}
