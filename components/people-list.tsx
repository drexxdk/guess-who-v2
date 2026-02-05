"use client";

import { useState, memo } from "react";
import { FaTrash } from "react-icons/fa6";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { OptimizedAvatar } from "@/components/ui/optimized-image";
import toast from "react-hot-toast";
import { deletePersonImage } from "@/lib/game-utils";
import { getErrorMessage } from "@/lib/logger";
import type { Person } from "@/lib/schemas";

// Memoized person card to prevent unnecessary re-renders
const PersonCard = memo(function PersonCard({
  person,
  isDeleting,
  onDelete,
}: {
  person: Person;
  isDeleting: boolean;
  onDelete: (personId: string, imageUrl: string | null) => void;
}) {
  return (
    <Card className="p-4">
      <div className="flex items-center gap-4">
        {person.image_url ? (
          <OptimizedAvatar
            src={person.image_url}
            alt={`${person.first_name} ${person.last_name}`}
            size={48}
          />
        ) : (
          <div className="w-12 h-12 bg-muted flex items-center justify-center rounded-full">
            <span className="text-lg font-semibold">
              {person.first_name[0]}
              {person.last_name[0]}
            </span>
          </div>
        )}
        <div className="flex-1">
          <p className="font-medium">
            {person.first_name} {person.last_name}
          </p>
          <p className="text-sm text-muted-foreground capitalize">
            {person.gender}
          </p>
        </div>
        <Button
          variant="destructive"
          onClick={() => onDelete(person.id, person.image_url)}
          disabled={isDeleting}
          size="icon"
        >
          <FaTrash className="w-4 h-4" />
        </Button>
      </div>
    </Card>
  );
});

export function PeopleList({ people }: { people: Person[] }) {
  const [deleting, setDeleting] = useState<string | null>(null);

  const handleDelete = async (personId: string, imageUrl: string | null) => {
    if (!confirm("Are you sure you want to delete this person?")) return;

    setDeleting(personId);
    try {
      const supabase = createClient();

      // Delete image from storage if it exists
      if (imageUrl) {
        const result = await deletePersonImage(supabase, imageUrl);
        if (!result.success) {
          // Continue with person deletion even if image deletion fails
        }
      }

      // Delete person from database
      const { error } = await supabase
        .from("people")
        .delete()
        .eq("id", personId);

      if (error) throw error;

      toast.success("Person deleted");
      // Let real-time subscription handle the removal
    } catch (err: unknown) {
      toast.error(getErrorMessage(err));
    } finally {
      setDeleting(null);
    }
  };

  if (people.length === 0) {
    return (
      <p className="text-center text-muted-foreground py-8">
        No people added yet. Add your first person to get started!
      </p>
    );
  }

  return (
    <>
      <div className="space-y-3">
        {people.map((person) => (
          <PersonCard
            key={person.id}
            person={person}
            isDeleting={deleting === person.id}
            onDelete={handleDelete}
          />
        ))}
      </div>
    </>
  );
}
