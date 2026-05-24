import * as mmb from 'music-metadata-browser';

/**
 * Parses the ID3 tags of an MP3 file directly in the browser.
 * Extracts the embedded album artwork and converts it to a Base64 string for preview rendering.
 * 
 * @param file - The raw MP3 File object
 * @returns A base64 data URL string, or null if no artwork is found
 */
export const extractArtwork = async (file: File): Promise<string | null> => {
  try {
    const metadata = await mmb.parseBlob(file);
    const picture = metadata.common.picture?.[0];
    if (picture) {
      let base64String = "";
      for (let i = 0; i < picture.data.length; i++) {
        base64String += String.fromCharCode(picture.data[i]);
      }
      const base64 = window.btoa(base64String);
      return `data:${picture.format};base64,${base64}`;
    }
  } catch (error) {
    console.error("Error parsing metadata:", error);
  }
  return null;
};
