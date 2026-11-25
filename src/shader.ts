// Fullscreen domain-warped noise field rendered with raw WebGL.

const vertex = `
attribute vec2 p;
void main() { gl_Position = vec4(p, 0.0, 1.0); }
`

const fragment = `
precision highp float;
uniform vec2 uRes;
uniform vec2 uMouse;
uniform float uTime;
uniform float uScroll;

float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
             mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
}

float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  mat2 r = mat2(0.8, 0.6, -0.6, 0.8);
  for (int i = 0; i < 5; i++) {
    v += a * noise(p);
    p = r * p * 2.02;
    a *= 0.5;
  }
  return v;
}

void main() {
  vec2 uv = gl_FragCoord.xy / uRes;
  vec2 p = (gl_FragCoord.xy - 0.5 * uRes) / uRes.y;
  vec2 m = (uMouse - 0.5) * vec2(uRes.x / uRes.y, 1.0);

  float t = uTime * 0.06;
  float d = length(p - m);
  p += (p - m) * 0.18 * exp(-d * 3.0);

  vec2 q = vec2(fbm(p * 1.4 + t), fbm(p * 1.4 - t + 3.1));
  vec2 r = vec2(fbm(p * 1.6 + 2.0 * q + vec2(1.7, 9.2) + t * 1.3),
                fbm(p * 1.6 + 2.0 * q + vec2(8.3, 2.8) - t));
  float f = fbm(p * 1.2 + 2.4 * r + uScroll * 0.6);

  vec3 ink = vec3(0.047, 0.043, 0.039);
  vec3 ember = vec3(1.0, 0.30, 0.14);
  vec3 violet = vec3(0.30, 0.16, 0.62);

  vec3 col = mix(ink, violet, smoothstep(0.25, 0.85, length(q)) * 0.75);
  col = mix(col, ember, smoothstep(0.55, 1.05, f + r.x * 0.35) * 0.9);
  col += ember * 0.25 * exp(-d * 4.0);

  col *= 1.0 - 0.55 * smoothstep(0.35, 1.05, length(uv - 0.5) * 1.4);
  col *= 1.0 - uScroll * 0.7;
  col += (hash(gl_FragCoord.xy + fract(uTime)) - 0.5) * 0.06;

  gl_FragColor = vec4(col, 1.0);
}
`

function compile(gl: WebGLRenderingContext, type: number, src: string): WebGLShader {
  const shader = gl.createShader(type)!
  gl.shaderSource(shader, src)
  gl.compileShader(shader)
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    throw new Error(`Shader compile failed: ${gl.getShaderInfoLog(shader)}`)
  }
  return shader
}

export function startShader(canvas: HTMLCanvasElement, getScroll: () => number) {
  const gl = canvas.getContext('webgl', { antialias: false, alpha: false })
  if (!gl) throw new Error('WebGL is not supported')

  const program = gl.createProgram()!
  gl.attachShader(program, compile(gl, gl.VERTEX_SHADER, vertex))
  gl.attachShader(program, compile(gl, gl.FRAGMENT_SHADER, fragment))
  gl.linkProgram(program)
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    throw new Error(`Program link failed: ${gl.getProgramInfoLog(program)}`)
  }
  gl.useProgram(program)

  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer())
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW)
  const loc = gl.getAttribLocation(program, 'p')
  gl.enableVertexAttribArray(loc)
  gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0)

  const uRes = gl.getUniformLocation(program, 'uRes')
  const uMouse = gl.getUniformLocation(program, 'uMouse')
  const uTime = gl.getUniformLocation(program, 'uTime')
  const uScroll = gl.getUniformLocation(program, 'uScroll')

  const target = { x: 0.5, y: 0.5 }
  const mouse = { x: 0.5, y: 0.5 }
  window.addEventListener('pointermove', (e) => {
    target.x = e.clientX / window.innerWidth
    target.y = 1 - e.clientY / window.innerHeight
  })

  const resize = () => {
    const dpr = Math.min(window.devicePixelRatio, 1.5)
    canvas.width = Math.floor(canvas.clientWidth * dpr)
    canvas.height = Math.floor(canvas.clientHeight * dpr)
    gl.viewport(0, 0, canvas.width, canvas.height)
    gl.uniform2f(uRes, canvas.width, canvas.height)
  }
  resize()
  window.addEventListener('resize', resize)

  let visible = true
  new IntersectionObserver(([entry]) => (visible = entry.isIntersecting)).observe(canvas)

  const start = performance.now()
  const frame = (now: number) => {
    requestAnimationFrame(frame)
    if (!visible) return
    mouse.x += (target.x - mouse.x) * 0.05
    mouse.y += (target.y - mouse.y) * 0.05
    gl.uniform2f(uMouse, mouse.x, mouse.y)
    gl.uniform1f(uTime, (now - start) / 1000)
    gl.uniform1f(uScroll, getScroll())
    gl.drawArrays(gl.TRIANGLES, 0, 3)
  }
  requestAnimationFrame(frame)
}
