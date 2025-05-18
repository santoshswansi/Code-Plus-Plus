"use client";
import { create } from "zustand";

const useAuthStore = create((set) => ({
  isLogging: false,
  setIsLogging: (newIsLogging) => set({isLogging: newIsLogging}),

  accessToken: "",
  setAccessToken: (newAccessToken) => set({accessToken: newAccessToken}),

  userId: "",
  setUserId: (newUserId) => set({userId: newUserId}),
  
  name: "",
  setName: (newName) => set({name: newName}),

  email: "",
  setEmail: (newEmail) => set({email: newEmail}),

  setDefault: () => set({
    isLogging: false,
    accessToken: "",
    userId: "",
    name: "",
    email: "",
  })
}));

export default useAuthStore;