"use server";

import { createClient } from "@/lib/supabase/server";
import { logger, logError } from "@/lib/logger";

export async function markPlayerAsLeft(sessionId: string, playerName: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("game_answers")
    .update({ is_active: false })
    .eq("session_id", sessionId)
    .eq("player_name", playerName)
    .select();

  if (error) {
    logError("Error marking player as left:", error);
    return { success: false, error };
  }

  logger.log(
    "Player marked as left successfully, updated records:",
    data?.length,
  );
  return { success: true, recordsUpdated: data?.length };
}
