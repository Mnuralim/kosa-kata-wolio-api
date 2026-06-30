import { HttpException } from './http-exception'

export class NotFoundException extends HttpException {
  constructor(resource = 'Data') {
    super(404, `${resource} tidak ditemukan`)
  }
}

export class UnauthorizedException extends HttpException {
  constructor(message = 'Tidak punya akses. Silakan login ulang') {
    super(401, message)
  }
}

export class ForbiddenException extends HttpException {
  constructor(message = 'Tidak punya akses') {
    super(403, message)
  }
}

export class BadRequestException extends HttpException {
  constructor(message: string, errors?: unknown) {
    super(400, message, errors)
  }
}

export class ConflictException extends HttpException {
  constructor(message: string) {
    super(409, message)
  }
}
