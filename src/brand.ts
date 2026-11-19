import { defineBrand } from './lib/brand-type';

export const brand = defineBrand({
  name: 'DogWalk',
  colors: { primary: '#0284C7', primaryText: '#FFFFFF', accent: '#65A30D' },
  // Routes are declared in src/app/_layout.tsx.
  screens: [],
});
