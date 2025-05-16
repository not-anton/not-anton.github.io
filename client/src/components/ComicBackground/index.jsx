import { Box } from '@chakra-ui/react';
import { useMemo, useState, useEffect, useRef } from 'react';

const PALETTE = ['#00e0ff', '#ffe600', '#ff2e63', '#a259f7', '#aaff00'];
const SHAPE_TYPES = ['circle', 'triangle', 'diamond', 'rectangle'];

function randomBetween(a, b) {
  return Math.random() * (b - a) + a;
}

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function getMainBox() {
  const screenW = window.innerWidth;
  const screenH = window.innerHeight;
  // Match the card's offset and size (mt: 120px/140px, maxW: 400px, h: ~340px)
  const cardW = 400;
  const cardH = 340;
  const cardY = screenW < 768 ? 120 : 140; // base: 120px, md: 140px
  return {
    x: screenW / 2 - cardW / 2,
    y: cardY,
    w: cardW,
    h: cardH,
  };
}

function generateShapes(mainBox = getMainBox(), count = 6) {
  const screenW = window.innerWidth;
  const screenH = window.innerHeight;
  const margin = 32;
  const boxPx = mainBox;
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
  const shapeCount = screenW < 600 ? 3 : count;
  for (let i = 0; i < shapeCount * 2; ++i) { // generate extra for fallback
    const type = pick(SHAPE_TYPES);
    const color = pick(PALETTE);
    let size = screenW < 600 ? randomBetween(50, 90) : randomBetween(70, 160);
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

function isShapeOverlappingMain(shape, mainBox, titleCard, pad = 32) {
  const { x, y, size, type } = shape;
  let w = type === 'rectangle' ? size : size;
  let h = type === 'rectangle' ? size / 2 : size;
  // Main box
  if (
    x + w > mainBox.x - pad &&
    x < mainBox.x + mainBox.w + pad &&
    y + h > mainBox.y - pad &&
    y < mainBox.y + mainBox.h + pad
  ) return true;
  // Title card
  if (
    x + w > titleCard.x - pad &&
    x < titleCard.x + titleCard.w + pad &&
    y + h > titleCard.y - pad &&
    y < titleCard.y + titleCard.h + pad
  ) return true;
  return false;
}

export default function ComicBackground() {
  const [shapes, setShapes] = useState(() => generateShapes());
  const lastDims = useRef({ w: window.innerWidth, h: window.innerHeight });

  useEffect(() => {
    function handleResize() {
      const w = window.innerWidth;
      const h = window.innerHeight;
      const { w: lastW, h: lastH } = lastDims.current;
      const significant = Math.abs(w - lastW) > lastW * 0.1 || Math.abs(h - lastH) > lastH * 0.1;
      // Get exclusion zones
      const mainBox = getMainBox();
      const titlePad = 24;
      const titleCard = { x: w / 2 - 175, y: 0 + titlePad, w: 350, h: 80 + titlePad * 2 };
      // Check if any shape overlaps
      const overlaps = shapes.some(s => isShapeOverlappingMain(s, mainBox, titleCard, 32));
      if (significant || overlaps) {
        setShapes(generateShapes());
        lastDims.current = { w, h };
      }
    }
    let timeout;
    function debounced() {
      clearTimeout(timeout);
      timeout = setTimeout(handleResize, 120);
    }
    window.addEventListener('resize', debounced);
    return () => window.removeEventListener('resize', debounced);
  }, [shapes]);

  return (
    <Box position="absolute" top={0} left={0} w="100vw" h="100%" zIndex={0} pointerEvents="none">
      {/* Halftone overlay */}
      <svg width="100%" height="100%" style={{ position: 'absolute', top: 0, left: 0, zIndex: 0, opacity: 0.12 }} aria-hidden="true">
        <defs>
          <pattern id="halftone" width="18" height="18" patternUnits="userSpaceOnUse">
            <circle cx="9" cy="9" r="3" fill="#000" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#halftone)" />
      </svg>
      {/* Action lines */}
      <svg width="100%" height="100%" style={{ position: 'absolute', top: 0, left: 0, zIndex: 0, opacity: 0.10 }} aria-hidden="true">
        {[...Array(12)].map((_, i) => (
          <line
            key={i}
            x1="50%" y1="0%"
            x2={`${50 + 40 * Math.cos((i/12)*2*Math.PI)}%`}
            y2={`${10 + 80 * Math.sin((i/12)*2*Math.PI)}%`}
            stroke="#ff2e63"
            strokeWidth="6"
            strokeLinecap="round"
            opacity="0.5"
          />
        ))}
      </svg>
      {shapes.map((shape, i) => {
        const { type, color, x, y, size, rotation } = shape;
        const border = 12;
        if (type === 'circle') {
          return (
            <svg key={i} width={size} height={size} style={{ position: 'absolute', left: x, top: y, transform: `rotate(${rotation}deg)` }} aria-hidden="true">
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
            <svg key={i} width={size} height={size} style={{ position: 'absolute', left: x, top: y, transform: `rotate(${rotation}deg)` }} aria-hidden="true">
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
            <svg key={i} width={size} height={size/2} style={{ position: 'absolute', left: x, top: y, transform: `rotate(${rotation}deg)` }} aria-hidden="true">
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
            <svg key={i} width={size} height={size} style={{ position: 'absolute', left: x, top: y, transform: `rotate(${rotation}deg)` }} aria-hidden="true">
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
