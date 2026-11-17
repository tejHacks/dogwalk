import { defineBrand } from './lib/brand-type';

export const brand = defineBrand({
  name: 'DogWalk',
  colors: { primary: '#0284C7', primaryText: '#FFFFFF', accent: '#65A30D' },
  screens: [
    { name: 'index', title: 'DogWalk', large: true },
    { name: 'walker/[id]', title: 'Walker' },
    { name: 'walk/[id]', title: 'Walk' },
  ],
});
