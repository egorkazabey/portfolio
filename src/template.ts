import { profile, projects, services, skills, stats } from './content'

const arrow = `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 18 18 6M8 6h10v10" fill="none" stroke="currentColor" stroke-width="1.6"/></svg>`

const marquee = (items: string[]) => {
  const row = items.map((s) => `<span>${s}</span><i>✦</i>`).join('')
  return `<div class="marquee__track">${row}${row}</div>`
}

const projectCard = (p: (typeof projects)[number], i: number) => `
  <a class="card" href="${p.href}" data-cursor="View" style="--h:${p.hue}">
    <div class="card__visual">
      <div class="card__art" data-parallax>
        <span class="orb orb--a"></span>
        <span class="orb orb--b"></span>
        <span class="card__grid"></span>
      </div>
      <span class="card__index">${String(i + 1).padStart(2, '0')}</span>
    </div>
    <div class="card__meta">
      <div>
        <h3 class="card__title">${p.title}</h3>
        <p class="card__kind">${p.kind} — ${p.year}</p>
      </div>
      <span class="card__arrow">${arrow}</span>
    </div>
    <p class="card__desc">${p.description}</p>
    <ul class="tags">${p.stack.map((s) => `<li>${s}</li>`).join('')}</ul>
  </a>`

export const template = `
<div class="loader" aria-hidden="true">
  <div class="loader__count"><span data-loader-count>000</span></div>
  <div class="loader__bar"><span></span></div>
</div>

<div class="cursor" aria-hidden="true"><span class="cursor__label"></span></div>

<header class="nav">
  <a class="nav__logo" href="#top" data-magnetic>${profile.firstName[0]}${profile.lastName[0]}<sup>©</sup></a>
  <nav class="nav__links">
    <a href="#work" data-magnetic>Work</a>
    <a href="#about" data-magnetic>About</a>
    <a href="#contact" data-magnetic>Contact</a>
  </nav>
  <div class="nav__status"><i></i><span>Available · <time data-clock></time></span></div>
</header>

<main>
  <section class="hero" id="top">
    <canvas class="hero__canvas"></canvas>
    <div class="hero__inner">
      <p class="eyebrow hero__eyebrow">${profile.role} — ${profile.location}</p>
      <h1 class="hero__title">
        <span class="line"><span class="split">${profile.firstName}</span></span>
        <span class="line line--indent"><span class="split">${profile.lastName}</span><em class="hero__star">✦</em></span>
      </h1>
      <div class="hero__foot">
        <p class="hero__intro">${profile.intro}</p>
        <a class="scroll-cue" href="#about" data-magnetic><span>Scroll</span><i></i></a>
      </div>
    </div>
  </section>

  <section class="marquee" aria-label="Skills">${marquee(skills)}</section>

  <section class="about" id="about">
    <p class="eyebrow">(01) About</p>
    <p class="about__text" data-reveal-words>${profile.about}</p>
    <div class="stats">
      ${stats
        .map(
          (s) => `
        <div class="stat">
          <span class="stat__value"><span data-count="${s.value}">0</span>${s.suffix}</span>
          <span class="stat__label">${s.label}</span>
        </div>`,
        )
        .join('')}
    </div>
  </section>

  <section class="work" id="work">
    <div class="work__pin">
      <div class="work__head">
        <p class="eyebrow">(02) Selected work</p>
        <h2 class="work__title">Projects<sup>${projects.length}</sup></h2>
      </div>
      <div class="work__track">
        ${projects.map(projectCard).join('')}
      </div>
      <div class="work__progress"><span></span></div>
    </div>
  </section>

  <section class="services">
    <p class="eyebrow">(03) What I do</p>
    <ul class="services__list">
      ${services
        .map(
          (s, i) => `
        <li class="service" data-fade>
          <span class="service__num">0${i + 1}</span>
          <h3 class="service__title">${s.title}</h3>
          <p class="service__text">${s.text}</p>
        </li>`,
        )
        .join('')}
    </ul>
  </section>

  <section class="contact" id="contact">
    <p class="eyebrow">(04) Contact</p>
    <h2 class="contact__title">
      <span class="line"><span class="split">Let's build</span></span>
      <span class="line"><span class="split">something <em>loud</em></span></span>
    </h2>
    <a class="contact__btn" href="mailto:${profile.email}" data-magnetic data-cursor="Write">
      <span>Get in touch</span>
    </a>
    <a class="contact__email" href="mailto:${profile.email}">${profile.email}</a>
  </section>
</main>

<footer class="footer">
  <ul class="footer__socials">
    ${profile.socials.map((s) => `<li><a href="${s.href}" target="_blank" rel="noreferrer" data-magnetic>${s.label}</a></li>`).join('')}
  </ul>
  <p>© ${new Date().getFullYear()} ${profile.firstName} ${profile.lastName}</p>
</footer>
`
