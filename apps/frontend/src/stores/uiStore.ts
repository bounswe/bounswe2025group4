import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer'; // Optional: for easier immutable updates

// Define the shape of a notification
interface Notification {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning'; // Example types
  duration?: number; // Optional duration in ms
}

// Define the state structure
interface UIState {
  notifications: Notification[];
  isSidebarOpen: boolean;
  isNotificationsPanelOpen: boolean;
  // Add other UI flags as needed
}

// Define the actions
interface UIActions {
  addNotification: (notification: Omit<Notification, 'id'>) => void;
  removeNotification: (id: string) => void;
  toggleSidebar: () => void;
  setSidebarOpen: (isOpen: boolean) => void;
  toggleNotificationsPanel: () => void;
  setNotificationsPanelOpen: (isOpen: boolean) => void;
  // Add other actions as needed
}

// Create the store using immer middleware for easier state mutations
export const useUIStore = create<UIState & UIActions>()(
  immer((set) => ({
    // Initial State
    notifications: [],
    isSidebarOpen: true, // Example initial state
    isNotificationsPanelOpen: false,

    // Actions
    addNotification: (notificationData) => {
      const id = Date.now().toString(); // Simple unique ID generation
      set((state) => {
        state.notifications.push({ ...notificationData, id });
      });
      // Optional: Auto-remove notification after duration
      if (notificationData.duration) {
        setTimeout(() => {
          set((state) => {
            state.notifications = state.notifications.filter(
              (n: Notification) => n.id !== id
            );
          });
        }, notificationData.duration);
      }
    },
    removeNotification: (id) => {
      set((state) => {
        state.notifications = state.notifications.filter(
          (n: Notification) => n.id !== id
        );
      });
    },
    toggleSidebar: () => {
      set((state) => {
        state.isSidebarOpen = !state.isSidebarOpen;
      });
    },
    setSidebarOpen: (isOpen) => {
      set((state) => {
        state.isSidebarOpen = isOpen;
      });
    },
    toggleNotificationsPanel: () => {
      set((state) => {
        state.isNotificationsPanelOpen = !state.isNotificationsPanelOpen;
      });
    },
    setNotificationsPanelOpen: (isOpen) => {
      set((state) => {
        state.isNotificationsPanelOpen = isOpen;
      });
    },
  }))
);

// Example basic selectors (optional, but can be useful)
export const selectNotifications = (state: UIState) => state.notifications;
export const selectIsSidebarOpen = (state: UIState) => state.isSidebarOpen;
