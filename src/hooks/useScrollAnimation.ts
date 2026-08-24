import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

interface ScrollAnimationOptions {
  /** Animation start trigger, defaults to 'top 85%' */
  start?: string;
  /** Whether to animate once or every time (defaults to true = once) */
  once?: boolean;
  /** Delay before the animation starts (seconds) */
  delay?: number;
  /** Duration of the animation (seconds) */
  duration?: number;
  /** Stagger between child elements */
  stagger?: number;
  /** Y offset to animate from (px) */
  y?: number;
  /** X offset to animate from (px) */
  x?: number;
  /** Scale to animate from */
  scale?: number;
}

/**
 * Scroll-triggered fade + slide-up animation using GSAP ScrollTrigger.
 * Returns a ref to attach to the container element.
 */
export function useScrollAnimation<T extends HTMLElement = HTMLDivElement>(
  options: ScrollAnimationOptions = {}
) {
  const ref = useRef<T>(null);
  const {
    start = 'top 85%',
    once = true,
    delay = 0,
    duration = 0.7,
    stagger = 0,
    y = 40,
    x = 0,
    scale = 1,
  } = options;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const targets = stagger > 0 ? Array.from(el.children) : [el];

    const fromVars: gsap.TweenVars = { opacity: 0, y };
    if (x !== 0) fromVars.x = x;
    if (scale !== 1) fromVars.scale = scale;

    const animation = gsap.fromTo(
      targets,
      fromVars,
      {
        opacity: 1,
        y: 0,
        x: 0,
        scale: 1,
        duration,
        delay,
        stagger,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: el,
          start,
          once,
        },
      }
    );

    return () => {
      animation.scrollTrigger?.kill();
    };
  }, [start, once, delay, duration, stagger, y, x, scale]);

  return ref;
}

/**
 * Scroll-triggered stagger animation for child elements.
 * Great for grids and card lists. Each child fades + slides up
 * with a slight stagger for a premium cascading effect.
 */
export function useGSAPStagger<T extends HTMLElement = HTMLDivElement>(
  options: ScrollAnimationOptions = {}
) {
  const ref = useRef<T>(null);
  const {
    start = 'top 88%',
    once = true,
    duration = 0.65,
    stagger = 0.08,
    y = 50,
    scale = 0.95,
    delay = 0,
  } = options;

  useEffect(() => {
    const el = ref.current;
    if (!el || !el.children.length) return;

    const children = Array.from(el.children);

    const animation = gsap.fromTo(
      children,
      { opacity: 0, y, scale },
      {
        opacity: 1,
        y: 0,
        scale: 1,
        duration,
        delay,
        stagger,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: el,
          start,
          once,
        },
      }
    );

    return () => {
      animation.scrollTrigger?.kill();
    };
  }, [start, once, duration, stagger, y, scale, delay]);

  return ref;
}

/**
 * Hero entrance animation using GSAP — fires immediately on mount.
 * Stagger-animates all direct children with a blur+fade+slide reveal.
 */
export function useGSAPHeroReveal<T extends HTMLElement = HTMLDivElement>(
  delay = 0.1
) {
  const ref = useRef<T>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const children = Array.from(el.children);

    gsap.fromTo(
      children,
      { opacity: 0, y: 30, filter: 'blur(4px)' },
      {
        opacity: 1,
        y: 0,
        filter: 'blur(0px)',
        duration: 0.8,
        stagger: 0.12,
        delay,
        ease: 'power3.out',
        clearProps: 'filter',
      }
    );
  }, [delay]);

  return ref;
}

/**
 * Scroll-triggered counter animation using GSAP.
 * Counts from 0 to `end` when the element enters the viewport.
 */
export function useCounterAnimation(end: number, suffix = '') {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const obj = { val: 0 };
    const animation = gsap.to(obj, {
      val: end,
      duration: 2,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: el,
        start: 'top 90%',
        once: true,
      },
      onUpdate: () => {
        el.textContent = Math.round(obj.val).toLocaleString() + suffix;
      },
    });

    return () => {
      animation.scrollTrigger?.kill();
    };
  }, [end, suffix]);

  return ref;
}

export { gsap, ScrollTrigger };
