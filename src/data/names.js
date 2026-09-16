export const FIRST_NAMES = ['Alicia','Amir','Aina','Daniel','Hana','Irfan','Jia Wei','Mei Lin','Noah','Priya','Ravi','Sara','Sofia','Yuki','Zara'];
export const LAST_NAMES = ['Tan','Lim','Lee','Rahman','Abdullah','Kumar','Singh','Wong','Yamada','Hassan','Ong','Chen','Aziz','Das','Ng'];

export function pickName(rng = Math.random) {
  const first = FIRST_NAMES[Math.floor(rng() * FIRST_NAMES.length) % FIRST_NAMES.length];
  const last = LAST_NAMES[Math.floor(rng() * LAST_NAMES.length) % LAST_NAMES.length];
  return `${first} ${last}`;
}
