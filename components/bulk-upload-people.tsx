'use client';

import { useState, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import toast from 'react-hot-toast';
import type { GenderType } from '@/lib/schemas';
import { logError, getErrorMessage } from '@/lib/logger';
import { sanitizeName, validateLength } from '@/lib/security';

interface CSVRow {
  first_name: string;
  last_name: string;
  gender: GenderType;
  image_url?: string;
  status: 'pending' | 'success' | 'error';
  error?: string;
}

export function BulkUploadPeople({ groupId, onComplete }: { groupId: string; onComplete?: () => void }) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [parsedData, setParsedData] = useState<CSVRow[]>([]);
  const [showPreview, setShowPreview] = useState(false);

  const parseCSV = (text: string): CSVRow[] => {
    const lines = text.split('\n').filter((line) => line.trim());
    if (lines.length < 2) return [];

    const headers = lines[0].split(',').map((h) => h.trim().toLowerCase());
    const firstNameIndex = headers.indexOf('first_name');
    const lastNameIndex = headers.indexOf('last_name');
    const genderIndex = headers.indexOf('gender');
    const imageUrlIndex = headers.indexOf('image_url');

    if (firstNameIndex === -1 || lastNameIndex === -1) {
      toast.error('CSV must have first_name and last_name columns');
      return [];
    }

    const rows: CSVRow[] = [];
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map((v) => v.trim());
      const firstName = values[firstNameIndex] || '';
      const lastName = values[lastNameIndex] || '';
      const gender = (values[genderIndex] || 'other') as GenderType;
      const imageUrl = imageUrlIndex !== -1 ? values[imageUrlIndex] : undefined;

      if (firstName && lastName) {
        rows.push({
          first_name: firstName,
          last_name: lastName,
          gender: ['male', 'female', 'other'].includes(gender) ? gender : 'other',
          image_url: imageUrl,
          status: 'pending',
        });
      }
    }

    return rows;
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
      toast.error('Please select a CSV file');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const parsed = parseCSV(text);
      if (parsed.length > 0) {
        setParsedData(parsed);
        setShowPreview(true);
      }
    };
    reader.readAsText(file);
  };

  const handleBulkUpload = async () => {
    if (parsedData.length === 0) return;

    setUploading(true);
    const supabase = createClient();
    const updatedRows = [...parsedData];

    try {
      for (let i = 0; i < updatedRows.length; i++) {
        const row = updatedRows[i];
        
        try {
          // Sanitize names
          const sanitizedFirstName = sanitizeName(row.first_name);
          const sanitizedLastName = sanitizeName(row.last_name);

          if (!sanitizedFirstName || !sanitizedLastName) {
            throw new Error('Invalid name format');
          }

          if (!validateLength(sanitizedFirstName, 50, 1) || !validateLength(sanitizedLastName, 50, 1)) {
            throw new Error('Names must be between 1-50 characters');
          }

          let imageUrl = row.image_url;

          // If image URL is provided, download and upload to Supabase storage
          if (imageUrl && imageUrl.startsWith('http')) {
            try {
              const response = await fetch(imageUrl);
              const blob = await response.blob();
              
              // Check file size (max 5MB for bulk upload)
              if (blob.size > 5 * 1024 * 1024) {
                throw new Error('Image too large (max 5MB)');
              }

              const fileName = `${Date.now()}-${sanitizedFirstName}-${sanitizedLastName}.jpg`;
              const { data: uploadData, error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(fileName, blob, {
                  contentType: blob.type,
                  cacheControl: '3600',
                  upsert: false,
                });

              if (uploadError) throw uploadError;

              const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(uploadData.path);
              imageUrl = urlData.publicUrl;
            } catch (imgError) {
              // Continue without image if upload fails
              logError('Failed to upload image for bulk upload', imgError);
              imageUrl = undefined;
            }
          }

          // Insert person
          const { error: insertError } = await supabase.from('people').insert({
            group_id: groupId,
            first_name: sanitizedFirstName,
            last_name: sanitizedLastName,
            gender: row.gender,
            image_url: imageUrl,
          });

          if (insertError) throw insertError;

          updatedRows[i].status = 'success';
        } catch (err) {
          updatedRows[i].status = 'error';
          updatedRows[i].error = getErrorMessage(err);
          logError(`Failed to upload person ${row.first_name} ${row.last_name}`, err);
        }

        // Update UI progressively
        setParsedData([...updatedRows]);
      }

      const successCount = updatedRows.filter((r) => r.status === 'success').length;
      const errorCount = updatedRows.filter((r) => r.status === 'error').length;

      if (successCount > 0) {
        toast.success(`Successfully imported ${successCount} ${successCount === 1 ? 'person' : 'people'}`);
      }
      if (errorCount > 0) {
        toast.error(`Failed to import ${errorCount} ${errorCount === 1 ? 'person' : 'people'}`);
      }

      if (successCount === updatedRows.length) {
        // All succeeded - reset form
        setParsedData([]);
        setShowPreview(false);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        onComplete?.();
      }
    } catch (err) {
      toast.error(getErrorMessage(err));
      logError('Bulk upload failed', err);
    } finally {
      setUploading(false);
    }
  };

  const downloadTemplate = () => {
    const template = 'first_name,last_name,gender,image_url\nJohn,Doe,male,https://example.com/photo.jpg\nJane,Smith,female,';
    const blob = new Blob([template], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'people_template.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  if (showPreview && parsedData.length > 0) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Review Import ({parsedData.length} people)</h3>
          <Button variant="outline" onClick={() => setShowPreview(false)} disabled={uploading}>
            Cancel
          </Button>
        </div>

        <div className="bg-muted max-h-96 overflow-y-auto rounded-lg border p-4">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="pb-2 text-left">Name</th>
                <th className="pb-2 text-left">Gender</th>
                <th className="pb-2 text-left">Image</th>
                <th className="pb-2 text-left">Status</th>
              </tr>
            </thead>
            <tbody>
              {parsedData.map((row, index) => (
                <tr key={index} className="border-b last:border-0">
                  <td className="py-2">
                    {row.first_name} {row.last_name}
                  </td>
                  <td className="py-2">{row.gender}</td>
                  <td className="py-2">{row.image_url ? '✓' : '—'}</td>
                  <td className="py-2">
                    {row.status === 'pending' && <span className="text-muted-foreground">Pending</span>}
                    {row.status === 'success' && <span className="text-green-600">✓ Success</span>}
                    {row.status === 'error' && (
                      <span className="text-red-600" title={row.error}>
                        ✗ Error
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <Button onClick={handleBulkUpload} disabled={uploading} className="w-full">
          {uploading ? 'Importing...' : `Import ${parsedData.filter((r) => r.status === 'pending').length} People`}
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="csv-upload">Upload CSV File</Label>
        <p className="text-muted-foreground mb-2 text-sm">
          Import multiple people at once using a CSV file with columns: first_name, last_name, gender, image_url
          (optional)
        </p>
        <input
          ref={fileInputRef}
          id="csv-upload"
          type="file"
          accept=".csv,text/csv"
          onChange={handleFileSelect}
          className="border-input bg-background file:bg-primary file:text-primary-foreground hover:file:bg-primary/90 w-full cursor-pointer rounded-md border text-sm file:mr-4 file:cursor-pointer file:rounded-l-md file:border-0 file:px-4 file:py-2 file:font-medium"
        />
      </div>

      <Button variant="outline" onClick={downloadTemplate} className="w-full">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
          className="mr-2 h-4 w-4"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3"
          />
        </svg>
        Download CSV Template
      </Button>
    </div>
  );
}
