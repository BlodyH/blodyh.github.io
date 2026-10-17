(() => {
  const button = document.querySelector('.menu-toggle');
  const navigation = document.querySelector('.main-navigation');
  const closeMenu = () => {
    navigation.classList.remove('is-open');
    button.setAttribute('aria-expanded', 'false');
  };
  button.addEventListener('click', () => {
    const opened = button.getAttribute('aria-expanded') !== 'true';
    button.setAttribute('aria-expanded', String(opened));
    navigation.classList.toggle('is-open', opened);
  });
  navigation.addEventListener('click', event => {
    if (event.target.closest('a')) closeMenu();
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && button.getAttribute('aria-expanded') === 'true') {
      closeMenu();
      button.focus();
    }
  });
  document.addEventListener('click', event => {
    if (!event.target.closest('.header-inner')) closeMenu();
  });
  const desktop = window.matchMedia('(min-width: 761px)');
  desktop.addEventListener('change', closeMenu);

  const links = [...document.querySelectorAll('[data-section]')];
  const sections = links.map(link => document.getElementById(link.dataset.section)).filter(Boolean);
  if (!sections.length) return;
  let pending = false;
  const updateActiveSection = () => {
    const threshold = window.innerHeight * .3;
    let active = sections[0].id;
    for (const section of sections) {
      if (section.getBoundingClientRect().top <= threshold) active = section.id;
    }
    for (const link of links) {
      const selected = link.dataset.section === active;
      link.classList.toggle('is-active', selected);
      if (selected) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    }
    pending = false;
  };
  window.addEventListener('scroll', () => {
    if (!pending) { pending = true; window.requestAnimationFrame(updateActiveSection); }
  }, { passive: true });
  window.addEventListener('resize', updateActiveSection);
  updateActiveSection();
})();


// Progressive enhancement: without JavaScript each photograph still opens directly.
(() => {
  const dialog = document.querySelector('.photo-lightbox');
  if (!dialog || typeof dialog.showModal !== 'function') return;
  const links = [...document.querySelectorAll('.photo-link[data-photo-index]')];
  const photo = dialog.querySelector('.lightbox-image');
  const caption = dialog.querySelector('.lightbox-caption');
  const counter = dialog.querySelector('.photo-counter');
  let index = 0;
  let returnFocus;
  const show = next => {
    index = (next + links.length) % links.length;
    const link = links[index];
    photo.src = link.href;
    photo.alt = link.querySelector('img').alt;
    caption.textContent = link.dataset.caption;
    counter.textContent = `${index + 1} / ${links.length}`;
  };
  links.forEach((link, i) => link.addEventListener('click', event => {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    returnFocus = link;
    show(i);
    dialog.showModal();
  }));
  dialog.querySelector('.photo-close').addEventListener('click', () => dialog.close());
  dialog.querySelector('.photo-prev').addEventListener('click', () => show(index - 1));
  dialog.querySelector('.photo-next').addEventListener('click', () => show(index + 1));
  dialog.addEventListener('keydown', event => {
    if (event.key === 'ArrowRight') { event.preventDefault(); show(index + 1); }
    if (event.key === 'ArrowLeft') { event.preventDefault(); show(index - 1); }
  });
  dialog.addEventListener('click', event => {
    if (event.target !== dialog) return;
    const bounds = dialog.getBoundingClientRect();
    if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) dialog.close();
  });
  dialog.addEventListener('close', () => returnFocus?.focus({ preventScroll: true }));
})();


// Keep the story readable in English without JavaScript; enhance with language buttons.
(() => {
  document.querySelectorAll('[data-bilingual-story]').forEach(story => {
    const controls = story.querySelector('[data-language-controls]');
    const panels = [...story.querySelectorAll('[data-story-panel]')];
    if (!controls || panels.length < 2) return;
    const buttons = [...controls.querySelectorAll('[data-language-choice]')];
    controls.addEventListener('click', event => {
      const button = event.target.closest('button[data-language-choice]');
      if (!button || !controls.contains(button)) return;
      const language = button.dataset.languageChoice;
      panels.forEach(panel => { panel.hidden = panel.dataset.storyPanel !== language; });
      buttons.forEach(choice => {
        choice.setAttribute('aria-pressed', String(choice.dataset.languageChoice === language));
      });
    });
    controls.hidden = false;
  });
})();
