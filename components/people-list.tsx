"use client";

import { useState, memo } from "react";
import { FaTrash } from "react-icons/fa6";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/ui/dialog";
import { EmptyState } from "@/components/ui/empty-state";
import {
  StaggeredGrid,
  StaggeredGridItem,
} from "@/components/ui/staggered-list";
import { AvatarImage } from "@/components/ui/avatar-image";
import toast from "react-hot-toast";
import { deletePersonImage } from "@/lib/game-utils";
import { getErrorMessage } from "@/lib/logger";
import type { Person } from "@/lib/schemas";

// Memoized person card to prevent unnecessary re-renders
const PersonCard = memo(function PersonCard({
  person,
  isDeleting,
  onDeleteClick,
}: {
  person: Person;
  isDeleting: boolean;
  onDeleteClick: (person: Person) => void;
}) {
  return (
    <Card
      hover
      className="p-4"
      role="article"
      aria-label={`Person: ${person.first_name} ${person.last_name}`}
    >
      <div className="flex items-center gap-4">
        <AvatarImage
          src={person.image_url}
          alt={`Photo of ${person.first_name} ${person.last_name}`}
          fallbackName={`${person.first_name} ${person.last_name}`}
          className="w-12 h-12"
        />
        <div className="flex-1">
          <p className="font-medium" id={`person-name-${person.id}`}>
            {person.first_name} {person.last_name}
          </p>
          <p className="text-sm text-muted-foreground capitalize">
            {person.gender}
          </p>
        </div>
        <Button
          variant="destructive"
          onClick={() => onDeleteClick(person)}
          disabled={isDeleting}
          loading={isDeleting}
          size="icon"
          aria-label={`Delete ${person.first_name} ${person.last_name}`}
        >
          <FaTrash className="w-4 h-4" />
        </Button>
      </div>
    </Card>
  );
});

export function PeopleList({ people }: { people: Person[] }) {
  const [deleting, setDeleting] = useState<string | null>(null);
  const [personToDelete, setPersonToDelete] = useState<Person | null>(null);

  const handleDeleteClick = (person: Person) => {
    setPersonToDelete(person);
  };

  const handleDelete = async () => {
    if (!personToDelete) return;

    setDeleting(personToDelete.id);
    try {
      const supabase = createClient();

      // Delete image from storage if it exists
      if (personToDelete.image_url) {
        const result = await deletePersonImage(
          supabase,
          personToDelete.image_url,
        );
        if (!result.success) {
          // Continue with person deletion even if image deletion fails
        }
      }

      // Delete person from database
      const { error } = await supabase
        .from("people")
        .delete()
        .eq("id", personToDelete.id);

      if (error) throw error;

      toast.success("Person deleted successfully");
      setPersonToDelete(null);
      // Let real-time subscription handle the removal
    } catch (err: unknown) {
      toast.error(getErrorMessage(err));
    } finally {
      setDeleting(null);
    }
  };

  if (people.length === 0) {
    return (
      <EmptyState
        icon={
          <svg
            className="w-8 h-8"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
            />
          </svg>
        }
        title="No people yet"
        description="Add your first person to get started with this group"
      />
    );
  }

  return (
    <>
      <StaggeredGrid className="grid gap-3">
        {people.map((person) => (
          <StaggeredGridItem key={person.id}>
            <PersonCard
              person={person}
              isDeleting={deleting === person.id}
              onDeleteClick={handleDeleteClick}
            />
          </StaggeredGridItem>
        ))}
      </StaggeredGrid>
      <ConfirmDialog
        open={!!personToDelete}
        onOpenChange={(open) => !open && setPersonToDelete(null)}
        title="Delete Person"
        description={`Are you sure you want to delete ${personToDelete?.first_name} ${personToDelete?.last_name}? This action cannot be undone.`}
        onConfirm={handleDelete}
        confirmText="Delete"
        cancelText="Cancel"
        variant="destructive"
      />
    </>
  );
}
