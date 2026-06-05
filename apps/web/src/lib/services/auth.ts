import { api, setTokens, clearTokens } from '@/lib/api'
import type { User, AuthSession, LoginInput, RegisterInput } from '@/lib/types'

export const authService = {
  login: async (input: LoginInput): Promise<AuthSession> => {
    const result = await api.post<{ session: AuthSession }>('/auth/login', input)
    setTokens(result.session.accessToken, result.session.refreshToken)
    return result.session
  },

  register: async (input: RegisterInput): Promise<AuthSession> => {
    const result = await api.post<{ session: AuthSession }>('/auth/register', input)
    setTokens(result.session.accessToken, result.session.refreshToken)
    return result.session
  },

  getMe: () =>
    api.get<User>('/auth/me'),

  logout: () => {
    clearTokens()
  },
}
