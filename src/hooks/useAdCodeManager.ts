import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AdCodeStore {
  editedCodes: Record<string, string>;
  setAdCode: (key: string, code: string) => void;
  getAdCode: (key: string, fallbackCode: string) => string;
  clearAdCode: (key: string) => void;
  clearAllCodes: () => void;
}

export const useAdCodeManager = create<AdCodeStore>()(
  persist(
    (set, get) => ({
      editedCodes: {},
      
      setAdCode: (key: string, code: string) => {
        set((state) => ({
          editedCodes: { ...state.editedCodes, [key]: code }
        }));
      },
      
      getAdCode: (key: string, fallbackCode: string) => {
        const state = get();
        return state.editedCodes[key] || fallbackCode;
      },
      
      clearAdCode: (key: string) => {
        set((state) => {
          const newEditedCodes = { ...state.editedCodes };
          delete newEditedCodes[key];
          return { editedCodes: newEditedCodes };
        });
      },
      
      clearAllCodes: () => {
        set({ editedCodes: {} });
      }
    }),
    {
      name: 'ad-code-storage'
    }
  )
);