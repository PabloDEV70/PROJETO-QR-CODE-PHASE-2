import { HttpException, HttpStatus } from '@nestjs/common';

export class DatabaseException extends HttpException {
  constructor(message: string, details?: any) {
    super(
      {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'A database operation failed.',
        error: 'Database Error',
        details: details,
      },
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }
}
