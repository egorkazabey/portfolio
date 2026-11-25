import gsap from 'gsap'

export function initCursor() {
  const cursor = document.querySelector<HTMLElement>('.cursor')!
  const label = cursor.querySelector<HTMLElement>('.cursor__label')!
  const x = gsap.quickTo(cursor, 'x', { duration: 0.35, ease: 'power3' })
  const y = gsap.quickTo(cursor, 'y', { duration: 0.35, ease: 'power3' })

  window.addEventListener(
    'pointermove',
    (e) => {
      gsap.set(cursor, { x: e.clientX, y: e.clientY, opacity: 1 })
    },
    { once: true },
  )
  window.addEventListener('pointermove', (e) => {
    x(e.clientX)
    y(e.clientY)
  })

  document.querySelectorAll<HTMLElement>('[data-cursor]').forEach((el) => {
    el.addEventListener('pointerenter', () => {
      label.textContent = el.dataset.cursor!
      cursor.classList.add('is-label')
    })
    el.addEventListener('pointerleave', () => cursor.classList.remove('is-label'))
  })

  document.querySelectorAll<HTMLElement>('a:not([data-cursor])').forEach((el) => {
    el.addEventListener('pointerenter', () => cursor.classList.add('is-hover'))
    el.addEventListener('pointerleave', () => cursor.classList.remove('is-hover'))
  })
}

export function initMagnetic() {
  document.querySelectorAll<HTMLElement>('[data-magnetic]').forEach((el) => {
    const x = gsap.quickTo(el, 'x', { duration: 0.8, ease: 'elastic.out(1, 0.4)' })
    const y = gsap.quickTo(el, 'y', { duration: 0.8, ease: 'elastic.out(1, 0.4)' })
    el.addEventListener('pointermove', (e) => {
      const r = el.getBoundingClientRect()
      x((e.clientX - (r.left + r.width / 2)) * 0.35)
      y((e.clientY - (r.top + r.height / 2)) * 0.35)
    })
    el.addEventListener('pointerleave', () => {
      x(0)
      y(0)
    })
  })
}
