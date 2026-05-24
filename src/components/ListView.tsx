"use client";

import { useState, useRef, useMemo } from "react";
import { Flex, Text, TextField, IconButton, Button, Box } from "@radix-ui/themes";
import { Search, Plus, Music, Check, Loader2, Trash2 } from "lucide-react";
import { SongInfo } from "../types";
import { SongItem } from "./SongItem";
import { useFileUpload } from "../hooks/useFileUpload";
import { supabase } from "../utils/supabase";

interface ListViewProps {
  songs: SongInfo[];
  currentSong: SongInfo | null;
  isPlaying: boolean;
  onSongsAdded: (songs: SongInfo[]) => void;
  onTogglePlay: (song: SongInfo) => void;
  onRenameSong: (id: string, newTitle: string) => void;
  onRemoveSongs: (ids: Set<string>) => void;
}

export function ListView({ 
  songs, 
  currentSong, 
  isPlaying, 
  onSongsAdded, 
  onTogglePlay,
  onRenameSong,
  onRemoveSongs
}: ListViewProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [authorName, setAuthorName] = useState("");
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishSuccess, setPublishSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { handleFileChange } = useFileUpload(onSongsAdded);

  const filteredSongs = useMemo(() => {
    return songs.filter(s => s.title.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [songs, searchQuery]);

  const toggleSelect = (id: string, selected: boolean) => {
    const newSet = new Set(selectedIds);
    if (selected) {
      newSet.add(id);
    } else {
      newSet.delete(id);
    }
    setSelectedIds(newSet);
  };

  const selectAll = () => {
    if (selectedIds.size === filteredSongs.length) {
      setSelectedIds(new Set()); // Deselect all
    } else {
      setSelectedIds(new Set(filteredSongs.map(s => s.id))); // Select all
    }
  };

  // Convert Base64 data URL back to a binary Blob for Supabase Storage upload
  const dataURLtoBlob = (dataurl: string) => {
    const arr = dataurl.split(',');
    const mime = arr[0].match(/:(.*?);/)?.[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new Blob([u8arr], { type: mime });
  };

  /**
   * Core Publishing Logic
   * 1. Iterates through all selected songs.
   * 2. Uploads the raw MP3 blob to the 'music' storage bucket.
   * 3. If artwork exists, converts it and uploads to the 'albums' storage bucket.
   * 4. Upserts the combined public URLs and metadata to the 'music' Postgres table.
   */
  const handlePublish = async () => {
    if (selectedIds.size === 0) return;
    setIsPublishing(true);

    try {
      const selectedSongs = songs.filter(s => selectedIds.has(s.id));
      
      for (const song of selectedSongs) {
        // 1. Upload MP3 file
        const uniqueId = song.id || (crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(7));
        const timestamp = Date.now();
        const mp3FileName = `${uniqueId}-${timestamp}-${song.file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
        const { data: mp3Data, error: mp3Error } = await supabase.storage
          .from('music')
          .upload(mp3FileName, song.file);
          
        if (mp3Error) throw mp3Error;

        const { data: { publicUrl: mp3Url } } = supabase.storage
          .from('music')
          .getPublicUrl(mp3FileName);

        // 2. Upload Album Art if it exists
        let albumArtUrl = null;
        if (song.coverUrl) {
          const coverBlob = dataURLtoBlob(song.coverUrl);
          const extension = coverBlob.type === 'image/png' ? 'png' : 'jpg';
          const coverFileName = `${uniqueId}-${timestamp}-cover.${extension}`;
          
          const { data: coverData, error: coverError } = await supabase.storage
            .from('albums')
            .upload(coverFileName, coverBlob);
            
          if (!coverError) {
            const { data: { publicUrl: url } } = supabase.storage
              .from('albums')
              .getPublicUrl(coverFileName);
            albumArtUrl = url;
          }
        }

        // 3. Insert into database using the new schema (using Upsert to prevent trigger collisions)
        const { error: dbError } = await supabase
          .from('music')
          .upsert({
            music_name: song.title,
            music_creator_name: authorName.trim() || "Unknown Artist",
            music_audio_url: mp3Url,
            music_photo_url: albumArtUrl,
            audio_storage_path: mp3FileName
          }, { onConflict: 'audio_storage_path' });

        if (dbError) throw dbError;
      }

      setPublishSuccess(true);
      setTimeout(() => {
        setPublishSuccess(false);
        onRemoveSongs(selectedIds);
        setSelectedIds(new Set());
        setAuthorName("");
      }, 2000);

    } catch (error) {
      console.error("Error publishing songs:", error);
      alert("Failed to publish songs. Please check console for details.");
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <Flex direction="column" gap="4" style={{ minHeight: '80vh' }}>
      <Flex 
        gap="3" 
        align="center" 
        style={{ 
          position: 'sticky', 
          top: 0, 
          paddingTop: '16px', 
          paddingBottom: '16px', 
          backgroundColor: 'var(--color-background)', 
          zIndex: 10 
        }}
      >
        <TextField.Root 
          size="3" 
          placeholder="Search..." 
          value={searchQuery} 
          onChange={(e) => setSearchQuery(e.target.value)} 
          style={{ flex: 1, borderRadius: '16px', backgroundColor: 'var(--gray-3)', border: 'none' }}
        >
          <TextField.Slot>
            <Search size={18} color="var(--gray-9)" />
          </TextField.Slot>
        </TextField.Root>
        <IconButton 
          size="3" 
          variant="soft" 
          radius="full" 
          onClick={() => fileInputRef.current?.click()}
        >
          <Plus size={20} />
        </IconButton>
      </Flex>

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        multiple
        accept=".mp3,audio/mpeg"
        style={{ display: 'none' }}
      />
      
      {selectedIds.size > 0 && (
        <Flex justify="between" align="center" style={{ padding: '8px 16px', margin: '4px 0 12px 0' }}>
          <Flex align="center" gap="3">
            <Text size="2" weight="medium">{selectedIds.size} selected</Text>
            <IconButton 
              variant="ghost" 
              color="red" 
              size="1" 
              onClick={() => {
                onRemoveSongs(selectedIds);
                setSelectedIds(new Set());
              }}
              style={{ cursor: 'pointer' }}
            >
              <Trash2 size={16} />
            </IconButton>
          </Flex>
          <Text size="2" weight="medium" style={{ cursor: 'pointer', color: 'var(--gray-11)' }} onClick={selectAll}>
            {selectedIds.size === filteredSongs.length ? "Deselect All" : "Select All"}
          </Text>
        </Flex>
      )}

      <Flex direction="column">
        {filteredSongs.length === 0 ? (
          <Flex direction="column" align="center" justify="center" py="9">
            <Music size={32} color="var(--gray-8)" style={{ marginBottom: '16px' }} />
            <Text size="3" color="gray">No matching songs</Text>
          </Flex>
        ) : (
          filteredSongs.map((song) => (
            <SongItem
              key={song.id}
              song={song}
              isCurrentlyPlaying={currentSong?.id === song.id}
              isPlaying={isPlaying}
              isSelected={selectedIds.has(song.id)}
              onTogglePlay={onTogglePlay}
              onToggleSelect={toggleSelect}
              onRename={onRenameSong}
            />
          ))
        )}
      </Flex>

      {/* Floating Action Bar */}
      <Box
        style={{
          position: 'fixed',
          bottom: '24px',
          left: '50%',
          transform: `translateX(-50%) translateY(${selectedIds.size > 0 ? '0' : '150%'})`,
          opacity: selectedIds.size > 0 ? 1 : 0,
          transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
          pointerEvents: selectedIds.size > 0 ? 'auto' : 'none',
          zIndex: 50,
          width: 'calc(100% - 32px)',
          maxWidth: '440px',
        }}
      >
        <Flex 
          justify="between" 
          align="center" 
          gap="4"
          style={{ 
            backgroundColor: 'var(--gray-3)', 
            padding: '12px 16px', 
            borderRadius: '16px',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
            border: '1px solid var(--gray-5)'
          }}
        >
          <TextField.Root 
            size="2" 
            placeholder="Author name..." 
            value={authorName}
            onChange={(e) => setAuthorName(e.target.value)}
            disabled={isPublishing || publishSuccess}
            style={{ flex: 1, backgroundColor: 'var(--gray-2)' }} 
          />
          <Button 
            size="2" 
            variant="solid" 
            color={publishSuccess ? "green" : "violet"} 
            style={{ borderRadius: '8px', minWidth: '80px' }}
            onClick={handlePublish}
            disabled={isPublishing || publishSuccess}
          >
            {isPublishing ? (
              <Loader2 className="animate-spin" size={16} />
            ) : publishSuccess ? (
              <Check size={16} />
            ) : (
              "Publish"
            )}
          </Button>
        </Flex>
      </Box>
    </Flex>
  );
}
