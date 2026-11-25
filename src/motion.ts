import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SplitText } from 'gsap/SplitText'
import type Lenis from 'lenis'

gsap.registerPlugin(ScrollTrigger, SplitText)

export function playLoader(): Promise<void> {
  const count = document.querySelector<HTMLElement>('[data-loader-count]')!
  const state = { v: 0 }
  return new Promise((resolve) => {
    gsap
      .timeline({ onComplete: resolve })
      .to(state, {
        v: 100,
        duration: 1.6,
        ease: 'power2.inOut',
        onUpdate: () => (count.textContent = String(Math.round(state.v)).padStart(3, '0')),
      })
      .to('.loader__bar span', { scaleX: 1, duration: 1.6, ease: 'power2.inOut' }, 0)
      .to(count, { yPercent: -100, duration: 0.6, ease: 'power3.in' })
      .to('.loader', { clipPath: 'inset(0 0 100% 0)', duration: 1, ease: 'expo.inOut' }, '-=0.2')
      .set('.loader', { display: 'none' })
  })
}

export function introHero() {
  gsap
    .timeline()
    .from('.hero__star', { scale: 0, rotate: -180, duration: 1.2, ease: 'back.out(2)' }, 0.5)
    .from(['.hero__eyebrow', '.hero__intro', '.scroll-cue', '.nav'], { opacity: 0, y: 20, duration: 1, stagger: 0.1 }, 0.6)
  gsap.to('.hero__star', { rotate: 360, duration: 12, ease: 'none', repeat: -1 })
}

function heroScroll() {
  gsap.to('.hero__inner', {
    yPercent: 30,
    opacity: 0,
    ease: 'none',
    scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true },
  })
}

function marquee(lenis: Lenis) {
  const track = document.querySelector<HTMLElement>('.marquee__track')!
  let x = 0
  let dir = -1
  gsap.ticker.add((_, delta) => {
    const v = lenis.velocity
    if (v !== 0) dir = v > 0 ? -1 : 1
    x += dir * (0.06 + Math.min(Math.abs(v), 60) * 0.01) * delta
    const half = track.scrollWidth / 2
    x = ((x % half) - half) % half
    track.style.transform = `translate3d(${x}px,0,0)`
  })
}

function revealWords() {
  const el = document.querySelector<HTMLElement>('[data-reveal-words]')!
  const words = SplitText.create(el, { type: 'words', wordsClass: 'word' }).words
  gsap.fromTo(
    words,
    { opacity: 0.12 },
    {
      opacity: 1,
      stagger: 0.1,
      ease: 'none',
      scrollTrigger: { trigger: el, start: 'top 80%', end: 'bottom 45%', scrub: true },
    },
  )
}

function counters() {
  document.querySelectorAll<HTMLElement>('[data-count]').forEach((el) => {
    const state = { v: 0 }
    gsap.to(state, {
      v: Number(el.dataset.count),
      duration: 2,
      ease: 'power3.out',
      onUpdate: () => (el.textContent = String(Math.round(state.v))),
      scrollTrigger: { trigger: el, start: 'top 85%' },
    })
  })
}

function horizontalWork() {
  const track = document.querySelector<HTMLElement>('.work__track')!
  const distance = () => track.scrollWidth - window.innerWidth
  const tween = gsap.to(track, {
    x: () => -distance(),
    ease: 'none',
    scrollTrigger: {
      trigger: '.work',
      pin: '.work__pin',
      start: 'top top',
      end: () => `+=${distance()}`,
      scrub: 1,
      invalidateOnRefresh: true,
    },
  })
  gsap.to('.work__progress span', {
    scaleX: 1,
    ease: 'none',
    scrollTrigger: { trigger: '.work', start: 'top top', end: () => `+=${distance()}`, scrub: true },
  })
  document.querySelectorAll<HTMLElement>('[data-parallax]').forEach((art) => {
    gsap.fromTo(
      art,
      { xPercent: 8 },
      {
        xPercent: -8,
        ease: 'none',
        scrollTrigger: {
          trigger: art.closest('.card')!,
          containerAnimation: tween,
          start: 'left right',
          end: 'right left',
          scrub: true,
        },
      },
    )
  })
}

function fades() {
  document.querySelectorAll<HTMLElement>('[data-fade]').forEach((el) => {
    gsap.from(el, {
      y: 40,
      opacity: 0,
      duration: 1.2,
      ease: 'expo.out',
      scrollTrigger: { trigger: el, start: 'top 90%' },
    })
  })
}

function contactTitle() {
  const chars = SplitText.create('.contact .split', { type: 'chars' }).chars
  gsap.from(chars, {
    yPercent: 110,
    duration: 1.2,
    ease: 'expo.out',
    stagger: 0.025,
    scrollTrigger: { trigger: '.contact__title', start: 'top 80%' },
  })
  gsap.from('.contact__btn', {
    scale: 0,
    rotate: -90,
    duration: 1.4,
    ease: 'elastic.out(1, 0.5)',
    scrollTrigger: { trigger: '.contact__title', start: 'top 60%' },
  })
}

export function initScrollMotion(lenis: Lenis) {
  heroScroll()
  marquee(lenis)
  revealWords()
  counters()
  horizontalWork()
  fades()
  contactTitle()
}
