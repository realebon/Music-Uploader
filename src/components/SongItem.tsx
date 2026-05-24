"use client";

import { useState } from "react";
import { Flex, Text, Box, IconButton, Checkbox } from "@radix-ui/themes";
import { Play, Pause, Music } from "lucide-react";
import { SongInfo } from "../types";

interface SongItemProps {
  song: SongInfo;
  isCurrentlyPlaying: boolean;
  isPlaying: boolean;
  isSelected: boolean;
  onTogglePlay: (song: SongInfo) => void;
  onToggleSelect: (id: string, selected: boolean) => void;
  onRename: (id: string, newTitle: string) => void;
}

/**
 * Represents a single song row in the list view.
 * Handles individual audio playback, selection toggling, and inline renaming.
 */
export function SongItem({
  song,
  isCurrentlyPlaying,
  isPlaying,
  isSelected,
  onTogglePlay,
  onToggleSelect,
  onRename
}: SongItemProps) {
  
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(song.title);

  const handleSelect = (checked: boolean) => {
    onToggleSelect(song.id, checked);
  };

  /**
   * Commits the new title to the local state.
   * If the name was actually changed, it bubbles up to the parent to update the file object.
   */
  const handleSaveRename = () => {
    if (editTitle.trim() && editTitle.trim() !== song.title) {
      onRename(song.id, editTitle.trim());
    } else {
      setEditTitle(song.title);
    }
    setIsEditing(false);
    // Clear any native browser text highlighting from the double-click
    window.getSelection()?.removeAllRanges();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSaveRename();
    if (e.key === 'Escape') {
      setEditTitle(song.title);
      setIsEditing(false);
    }
  };

  return (
    <Flex 
      align="center" 
      justify="between" 
      gap="3"
      style={{ 
        padding: '12px 8px',
        transition: 'all 0.15s',
        backgroundColor: 'transparent',
        borderRadius: '12px'
      }}
    >
      <Flex align="center" gap="3" style={{ flex: 1, overflow: 'hidden' }}>
        <Box 
          onClick={(e) => e.stopPropagation()} 
          style={{ display: 'flex', alignItems: 'center', padding: '0 4px', opacity: isSelected ? 1 : 0.4, transition: 'opacity 0.2s' }}
        >
          <Checkbox 
            checked={isSelected} 
            onCheckedChange={handleSelect} 
            size="2" 
            variant="surface"
            color="gray"
            highContrast
          />
        </Box>
        
        <Flex 
          align="center" 
          gap="3" 
          style={{ flex: 1, overflow: 'hidden', cursor: isEditing ? 'default' : 'pointer' }}
          onClick={(e) => {
            // Only play if they click the cover art area explicitly
            // Let the text area handle double click for renaming without triggering play
            if (!isEditing) {
              const target = e.target as HTMLElement;
              // If they click on the cover art container or the image inside it, toggle play
              if (target.closest('[data-cover-art="true"]')) {
                onTogglePlay(song);
              }
            }
          }}
        >
          <Box 
            data-cover-art="true"
            style={{ 
              width: '44px', 
              height: '44px', 
              borderRadius: '8px', 
              overflow: 'hidden',
              flexShrink: 0,
              backgroundColor: 'var(--gray-4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            {song.coverUrl ? (
              <img 
                src={song.coverUrl} 
                alt="Cover" 
                style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
              />
            ) : (
              <Music size={20} color="var(--gray-9)" />
            )}
          </Box>
          
          {isEditing ? (
            <Box onClick={(e) => e.stopPropagation()} style={{ flex: 1 }}>
              <input
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                onKeyDown={handleKeyDown}
                onBlur={handleSaveRename}
                autoFocus
                style={{
                  width: '100%',
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  color: 'var(--gray-12)',
                  fontSize: 'var(--font-size-3)',
                  fontWeight: 'var(--font-weight-medium)',
                  padding: 0,
                  margin: 0,
                  fontFamily: 'inherit'
                }}
              />
            </Box>
          ) : (
            <Text 
              size="3" 
              weight={isSelected ? "bold" : "medium"} 
              onDoubleClick={(e) => {
                e.stopPropagation();
                setIsEditing(true);
                window.getSelection()?.removeAllRanges();
              }}
              style={{ 
                flex: 1,
                whiteSpace: 'nowrap', 
                overflow: 'hidden', 
                textOverflow: 'ellipsis',
                color: isCurrentlyPlaying 
                  ? 'var(--gray-12)' 
                  : isSelected 
                    ? 'var(--gray-12)' 
                    : 'var(--gray-11)',
                userSelect: 'none',
                transition: 'color 0.2s, font-weight 0.2s'
              }}
            >
              {song.title}
            </Text>
          )}
        </Flex>
      </Flex>
      
      <Flex gap="1" align="center">
        <IconButton 
          variant="ghost" 
          color="gray" 
          size="2" 
          onClick={(e) => {
            e.stopPropagation();
            onTogglePlay(song);
          }}
        >
          {isCurrentlyPlaying && isPlaying ? (
            <Pause size={20} color="var(--gray-12)" fill="currentColor" />
          ) : (
            <Play size={20} color="var(--gray-10)" fill="currentColor" />
          )}
        </IconButton>
      </Flex>
    </Flex>
  );
}
