// Sample posts data
export const posts = [
  {
    id: '1',
    title: 'Sunset Painting',
    media: '/file.svg',
    category: 'Painting',
    privacy: 'Public',
    includeDate: true,
    date: '2025-05-20',
    includeTime: false,
    time: '',
    featured: true,
    author: { name: 'Alice Smith', avatar: '/window.svg' },
    description: 'A beautiful sunset painting capturing warm colors and serene atmosphere.'
  },
  {
    id: '2',
    title: 'Mountain Sketch',
    media: '/file.svg',
    category: 'Illustration',
    privacy: 'Private',
    includeDate: true,
    date: '2025-05-18',
    includeTime: true,
    time: '14:30',
    featured: false,
    author: { name: 'Bob Jones', avatar: '/window.svg' },
    description: 'A detailed pencil sketch of a mountain landscape.'
  }
];