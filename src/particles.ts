// The hero name rendered as a WebGL particle swarm: assembles on intro,
// is pushed by the cursor, shockwaves on click and explodes on scroll.

const vertex = `
attribute vec3 a;
uniform vec2 uRes;
uniform float uSize;
varying float vHeat;
void main() {
  vHeat = a.z;
  vec2 clip = a.xy / uRes * 2.0 - 1.0;
  gl_Position = vec4(clip.x, -clip.y, 0.0, 1.0);
  gl_PointSize = uSize * (1.0 + a.z * 0.6);
}
`

const fragment = `
precision mediump float;
uniform float uAlpha;
varying float vHeat;
void main() {
  if (length(gl_PointCoord - 0.5) > 0.5) discard;
  vec3 bone = vec3(0.925, 0.902, 0.863);
  vec3 ember = vec3(1.0, 0.30, 0.14);
  gl_FragColor = vec4(mix(bone, ember, vHeat), uAlpha);
}
`

type Swarm = {
  count: number
  home: Float32Array // x, y
  pos: Float32Array // x, y
  vel: Float32Array // x, y
  scatter: Float32Array // x, y offset at full scroll
  delay: Float32Array
  heat: Float32Array
}

function compile(gl: WebGLRenderingContext, type: number, src: string): WebGLShader {
  const shader = gl.createShader(type)!
  gl.shaderSource(shader, src)
  gl.compileShader(shader)
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    throw new Error(`Particle shader compile failed: ${gl.getShaderInfoLog(shader)}`)
  }
  return shader
}

// Draws every character of the title at its exact DOM position, then samples filled pixels.
function sampleTitle(hero: HTMLElement, title: HTMLElement, gap: number): Float32Array {
  const heroRect = hero.getBoundingClientRect()
  const canvas = document.createElement('canvas')
  canvas.width = Math.ceil(heroRect.width)
  canvas.height = Math.ceil(heroRect.height)
  const ctx = canvas.getContext('2d', { willReadFrequently: true })!
  const style = getComputedStyle(title)
  ctx.font = `${style.fontWeight} ${style.fontSize} ${style.fontFamily}`
  ctx.textBaseline = 'middle'
  ctx.fillStyle = '#fff'
  const upper = style.textTransform === 'uppercase'

  title.querySelectorAll<HTMLElement>('.split').forEach((el) => {
    const text = el.firstChild as Text
    const range = document.createRange()
    for (let i = 0; i < text.length; i++) {
      range.setStart(text, i)
      range.setEnd(text, i + 1)
      const r = range.getBoundingClientRect()
      ctx.fillText(upper ? text.data[i].toUpperCase() : text.data[i], r.left - heroRect.left, r.top - heroRect.top + r.height / 2)
    }
  })

  const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data
  const points: number[] = []
  for (let y = 0; y < canvas.height; y += gap) {
    for (let x = 0; x < canvas.width; x += gap) {
      if (data[(y * canvas.width + x) * 4 + 3] > 128) points.push(x, y)
    }
  }
  return new Float32Array(points)
}

function buildSwarm(home: Float32Array, width: number, height: number): Swarm {
  const count = home.length / 2
  const pos = new Float32Array(count * 2)
  const scatter = new Float32Array(count * 2)
  const delay = new Float32Array(count)
  for (let i = 0; i < count; i++) {
    pos[i * 2] = Math.random() * width
    pos[i * 2 + 1] = Math.random() * height
    const angle = Math.random() * Math.PI * 2
    const dist = 300 + Math.random() * 900
    scatter[i * 2] = Math.cos(angle) * dist
    scatter[i * 2 + 1] = Math.sin(angle) * dist - 400
    delay[i] = (home[i * 2] / width) * 0.9 + Math.random() * 0.3
  }
  return { count, home, pos, vel: new Float32Array(count * 2), scatter, delay, heat: new Float32Array(count) }
}

const smooth = (a: number, b: number, x: number) => {
  const t = Math.min(Math.max((x - a) / (b - a), 0), 1)
  return t * t * (3 - 2 * t)
}

export function createParticles(hero: HTMLElement, getScroll: () => number) {
  const title = hero.querySelector<HTMLElement>('.hero__title')!
  const canvas = document.createElement('canvas')
  canvas.className = 'hero__particles'
  hero.querySelector('.hero__canvas')!.after(canvas)

  const gl = canvas.getContext('webgl', { antialias: false, premultipliedAlpha: false })
  if (!gl) throw new Error('WebGL is not supported')
  const program = gl.createProgram()!
  gl.attachShader(program, compile(gl, gl.VERTEX_SHADER, vertex))
  gl.attachShader(program, compile(gl, gl.FRAGMENT_SHADER, fragment))
  gl.linkProgram(program)
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    throw new Error(`Particle program link failed: ${gl.getProgramInfoLog(program)}`)
  }
  gl.useProgram(program)
  gl.enable(gl.BLEND)
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA)

  const buffer = gl.createBuffer()!
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
  const loc = gl.getAttribLocation(program, 'a')
  gl.enableVertexAttribArray(loc)
  gl.vertexAttribPointer(loc, 3, gl.FLOAT, false, 0, 0)
  const uRes = gl.getUniformLocation(program, 'uRes')
  const uSize = gl.getUniformLocation(program, 'uSize')
  const uAlpha = gl.getUniformLocation(program, 'uAlpha')

  let swarm: Swarm
  let attrs: Float32Array
  let width = 0
  let height = 0

  const build = () => {
    const rect = hero.getBoundingClientRect()
    width = rect.width
    height = rect.height
    const dpr = Math.min(window.devicePixelRatio, 2)
    canvas.width = Math.floor(width * dpr)
    canvas.height = Math.floor(height * dpr)
    gl.viewport(0, 0, canvas.width, canvas.height)
    gl.uniform2f(uRes, width, height)
    const gap = width < 760 ? 2 : 3
    gl.uniform1f(uSize, gap * 0.85 * dpr)
    swarm = buildSwarm(sampleTitle(hero, title, gap), width, height)
    attrs = new Float32Array(swarm.count * 3)
    gl.bufferData(gl.ARRAY_BUFFER, attrs.byteLength, gl.DYNAMIC_DRAW)
  }
  build()
  hero.classList.add('has-particles')

  let resizeTimer = 0
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer)
    resizeTimer = window.setTimeout(() => {
      build()
      introStart = performance.now() - 10_000
    }, 200)
  })

  const mouse = { x: -9999, y: -9999 }
  const toLocal = (e: PointerEvent) => {
    const r = hero.getBoundingClientRect()
    return { x: e.clientX - r.left, y: e.clientY - r.top }
  }
  window.addEventListener('pointermove', (e) => Object.assign(mouse, toLocal(e)))
  hero.addEventListener('pointerleave', () => Object.assign(mouse, { x: -9999, y: -9999 }))
  hero.addEventListener('pointerdown', (e) => {
    const c = toLocal(e)
    const { pos, vel, heat } = swarm
    for (let i = 0; i < swarm.count; i++) {
      const dx = pos[i * 2] - c.x
      const dy = pos[i * 2 + 1] - c.y
      const d = Math.hypot(dx, dy) + 0.001
      if (d > 420) continue
      const f = (1 - d / 420) * 38
      vel[i * 2] += (dx / d) * f
      vel[i * 2 + 1] += (dy / d) * f
      heat[i] = 1
    }
  })

  let visible = true
  new IntersectionObserver(([entry]) => (visible = entry.isIntersecting)).observe(hero)

  let introStart = Infinity
  let last = performance.now()
  const radius = () => Math.max(90, width * 0.08)

  const step = (now: number) => {
    requestAnimationFrame(step)
    // Physics is tuned for 60fps; dt scales it so 30Hz and 120Hz screens move at the same speed.
    const dt = Math.min((now - last) / (1000 / 60), 3)
    last = now
    if (!visible) return
    const t = (now - introStart) / 1000
    const damping = 0.86 ** dt
    const s = getScroll()
    const burst = s * s
    const R = radius()
    const { count, home, pos, vel, scatter, delay, heat } = swarm

    for (let i = 0; i < count; i++) {
      const ix = i * 2
      const iy = ix + 1
      const k = 0.055 * dt * smooth(delay[i], delay[i] + 0.7, t)
      const tx = home[ix] + scatter[ix] * burst
      const ty = home[iy] + scatter[iy] * burst
      let vx = vel[ix] * damping + (tx - pos[ix]) * k
      let vy = vel[iy] * damping + (ty - pos[iy]) * k

      const dx = pos[ix] - mouse.x
      const dy = pos[iy] - mouse.y
      const d2 = dx * dx + dy * dy
      if (d2 < R * R) {
        const d = Math.sqrt(d2) + 0.001
        const f = (1 - d / R) ** 2 * 9 * dt
        vx += (dx / d) * f
        vy += (dy / d) * f
      }

      vel[ix] = vx
      vel[iy] = vy
      pos[ix] += vx * dt
      pos[iy] += vy * dt
      heat[i] = Math.max(heat[i] * 0.94 ** dt, Math.min(Math.hypot(vx, vy) * 0.12, 1))

      attrs[i * 3] = pos[ix]
      attrs[i * 3 + 1] = pos[iy]
      attrs[i * 3 + 2] = heat[i]
    }

    gl.uniform1f(uAlpha, 1 - smooth(0.4, 0.95, s))
    gl.clearColor(0, 0, 0, 0)
    gl.clear(gl.COLOR_BUFFER_BIT)
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, attrs)
    gl.drawArrays(gl.POINTS, 0, count)
  }
  requestAnimationFrame(step)

  return {
    play() {
      introStart = performance.now()
    },
  }
}
