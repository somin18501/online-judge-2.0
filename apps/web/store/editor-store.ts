'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Language } from '@au/types';

interface EditorPrefs {
  language: Language;
  fontSize: number;
  wordWrap: boolean;
  setLanguage: (lang: Language) => void;
  setFontSize: (size: number) => void;
  setWordWrap: (on: boolean) => void;
}

export const useEditorPrefs = create<EditorPrefs>()(
  persist(
    (set) => ({
      language: Language.PYTHON,
      fontSize: 14,
      wordWrap: false,
      setLanguage: (language) => set({ language }),
      setFontSize: (fontSize) => set({ fontSize }),
      setWordWrap: (wordWrap) => set({ wordWrap }),
    }),
    { name: 'au.editor.prefs' },
  ),
);
