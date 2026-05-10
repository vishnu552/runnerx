"use client";

import { useState, useRef } from "react";

interface ImageUploadProps {
  name: string;
  defaultValue?: string | null;
  placeholder?: string;
  onUploadSuccess?: (url: string) => void;
  onChange?: (url: string) => void;
}

export function ImageUpload({ name, defaultValue, placeholder, onUploadSuccess, onChange }: ImageUploadProps) {
  const [url, setUrl] = useState<string>(defaultValue || "");
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const updateUrl = (next: string) => {
    setUrl(next);
    if (onChange) onChange(next);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);

    try {
      // Send file as raw binary — no FormData, no multipart parsing issues
      const res = await fetch(`/api/upload?filename=${encodeURIComponent(file.name)}`, {
        method: "POST",
        headers: { "Content-Type": file.type },
        body: file,
      });

      const data = await res.json();
      if (data.success) {
        updateUrl(data.url);
        if (onUploadSuccess) onUploadSuccess(data.url);
      } else {
        alert("Upload failed: " + (data.message || "Unknown error"));
      }
    } catch (err) {
      console.error(err);
      alert("An error occurred during upload.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        <input 
          type="text" 
          name={name} 
          className="input" 
          placeholder={placeholder || "https://..."} 
          value={url}
          onChange={(e) => updateUrl(e.target.value)}
          style={{ flex: 1 }}
        />
        <input 
          type="file" 
          accept="image/*" 
          style={{ display: "none" }} 
          ref={fileInputRef}
          onChange={handleFileChange}
        />
        <button 
          type="button" 
          className="btn btn-outline" 
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          style={{ whiteSpace: "nowrap" }}
        >
          {uploading ? "Uploading..." : "Upload File"}
        </button>
      </div>
      {url && (
        <div style={{ marginTop: 4 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img 
            src={url} 
            alt="Preview" 
            style={{ height: 60, borderRadius: 4, objectFit: 'contain', border: '1px solid var(--border)', background: 'var(--bg-alt)' }} 
          />
        </div>
      )}
    </div>
  );
}
