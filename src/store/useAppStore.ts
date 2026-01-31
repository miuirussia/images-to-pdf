import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  ImageItem,
  PdfSettings,
  DEFAULT_PDF_SETTINGS,
  generateImageId,
  extractFileName,
} from '@/types';

// ============================================================================
// Store State Interface
// ============================================================================

interface AppState {
  // Image list
  images: ImageItem[];

  // PDF settings (persisted to localStorage)
  settings: PdfSettings;

  // UI state
  isGenerating: boolean;
  progress: number;

  // Actions - Image Management
  addImages: (paths: string[]) => void;
  removeImage: (id: string) => void;
  clearImages: () => void;
  reorderImages: (startIndex: number, endIndex: number) => void;
  updateImageInfo: (pathOrId: string, info: ImageItem['info']) => void;

  // Actions - Settings Management
  updateSettings: (settings: Partial<PdfSettings>) => void;
  resetSettings: () => void;

  // Actions - UI State
  setIsGenerating: (isGenerating: boolean) => void;
  setProgress: (progress: number) => void;
}

// ============================================================================
// Store Implementation
// ============================================================================

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // ======================================================================
      // Initial State
      // ======================================================================

      images: [],
      settings: DEFAULT_PDF_SETTINGS,
      isGenerating: false,
      progress: 0,

      // ======================================================================
      // Image Management Actions
      // ======================================================================

      addImages: (paths: string[]) => {
        const newImages: ImageItem[] = paths.map((path) => ({
          id: generateImageId(),
          path,
          name: extractFileName(path),
          // info will be populated after calling getImageInfo
        }));

        set((state) => ({
          images: [...state.images, ...newImages],
        }));
      },

      removeImage: (id: string) => {
        set((state) => ({
          images: state.images.filter((img) => img.id !== id),
        }));
      },

      clearImages: () => {
        set({ images: [] });
      },

      reorderImages: (startIndex: number, endIndex: number) => {
        const { images } = get();

        if (
          startIndex < 0 ||
          startIndex >= images.length ||
          endIndex < 0 ||
          endIndex >= images.length
        ) {
          return;
        }

        const result = Array.from(images);
        const [removed] = result.splice(startIndex, 1);
        result.splice(endIndex, 0, removed);

        set({ images: result });
      },

      updateImageInfo: (pathOrId: string, info: ImageItem['info']) => {
        set((state) => ({
          images: state.images.map((img) =>
            img.id === pathOrId || img.path === pathOrId
              ? { ...img, info }
              : img
          ),
        }));
      },

      // ======================================================================
      // Settings Management Actions
      // ======================================================================

      updateSettings: (newSettings: Partial<PdfSettings>) => {
        set((state) => ({
          settings: {
            ...state.settings,
            ...newSettings,
          },
        }));
      },

      resetSettings: () => {
        set({ settings: DEFAULT_PDF_SETTINGS });
      },

      // ======================================================================
      // UI State Actions
      // ======================================================================

      setIsGenerating: (isGenerating: boolean) => {
        set({ isGenerating });
        // Reset progress when starting/stopping generation
        if (!isGenerating) {
          set({ progress: 0 });
        }
      },

      setProgress: (progress: number) => {
        set({ progress: Math.min(Math.max(progress, 0), 100) });
      },
    }),
    {
      name: 'image-pdf-storage',
      // Only persist settings, not images or UI state
      partialize: (state) => ({
        settings: state.settings,
      }),
    }
  )
);

// ============================================================================
// Selectors (for optimized re-renders)
// ============================================================================

// Select only images
export const useImages = () => useAppStore((state) => state.images);

// Select only settings
export const useSettings = () => useAppStore((state) => state.settings);

// Select only UI state
export const useGenerationState = () =>
  useAppStore((state) => ({
    isGenerating: state.isGenerating,
    progress: state.progress,
  }));

// Select image count
export const useImageCount = () =>
  useAppStore((state) => state.images.length);

// Check if can generate (has images and not currently generating)
export const useCanGenerate = () =>
  useAppStore(
    (state) => state.images.length > 0 && !state.isGenerating
  );
