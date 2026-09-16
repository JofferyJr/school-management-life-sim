function isTypingTarget(target) {
  if (!(target instanceof Element)) return false;
  return target.matches('input,select,textarea,button,[contenteditable="true"]');
}

export function createInputController(canvas, handlers) {
  const keyMap = {
    w:[0,-1], arrowup:[0,-1], s:[0,1], arrowdown:[0,1],
    a:[-1,0], arrowleft:[-1,0], d:[1,0], arrowright:[1,0]
  };

  const onKeyDown = event => {
    if (handlers.getMode?.() !== 'life' || isTypingTarget(event.target)) return;
    const key = event.key.toLowerCase();
    if (keyMap[key]) {
      event.preventDefault();
      const [dx,dy] = keyMap[key];
      handlers.onStep?.(dx, dy, { fast:event.shiftKey });
    } else if (key === 'e') {
      event.preventDefault();
      handlers.onInteract?.();
    } else if (key === 'escape') {
      event.preventDefault();
      handlers.onPause?.();
    }
  };

  const onClick = event => {
    if (handlers.getMode?.() !== 'life') return;
    const rect = canvas.getBoundingClientRect();
    const tile = handlers.screenToTile?.(event.clientX - rect.left, event.clientY - rect.top);
    if (tile) handlers.onPathRequest?.(tile);
  };

  const onContextMenu = event => {
    if (handlers.getMode?.() !== 'life') return;
    event.preventDefault();
    const rect = canvas.getBoundingClientRect();
    const tile = handlers.screenToTile?.(event.clientX - rect.left, event.clientY - rect.top);
    handlers.onContext?.(tile, { x:event.clientX, y:event.clientY });
  };

  window.addEventListener('keydown', onKeyDown);
  canvas.addEventListener('click', onClick);
  canvas.addEventListener('contextmenu', onContextMenu);

  return {
    destroy() {
      window.removeEventListener('keydown', onKeyDown);
      canvas.removeEventListener('click', onClick);
      canvas.removeEventListener('contextmenu', onContextMenu);
    }
  };
}
