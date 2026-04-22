import { create } from "zustand";

interface ParkingState {
  /** Real-time occupancy counter */
  currentOccupancy: number;
  totalCapacity: number;
  setOccupancy: (count: number) => void;
  incrementOccupancy: () => void;
  decrementOccupancy: () => void;
}

export const useParkingStore = create<ParkingState>()((set) => ({
  currentOccupancy: 183,
  totalCapacity: 500,
  setOccupancy: (count) => set({ currentOccupancy: count }),
  incrementOccupancy: () =>
    set((state) => ({ currentOccupancy: state.currentOccupancy + 1 })),
  decrementOccupancy: () =>
    set((state) => ({
      currentOccupancy: Math.max(0, state.currentOccupancy - 1),
    })),
}));
