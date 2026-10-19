export class ApiError extends Error {
  readonly statusCode: number

  constructor(statusCode: number, message: string) {
    super(message)
    this.name = 'ApiError'
    this.statusCode = statusCode
  }
}

/** Used when the request never received an HTTP response (offline, DNS failure, abort). */
const NETWORK_ERROR_STATUS = 0

function messageOf(data: unknown, fallback: string): string {
  if (typeof data === 'object' && data !== null && 'message' in data && typeof data.message === 'string' && data.message) {
    return data.message
  }
  return fallback
}

// Every failure leaves the client as an ApiError, so callers handle exactly one error type.
export const http = $fetch.create({
  onRequestError() {
    throw new ApiError(NETWORK_ERROR_STATUS, 'Network error')
  },
  onResponseError({ response }) {
    throw new ApiError(response.status, messageOf(response._data, response.statusText || 'Request failed'))
  },
})
