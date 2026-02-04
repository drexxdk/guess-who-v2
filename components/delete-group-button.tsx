"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

export function DeleteGroupButton({ groupId }: { groupId: string }) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);

  const handleDeleteGroup = async () => {
    if (
      !confirm(
        "Are you sure you want to delete this group? This will also delete all people and active games in this group.",
      )
    )
      return;

    setDeleting(true);
    try {
      const supabase = createClient();

      // Get all people in this group to delete their images
      const { data: people } = await supabase
        .from("people")
        .select("image_url")
        .eq("group_id", groupId);

      // Delete all images from storage
      if (people && people.length > 0) {
        for (const person of people) {
          if (person.image_url) {
            try {
              const urlParts = person.image_url.split("/person-images/");
              if (urlParts.length > 1) {
                const filename = decodeURIComponent(urlParts[1]);
                await supabase.storage.from("person-images").remove([filename]);
              }
            } catch (err) {
              console.error("Failed to delete image:", err);
              // Continue with deletion even if image deletion fails
            }
          }
        }
      }

      // Delete all active game sessions for this group
      await supabase.from("game_sessions").delete().eq("group_id", groupId);

      // Delete all people in this group
      await supabase.from("people").delete().eq("group_id", groupId);

      // Delete the group itself
      const { error } = await supabase
        .from("groups")
        .delete()
        .eq("id", groupId);

      if (error) throw error;

      router.push("/protected/groups");
      router.refresh();
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      alert("Error deleting group: " + errorMessage);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Button
      variant="destructive"
      onClick={handleDeleteGroup}
      disabled={deleting}
      className="w-full"
    >
      {deleting ? "Deleting Group..." : "Delete Group"}
    </Button>
  );
}
