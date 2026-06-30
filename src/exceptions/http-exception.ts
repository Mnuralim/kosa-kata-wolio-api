export class HttpException extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public errors?: unknown
  ) {
    super(message)
    this.name = 'HttpException'
  }
}
