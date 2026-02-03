"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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

export function PeopleList({
  people,
  groupId,
}: {
  people: Person[];
  groupId: string;
}) {
  const router = useRouter();
  const [deleting, setDeleting] = useState<string | null>(null);

  const handleDelete = async (personId: string) => {
    if (!confirm("Are you sure you want to delete this person?")) return;

    setDeleting(personId);
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("people")
        .delete()
        .eq("id", personId);

      if (error) throw error;
      router.refresh();
    } catch (err: any) {
      alert(err.message);
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
    <div className="space-y-3">
      {people.map((person) => (
        <Card key={person.id} className="p-4">
          <div className="flex items-center gap-4">
            {person.image_url ? (
              <img
                src={person.image_url}
                alt={`${person.first_name} ${person.last_name}`}
                className="w-12 h-12 rounded-full object-cover"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
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
              size="sm"
              onClick={() => handleDelete(person.id)}
              disabled={deleting === person.id}
            >
              {deleting === person.id ? "Deleting..." : "Delete"}
            </Button>
          </div>
        </Card>
      ))}
    </div>
  );
}
