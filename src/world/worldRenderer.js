import { getTile } from './tileMap.js';
import { ATLAS_PATH, CLASSROOM_PACK_FRAMES, getObjectSpriteFrame } from '../assets/classroomPack.js';

const BASE_TILE_SIZE = 26;
const ZONE_TINT = {
  'staff-only': 'rgba(133,94,190,.16)',
  academic: 'rgba(82,136,205,.13)',
  dormitory: 'rgba(210,142,79,.13)',
  sports: 'rgba(81,175,118,.14)',
  restricted: 'rgba(201,73,73,.18)'
};

function clamp(value, min, max) { return Math.max(min, Math.min(max, value)); }

export function createWorldRenderer(canvas) {
  const ctx = canvas.getContext('2d');
  const atlas = typeof Image === 'function' ? new Image() : null;
  let atlasReady = false;
  if (atlas) {
    atlas.addEventListener('load', () => { atlasReady = true; });
    atlas.src = ATLAS_PATH;
  }

  function drawAtlasFrame(frame, x, y, width, height) {
    if (!atlasReady || !atlas || !frame) return false;
    const [sx, sy, sw, sh] = frame.source;
    ctx.drawImage(atlas, sx, sy, sw, sh, x, y, width, height);
    return true;
  }

  function resize() {
    const dpr = window.devicePixelRatio || 1;
    const width = Math.max(1, Math.floor(canvas.clientWidth * dpr));
    const height = Math.max(1, Math.floor(canvas.clientHeight * dpr));
    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
    }
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    return { width: canvas.clientWidth, height: canvas.clientHeight };
  }

  function normalizedCamera(camera) {
    return { x: camera.x || 0, y: camera.y || 0, zoom: clamp(camera.zoom || 1, .5, 2) };
  }

  function tileToScreen(x, y, camera) {
    const cam = normalizedCamera(camera);
    return {
      x: (x * BASE_TILE_SIZE - cam.x) * cam.zoom,
      y: (y * BASE_TILE_SIZE - cam.y) * cam.zoom
    };
  }

  function screenToTile(px, py, camera) {
    const cam = normalizedCamera(camera);
    return {
      x: Math.floor((px / cam.zoom + cam.x) / BASE_TILE_SIZE),
      y: Math.floor((py / cam.zoom + cam.y) / BASE_TILE_SIZE)
    };
  }

  function render(state, camera = { x: 0, y: 0, zoom: 1 }) {
    if (!state?.world?.campus) return;
    const size = resize();
    const map = state.world.campus;
    const cam = normalizedCamera(camera);
    const tilePx = BASE_TILE_SIZE * cam.zoom;
    const objectsById = new Map((map.objects ?? []).map(object => [object.id, object]));
    ctx.clearRect(0, 0, size.width, size.height);
    ctx.fillStyle = '#0b1713';
    ctx.fillRect(0, 0, size.width, size.height);

    const first = screenToTile(0, 0, cam);
    const last = screenToTile(size.width, size.height, cam);
    const minX = clamp(first.x - 1, 0, map.width - 1);
    const minY = clamp(first.y - 1, 0, map.height - 1);
    const maxX = clamp(last.x + 1, 0, map.width - 1);
    const maxY = clamp(last.y + 1, 0, map.height - 1);

    for (let y = minY; y <= maxY; y += 1) {
      for (let x = minX; x <= maxX; x += 1) {
        const tile = getTile(map, x, y);
        const p = tileToScreen(x, y, cam);
        ctx.fillStyle = tile.terrain === 'grass' ? '#234f37' : '#31473d';
        ctx.fillRect(p.x, p.y, tilePx, tilePx);
        if (tile.floor) {
          const drewFloor = tile.floor === 'basic-floor' && drawAtlasFrame(CLASSROOM_PACK_FRAMES.floor, p.x, p.y, tilePx, tilePx);
          if (!drewFloor) {
            ctx.fillStyle = tile.floor === 'path' ? '#837b6b' : '#b8b5a8';
            ctx.fillRect(p.x + 1, p.y + 1, tilePx - 2, tilePx - 2);
          }
        }
        if (ZONE_TINT[tile.zone]) {
          ctx.fillStyle = ZONE_TINT[tile.zone];
          ctx.fillRect(p.x, p.y, tilePx, tilePx);
        }
        if (tile.wall) {
          const wallFrame = tile.wall === 'door' ? CLASSROOM_PACK_FRAMES.door : tile.wall === 'basic-wall' ? CLASSROOM_PACK_FRAMES.wall : null;
          const drewWall = drawAtlasFrame(wallFrame, p.x, p.y, tilePx, tilePx);
          if (!drewWall) {
            ctx.fillStyle = tile.wall === 'door' ? '#c9965c' : '#2f3433';
            const thickness = Math.max(3, 5 * cam.zoom);
            ctx.fillRect(p.x, p.y, tilePx, thickness);
            if (tile.blocked) ctx.fillRect(p.x, p.y, thickness, tilePx);
          }
        }
        if (tile.objectId) {
          const object = objectsById.get(tile.objectId);
          const objectFrame = getObjectSpriteFrame(object?.type);
          const objectInset = Math.max(1, tilePx * .04);
          const drewObject = drawAtlasFrame(objectFrame, p.x + objectInset, p.y + objectInset, tilePx - objectInset * 2, tilePx - objectInset * 2);
          if (!drewObject) {
            ctx.fillStyle = '#315f78';
            const inset = Math.max(4, tilePx * .24);
            ctx.fillRect(p.x + inset, p.y + inset, tilePx - inset * 2, tilePx - inset * 2);
          }
        }
        ctx.strokeStyle = 'rgba(213,236,224,.10)';
        ctx.lineWidth = 1;
        ctx.strokeRect(p.x + .5, p.y + .5, tilePx - 1, tilePx - 1);
      }
    }

    for (const room of map.rooms ?? []) {
      if (!room.tiles?.length) continue;
      const anchor = room.tiles[0];
      const p = tileToScreen(anchor.x, anchor.y, cam);
      ctx.fillStyle = room.status === 'functional' ? '#e6f7ec' : '#ffd2a1';
      ctx.font = `${Math.max(9, 11 * cam.zoom)}px system-ui`;
      ctx.fillText(room.type, p.x + 3, p.y + Math.max(12, 14 * cam.zoom));
    }

    const people = [...(state.people?.students ?? []), ...(state.people?.staff ?? [])];
    for (const person of people) {
      if (!person.position) continue;
      const p = tileToScreen(person.position.x, person.position.y, cam);
      ctx.beginPath();
      ctx.fillStyle = person.kind === 'staff' || person.roleId ? '#ffd166' : '#7dd3fc';
      ctx.arc(p.x + tilePx / 2, p.y + tilePx / 2, Math.max(3, tilePx * .22), 0, Math.PI * 2);
      ctx.fill();
      if (person.id === state.people.activeStudentId) {
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.stroke();
      }
    }
  }

  return { render, screenToTile, tileToScreen };
}
