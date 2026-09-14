"use client";

// Hide/show the mobile tab bar from scroll *and* from touch/wheel at scroll
// edges. Position-only tracking fails in two common cases:
//   1. Short pages: hiding the bar shrinks padding, clamps scrollTop to 0,
//      and there is no remaining upward scroll to bring the bar back.
//   2. Short inner lists (Sandbox): overflow is smaller than the hide
//      threshold, so scrollTop never moves far enough to hide.
// Touch/wheel deltas are ignored when a real scroll event just fired, so a
// scrolling container does not get counted twice. Layout clamps are ignored
// on the scroll path only — a later finger swipe can still reverse the bar.

type Listener = (hidden: boolean) => void;

let listeners: Listener[] = [];
const accumulated = new Map<EventTarget, number>();
const lastPositions = new Map<EventTarget, number>();

let barHidden = false;
let layoutLockUntil = 0;
let layoutLockStarted = 0;
let gestureQuietUntil = 0;
const lastScrollEventAt = new Map<EventTarget, number>();

const HIDE_THRESHOLD = 12;
const SHOW_THRESHOLD = 12;
const SETTLE_MS = 160;
const LOCK_MAX_MS = 800;
const GESTURE_QUIET_MS = 120;
const SCROLL_TAKES_GESTURE_MS = 48;
const INNER_SOURCE_ATTR = "data-chrome-scroll";

export function subscribeToScrollHide(listener: Listener): () => void {
  listeners.push(listener);
  return () => {
    listeners = listeners.filter((l) => l !== listener);
  };
}

function lockLayout() {
  const now = performance.now();
  layoutLockStarted = now;
  layoutLockUntil = now + SETTLE_MS;
  gestureQuietUntil = now + GESTURE_QUIET_MS;
  accumulated.clear();
  lastPositions.clear();
}

function notify(hidden: boolean) {
  if (barHidden === hidden) return;
  barHidden = hidden;
  lockLayout();
  listeners.forEach((l) => l(hidden));
}

export function resetScrollHide() {
  barHidden = false;
  layoutLockUntil = 0;
  gestureQuietUntil = 0;
  accumulated.clear();
  lastPositions.clear();
  listeners.forEach((l) => l(false));
}

export function syncScrollPosition(source: EventTarget, currentPosition: number) {
  lastPositions.set(source, currentPosition);
  accumulated.set(source, 0);
}

function accumulate(source: EventTarget, delta: number, canHide: boolean) {
  if (delta === 0) return;
  const prev = accumulated.get(source) ?? 0;
  const next = Math.sign(prev) !== Math.sign(delta) && prev !== 0 ? delta : prev + delta;

  if (next >= HIDE_THRESHOLD && canHide) {
    notify(true);
    accumulated.set(source, 0);
  } else if (next <= -SHOW_THRESHOLD) {
    notify(false);
    accumulated.set(source, 0);
  } else {
    accumulated.set(source, next);
  }
}

export function reportScroll(
  source: EventTarget,
  currentPosition: number,
  minPositionForHide = 12
) {
  lastScrollEventAt.set(source, performance.now());

  const now = performance.now();
  if (now < layoutLockUntil) {
    lastPositions.set(source, currentPosition);
    accumulated.set(source, 0);
    if (now - layoutLockStarted < LOCK_MAX_MS) {
      layoutLockUntil = Math.min(layoutLockStarted + LOCK_MAX_MS, now + SETTLE_MS);
    }
    return;
  }

  const last = lastPositions.get(source) ?? currentPosition;
  const delta = currentPosition - last;
  lastPositions.set(source, currentPosition);
  accumulate(source, delta, currentPosition > minPositionForHide);
}

// Finger/wheel movement that did not change scrollTop (at the top/bottom, or
// on a page that barely scrolls). Same sign as reportScroll: positive hides.
export function reportGesture(source: EventTarget, delta: number) {
  if (delta === 0) return;
  const now = performance.now();
  if (now < gestureQuietUntil) return;
  if (now - (lastScrollEventAt.get(source) ?? 0) < SCROLL_TAKES_GESTURE_MS) return;
  accumulate(source, delta, true);
}

function isInsideInnerSource(target: EventTarget | null) {
  return target instanceof Element && Boolean(target.closest(`[${INNER_SOURCE_ATTR}]`));
}

type ScrollNode = Window | HTMLElement;

export function attachChromeScrollSource(
  node: ScrollNode,
  options: { minPositionForHide?: number } = {}
): () => void {
  const isWindow = node === window;
  const minHide = options.minPositionForHide ?? (isWindow ? 12 : 0);
  const element = isWindow ? null : (node as HTMLElement);

  if (element) element.setAttribute(INNER_SOURCE_ATTR, "");

  const getPosition = () => (isWindow ? window.scrollY : element!.scrollTop);

  let lastTouchY: number | null = null;

  const onScroll = () => reportScroll(node, getPosition(), minHide);

  const onGesture = (delta: number, eventTarget: EventTarget | null) => {
    if (isWindow && isInsideInnerSource(eventTarget)) return;
    reportGesture(node, delta);
  };

  const onTouchStart = (event: Event) => {
    const touch = (event as TouchEvent).touches[0];
    if (isWindow && isInsideInnerSource(event.target)) return;
    lastTouchY = touch?.clientY ?? null;
  };

  const onTouchMove = (event: Event) => {
    const touch = (event as TouchEvent).touches[0];
    if (!touch || lastTouchY == null) return;
    if (isWindow && isInsideInnerSource(event.target)) return;
    const delta = lastTouchY - touch.clientY;
    lastTouchY = touch.clientY;
    onGesture(delta, event.target);
  };

  const onTouchEnd = () => {
    lastTouchY = null;
  };

  const onWheel = (event: Event) => {
    onGesture((event as WheelEvent).deltaY, event.target);
  };

  const opts: AddEventListenerOptions = { passive: true };
  node.addEventListener("scroll", onScroll, opts);
  node.addEventListener("touchstart", onTouchStart, opts);
  node.addEventListener("touchmove", onTouchMove, opts);
  node.addEventListener("touchend", onTouchEnd, opts);
  node.addEventListener("touchcancel", onTouchEnd, opts);
  node.addEventListener("wheel", onWheel, opts);

  return () => {
    node.removeEventListener("scroll", onScroll, opts);
    node.removeEventListener("touchstart", onTouchStart, opts);
    node.removeEventListener("touchmove", onTouchMove, opts);
    node.removeEventListener("touchend", onTouchEnd, opts);
    node.removeEventListener("touchcancel", onTouchEnd, opts);
    node.removeEventListener("wheel", onWheel, opts);
    element?.removeAttribute(INNER_SOURCE_ATTR);
  };
}
