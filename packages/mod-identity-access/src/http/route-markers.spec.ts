import { Controller, Get, Module, Post } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Test } from '@nestjs/testing';
import { describe, expect, it } from 'vitest';
import { AllowWithoutTenant, Public, RequirePermission } from './decorators.js';
import { findRoutesWithoutMarker, readRouteMarker } from './route-markers.js';

// Route markers and the default-deny route audit (T-ACC-02, D section 7.2). No database.

@RequirePermission('billing.invoice.issue')
@Controller('invoices')
class InvoiceController {
  @Get()
  list() {
    return [];
  }

  @RequirePermission('billing.payment.record', 'billing.invoice.issue')
  @Post('payments')
  pay() {
    return {};
  }
}

@Controller('mixed')
class MixedController {
  @Public()
  @Get('open')
  open() {
    return {};
  }

  @AllowWithoutTenant()
  @Get('session')
  session() {
    return {};
  }

  @Get('forgotten')
  forgotten() {
    return {};
  }

  // Not a route: helpers without a route decorator are ignored.
  helper() {
    return 1;
  }
}

@Module({ controllers: [InvoiceController, MixedController] })
class MarkersTestModule {}

describe('readRouteMarker', () => {
  const reflector = new Reflector();

  it('adds handler codes to the controller codes, without duplicates', () => {
    const marker = readRouteMarker(reflector, InvoiceController.prototype.pay, InvoiceController);
    expect(marker).toEqual({
      kind: 'permissions',
      codes: ['billing.payment.record', 'billing.invoice.issue'],
    });
  });

  it('applies a controller marker to handlers without their own', () => {
    const marker = readRouteMarker(reflector, InvoiceController.prototype.list, InvoiceController);
    expect(marker).toEqual({ kind: 'permissions', codes: ['billing.invoice.issue'] });
  });

  it('reads the public and without-tenant markers', () => {
    expect(readRouteMarker(reflector, MixedController.prototype.open, MixedController)).toEqual({
      kind: 'public',
    });
    expect(readRouteMarker(reflector, MixedController.prototype.session, MixedController)).toEqual({
      kind: 'without-tenant',
    });
  });

  it('reports a handler with no marker as none', () => {
    const marker = readRouteMarker(reflector, MixedController.prototype.forgotten, MixedController);
    expect(marker).toEqual({ kind: 'none' });
  });
});

describe('findRoutesWithoutMarker', () => {
  it('lists exactly the unmarked routes', async () => {
    const moduleRef = await Test.createTestingModule({ imports: [MarkersTestModule] }).compile();
    expect(findRoutesWithoutMarker(moduleRef)).toEqual(['MixedController.forgotten']);
    await moduleRef.close();
  });
});
