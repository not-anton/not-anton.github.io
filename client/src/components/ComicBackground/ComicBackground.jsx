import { Box } from '@chakra-ui/react';
import { useMemo } from 'react';

const PALETTE = ['#00e0ff', '#ffe600', '#ff2e63', '#a259f7', '#aaff00'];
const SHAPE_TYPES = ['circle', 'triangle', 'diamond', 'rectangle'];

function randomBetween(a, b) {
  return Math.random() * (b - a) + a;
}

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generateShapes(mainBox = { x: 0.5, y: 0.5, w: 350, h: 340 }, count = 6) {
  const screenW = window.innerWidth;
  const screenH = window.innerHeight;
  const isMobile = screenW < 600;
  const margin = 32;
  const boxPx = {
    x: screenW / 2 - mainBox.w / 2,
    y: screenH / 2 - mainBox.h / 2,
    w: mainBox.w,
    h: mainBox.h,
  };
  // Title card area (centered at top)
  const titlePad = 24;
  const titleCard = {
    x: screenW / 2 - 175,
    y: 0 + titlePad,
    w: 350,
    h: 80 + titlePad * 2,
  };
  // 1. Pre-generate all shapes (random type, size, rotation)
  let candidates = [];
  const shapeCount = isMobile ? 3 : count;
  for (let i = 0; i < shapeCount * 2; ++i) { // generate extra for fallback
    const type = pick(SHAPE_TYPES);
    const color = pick(PALETTE);
    let size = isMobile ? randomBetween(50, 90) : randomBetween(70, 160);
    let rotation = randomBetween(-15, 15);
    candidates.push({ type, color, size, rotation });
  }
  // 2. Sort by size (largest first)
  candidates.sort((a, b) => (b.size || 0) - (a.size || 0));
  // 3. Greedily place shapes
  const placed = [];
  for (const shape of candidates) {
    let placedShape = null;
    for (let attempt = 0; attempt < 30; ++attempt) {
      let size = shape.size;
      let w = shape.type === 'rectangle' ? size : size;
      let h = shape.type === 'rectangle' ? size / 2 : size;
      let x = randomBetween(margin, screenW - margin - w);
      let y = randomBetween(margin, screenH - margin - h);
      // Avoid main box
      const pad = 32;
      if (
        x + w > boxPx.x - pad &&
        x < boxPx.x + boxPx.w + pad &&
        y + h > boxPx.y - pad &&
        y < boxPx.y + boxPx.h + pad
      ) {
        // If not enough below, force one below main box for first shape
        if (placed.length === 0) {
          y = boxPx.y + boxPx.h + 32;
          if (y + h > screenH - margin) y = screenH - margin - h;
        } else {
          continue;
        }
      }
      // Avoid title card
      if (
        x + w > titleCard.x - pad &&
        x < titleCard.x + titleCard.w + pad &&
        y + h > titleCard.y - pad &&
        y < titleCard.y + titleCard.h + pad
      ) {
        continue;
      }
      // Check overlap with already placed shapes
      let overlaps = false;
      for (const s of placed) {
        const sx = s.x, sy = s.y, sw = s.type === 'rectangle' ? s.size : s.size, sh = s.type === 'rectangle' ? s.size / 2 : s.size;
        if (
          x < sx + sw &&
          x + w > sx &&
          y < sy + sh &&
          y + h > sy
        ) {
          overlaps = true;
          break;
        }
      }
      if (!overlaps) {
        placedShape = { ...shape, x, y };
        break;
      }
    }
    if (placedShape) {
      placed.push(placedShape);
      if (placed.length >= shapeCount) break;
    }
  }
  return placed;
}

export default function ComicBackground() {
  // Memoize shapes for this render
  const shapes = useMemo(() => generateShapes(), []);
  return (
    <Box position="fixed" top={0} left={0} w="100vw" h="100vh" zIndex={0} pointerEvents="none">
      {shapes.map((shape, i) => {
        const { type, color, x, y, size, rotation } = shape;
        const border = 12;
        if (type === 'circle') {
          return (
            <svg key={i} width={size} height={size} style={{ position: 'absolute', left: x, top: y, transform: `rotate(${rotation}deg)` }}>
              <circle
                cx={size/2}
                cy={size/2}
                r={size/2 - border/2}
                fill={color}
                stroke="#fff"
                strokeWidth={border}
              />
            </svg>
          );
        }
        if (type === 'triangle') {
          // Equilateral triangle
          const points = [
            [size/2, border/2],
            [size - border/2, size - border/2],
            [border/2, size - border/2],
          ];
          const pointsStr = points.map(p => p.join(",")).join(" ");
          return (
            <svg key={i} width={size} height={size} style={{ position: 'absolute', left: x, top: y, transform: `rotate(${rotation}deg)` }}>
              <polygon
                points={pointsStr}
                fill={color}
                stroke="#fff"
                strokeWidth={border}
                strokeLinejoin="round"
              />
            </svg>
          );
        }
        if (type === 'rectangle') {
          const rx = size * 0.08;
          return (
            <svg key={i} width={size} height={size/2} style={{ position: 'absolute', left: x, top: y, transform: `rotate(${rotation}deg)` }}>
              <rect
                x={border/2}
                y={border/4}
                width={size - border}
                height={size/2 - border/2}
                rx={rx}
                ry={rx}
                fill={color}
                stroke="#fff"
                strokeWidth={border}
              />
            </svg>
          );
        }
        if (type === 'diamond') {
          // Diamond (rhombus)
          const points = [
            [size/2, border/2],
            [size - border/2, size/2],
            [size/2, size - border/2],
            [border/2, size/2],
          ];
          const pointsStr = points.map(p => p.join(",")).join(" ");
          return (
            <svg key={i} width={size} height={size} style={{ position: 'absolute', left: x, top: y, transform: `rotate(${rotation}deg)` }}>
              <polygon
                points={pointsStr}
                fill={color}
                stroke="#fff"
                strokeWidth={border}
                strokeLinejoin="round"
              />
            </svg>
          );
        }
        return null;
      })}
    </Box>
  );
}
