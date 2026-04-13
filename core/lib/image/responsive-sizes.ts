interface GridSizesConfig {
  columns: number;
  gapPx?: number;
  containerMaxWidth?: string;
}

// eslint-disable-next-line valid-jsdoc
/**
 * Computes the optimal `sizes` prop for next/image based on grid column count.
 * When columns change (e.g. via a future grid-size selector), the browser
 * automatically picks the right resolution from the srcset.
 */
export const getGridImageSizes = ({
  columns,
  gapPx = 0,
  containerMaxWidth,
}: GridSizesConfig): string => {
  const gapTotal = gapPx * (columns - 1);
  const colCalc =
    gapTotal > 0 ? `calc((100vw - ${gapTotal}px) / ${columns})` : `${(100 / columns).toFixed(2)}vw`;

  if (containerMaxWidth) {
    const maxCalc =
      gapTotal > 0
        ? `calc((${containerMaxWidth} - ${gapTotal}px) / ${columns})`
        : `calc(${containerMaxWidth} / ${columns})`;

    return `(min-width: ${containerMaxWidth}) ${maxCalc}, ${colCalc}`;
  }

  return colCalc;
};

/**
 * Responsive sizes for the intrinsic auto-fill grid.
 * Grid uses min(50%, 220px) minimum: 6 cols ~1320px+, 5 cols ~1100px,
 * 4 cols ~880px, 3 cols ~660px, 2 cols below. Locked at 6 from 1440px.
 */
export const MINIMAL_GRID_IMAGE_SIZES =
  '(min-width: 1320px) 16.67vw, (min-width: 1100px) 20vw, (min-width: 880px) 25vw, (min-width: 660px) 33.33vw, 50vw';
