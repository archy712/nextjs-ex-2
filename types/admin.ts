export interface AdminLoginState {
  status: "idle" | "error"
  message?: string
}

export type AdminSessionVerification = { valid: true; expiresAt: number } | { valid: false }
