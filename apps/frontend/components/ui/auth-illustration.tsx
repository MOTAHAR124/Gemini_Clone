'use client';

import Image from 'next/image';
import { useRef } from 'react';

const MAX_TILT = 20;
const PERSPECTIVE = 300;
const HOVER_SCALE = 1.1;
const EASING = 'cubic-bezier(.03,.98,.52,.99)';
const SPEED_MS = 400;

export function AuthIllustration({ alt }: { alt: string }) {
  const tiltRef = useRef<HTMLDivElement>(null);

  return (
    <div className="hidden flex-1 justify-center md:flex">
      <div
        ref={tiltRef}
        className="w-79 will-change-transform transform-3d"
        style={{
          transform: `perspective(${PERSPECTIVE}px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`,
          transition: `transform ${SPEED_MS}ms ${EASING}`,
        }}
        onMouseMove={(event) => {
          const element = tiltRef.current;
          if (!element) return;

          const rect = element.getBoundingClientRect();
          const percentX = (event.clientX - rect.left) / rect.width;
          const percentY = (event.clientY - rect.top) / rect.height;

          // Match tilt.jquery formulas:
          // rotateY <- max/2 - percentageX * max
          // rotateX <- percentageY * max - max/2
          const rotateY = MAX_TILT / 2 - percentX * MAX_TILT;
          const rotateX = percentY * MAX_TILT - MAX_TILT / 2;

          element.style.transition = 'transform 80ms linear';
          element.style.transform = `perspective(${PERSPECTIVE}px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) scale3d(${HOVER_SCALE}, ${HOVER_SCALE}, ${HOVER_SCALE})`;
        }}
        onMouseLeave={() => {
          const element = tiltRef.current;
          if (!element) return;

          element.style.transition = `transform ${SPEED_MS}ms ${EASING}`;
          element.style.transform = `perspective(${PERSPECTIVE}px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;
        }}
      >
        <Image
          src="/login-v1/img-01.png"
          alt={alt}
          width={316}
          height={260}
          priority
          className="h-auto w-79 object-contain"
        />
      </div>
    </div>
  );
}

