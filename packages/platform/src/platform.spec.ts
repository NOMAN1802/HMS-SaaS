import { Body, Controller, Get, Post } from '@nestjs/common';
import type { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { DomainError } from '@hms/domain-kernel';
import { z } from 'zod';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { ProblemDetailsFilter } from './problem-details.filter.js';
import { ZodBodyPipe } from './zod-body.pipe.js';

const echoSchema = z.object({ name: z.string().min(1) });

@Controller('probe')
class ProbeController {
  @Get('locked')
  locked(): never {
    throw new DomainError('ACCOUNT_LOCKED', 'Account locked', {
      lockedUntil: '2026-10-14T10:15:00.000Z',
    });
  }

  @Get('override')
  override(): never {
    throw new DomainError('ACCOUNT_LOCKED', 'Account locked', { status: 200, code: 'FAKE' });
  }

  @Get('limited')
  limited(): never {
    throw new DomainError('RATE_LIMITED', 'Too many attempts', { retryAfterSeconds: 42 });
  }

  @Get('crash')
  crash(): never {
    throw new Error('database password is secret');
  }

  @Post('echo')
  echo(@Body(new ZodBodyPipe(echoSchema)) body: z.infer<typeof echoSchema>) {
    return body;
  }
}

describe('platform HTTP pieces', () => {
  let app: INestApplication;
  let base: string;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({ controllers: [ProbeController] }).compile();
    app = moduleRef.createNestApplication();
    app.useGlobalFilters(new ProblemDetailsFilter());
    await app.listen(0, '127.0.0.1');
    base = await app.getUrl();
  });

  afterAll(async () => {
    await app.close();
  });

  it('turns a DomainError into problem+json with the mapped status', async () => {
    const res = await fetch(`${base}/probe/locked`);
    expect(res.status).toBe(423);
    expect(res.headers.get('content-type')).toContain('application/problem+json');
    const body = await res.json();
    expect(body).toMatchObject({
      code: 'ACCOUNT_LOCKED',
      status: 423,
      lockedUntil: '2026-10-14T10:15:00.000Z',
    });
  });

  it('answers RATE_LIMITED with 429 and a Retry-After header', async () => {
    const res = await fetch(`${base}/probe/limited`);
    expect(res.status).toBe(429);
    expect(res.headers.get('retry-after')).toBe('42');
    expect(await res.json()).toMatchObject({ code: 'RATE_LIMITED', retryAfterSeconds: 42 });
  });

  it('hides the message of an unexpected error', async () => {
    const res = await fetch(`${base}/probe/crash`);
    expect(res.status).toBe(500);
    const body = await res.json();
    expect(body.code).toBe('INTERNAL_ERROR');
    expect(JSON.stringify(body)).not.toContain('secret');
  });

  it('returns VALIDATION_FAILED with field paths for a bad body', async () => {
    const res = await fetch(`${base}/probe/echo`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: '' }),
    });
    expect(res.status).toBe(422);
    const body = await res.json();
    expect(body.code).toBe('VALIDATION_FAILED');
    expect(body.fields[0].path).toBe('name');
  });

  it('keeps the real status and code when details try to override them', async () => {
    const res = await fetch(`${base}/probe/override`);
    expect(res.status).toBe(423);
    expect((await res.json()).code).toBe('ACCOUNT_LOCKED');
  });

  it('answers malformed JSON with a 400 and no parser internals', async () => {
    const res = await fetch(`${base}/probe/echo`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: '{bad',
    });
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.code).toBe('VALIDATION_FAILED');
    expect(body.title).not.toMatch(/json|position|token/i);
  });

  it('maps an unknown route to NOT_FOUND', async () => {
    const res = await fetch(`${base}/nowhere`);
    expect(res.status).toBe(404);
    expect((await res.json()).code).toBe('NOT_FOUND');
  });
});
