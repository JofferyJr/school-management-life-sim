export const STAFF_ROLES = {
  principal: { id:'principal', label:'Principal / Headmaster', baseSalary:7000 },
  'vice-principal': { id:'vice-principal', label:'Vice Principal', baseSalary:5600 },
  'head-of-department': { id:'head-of-department', label:'Head of Department', baseSalary:5000 },
  teacher: { id:'teacher', label:'Teacher', baseSalary:3200 },
  'substitute-teacher': { id:'substitute-teacher', label:'Substitute Teacher', baseSalary:2400 },
  counselor: { id:'counselor', label:'Counselor', baseSalary:3300 },
  librarian: { id:'librarian', label:'Librarian', baseSalary:2600 },
  nurse: { id:'nurse', label:'Nurse', baseSalary:3500 },
  'lab-assistant': { id:'lab-assistant', label:'Lab Assistant', baseSalary:2500 },
  'it-staff': { id:'it-staff', label:'IT Staff', baseSalary:3200 },
  'administrative-staff': { id:'administrative-staff', label:'Administrative Staff', baseSalary:2400 },
  accountant: { id:'accountant', label:'Accountant', baseSalary:3600 },
  security: { id:'security', label:'Security', baseSalary:2200 },
  cleaner: { id:'cleaner', label:'Cleaner', baseSalary:2000 },
  maintenance: { id:'maintenance', label:'Maintenance Worker', baseSalary:2400 },
  cook: { id:'cook', label:'Cook / Canteen Staff', baseSalary:2200 },
  coach: { id:'coach', label:'Coach', baseSalary:3000 },
  warden: { id:'warden', label:'Dormitory Warden', baseSalary:3000 }
};

export const V01_HIREABLE_ROLE_IDS = ['principal','teacher','counselor','nurse','cleaner','cook','security','warden'];
export function getStaffRole(id) { return STAFF_ROLES[id] ?? null; }
