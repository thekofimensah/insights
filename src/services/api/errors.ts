export class APIError extends Error {
  constructor(
    message: string,
    public status?: number,
    public code?: string
  ) {
    super(message);
    this.name = 'APIError';
  }
}

export class RateLimitError extends APIError {
  constructor(message = 'Rate limit exceeded. Please try again later.') {
    super(message, 429, 'RATE_LIMIT');
  }
}

export class NetworkError extends APIError {
  constructor(message = 'Network error occurred. Please check your connection.') {
    super(message, 0, 'NETWORK_ERROR');
  }
}