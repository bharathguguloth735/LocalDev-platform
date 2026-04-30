import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useUserStore = create(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isSidebarOpen: false, // UI state (usually not persisted, but we'll see)
      
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
        isAuthenticated: false,
        isSidebarOpen: false
      }),

      setSidebarOpen: (isOpen) => set({ isSidebarOpen: isOpen }),
      toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),

      updateProfile: (updates) => set((state) => ({
        user: state.user ? { ...state.user, ...updates } : null
      })),
    }),
    {
      name: 'localdev-user-storage',
      partialize: (state) => ({ 
        user: state.user, 
        isAuthenticated: state.isAuthenticated 
      }), // Only persist user and auth status
    }
  )
);

export default useUserStore;
