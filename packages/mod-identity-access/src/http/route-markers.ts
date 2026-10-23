// Reads the route marker of a handler (D section 7.2, T-ACC-02). PermissionGuard uses it on
// every request, and the route audit uses it to list handlers that have no marker at all.
import type { ExecutionContext, INestApplicationContext, Type } from '@nestjs/common';
import { PATH_METADATA } from '@nestjs/common/constants.js';
import { DiscoveryService, MetadataScanner, ModulesContainer, Reflector } from '@nestjs/core';
import type { PermissionCode } from '@hms/contracts';
import { ALLOW_WITHOUT_TENANT_KEY, PUBLIC_KEY, REQUIRED_PERMISSIONS_KEY } from './decorators.js';

export type RouteMarker =
  | { kind: 'public' }
  | { kind: 'without-tenant' }
  | { kind: 'permissions'; codes: PermissionCode[] }
  | { kind: 'none' };

/** A route handler, typed as Nest hands it to guards. */
type Handler = ReturnType<ExecutionContext['getHandler']>;

export function readRouteMarker(
  reflector: Reflector,
  handler: Handler,
  controller: Type,
): RouteMarker {
  const targets = [handler, controller];
  if (reflector.getAllAndOverride<boolean>(PUBLIC_KEY, targets) === true) return { kind: 'public' };
  if (reflector.getAllAndOverride<boolean>(ALLOW_WITHOUT_TENANT_KEY, targets) === true) {
    return { kind: 'without-tenant' };
  }
  const codes = reflector.getAllAndMerge<PermissionCode[]>(REQUIRED_PERMISSIONS_KEY, targets);
  return codes.length > 0 ? { kind: 'permissions', codes: [...new Set(codes)] } : { kind: 'none' };
}

/** `Controller.handler` of every route in the app that carries no marker (default deny check). */
export function findRoutesWithoutMarker(app: INestApplicationContext): string[] {
  const reflector = app.get(Reflector);
  const scanner = new MetadataScanner();
  const discovery = new DiscoveryService(app.get(ModulesContainer));
  const unmarked: string[] = [];
  for (const wrapper of discovery.getControllers()) {
    const controller = wrapper.metatype as Type | null;
    if (!controller) continue;
    const prototype = controller.prototype as Record<string, unknown>;
    for (const name of scanner.getAllMethodNames(prototype)) {
      const handler = prototype[name];
      // Only methods with a route decorator (@Get, @Post, ...) are routes.
      if (
        typeof handler !== 'function' ||
        Reflect.getMetadata(PATH_METADATA, handler) === undefined
      ) {
        continue;
      }
      if (readRouteMarker(reflector, handler, controller).kind === 'none') {
        unmarked.push(`${controller.name}.${name}`);
      }
    }
  }
  return unmarked;
}
