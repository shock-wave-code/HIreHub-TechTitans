"use client"

import { useAuth } from "@clerk/nextjs"

const API_BASE_URL = "http://localhost:3000/api"

interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
}

export function useApiClient() {
  const { getToken } = useAuth()

  const makeRequest = async <T = any>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> => {
    try {
      const token = await getToken()

      const headers: HeadersInit = {
        "Content-Type": "application/json",
        ...options.headers,
      }

      if (token) {
        headers.Authorization = `Bearer ${token}`
      }

      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers,
      })

      const data = await response.json()

      if (response.ok) {
        return { success: true, data }
      } else {
        return { success: false, error: data.error || "Request failed" }
      }
    } catch (error) {
      return { success: false, error: "Network error" }
    }
  }

  const get = <T = any>(endpoint: string) => makeRequest<T>(endpoint)

  const post = <T = any>(endpoint: string, body: any) =>
    makeRequest<T>(endpoint, {
      method: "POST",
      body: JSON.stringify(body),
    })

  const patch = <T = any>(endpoint: string, body: any) =>
    makeRequest<T>(endpoint, {
      method: "PATCH",
      body: JSON.stringify(body),
    })

  const postFormData = <T = any>(endpoint: string, formData: FormData) =>
    makeRequest<T>(endpoint, {
      method: "POST",
      body: formData,
      headers: {}, // Let browser set Content-Type for FormData
    })

  return { get, post, patch, postFormData }
}

// Server-side API utilities
export async function makeServerRequest<T = any>(
  endpoint: string,
  options: RequestInit = {},
  token?: string,
): Promise<ApiResponse<T>> {
  try {
    const headers: HeadersInit = {
      "Content-Type": "application/json",
      ...options.headers,
    }

    if (token) {
      headers.Authorization = `Bearer ${token}`
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    })

    const data = await response.json()

    if (response.ok) {
      return { success: true, data }
    } else {
      return { success: false, error: data.error || "Request failed" }
    }
  } catch (error) {
    return { success: false, error: "Network error" }
  }
}
