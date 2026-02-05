"use client";

import Image from "next/image";
import { useState } from "react";
import { FaTrash } from "react-icons/fa6";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

type Person = {
  id: string;
  first_name: string;
  last_name: string;
  gender: string;
  image_url: string | null;
};

export function PeopleList({ people }: { people: Person[] }) {
  const [deleting, setDeleting] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async (personId: string, imageUrl: string | null) => {
    if (!confirm("Are you sure you want to delete this person?")) return;

    setDeleting(personId);
    try {
      const supabase = createClient();

      // Delete image from storage if it exists
      if (imageUrl) {
        try {
          console.log("Full image URL:", imageUrl);

          // Extract filename from URL
          // URL format: https://{domain}/storage/v1/object/public/person-images/{filename}
          const urlParts = imageUrl.split("/person-images/");
          console.log("URL parts:", urlParts);

          if (urlParts.length > 1) {
            const filename = decodeURIComponent(urlParts[1]);
            console.log("Extracted filename:", filename);

            const { data, error: deleteError } = await supabase.storage
              .from("person-images")
              .remove([filename]);

            console.log("Delete response - data:", data, "error:", deleteError);

            if (deleteError) {
              console.error("Error deleting image:", deleteError);
            } else {
              console.log("Image deleted successfully. Response:", data);
            }
          } else {
            console.warn("Could not extract filename from URL:", imageUrl);
          }
        } catch (storageErr) {
          console.error("Failed to delete image from storage:", storageErr);
          // Continue with person deletion even if image deletion fails
        }
      }

      // Delete person from database
      const { error } = await supabase
        .from("people")
        .delete()
        .eq("id", personId);

      if (error) throw error;

      // Let real-time subscription handle the removal
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      setError(errorMessage);
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
          <Card key={person.id} className="p-4">
            <div className="flex items-center gap-4">
              {person.image_url ? (
                <Image
                  src={person.image_url}
                  alt={`${person.first_name} ${person.last_name}`}
                  width={48}
                  height={48}
                  className="object-cover"
                />
              ) : (
                <div className="w-12 h-12 bg-muted flex items-center justify-center">
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
                onClick={() => handleDelete(person.id, person.image_url)}
                disabled={deleting === person.id}
                size="icon"
              >
                <FaTrash className="w-4 h-4" />
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {error && (
        <div className="p-3 bg-red-100 text-red-700 rounded-lg text-sm mt-3">
          {error}
        </div>
      )}
    </>
  );
}
