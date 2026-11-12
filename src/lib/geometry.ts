/**
 * Position of `el` inside `ancestor` in untransformed layout coordinates.
 * Unlike getBoundingClientRect, this ignores CSS transforms, so overlays placed
 * in the ancestor's own coordinate space line up even while an entrance
 * animation is moving the scene. `ancestor` must be positioned (it is the offsetParent root).
 */
export function offsetWithin(el: HTMLElement, ancestor: HTMLElement) {
  let x = 0;
  let y = 0;
  let node: HTMLElement | null = el;
  while (node && node !== ancestor) {
    x += node.offsetLeft;
    y += node.offsetTop;
    node = node.offsetParent as HTMLElement | null;
  }
  return { x, y, w: el.offsetWidth, h: el.offsetHeight };
}
