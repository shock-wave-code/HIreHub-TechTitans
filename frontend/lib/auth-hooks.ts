"use client"

import { useUser, useAuth } from "@clerk/nextjs"
import { getUserRole } from "./clerk-utils"

export function useAuthUser() {
  const { user, isLoaded } = useUser()
  const { signOut } = useAuth()

  if (!isLoaded) {
    return {
      user: null,
      isLoading: true,
      role: null,
      logout: signOut,
    }
  }

  if (!user) {
    return {
      user: null,
      isLoading: false,
      role: null,
      logout: signOut,
    }
  }

  return {
    user: {
      id: user.id,
      email: user.emailAddresses[0]?.emailAddress || "",
      name: user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : user.username || "User",
    },
    isLoading: false,
    role: 'role',
    logout: signOut,
  }
}
