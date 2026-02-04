"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Image from "next/image";

export function AddPersonForm({ groupId }: { groupId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [preview, setPreview] = useState<string>("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    gender: "other" as "male" | "female" | "other",
  });

  const handleImageSelect = (file: File) => {
    // Check file type
    const validTypes = ["image/jpeg", "image/png"];
    if (!validTypes.includes(file.type)) {
      alert("Please select a JPEG or PNG image");
      return;
    }

    // Check file size (max 1 MB)
    const maxSize = 1024 * 1024; // 1 MB in bytes
    if (file.size > maxSize) {
      alert("File size must be less than 1 MB");
      return;
    }

    // Store the file and show local preview
    setSelectedFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleImageSelect(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleImageSelect(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields
    if (!formData.first_name.trim() || !formData.last_name.trim()) {
      alert("Please enter first and last name");
      return;
    }

    setLoading(true);

    try {
      const supabase = createClient();
      let imageUrl = "";

      // Upload image if one was selected
      if (selectedFile) {
        const timestamp = Date.now();
        const randomString = Math.random().toString(36).substring(2, 8);
        const filename = `${timestamp}-${randomString}-${selectedFile.name}`;

        const { error: uploadError } = await supabase.storage
          .from("person-images")
          .upload(filename, selectedFile);

        if (uploadError) {
          if (uploadError.message.includes("Bucket not found")) {
            throw new Error(
              "The 'person-images' storage bucket does not exist. Please create it in your Supabase dashboard: Storage → Create new bucket → Name it 'person-images' → Enable Public bucket → Create.",
            );
          }
          throw uploadError;
        }

        // Get public URL
        const { data: publicUrlData } = supabase.storage
          .from("person-images")
          .getPublicUrl(filename);

        imageUrl = publicUrlData.publicUrl;
      }

      // Build the person object
      const personData: any = {
        group_id: groupId,
        first_name: formData.first_name,
        last_name: formData.last_name,
        gender: formData.gender,
      };

      // Only include image_url if it has a value
      if (imageUrl) {
        personData.image_url = imageUrl;
      }

      const { error } = await supabase.from("people").insert(personData);

      if (error) {
        if (error.message.includes("row-level security")) {
          throw new Error(
            "Permission denied: RLS policy prevents adding people. In Supabase: Database → Tables → people → RLS toggle OFF (or create INSERT policy).",
          );
        }
        throw error;
      }

      // Reset form
      setFormData({
        first_name: "",
        last_name: "",
        gender: "other",
      });
      setPreview("");
      setSelectedFile(null);

      router.refresh();
    } catch (err: any) {
      console.error(err);
      alert("Error adding person: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="first_name">First Name</Label>
          <Input
            id="first_name"
            value={formData.first_name}
            onChange={(e) =>
              setFormData({ ...formData, first_name: e.target.value })
            }
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="last_name">Last Name</Label>
          <Input
            id="last_name"
            value={formData.last_name}
            onChange={(e) =>
              setFormData({ ...formData, last_name: e.target.value })
            }
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="gender">Gender</Label>
        <select
          id="gender"
          value={formData.gender}
          onChange={(e) =>
            setFormData({
              ...formData,
              gender: e.target.value as "male" | "female" | "other",
            })
          }
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          required
        >
          <option value="male">Male</option>
          <option value="female">Female</option>
          <option value="other">Other</option>
        </select>
      </div>

      <div className="space-y-2">
        <Label>Photo</Label>
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer ${
            dragActive
              ? "border-primary bg-primary/5"
              : "border-muted-foreground/25 hover:border-muted-foreground/50"
          }`}
        >
          <input
            type="file"
            accept="image/jpeg,image/png"
            onChange={handleFileInputChange}
            disabled={loading}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          {preview ? (
            <div className="space-y-3">
              <div className="relative w-40 h-40 mx-auto">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={preview}
                  alt="Preview"
                  className="w-full h-full object-cover rounded-lg"
                />
              </div>
              <p className="text-sm font-medium">Image ready</p>
              <p className="text-xs text-muted-foreground">
                Click or drag to replace
              </p>
            </div>
          ) : (
            <div className="space-y-2 py-8">
              <p className="text-sm font-medium">Drag and drop an image here</p>
              <p className="text-xs text-muted-foreground">
                or click to select from your device
              </p>
            </div>
          )}
        </div>
      </div>

      <Button 
        type="submit" 
        disabled={loading || !formData.first_name.trim() || !formData.last_name.trim() || !selectedFile} 
        className="w-full"
      >
        {loading ? "Adding..." : "Add Person"}
      </Button>
    </form>
  );
}
