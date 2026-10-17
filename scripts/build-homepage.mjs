import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

// The generated pages are committed, so GitHub Pages needs no build step.
const root = fileURLToPath(new URL('../', import.meta.url));
const data = JSON.parse(await readFile(path.join(root, 'homepage.json'), 'utf8'));
const profile = data.profile;
const escape = (value = '') => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;'}[c]));
const safeUrl = (value) => {
  if (!value) return '';
  if (/^(https?:\/\/|mailto:)/i.test(value)) return escape(value);
  if (!/^[a-z][a-z\d+.-]*:/i.test(value) && !value.startsWith('//')) return escape(value);
  throw new Error(`Unsupported URL: ${value}`);
};
const icons = {
  mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 6 9 7 9-7"/>',
  pin: '<path d="M20 10c0 6-8 11-8 11S4 16 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/>',
  scholar: '<path d="m2 9 10-5 10 5-10 5L2 9Z"/><path d="M6 11v6c4 3 8 3 12 0v-6M22 9v7"/>',
  linkedin: '<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M7 10v7M7 7v.1M11 17v-7M11 13a3 3 0 0 1 6 0v4"/>',
  github: '<path d="M9 19c-4 1-4-2-6-2m12 5v-4a3.5 3.5 0 0 0-1-2.5c3.3-.4 6.5-1.6 6.5-7a5.5 5.5 0 0 0-1.5-3.8A5 5 0 0 0 18.9 1S17.6.6 15 2.5a13 13 0 0 0-6 0C6.4.6 5.1 1 5.1 1A5 5 0 0 0 5 4.7a5.5 5.5 0 0 0-1.5 3.8c0 5.4 3.2 6.6 6.5 7A3.5 3.5 0 0 0 9 18v4"/>',
  arrow: '<path d="M5 12h14m-5-5 5 5-5 5"/>',
  file: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z"/><path d="M14 2v6h6M8 13h8M8 17h5"/>'
};
const icon = (name, cls = '') => `<svg class="icon ${cls}" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${icons[name]}</svg>`;
const resource = (label, url, symbol) => url
  ? `<a class="profile-link" href="${safeUrl(url)}">${icon(symbol)}<span>${escape(label)}</span>${icon('arrow', 'link-arrow')}</a>`
  : `<span class="profile-link is-pending">${icon(symbol)}<span>${escape(label)}</span><span class="pending-label">Soon</span></span>`;
const empty = (title, text) => `<div class="empty-state"><span class="empty-mark" aria-hidden="true"></span><div><h3>${escape(title)}</h3><p>${escape(text)}</p></div></div>`;
const heading = (title, label = '') => `<div class="section-heading"><h2>${title}</h2>${label ? `<span class="section-note">${label}</span>` : ''}</div>`;

function renderPublication(paper) {
  const title = paper.url && paper.status !== 'under-review'
    ? `<a href="${safeUrl(paper.url)}">${escape(paper.title)}</a>`
    : escape(paper.title);
  // Anonymous manuscripts deliberately render titles and status only.
  if (paper.status === 'under-review') {
    return `<li class="publication manuscript"><div class="publication-label"><span class="submission-status">Under review</span></div><div><h4>${title}</h4></div></li>`;
  }
  const authors = escape(paper.authors).replaceAll(escape(profile.name), `<strong>${escape(profile.name)}</strong>`);
  return `<li class="publication"><div class="publication-label"><span>${escape(paper.venue)}</span><span>${escape(paper.year)}</span></div><div><h4>${title}</h4>${paper.authors ? `<p class="authors">${authors}</p>` : ''}${paper.note ? `<p class="publication-note">${escape(paper.note)}</p>` : ''}${paper.links?.length ? `<div class="paper-links">${paper.links.map(link => `<a href="${safeUrl(link.url)}">${escape(link.label)} ${icon('arrow')}</a>`).join('')}</div>` : ''}</div></li>`;
}
function publications() {
  if (!data.publications.length) return empty('Publication list coming soon', 'Paper details and links will be added here.');
  if (!data.publicationGroups?.length) return `<ol class="publication-list">${data.publications.map(renderPublication).join('')}</ol>`;
  for (const paper of data.publications) {
    if (!data.publicationGroups.some(group => group.id === paper.group)) throw new Error(`Unknown publication group: ${paper.group}`);
  }
  return data.publicationGroups.map(group => {
    const papers = data.publications.filter(paper => paper.group === group.id);
    if (!papers.length) return '';
    return `<section class="publication-group" aria-labelledby="papers-${escape(group.id)}"><h3 class="publication-group-title" id="papers-${escape(group.id)}">${escape(group.title)}</h3><ol class="publication-list">${papers.map(renderPublication).join('')}</ol></section>`;
  }).join('');
}
function education() {
  return `<ol class="timeline">${data.education.map(item => `<li><span class="timeline-date">${escape(item.period)}</span><div><h3>${escape(item.title)}</h3><p>${escape(item.institution)}</p>${item.detail ? `<p class="timeline-detail">${escape(item.detail)}</p>` : ''}${item.field || item.wam != null || item.atar != null ? `<div class="education-meta">${item.field ? (item.handbookUrl ? `<a class="education-field-link" href="${safeUrl(item.handbookUrl)}">${escape(item.fieldLabel || 'Major')}: ${escape(item.field)}</a>` : `<span>${escape(item.fieldLabel || 'Major')}: ${escape(item.field)}</span>`) : ''}${item.wam != null ? `<span class="education-wam"><abbr title="Weighted Average Mark">WAM</abbr> <strong>${escape(item.wam)}</strong><span class="wam-scale"> / 100</span></span>` : ''}${item.atar != null ? `<span class="education-atar"><abbr title="Australian Tertiary Admission Rank">ATAR</abbr> <strong>${escape(item.atar)}</strong></span>` : ''}</div>` : ''}</div></li>`).join('')}</ol>`;
}
const officeMap = () => profile.officeMapUrl ? `<a class="office-map-link" href="${safeUrl(profile.officeMapUrl)}" target="_blank" rel="noopener noreferrer" aria-label="Find my office on Google Maps" title="Office on Google Maps">${icon('pin')}</a>` : icon('pin');
function activities(items, placeholder) {
  return items.length ? `<ul class="activity-list">${items.map(item => `<li><h3>${escape(item.title)}</h3><p>${escape(item.detail)}</p>${item.period ? `<span>${escape(item.period)}</span>` : ''}</li>`).join('')}</ul>` : `<p class="subtle-placeholder">${placeholder}</p>`;
}
function researchExperience() {
  if (!data.researchExperience?.length) return '';
  return `<section class="content-section" id="experience" aria-labelledby="experience-title">${heading('<span id="experience-title">Research experience</span>')}<ol class="timeline experience-timeline">${data.researchExperience.map(item => `<li><span class="timeline-date">${escape(item.period)}</span><div><h3>${escape(item.title)}</h3><p>${escape(item.institution)}</p><p class="experience-description">${escape(item.description)}</p>${item.collaborators?.length ? `<p class="experience-collaborators">With ${item.collaborators.map(person => person.url ? `<a class="person-link" href="${safeUrl(person.url)}">${escape(person.name)}</a>` : `<span class="person-link">${escape(person.name)}</span>`).join(' and ')}.</p>` : ''}</div></li>`).join('')}</ol></section>`;
}
function teaching() {
  if (!data.teaching.length) return `<p class="subtle-placeholder">Teaching experience will be added here.</p>`;
  const years = [...new Set(data.teaching.map(course => course.year))].sort((a, b) => b - a);
  return `${data.teachingAppointment ? `<p class="teaching-institution">Tutoring at ${escape(data.teachingAppointment.institution)}</p>` : ''}<div class="teaching-years">${years.map(year => `<section class="teaching-year" aria-labelledby="teaching-${escape(year)}"><h3 class="teaching-year-label" id="teaching-${escape(year)}">${escape(year)}</h3><ul class="course-list">${data.teaching.filter(course => course.year === year).map(course => `<li><div class="course-heading"><h4><a href="${safeUrl(course.handbookUrl)}" title="University of Melbourne Handbook">${escape(course.title)}</a> <span class="course-code">${escape(course.code)}</span></h4>${course.role === 'Head Tutor' ? `<span class="teaching-role head-tutor">Head Tutor</span>` : `<span class="teaching-role">${escape(course.role || 'Tutor')}</span>`}</div>${course.detail ? `<p class="course-detail">${escape(course.detail)}</p>` : ''}</li>`).join('')}</ul></section>`).join('')}</div>`;
}
function home() {
  return `<section class="content-section about-section" id="about" aria-labelledby="about-title">
      <p class="eyebrow">Research &amp; academic life</p>
      <h2 class="intro-title" id="about-title">About me<span class="heading-dot">.</span></h2>
      <div class="prose">${data.about.map(p => `<p>${p}</p>`).join('')}</div>
      <a class="text-link personal-invitation" href="beyond/index.html">A little more about me, beyond research ${icon('arrow')}</a>
    </section>
    ${data.news.length ? `<section class="content-section" id="news">${heading('News')}<ul class="news-list">${data.news.map(n => `<li><time>${escape(n.date)}</time><span>${escape(n.text)}</span></li>`).join('')}</ul></section>` : ''}
    <section class="content-section" id="research" aria-labelledby="research-title">
      ${heading('<span id="research-title">Research interests</span>')}
      <div class="research-list">${data.research.map((r, i) => `<article class="research-row"><span class="row-index">0${i + 1}</span><div><h3>${escape(r.title)}</h3><p>${escape(r.description)}</p></div></article>`).join('')}</div>
    </section>
    <section class="content-section" id="publications" aria-labelledby="publications-title">
      ${heading('<span id="publications-title">Publications</span>', profile.scholar ? `<a href="${safeUrl(profile.scholar)}">Google Scholar ${icon('arrow')}</a>` : 'Selected work')}
      ${publications()}
    </section>
    <section class="content-section" id="background" aria-labelledby="education-title">
      ${heading('<span id="education-title">Education</span>')}
      ${education()}
    </section>
    ${researchExperience()}
    <section class="content-section" id="teaching" aria-labelledby="teaching-title">
      ${heading('<span id="teaching-title">Teaching</span>', escape(data.teachingAppointment?.period || ''))}
      ${teaching()}
    </section>
    <section class="content-section" id="service" aria-labelledby="service-title">
      ${heading('<span id="service-title">Academic service</span>')}
      ${activities(data.service, 'Academic service will be added here.')}
    </section>
    <section class="content-section" id="awards" aria-labelledby="awards-title">
      ${heading('<span id="awards-title">Honours &amp; awards</span>')}
      <ul class="award-list">${data.awards.map(a => `<li><span>${escape(a.year)}</span><p>${escape(a.title)}</p></li>`).join('')}</ul>
    </section>
    <section class="content-section contact-section" id="contact" aria-labelledby="contact-title">
      ${heading('<span id="contact-title">Get in touch</span>')}
      <p>I’m happy to connect about research and potential collaborations.</p>
      <a class="contact-email" href="mailto:${escape(profile.email)}">${escape(profile.email)} ${icon('arrow')}</a>
      <p class="contact-location">${officeMap()}<span>${escape(profile.location)}</span></p>
    </section>`;
}
function galleryPhoto(photo, index, featured = false) {
  return `<figure class="${featured ? 'pet-feature' : 'pet-photo'}"><a class="photo-link" href="../${safeUrl(photo.src)}" data-photo-index="${index}" data-caption="${escape(photo.caption)}" aria-label="Open photograph: ${escape(photo.caption)}"><img src="../${safeUrl(featured ? photo.src : (photo.thumbnail || photo.src))}" alt="${escape(photo.alt)}" width="${featured ? '600' : '720'}" height="${featured ? '800' : '540'}" style="object-position:${escape(photo.position || '50% 50%')}" ${featured ? 'fetchpriority="high"' : 'loading="lazy"'}></a>${featured ? '' : `<figcaption>${escape(photo.caption)}</figcaption>`}</figure>`;
}
function petVideo(video) {
  if (!video?.src) return '';
  return `<div class="pet-motion"><div class="pet-motion-copy"><h3>${escape(video.title || 'In motion')}</h3><p>${escape(video.caption)}</p><a href="../${safeUrl(video.src)}" class="pet-video-link">Open video ${icon('arrow')}</a></div><video class="pet-video" controls playsinline preload="metadata" poster="../${safeUrl(video.poster)}" width="${escape(video.width || 720)}" height="${escape(video.height || 1280)}" aria-label="${escape(video.title || 'Belial in motion')}"><source src="../${safeUrl(video.src)}" type="video/mp4"><a href="../${safeUrl(video.src)}">Watch Belial’s video</a></video></div>`;
}
function petSection(section, index) {
  const photos = section.photos || [];
  return `<section class="content-section pet-section" id="${escape(section.id)}" aria-labelledby="pet-title"><p class="eyebrow chapter-eyebrow"><span>0${index + 1}</span> ${escape(section.eyebrow)}</p><div class="pet-hero">${photos[0] ? galleryPhoto(photos[0], 0, true) : ''}<div class="pet-copy"><h2 id="pet-title">${escape(section.title)} <span lang="zh-Hans">${escape(section.chineseName)}</span></h2><p class="pet-intro">${escape(section.intro)}</p><dl class="pet-facts"><div><dt>Born</dt><dd><time datetime="${escape(section.birthday)}">${escape(section.birthdayLabel)}</time></dd></div><div><dt>Breed</dt><dd>${escape(section.breed)}</dd></div><div><dt>A little</dt><dd>${escape(section.sex.toLowerCase())}</dd></div></dl><p class="pet-name-story">${escape(section.nameStory)}</p>${section.walkInvitation ? `<p class="pet-walk-invitation">${escape(section.walkInvitation)}</p>` : ''}</div></div><div class="gallery-heading"><h3>Small moments</h3><p>${escape(section.galleryIntro)}</p><span>${photos.length} photographs · click to open</span></div><div class="pet-gallery">${photos.slice(1).map((photo, i) => galleryPhoto(photo, i + 1)).join('')}</div>${petVideo(section.video)}</section>`;
}
function storyLanguages(id, languages, renderContent, panelClass) {
  return `${languages.length > 1 ? `<div class="story-language-switch" data-language-controls role="group" aria-label="Story language / 正文语言" hidden>${languages.map((language, i) => `<button type="button" lang="${language.code}" data-language-choice="${language.code}" aria-label="${escape(language.accessibleLabel || language.label)}" aria-pressed="${i === 0}" aria-controls="${escape(id)}-story-${language.code}">${escape(language.label)}</button>`).join('')}</div>` : ''}${languages.map((language, i) => `<div class="story-language-panel ${panelClass}" id="${escape(id)}-story-${language.code}" data-story-panel="${language.code}" lang="${language.code}"${i ? ' hidden' : ''}>${renderContent(language)}</div>`).join('')}`;
}
function martialArtsSection(section, index) {
  const oath = section.dojoKun;
  const languages = [{ code: 'en', label: 'EN', accessibleLabel: 'English', paragraphs: section.paragraphs }];
  if (section.paragraphsZh?.length) languages.push({ code: 'zh-Hans', label: '中文', paragraphs: section.paragraphsZh });
  const story = storyLanguages(section.id, languages, language => language.paragraphs.map(paragraph => `<p>${escape(paragraph)}</p>`).join(''), 'karate-story-panel');
  return `<section class="content-section karate-section" id="${escape(section.id)}" aria-labelledby="${escape(section.id)}-title"><p class="eyebrow chapter-eyebrow"><span>0${index + 1}</span> ${escape(section.eyebrow)}</p><div class="karate-heading"><h2 id="${escape(section.id)}-title">${escape(section.title)}</h2><span lang="zh-Hans">${escape(section.chineseTitle)}</span></div><div class="karate-meta"><span>${escape(section.period)}</span><span>${escape(section.grade)}</span></div><figure class="karate-photo"><a href="../${safeUrl(section.image)}" aria-label="Open the full training photograph"><img src="../${safeUrl(section.image)}" alt="${escape(section.imageAlt)}" width="1440" height="1080" loading="lazy"></a><figcaption>${escape(section.photoNote)}</figcaption></figure><div class="karate-reflections"><div class="karate-story" data-bilingual-story>${story}<p class="karate-osu">${escape(section.signoff)}</p></div>${oath ? `<aside class="dojo-kun" aria-labelledby="${escape(section.id)}-oath-title"><h3 id="${escape(section.id)}-oath-title" lang="zh-Hans">${escape(oath.chineseTitle)} <span lang="en">${escape(oath.title)}</span></h3><p class="dojo-subtitle">${escape(oath.subtitle)}</p><ol>${oath.precepts.map(precept => `<li><div><p class="dojo-precept-zh" lang="zh-Hans">${escape(precept.zh)}</p><p class="dojo-precept-en" lang="en">${escape(precept.en)}</p></div></li>`).join('')}</ol><p class="dojo-source">${oath.noteZh ? `<span lang="zh-Hans">${escape(oath.noteZh)}</span><br>` : ''}${escape(oath.note)}<br><a href="${safeUrl(oath.sourceUrl)}">${escape(oath.sourceLabel)} ${icon('arrow')}</a></p></aside>` : ''}</div></section>`;
}
function communitySection(section, index) {
  const content = language => `<p class="community-intro">${escape(language.intro)}</p><ol class="community-roles" aria-label="${language.code === 'en' ? 'Roles and dates' : '任职经历'}">${language.roles.map(role => `<li><span>${escape(role.period)}</span><h3>${escape(role.title)}</h3></li>`).join('')}</ol><div class="community-work">${language.work.map(work => `<section class="community-project"><h3>${escape(work.title)}</h3>${work.paragraphs.map(paragraph => `<p>${escape(paragraph)}</p>`).join('')}${work.metrics?.length ? `<dl class="community-metrics">${work.metrics.map(metric => `<div><dt>${escape(metric.label)}</dt><dd>${escape(metric.value)}</dd></div>`).join('')}</dl>` : ''}</section>`).join('')}</div><section class="community-reflection"><h3>${escape(language.reflectionTitle)}</h3>${language.reflections.map(paragraph => `<p>${escape(paragraph)}</p>`).join('')}</section>`;
  return `<section class="content-section community-section" id="${escape(section.id)}" aria-labelledby="${escape(section.id)}-title"><p class="eyebrow chapter-eyebrow"><span>0${index + 1}</span> ${escape(section.eyebrow)}</p><h2 class="community-title" id="${escape(section.id)}-title">${escape(section.title)}</h2><p class="community-organization">${section.organizationZh ? `<span lang="zh-Hans">${escape(section.organizationZh)}</span>` : ''}<a href="${safeUrl(section.organizationUrl)}">${escape(section.organization)} ${icon('arrow')}</a></p><figure class="community-photo"><img src="../${safeUrl(section.image)}" alt="${escape(section.imageAlt)}" width="${escape(section.imageWidth)}" height="${escape(section.imageHeight)}" loading="lazy"><figcaption>${escape(section.photoCaption)}</figcaption></figure><div class="community-story" data-bilingual-story>${storyLanguages(section.id, section.languages, content, 'community-story-panel')}</div></section>`;
}
function photoDialog() {
  return `<dialog class="photo-lightbox" aria-labelledby="photo-dialog-title"><h2 class="visually-hidden" id="photo-dialog-title">Belial’s photo album</h2><button type="button" class="photo-close" aria-label="Close photograph">×</button><figure><img class="lightbox-image" alt=""><figcaption class="lightbox-caption"></figcaption></figure><div class="photo-controls"><button type="button" class="photo-prev" aria-label="Previous photograph">${icon('arrow', 'back-arrow')}<span>Previous</span></button><span class="photo-counter" aria-live="polite"></span><button type="button" class="photo-next" aria-label="Next photograph"><span>Next</span>${icon('arrow')}</button></div></dialog>`;
}
function beyond() {
  const sections = data.beyond.sections || [];
  const navigation = sections.filter(section => section.id).map((section, index) => `<a href="#${escape(section.id)}"><span>0${index + 1}</span>${escape(section.navTitle || section.title)}</a>`).join('');
  return `<section class="content-section beyond-intro" aria-labelledby="beyond-title"><p class="eyebrow">Beyond research</p><h2 class="intro-title" id="beyond-title">Outside the lab<span class="heading-dot">.</span></h2><p class="beyond-description">${escape(data.beyond.intro)}</p>${navigation ? `<nav class="personal-navigation" aria-label="Personal chapters">${navigation}</nav>` : ''}</section>
    ${sections.length ? sections.map((section, index) => {
      if (section.type === 'pet') return petSection(section, index);
      if (section.type === 'martial-arts') return martialArtsSection(section, index);
      if (section.type === 'community') return communitySection(section, index);
      if (section.type === 'placeholder') return `<section class="content-section personal-placeholder" id="${escape(section.id)}"><span class="chapter-number">0${index + 1}</span><h2>${escape(section.title)}</h2><span class="chapter-status">Coming soon</span></section>`;
      return `<section class="content-section personal-section"${section.id ? ` id="${escape(section.id)}"` : ''}>${heading(escape(section.title))}${section.image ? `<figure><img src="../${safeUrl(section.image)}" alt="${escape(section.imageAlt || '')}" loading="lazy">${section.caption ? `<figcaption>${escape(section.caption)}</figcaption>` : ''}</figure>` : ''}${(section.paragraphs || []).map(p => `<p>${escape(p)}</p>`).join('')}${section.links?.length ? `<div class="paper-links">${section.links.map(link => `<a href="${safeUrl(link.url)}">${escape(link.label)} ${icon('arrow')}</a>`).join('')}</div>` : ''}</section>`;
    }).join('') : `<section class="beyond-empty" aria-labelledby="more-title"><h3 id="more-title">More to come.</h3></section>`}
    <a class="text-link return-link" href="../index.html">${icon('arrow', 'back-arrow')} Back to my research</a>
    ${sections.some(section => section.type === 'pet' && section.photos?.length) ? photoDialog() : ''}`;
}
function render(isBeyond = false) {
  const prefix = isBeyond ? '../' : '';
  const nav = [['About', 'about'], ['Research', 'research'], ['Publications', 'publications'], ['Background', 'background']];
  const title = `${isBeyond ? 'Beyond Research · ' : ''}${profile.name} | ${profile.institution}`;
  const description = isBeyond ? `${profile.name} beyond research — interests, experiences, and everyday life.` : `${profile.name}, Ph.D. student at the University of Melbourne. Research in LLM robustness, post-training, trustworthy machine learning, and statistical learning.`;
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="description" content="${escape(description)}">
  <meta name="theme-color" content="#f4f7fa">
  <meta property="og:type" content="website">
  <meta property="og:title" content="${escape(title)}">
  <meta property="og:description" content="${escape(description)}">
  <title>${escape(title)}</title>
  <link rel="icon" href="${prefix}assets/favicon.svg" type="image/svg+xml">
  <link rel="stylesheet" href="${prefix}assets/css/personal.css">
  <script src="${prefix}assets/js/personal.js" defer></script>
</head>
<body class="${isBeyond ? 'beyond-page' : 'home-page'}">
  <a class="skip-link" href="#main">Skip to content</a>
  <header class="site-header">
    <div class="header-inner">
      <a class="wordmark" href="${isBeyond ? '../index.html' : './index.html'}" aria-label="${escape(profile.name)} — home"><span class="monogram">${escape(profile.initials)}<span>.</span></span><span class="wordmark-caption">Personal homepage</span></a>
      <button class="menu-toggle" type="button" aria-controls="main-navigation" aria-expanded="false"><span>Menu</span><span class="menu-lines" aria-hidden="true"></span></button>
      <nav class="main-navigation" id="main-navigation" aria-label="Main navigation">
        ${nav.map(([label, id]) => `<a href="${isBeyond ? '../index.html' : ''}#${id}"${!isBeyond ? ` data-section="${id}"${id === 'about' ? ' class="is-active" aria-current="location"' : ''}` : ''}>${label}</a>`).join('\n        ')}
        <a class="beyond-nav${isBeyond ? ' is-active' : ''}" href="${prefix}beyond/index.html"${isBeyond ? ' aria-current="page"' : ''}>Beyond Research<span class="nav-dot" aria-hidden="true"></span></a>
      </nav>
    </div>
  </header>
  <div class="page-shell">
    <aside class="profile" aria-label="Profile">
      <div class="portrait-wrap"><img class="portrait" src="${prefix}${safeUrl(profile.photo)}" alt="${escape(profile.photoAlt)}" width="216" height="226" fetchpriority="high"></div>
      <h1>${escape(profile.name)}</h1>
      <p class="profile-role">${escape(profile.role)}</p>
      <p class="profile-department">${escape(profile.department)}</p>
      <a class="institution" href="${safeUrl(profile.institutionUrl)}">${escape(profile.institution)}</a>
      <p class="profile-location">${officeMap()}<span>${escape(profile.location)}</span></p>
      <a class="profile-email" href="mailto:${escape(profile.email)}">${icon('mail')}<span>${escape(profile.email)}</span></a>
      <div class="profile-links" aria-label="Academic and social profiles">
        ${resource('Google Scholar', profile.scholar, 'scholar')}
        ${resource('LinkedIn', profile.linkedin, 'linkedin')}
        ${resource('GitHub', profile.github, 'github')}
        ${profile.cv ? resource('Curriculum vitae', profile.cv.startsWith('http') ? profile.cv : prefix + profile.cv, 'file') : ''}
      </div>
      <div class="profile-footnote"><span class="small-rule" aria-hidden="true"></span><p>Research, learning,<br>and a little life in between.</p></div>
    </aside>
    <main id="main" class="main-content" tabindex="-1">${isBeyond ? beyond() : home()}</main>
  </div>
  <footer class="site-footer"><div class="footer-inner"><span>© ${new Date().getFullYear()} ${escape(profile.name)}</span><span>Made with curiosity. Based in Melbourne.</span><a href="#${isBeyond ? 'main' : 'about'}">Back to top ↑</a></div></footer>
</body>
</html>
`;
}
await mkdir(path.join(root, 'beyond'), { recursive: true });
await writeFile(path.join(root, 'index.html'), render());
await writeFile(path.join(root, 'beyond/index.html'), render(true));
console.log('Built index.html and beyond/index.html from homepage.json');
