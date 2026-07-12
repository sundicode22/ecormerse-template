export interface ApiResponse<T> {
  success: boolean
  data: T
  error?: {
    message: string
    code?: string
    details?: unknown
  }
}

export interface ApiPaginatedResponse<T> extends ApiResponse<T> {
  meta: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
}

export type ApiResponseOrError<T> = ApiResponse<T> | {
  success: false
  data?: never
  error: {
    message: string
    code?: string
    details?: unknown
  }
}
