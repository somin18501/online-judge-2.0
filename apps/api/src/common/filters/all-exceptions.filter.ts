import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { ZodError } from 'zod';
import { Prisma } from '@prisma/client';

interface StructuredError {
  statusCode: number;
  message: string | string[];
  error: string;
  code?: string;
  path: string;
  timestamp: string;
}

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const body = this.toBody(exception, request.url);

    if (body.statusCode >= 500) {
      this.logger.error(
        `[${request.method}] ${request.url} -> ${body.statusCode} ${body.error}`,
        exception instanceof Error ? exception.stack : undefined,
      );
    } else {
      this.logger.warn(
        `[${request.method}] ${request.url} -> ${body.statusCode} ${body.error}`,
      );
    }

    response.status(body.statusCode).json(body);
  }

  private toBody(exception: unknown, path: string): StructuredError {
    const timestamp = new Date().toISOString();

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const res = exception.getResponse();
      const { message, error, code } = this.normalizeHttpResponse(res, exception.name);
      return { statusCode: status, message, error, code, path, timestamp };
    }

    if (exception instanceof ZodError) {
      return {
        statusCode: HttpStatus.BAD_REQUEST,
        message: exception.errors.map((e) => `${e.path.join('.')}: ${e.message}`),
        error: 'Validation failed',
        code: 'VALIDATION_FAILED',
        path,
        timestamp,
      };
    }

    if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      return this.fromPrismaError(exception, path, timestamp);
    }

    return {
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Internal server error',
      error: 'InternalServerError',
      code: 'INTERNAL_ERROR',
      path,
      timestamp,
    };
  }

  private normalizeHttpResponse(
    res: unknown,
    fallbackError: string,
  ): { message: string | string[]; error: string; code?: string } {
    if (typeof res === 'string') {
      return { message: res, error: fallbackError };
    }
    if (res && typeof res === 'object') {
      const r = res as { message?: unknown; error?: unknown; code?: unknown };
      const message =
        Array.isArray(r.message) || typeof r.message === 'string'
          ? (r.message as string | string[])
          : fallbackError;
      const error = typeof r.error === 'string' ? r.error : fallbackError;
      const code = typeof r.code === 'string' ? r.code : undefined;
      return { message, error, code };
    }
    return { message: fallbackError, error: fallbackError };
  }

  private fromPrismaError(
    error: Prisma.PrismaClientKnownRequestError,
    path: string,
    timestamp: string,
  ): StructuredError {
    switch (error.code) {
      case 'P2002':
        return {
          statusCode: HttpStatus.CONFLICT,
          message: `A record with these unique fields already exists: ${JSON.stringify(error.meta?.target)}`,
          error: 'Conflict',
          code: 'UNIQUE_CONSTRAINT',
          path,
          timestamp,
        };
      case 'P2025':
        return {
          statusCode: HttpStatus.NOT_FOUND,
          message: 'Resource not found',
          error: 'NotFound',
          code: 'NOT_FOUND',
          path,
          timestamp,
        };
      default:
        return {
          statusCode: HttpStatus.BAD_REQUEST,
          message: `Database error: ${error.code}`,
          error: 'BadRequest',
          code: 'DB_ERROR',
          path,
          timestamp,
        };
    }
  }
}
