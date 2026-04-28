import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useUserStore = create(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      
      setUser: (userData) => {
        if (userData && userData._id && !userData.id) {
          userData.id = userData._id;
        }
        set({ 
          user: userData, 
          isAuthenticated: !!userData 
        });
      },
      
      logout: () => set({ 
        user: null, 
        isAuthenticated: false 
      }),

      updateProfile: (updates) => set((state) => ({
        user: state.user ? { ...state.user, ...updates } : null
      })),
    }),
    {
      name: 'localdev-user-storage', // persists to localStorage
    }
  )
);

export default useUserStore;
