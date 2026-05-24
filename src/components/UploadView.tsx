"use client";

import { useRef } from "react";
import { Flex, Text, Box } from "@radix-ui/themes";
import { Upload } from "lucide-react";
import { SongInfo } from "../types";
import { useFileUpload } from "../hooks/useFileUpload";

interface UploadViewProps {
  onSongsAdded: (songs: SongInfo[]) => void;
}

export function UploadView({ onSongsAdded }: UploadViewProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { handleFileChange, handleDrop } = useFileUpload(onSongsAdded);

  return (
    <Flex direction="column" align="center" justify="center" style={{ minHeight: '80vh' }}>
      <Box 
        onClick={() => fileInputRef.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        style={{ 
          width: '100%', 
          padding: '64px 20px',
          textAlign: 'center',
          cursor: 'pointer',
          borderRadius: '24px',
          backgroundColor: 'var(--gray-3)',
          transition: 'all 0.2s ease-in-out'
        }}
      >
        <Flex direction="column" align="center" gap="4">
          <Box style={{ background: 'var(--gray-5)', padding: '20px', borderRadius: '50%' }}>
            <Upload size={32} color="var(--gray-11)" />
          </Box>
          <Box>
            <Text size="5" weight="medium" style={{ display: 'block', marginBottom: '4px' }}>
              Select or drop audio
            </Text>
            <Text size="3" color="gray">
              MP3 files
            </Text>
          </Box>
        </Flex>
      </Box>
      
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        multiple
        accept=".mp3,audio/mpeg"
        style={{ display: 'none' }}
      />
    </Flex>
  );
}
