/**
 * DBA Labs 2 & 3 — Study Guide
 * Interactive enhancements:
 *   1. Reading progress bar
 *   2. Copy-to-clipboard buttons on every code block
 *   3. Live keyword search / highlight
 *   4. Scroll-spy active nav links
 *   5. Back-to-top button
 *   6. Intersection Observer — fade-in exercises
 *   7. Search bar injection
 */

'use strict';

/* ══════════════════════════════════════
   1. READING PROGRESS BAR
══════════════════════════════════════ */
function initProgressBar() {
  const bar = document.createElement('div');
  bar.id = 'progress-bar';
  document.body.prepend(bar);

  window.addEventListener('scroll', () => {
    const scrolled = window.scrollY;
    const total    = document.documentElement.scrollHeight - window.innerHeight;
    bar.style.width = total > 0 ? `${(scrolled / total) * 100}%` : '0%';
  }, { passive: true });
}

/* ══════════════════════════════════════
   2. COPY-TO-CLIPBOARD BUTTONS
══════════════════════════════════════ */
function initCopyButtons() {
  document.querySelectorAll('.code-block').forEach(block => {
    const header = block.querySelector('.code-header');
    const pre    = block.querySelector('pre');
    if (!header || !pre) return;

    const btn = document.createElement('button');
    btn.className   = 'copy-btn';
    btn.textContent = 'Copy';
    btn.setAttribute('aria-label', 'Copy code to clipboard');
    header.appendChild(btn);

    btn.addEventListener('click', async () => {
      const code = pre.innerText;
      try {
        await navigator.clipboard.writeText(code);
        btn.textContent = 'Copied!';
        btn.classList.add('copied');
      } catch {
        /* Fallback for older browsers */
        const ta = document.createElement('textarea');
        ta.value = code;
        ta.style.position = 'fixed';
        ta.style.opacity  = '0';
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
        btn.textContent = 'Copied!';
        btn.classList.add('copied');
      }
      setTimeout(() => {
        btn.textContent = 'Copy';
        btn.classList.remove('copied');
      }, 2000);
    });
  });
}

/* ══════════════════════════════════════
   3. LIVE KEYWORD SEARCH
══════════════════════════════════════ */
function initSearch() {
  /* Inject search bar between nav and main */
  const nav  = document.querySelector('nav');
  const main = document.querySelector('main');
  if (!nav || !main) return;

  const wrap  = document.createElement('div');
  wrap.id     = 'search-wrap';

  const input = document.createElement('input');
  input.id          = 'search-input';
  input.type        = 'search';
  input.placeholder = '🔍  Search across all steps, queries, concepts…';
  input.autocomplete = 'off';

  wrap.appendChild(input);
  nav.insertAdjacentElement('afterend', wrap);

  /* Store original HTML of every step to allow clean un-highlight */
  const steps = [...document.querySelectorAll('.step, .box, .explanation')];
  const originals = new WeakMap();
  steps.forEach(el => originals.set(el, el.innerHTML));

  let debounceTimer;

  input.addEventListener('input', () => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      const q = input.value.trim();

      steps.forEach(el => {
        /* Restore original HTML */
        el.innerHTML = originals.get(el);

        if (q.length < 2) {
          el.closest('.exercise')?.classList.remove('search-hidden');
          return;
        }

        /* Highlight matches in this element's text nodes */
        highlightText(el, q);
      });

      /* Hide exercises with no matches */
      document.querySelectorAll('.exercise').forEach(ex => {
        const hasMatch = ex.querySelector('.search-highlight');
        ex.style.display = hasMatch || q.length < 2 ? '' : 'none';
      });
    }, 180);
  });
}

function highlightText(container, query) {
  const regex = new RegExp(`(${escapeRegex(query)})`, 'gi');

  function walk(node) {
    if (node.nodeType === Node.TEXT_NODE) {
      if (regex.test(node.textContent)) {
        const span = document.createElement('span');
        span.innerHTML = node.textContent.replace(regex,
          '<mark class="search-highlight">$1</mark>');
        node.parentNode.replaceChild(span, node);
      }
      regex.lastIndex = 0;
    } else if (
      node.nodeType === Node.ELEMENT_NODE &&
      !['SCRIPT', 'STYLE', 'BUTTON'].includes(node.tagName)
    ) {
      [...node.childNodes].forEach(walk);
    }
  }
  walk(container);
}

function escapeRegex(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/* ══════════════════════════════════════
   4. SCROLL SPY — ACTIVE NAV LINKS
══════════════════════════════════════ */
function initScrollSpy() {
  const navLinks = [...document.querySelectorAll('nav a[href^="#"]')];
  if (!navLinks.length) return;

  const targets = navLinks.map(a => document.querySelector(a.getAttribute('href')))
                           .filter(Boolean);

  const observer = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id   = '#' + entry.target.id;
          const link = navLinks.find(a => a.getAttribute('href') === id);

          navLinks.forEach(a => a.classList.remove('active'));
          if (link) link.classList.add('active');
        }
      });
    },
    { rootMargin: '-20% 0px -70% 0px', threshold: 0 }
  );

  targets.forEach(t => observer.observe(t));
}

/* ══════════════════════════════════════
   5. BACK-TO-TOP BUTTON
══════════════════════════════════════ */
function initBackToTop() {
  const btn = document.createElement('button');
  btn.id          = 'back-to-top';
  btn.textContent = '↑';
  btn.setAttribute('aria-label', 'Back to top');
  document.body.appendChild(btn);

  window.addEventListener('scroll', () => {
    btn.classList.toggle('visible', window.scrollY > 400);
  }, { passive: true });

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

/* ══════════════════════════════════════
   6. FADE-IN EXERCISES ON SCROLL
══════════════════════════════════════ */
function initFadeIn() {
  const exercises = document.querySelectorAll('.exercise');

  const observer = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.06 }
  );

  exercises.forEach(ex => observer.observe(ex));
}

/* ══════════════════════════════════════
   7. SMOOTH ANCHOR SCROLLING
══════════════════════════════════════ */
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const target = document.querySelector(a.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      const navHeight    = document.querySelector('nav')?.offsetHeight  || 0;
      const searchHeight = document.getElementById('search-wrap')?.offsetHeight || 0;
      const offset = target.getBoundingClientRect().top + window.scrollY
                     - navHeight - searchHeight - 12;
      window.scrollTo({ top: offset, behavior: 'smooth' });
    });
  });
}

/* ══════════════════════════════════════
   INIT — run everything on DOMContentLoaded
══════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
  initProgressBar();
  initCopyButtons();
  initSearch();
  initScrollSpy();
  initBackToTop();
  initFadeIn();
  initSmoothScroll();
});
