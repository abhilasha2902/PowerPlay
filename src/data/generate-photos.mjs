import { writeFileSync } from 'node:fs'

const categories = ['Living room', 'Bedroom', 'Kitchen', 'Bathroom', 'Exterior', 'Views']
const photos = Array.from({ length: 43 }, (_, i) => {
  const category = categories[i % categories.length]
  return {
    id: `photo-${i + 1}`,
    url: `https://picsum.photos/seed/photo-${i + 1}/1200/800`,
    alt: `${category} — photo ${i + 1} of 43`,
    category,
  }
})

writeFileSync(new URL('./photos.json', import.meta.url), JSON.stringify(photos, null, 2) + '\n')
console.log(`Wrote ${photos.length} photos to photos.json`)
