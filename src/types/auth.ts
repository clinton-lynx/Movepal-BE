export interface User {
  id: string
  name: string
  email: string
  pushToken?: string
  createdAt: string
}

export interface AuthPayload {
  id: string
  email: string
}
