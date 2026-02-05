import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/database.types";
import { getErrorMessage } from "@/lib/logger";

/**
 * Generate a random game code
 * @param length - Length of the code (default: 6)
 * @returns A random alphanumeric code (excluding ambiguous characters)
 */
export function generateGameCode(length = 6): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < length; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

/**
 * Delete a person's image from Supabase storage
 * @param supabase - Supabase client instance
 * @param imageUrl - The full URL of the image to delete
 * @returns Object with success status and optional error
 */
export async function deletePersonImage(
  supabase: SupabaseClient<Database>,
  imageUrl: string | null,
): Promise<{ success: boolean; error?: string }> {
  if (!imageUrl) {
    return { success: true };
  }

  try {
    // Extract filename from URL
    // URL format: https://{domain}/storage/v1/object/public/person-images/{filename}
    const urlParts = imageUrl.split("/person-images/");

    if (urlParts.length <= 1) {
      return { success: false, error: "Could not extract filename from URL" };
    }

    const filename = decodeURIComponent(urlParts[1]);
    const { error } = await supabase.storage
      .from("person-images")
      .remove([filename]);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: getErrorMessage(err),
    };
  }
}

/**
 * End a game session by marking it as completed
 * @param supabase - Supabase client instance
 * @param sessionId - The game session ID to end
 */
export async function endGameSession(
  supabase: SupabaseClient<Database>,
  sessionId: string,
): Promise<{ success: boolean; error?: string }> {
  const { error } = await supabase
    .from("game_sessions")
    .update({ status: "completed" })
    .eq("id", sessionId);

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true };
}
