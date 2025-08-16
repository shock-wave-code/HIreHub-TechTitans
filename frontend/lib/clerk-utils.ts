import { currentUser } from "@clerk/nextjs/server"

export async function getCurrentUser() {
  const user = await currentUser()
  if (!user) return null

  return {
    id: user.id,
    email: user.emailAddresses[0]?.emailAddress || "",
    name: user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : user.username || "User",
    role: (user.publicMetadata?.role as "student" | "faculty") || "student",
  }
}

export function getUserRole(user: any): "student" | "faculty" {
  return (user?.publicMetadata?.role as "student" | "faculty") || "student"
}
