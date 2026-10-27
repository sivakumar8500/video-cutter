import JSZip from 'jszip';
import type { ExportedClip } from '../types';

export interface FolderSaveResult {
  success: boolean;
  message: string;
  folderName?: string;
}

/**
 * Check if the browser supports File System Access API
 */
export function isFileSystemAccessSupported(): boolean {
  return typeof window !== 'undefined' && 'showDirectoryPicker' in window;
}

/**
 * Save clips directly to a new folder on the user's disk
 * using the File System Access API
 */
export async function saveClipsToLocalFolder(
  folderName: string,
  clips: ExportedClip[]
): Promise<FolderSaveResult> {
  if (!isFileSystemAccessSupported()) {
    return {
      success: false,
      message: 'Direct folder saving is not supported in this browser. Please download all clips as a ZIP archive.',
    };
  }

  try {
    // Prompt the user to select the parent destination directory
    // (e.g., Downloads, Documents, or Movies)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const parentDirHandle = await (window as any).showDirectoryPicker({
      id: 'video-cutter-output',
      mode: 'readwrite',
      startIn: 'downloads',
    });

    // Create the dedicated new folder inside the selected parent directory
    const outputDirHandle = await parentDirHandle.getDirectoryHandle(folderName, {
      create: true,
    });

    // Save each clip into the new folder
    for (const clip of clips) {
      const fileHandle = await outputDirHandle.getFileHandle(clip.filename, {
        create: true,
      });
      const writable = await fileHandle.createWritable();
      await writable.write(clip.blob);
      await writable.close();
    }

    return {
      success: true,
      folderName,
      message: `Successfully saved ${clips.length} clips into folder "${folderName}"!`,
    };
  } catch (err: unknown) {
    if (err instanceof Error && err.name === 'AbortError') {
      return {
        success: false,
        message: 'Folder selection was cancelled.',
      };
    }
    return {
      success: false,
      message: err instanceof Error ? err.message : 'Failed to write files to folder.',
    };
  }
}

/**
 * Download all clips packaged in a ZIP archive
 */
export async function downloadAllAsZip(
  folderName: string,
  clips: ExportedClip[],
  onProgress?: (percent: number) => void
): Promise<void> {
  const zip = new JSZip();
  const folder = zip.folder(folderName) || zip;

  for (const clip of clips) {
    folder.file(clip.filename, clip.blob);
  }

  const content = await zip.generateAsync(
    {
      type: 'blob',
      compression: 'DEFLATE',
      compressionOptions: { level: 4 },
    },
    (metadata) => {
      if (onProgress) {
        onProgress(Math.round(metadata.percent));
      }
    }
  );

  const zipUrl = URL.createObjectURL(content);
  const a = document.createElement('a');
  a.href = zipUrl;
  a.download = `${folderName}.zip`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);

  setTimeout(() => {
    URL.revokeObjectURL(zipUrl);
  }, 1000);
}

/**
 * Trigger download for a single clip
 */
export function downloadSingleClip(clip: ExportedClip): void {
  const a = document.createElement('a');
  a.href = clip.url;
  a.download = clip.filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}
