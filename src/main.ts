import './style.css'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from 'lenis'
import { profile } from './content'
import { template } from './template'
import { startShader } from './shader'
import { createParticles } from './particles'
import { initCursor, initMagnetic } from './cursor'
import { initScrollMotion, introHero, playLoader } from './motion'

document.querySelector<HTMLDivElement>('#app')!.innerHTML = template
document.body.classList.add('is-loading')

const lenis = new Lenis({ lerp: 0.09 })
lenis.on('scroll', ScrollTrigger.update)
gsap.ticker.add((t) => lenis.raf(t * 1000))
gsap.ticker.lagSmoothing(0)
lenis.stop()

const heroScroll = () => Math.min(window.scrollY / window.innerHeight, 1)
startShader(document.querySelector<HTMLCanvasElement>('.hero__canvas')!, heroScroll)

const clock = document.querySelector<HTMLElement>('[data-clock]')!
const fmt = new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', timeZone: profile.timezone })
const tick = () => (clock.textContent = fmt.format(new Date()))
tick()
setInterval(tick, 10_000)

document.querySelectorAll<HTMLAnchorElement>('a[href^="#"]').forEach((a) => {
  a.addEventListener('click', (e) => {
    e.preventDefault()
    lenis.scrollTo(a.getAttribute('href')!, { duration: 1.6 })
  })
})

initCursor()
initMagnetic()

await document.fonts.ready
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
const particles = reducedMotion ? null : createParticles(document.querySelector<HTMLElement>('.hero')!, heroScroll)
initScrollMotion(lenis)
await playLoader()
document.body.classList.remove('is-loading')
lenis.start()
particles?.play()
introHero()
