export const ROOM_DEFINITIONS = {
  classroom: { label: 'Classroom', zone: 'academic', size: [6, 5], requirements: ['door', 'teacher-desk', 'student-seat', 'board'] },
  'principal-office': { label: 'Principal Office', zone: 'staff-only', size: [5, 4], requirements: ['door', 'desk'] },
  'staff-room': { label: 'Staff Room', zone: 'staff-only', size: [5, 4], requirements: ['door', 'staff-seat'] },
  toilet: { label: 'Toilet', zone: 'public', size: [4, 3], requirements: ['door', 'toilet-fixture'] },
  canteen: { label: 'Canteen', zone: 'public', size: [7, 5], requirements: ['door', 'serving-counter', 'student-seat'] },
  library: { label: 'Library', zone: 'academic', size: [6, 5], requirements: ['door'] },
  'science-lab': { label: 'Science Lab', zone: 'academic', size: [6, 5], requirements: ['door'] },
  'computer-lab': { label: 'Computer Lab', zone: 'academic', size: [6, 5], requirements: ['door'] },
  clinic: { label: 'Clinic', zone: 'restricted', size: [5, 4], requirements: ['door'] },
  'counseling-room': { label: 'Counseling Room', zone: 'restricted', size: [4, 4], requirements: ['door'] },
  'club-room': { label: 'Club Room', zone: 'academic', size: [5, 4], requirements: ['door'] },
  hall: { label: 'Hall', zone: 'public', size: [8, 6], requirements: ['door'] },
  gym: { label: 'Gym', zone: 'sports', size: [8, 6], requirements: ['door'] },
  'sports-field': { label: 'Sports Field', zone: 'sports', size: [10, 7], requirements: [] },
  'dorm-room': { label: 'Dorm Room', zone: 'dormitory', size: [5, 4], requirements: ['door', 'bed'] },
  'warden-room': { label: 'Warden Room', zone: 'dormitory', size: [4, 4], requirements: ['door'] },
  'dining-hall': { label: 'Dining Hall', zone: 'dormitory', size: [7, 5], requirements: ['door'] },
  'study-room': { label: 'Study Room', zone: 'dormitory', size: [6, 4], requirements: ['door'] },
  laundry: { label: 'Laundry', zone: 'dormitory', size: [5, 4], requirements: ['door'] }
};

export function getRoomDefinition(type) {
  return ROOM_DEFINITIONS[type] ?? null;
}
