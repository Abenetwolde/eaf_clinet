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
  } = options;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const targets = stagger > 0 ? Array.from(el.children) : [el];

    gsap.fromTo(
      targets,
      { opacity: 0, y },
      {
        opacity: 1,
        y: 0,
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
      ScrollTrigger.getAll().forEach((st) => st.kill());
    };
  }, [start, once, delay, duration, stagger, y]);

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
    gsap.to(obj, {
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
  }, [end, suffix]);

  return ref;
}

export { gsap, ScrollTrigger };
