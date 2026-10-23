'use client';
// A photo that shimmers until it has loaded, then fades in, so image frames never sit as blank
// boxes while pictures stream in. The server HTML shows the photo normally (it works without
// script); after hydration a photo still loading is hidden until its load event. A photo that
// finished before hydration is marked loaded at once, so it is never hidden. Implements: T-WEB-15.
import Image, { type ImageProps } from 'next/image';
import { useEffect, useRef, useState } from 'react';

type LoadState = 'server' | 'loading' | 'loaded';

export function LoadingImage({ className, onLoad, ...props }: ImageProps) {
  const ref = useRef<HTMLImageElement>(null);
  const [state, setState] = useState<LoadState>('server');

  useEffect(() => {
    // The load event may have fired before React attached its handler.
    setState(ref.current?.complete ? 'loaded' : 'loading');
  }, []);

  return (
    <>
      {state === 'loaded' ? null : (
        <span aria-hidden="true" className="skeleton absolute inset-0 rounded-none" />
      )}
      <Image
        ref={ref}
        {...props}
        onLoad={(event) => {
          setState('loaded');
          onLoad?.(event);
        }}
        className={`transition-opacity duration-500 ease-out ${
          state === 'loading' ? 'opacity-0' : 'opacity-100'
        } ${className ?? ''}`}
      />
    </>
  );
}
