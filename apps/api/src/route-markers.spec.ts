import { Test } from '@nestjs/testing';
import { findRoutesWithoutMarker } from '@hms/mod-identity-access';
import { describe, expect, it } from 'vitest';
import { AppModule } from './app.module.js';

// Default deny, checked over the real API (T-ACC-02, D section 7.2): every route must carry
// @Public, @AllowWithoutTenant or @RequirePermission. The guard would refuse an unmarked route
// anyway; this test makes the mistake visible before it ships. Compiling does not connect to
// the database.
describe('API route markers', () => {
  it('has a marker on every route', async () => {
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
    expect(findRoutesWithoutMarker(moduleRef)).toEqual([]);
    await moduleRef.close();
  });
});
