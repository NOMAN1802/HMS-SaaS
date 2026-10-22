// Loading placeholders for the parts that render in the browser (they read the URL): the booking
// wizard and the site search. Shaped like the real layout so nothing jumps when it arrives; the
// rest of every page is static HTML and needs none. Implements: T-WEB-15.
import { Skeleton } from '@hms/ui';
import { LoadingRegion } from './loading-region';

/** The booking wizard before its script runs: steps, heading, fields, buttons. */
export function BookingSkeleton() {
  return (
    <LoadingRegion className="flex flex-col gap-6">
      <div className="grid grid-cols-4 gap-2">
        {Array.from({ length: 4 }, (_, index) => (
          <Skeleton key={index} className="h-10" />
        ))}
      </div>
      <Skeleton className="h-8 w-1/2" />
      <div className="grid gap-4 md:grid-cols-2">
        <Skeleton className="h-16" />
        <Skeleton className="h-16" />
      </div>
      <Skeleton className="h-11 w-40" />
    </LoadingRegion>
  );
}

/** Site search before its script runs: the search box and a few result rows. */
export function SearchSkeleton() {
  return (
    <LoadingRegion className="flex flex-col gap-6">
      <Skeleton className="h-12 w-full max-w-2xl" />
      <Skeleton className="h-5 w-48" />
      <div className="grid gap-3 md:grid-cols-2">
        {Array.from({ length: 4 }, (_, index) => (
          <Skeleton key={index} className="h-16" />
        ))}
      </div>
    </LoadingRegion>
  );
}
