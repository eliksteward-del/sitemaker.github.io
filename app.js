// ── Block definitions ────────────────────────────────────────────────────────
const BLOCK_DEFS = [
  {
    type: 'hero',
    label: 'Hero Section',
    icon: '🚀',
    create() {
      const el = div('cb-hero');
      el.innerHTML = `
        <h1 contenteditable="true" spellcheck="false">Welcome to My Site</h1>
        <p contenteditable="true" spellcheck="false">A beautiful, fast website. Start editing to make it yours.</p>
        <a contenteditable="true" spellcheck="false" href="#">Get Started</a>`;
      return el;
    },
    props: ['bgGradient', 'align'],
  },
  {
    type: 'navbar',
    label: 'Navigation Bar',
    icon: '🔗',
    create() {
      const el = div('cb-navbar');
      el.innerHTML = `
        <span class="nav-brand" contenteditable="true" spellcheck="false">MySite</span>
        <div class="nav-links">
          <span contenteditable="true" spellcheck="false">Home</span>
          <span contenteditable="true" spellcheck="false">About</span>
          <span contenteditable="true" spellcheck="false">Contact</span>
        </div>`;
      return el;
    },
  },
  {
    type: 'heading',
    label: 'Heading',
    icon: 'H',
    create() {
      const el = div('cb-heading');
      el.innerHTML = `<h2 contenteditable="true" spellcheck="false">Section Title</h2>`;
      return el;
    },
    props: ['headingLevel', 'align', 'color'],
  },
  {
    type: 'text',
    label: 'Text',
    icon: '¶',
    create() {
      const el = div('cb-text');
      el.innerHTML = `<p contenteditable="true" spellcheck="false">Click here to edit your text. Add your own content, tell your story, and engage your visitors.</p>`;
      return el;
    },
    props: ['align', 'color', 'fontSize'],
  },
  {
    type: 'button',
    label: 'Button',
    icon: '▶',
    create() {
      const el = div('cb-button');
      el.innerHTML = `<a contenteditable="true" spellcheck="false">Click Me</a>`;
      return el;
    },
    props: ['buttonColor', 'buttonUrl', 'align'],
  },
  {
    type: 'image',
    label: 'Image',
    icon: '🖼',
    create() {
      const el = div('cb-image');
      el.innerHTML = `
        <div class="img-placeholder" title="Click to set image URL">
          <span>🖼</span> Click to add image
        </div>`;
      el.querySelector('.img-placeholder').addEventListener('click', () => pickImage(el));
      return el;
    },
    props: ['imageUrl', 'altText'],
  },
  {
    type: 'columns',
    label: 'Two Columns',
    icon: '⊞',
    create() {
      const el = div('cb-columns');
      el.innerHTML = `
        <div class="col">
          <h4 contenteditable="true" spellcheck="false">Column One</h4>
          <p contenteditable="true" spellcheck="false">Edit this column text to describe your content.</p>
        </div>
        <div class="col">
          <h4 contenteditable="true" spellcheck="false">Column Two</h4>
          <p contenteditable="true" spellcheck="false">Edit this column text to describe your content.</p>
        </div>`;
      return el;
    },
  },
  {
    type: 'divider',
    label: 'Divider',
    icon: '—',
    create() {
      const el = div('cb-divider');
      el.innerHTML = `<hr>`;
      return el;
    },
  },
];

// ── Utility ───────────────────────────────────────────────────────────────────
function div(...classes) {
  const el = document.createElement('div');
  if (classes.length) el.className = classes.join(' ');
  return el;
}

function uid() {
  return 'b' + Math.random().toString(36).slice(2, 9);
}

/** Allow only http: and https: URLs; return '#' for anything else (allowlist approach) */
function sanitizeUrl(url) {
  if (!url) return '#';
  const s = url.trim();
  try {
    const parsed = new URL(s);
    // Allowlist: only http and https
    return (parsed.protocol === 'http:' || parsed.protocol === 'https:') ? parsed.href : '#';
  } catch (_) {
    // Relative URL: reject if it contains a scheme-like pattern before any slash
    const colonIdx = s.indexOf(':');
    const slashIdx = s.indexOf('/');
    if (colonIdx !== -1 && (slashIdx === -1 || colonIdx < slashIdx)) return '#';
    return s;
  }
}

const HERO_BACKGROUNDS = [
  'linear-gradient(135deg,#ede9fe,#dbeafe)',
  'linear-gradient(135deg,#d1fae5,#a7f3d0)',
  'linear-gradient(135deg,#fef9c3,#fde68a)',
  'linear-gradient(135deg,#fee2e2,#fecaca)',
  'linear-gradient(135deg,#f0f9ff,#e0f2fe)',
  '#ffffff',
  '#111827',
];

const TEXT_ALIGNMENTS = ['left', 'center', 'right'];
const HEADING_LEVELS = ['h1', 'h2', 'h3'];
const FONT_SIZES = ['.85rem', '1rem', '1.15rem', '1.35rem'];

function sanitizeColor(value, fallback = '') {
  return /^#(?:[0-9a-fA-F]{3}){1,2}$/.test(value || '') ? value : fallback;
}

function sanitizeAlignment(value) {
  return TEXT_ALIGNMENTS.includes(value) ? value : '';
}

function sanitizeHeroBackground(value) {
  return HERO_BACKGROUNDS.includes(value) ? value : HERO_BACKGROUNDS[0];
}

function sanitizeHeadingLevelValue(value) {
  return HEADING_LEVELS.includes(value) ? value : 'h2';
}

function sanitizeFontSizeValue(value) {
  return FONT_SIZES.includes(value) ? value : '1rem';
}

function buildStyleAttr(styles) {
  const safeStyle = Object.entries(styles)
    .filter(([, value]) => value)
    .map(([key, value]) => `${key}:${value}`)
    .join(';');
  return safeStyle ? ` style="${escapeHTML(safeStyle)}"` : '';
}

function safeText(value, fallback = '') {
  return typeof value === 'string' ? value : fallback;
}

function slugifySiteName(value) {
  const slug = safeText(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 32);
  return slug || 'my-site';
}

function isValidSiteSlug(value) {
  return /^[a-z0-9](?:[a-z0-9-]{1,30}[a-z0-9])?$/.test(value);
}

// ── State ─────────────────────────────────────────────────────────────────────
let selectedBlock = null;
let dragSrcType   = null; // type from sidebar
let dragSrcBlock  = null; // existing block being reordered

// ── DOM refs ──────────────────────────────────────────────────────────────────
const canvas          = document.getElementById('canvas');
const emptyMsg        = document.getElementById('canvas-empty-msg');
const propsPanel      = document.getElementById('props-panel');
const propsEmpty      = document.getElementById('props-empty');
const propsContent    = document.getElementById('props-content');
const previewOverlay  = document.getElementById('preview-overlay');
const previewIframe   = document.getElementById('preview-iframe');
const templatesOverlay = document.getElementById('templates-overlay');
const publishOverlay  = document.getElementById('publish-overlay');
const pageTitleInput  = document.getElementById('page-title-input');
const publishSlugInput = document.getElementById('publish-slug-input');
const publishUrlOutput = document.getElementById('publish-url-output');
const publishStatus   = document.getElementById('publish-status');

// ── Sidebar block items ────────────────────────────────────────────────────────
function buildSidebar() {
  const container = document.getElementById('sidebar-blocks');
  BLOCK_DEFS.forEach(def => {
    const item = div('block-item');
    item.draggable = true;
    item.dataset.type = def.type;
    item.innerHTML = `<span class="icon">${def.icon}</span><span>${def.label}</span>`;
    item.addEventListener('dragstart', e => {
      dragSrcType  = def.type;
      dragSrcBlock = null;
      e.dataTransfer.effectAllowed = 'copy';
    });
    // Also allow click-to-add
    item.addEventListener('click', () => addBlock(def.type));
    container.appendChild(item);
  });
}

// ── Canvas drag-over / drop ───────────────────────────────────────────────────
canvas.addEventListener('dragover', e => {
  e.preventDefault();
  e.dataTransfer.dropEffect = dragSrcBlock ? 'move' : 'copy';
  canvas.classList.add('drag-over');

  // Show insertion point
  const afterEl = getDragAfterElement(canvas, e.clientY);
  const placeholder = document.querySelector('.drop-placeholder') || (() => {
    const p = div('drop-placeholder');
    return p;
  })();

  if (afterEl) canvas.insertBefore(placeholder, afterEl);
  else canvas.appendChild(placeholder);
});

canvas.addEventListener('dragleave', e => {
  if (!canvas.contains(e.relatedTarget)) {
    canvas.classList.remove('drag-over');
    document.querySelector('.drop-placeholder')?.remove();
  }
});

canvas.addEventListener('drop', e => {
  e.preventDefault();
  canvas.classList.remove('drag-over');
  const placeholder = document.querySelector('.drop-placeholder');

  if (dragSrcType) {
    const wrapper = createBlockWrapper(dragSrcType);
    if (placeholder) canvas.insertBefore(wrapper, placeholder);
    else canvas.appendChild(wrapper);
    selectBlock(wrapper);
  } else if (dragSrcBlock) {
    if (placeholder) canvas.insertBefore(dragSrcBlock, placeholder);
    else canvas.appendChild(dragSrcBlock);
  }

  placeholder?.remove();
  dragSrcType = dragSrcBlock = null;
  updateEmptyMsg();
});

function getDragAfterElement(container, y) {
  const els = [...container.querySelectorAll('.canvas-block:not(.dragging)')];
  return els.reduce((closest, child) => {
    const box = child.getBoundingClientRect();
    const offset = y - box.top - box.height / 2;
    if (offset < 0 && offset > closest.offset) return { offset, element: child };
    return closest;
  }, { offset: Number.NEGATIVE_INFINITY }).element;
}

// ── Add block programmatically ────────────────────────────────────────────────
function addBlock(type, insertAfter = null) {
  const wrapper = createBlockWrapper(type);
  if (insertAfter) insertAfter.after(wrapper);
  else canvas.appendChild(wrapper);
  selectBlock(wrapper);
  updateEmptyMsg();
  wrapper.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// ── Create a block wrapper ────────────────────────────────────────────────────
function createBlockWrapper(type) {
  const def = BLOCK_DEFS.find(d => d.type === type);
  if (!def) return;

  const wrapper = div('canvas-block');
  wrapper.dataset.type  = type;
  wrapper.dataset.id    = uid();

  // Actions bar
  const actions = div('block-actions');
  actions.innerHTML = `
    <button class="block-action-btn drag-handle" title="Drag to reorder">⠿</button>
    <button class="block-action-btn" data-action="up"  title="Move up">↑</button>
    <button class="block-action-btn" data-action="down" title="Move down">↓</button>
    <button class="block-action-btn" data-action="dup"  title="Duplicate">⧉</button>
    <button class="block-action-btn del" data-action="del" title="Delete">✕</button>`;

  actions.querySelector('.drag-handle').addEventListener('mousedown', () => {
    wrapper.draggable = true;
  });

  actions.querySelectorAll('[data-action]').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      handleBlockAction(wrapper, btn.dataset.action);
    });
  });

  wrapper.draggable = false;
  wrapper.addEventListener('dragstart', e => {
    if (!wrapper.draggable) { e.preventDefault(); return; }
    dragSrcBlock = wrapper;
    dragSrcType  = null;
    wrapper.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
    setTimeout(() => { wrapper.style.opacity = '.4'; }, 0);
  });
  wrapper.addEventListener('dragend', () => {
    wrapper.draggable = false;
    wrapper.classList.remove('dragging');
    wrapper.style.opacity = '';
    dragSrcBlock = null;
    updateEmptyMsg();
  });

  wrapper.addEventListener('mouseup', () => { wrapper.draggable = false; });

  // Block content
  const content = def.create();
  wrapper.appendChild(actions);
  wrapper.appendChild(content);

  wrapper.addEventListener('click', e => {
    e.stopPropagation();
    selectBlock(wrapper);
  });

  return wrapper;
}

function handleBlockAction(wrapper, action) {
  if (action === 'del') {
    if (selectedBlock === wrapper) deselect();
    wrapper.remove();
    updateEmptyMsg();
  } else if (action === 'up') {
    const prev = wrapper.previousElementSibling;
    if (prev && prev.classList.contains('canvas-block')) prev.before(wrapper);
  } else if (action === 'down') {
    const next = wrapper.nextElementSibling;
    if (next && next.classList.contains('canvas-block')) next.after(wrapper);
  } else if (action === 'dup') {
    const clone = wrapper.cloneNode(true);
    clone.dataset.id = uid();
    rewireBlockClone(clone);
    wrapper.after(clone);
    selectBlock(clone);
  }
}

function rewireBlockClone(clone) {
  const type = clone.dataset.type;
  const def  = BLOCK_DEFS.find(d => d.type === type);

  // Re-attach image placeholder click if needed
  if (type === 'image') {
    clone.querySelector('.img-placeholder')?.addEventListener('click', () => pickImage(clone));
  }

  // Re-wire action buttons
  const actions = clone.querySelector('.block-actions');
  actions?.querySelector('.drag-handle')?.addEventListener('mousedown', () => {
    clone.draggable = true;
  });
  actions?.querySelectorAll('[data-action]').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      handleBlockAction(clone, btn.dataset.action);
    });
  });

  clone.draggable = false;
  clone.addEventListener('dragstart', e => {
    if (!clone.draggable) { e.preventDefault(); return; }
    dragSrcBlock = clone;
    dragSrcType  = null;
    clone.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
    setTimeout(() => { clone.style.opacity = '.4'; }, 0);
  });
  clone.addEventListener('dragend', () => {
    clone.draggable = false;
    clone.classList.remove('dragging');
    clone.style.opacity = '';
    dragSrcBlock = null;
    updateEmptyMsg();
  });
  clone.addEventListener('mouseup', () => { clone.draggable = false; });
  clone.addEventListener('click', e => {
    e.stopPropagation();
    selectBlock(clone);
  });
}

// ── Selection & properties ────────────────────────────────────────────────────
function selectBlock(wrapper) {
  if (selectedBlock) selectedBlock.classList.remove('selected');
  selectedBlock = wrapper;
  wrapper.classList.add('selected');
  renderProps(wrapper);
}

function deselect() {
  if (selectedBlock) selectedBlock.classList.remove('selected');
  selectedBlock = null;
  propsEmpty.style.display  = '';
  propsContent.style.display = 'none';
}

document.addEventListener('click', e => {
  if (!canvas.contains(e.target) && !propsPanel.contains(e.target)) deselect();
});

// ── Properties panel ──────────────────────────────────────────────────────────
function renderProps(wrapper) {
  propsEmpty.style.display   = 'none';
  propsContent.style.display = '';
  propsContent.innerHTML     = '';

  const type = wrapper.dataset.type;
  const def  = BLOCK_DEFS.find(d => d.type === type);

  const title = document.createElement('h3');
  title.textContent = def?.label ?? type;
  propsContent.appendChild(title);

  // ── Generic props ──────────────────────────────────────────────────────────
  if (!def?.props) {
    addPropsNote('Click elements directly on the canvas to edit their text.');
    return;
  }

  (def.props || []).forEach(prop => {
    if (prop === 'align') addAlignProp(wrapper);
    if (prop === 'color') addColorProp(wrapper, 'Text Color', el => {
      el.querySelectorAll('[contenteditable]').forEach(c => c.style.color = el._color || '');
    });
    if (prop === 'bgGradient') addBgGradientProp(wrapper);
    if (prop === 'headingLevel') addHeadingLevelProp(wrapper);
    if (prop === 'fontSize') addFontSizeProp(wrapper);
    if (prop === 'buttonColor') addButtonColorProp(wrapper);
    if (prop === 'buttonUrl')   addButtonUrlProp(wrapper);
    if (prop === 'imageUrl')    addImageUrlProp(wrapper);
    if (prop === 'altText')     addAltTextProp(wrapper);
  });

  addPropsNote('Click text on the canvas to edit it inline.');
}

function addPropsNote(msg) {
  const p = document.createElement('p');
  p.className = 'prop-note';
  p.textContent = msg;
  propsContent.appendChild(p);
}

function propGroup(label) {
  const g = div('prop-group');
  const l = document.createElement('label');
  l.textContent = label;
  g.appendChild(l);
  propsContent.appendChild(g);
  return g;
}

function addAlignProp(wrapper) {
  const g = propGroup('Alignment');
  const sel = document.createElement('select');
  sel.innerHTML = `<option value="">Default</option>
    <option value="left">Left</option>
    <option value="center">Center</option>
    <option value="right">Right</option>`;

  const inner = wrapper.querySelector('[class^="cb-"]');
  sel.value = inner?.style.textAlign || '';
  sel.addEventListener('change', () => {
    if (inner) inner.style.textAlign = sel.value;
  });
  g.appendChild(sel);
}

function addColorProp(wrapper, label, apply) {
  const g = propGroup(label);
  const inp = document.createElement('input');
  inp.type = 'color';
  inp.value = wrapper._color || '#374151';
  inp.addEventListener('input', () => {
    wrapper._color = inp.value;
    apply(wrapper);
  });
  g.appendChild(inp);
}

function addBgGradientProp(wrapper) {
  const g = propGroup('Background');
  const sel = document.createElement('select');
  sel.innerHTML = `
    <option value="linear-gradient(135deg,#ede9fe,#dbeafe)">Purple → Blue</option>
    <option value="linear-gradient(135deg,#d1fae5,#a7f3d0)">Teal</option>
    <option value="linear-gradient(135deg,#fef9c3,#fde68a)">Yellow</option>
    <option value="linear-gradient(135deg,#fee2e2,#fecaca)">Red</option>
    <option value="linear-gradient(135deg,#f0f9ff,#e0f2fe)">Sky</option>
    <option value="#ffffff">White</option>
    <option value="#111827">Dark</option>`;

  const inner = wrapper.querySelector('.cb-hero');
  sel.value = inner?.style.background || '';
  sel.addEventListener('change', () => {
    if (inner) inner.style.background = sel.value;
  });
  g.appendChild(sel);
}

function addHeadingLevelProp(wrapper) {
  const g = propGroup('Heading level');
  const sel = document.createElement('select');
  sel.innerHTML = `<option value="h1">H1 – Large</option>
    <option value="h2">H2 – Medium</option>
    <option value="h3">H3 – Small</option>`;

  const inner = wrapper.querySelector('.cb-heading');
  const current = inner?.querySelector('h1,h2,h3');
  sel.value = current?.tagName.toLowerCase() || 'h2';

  sel.addEventListener('change', () => {
    const cur = inner.querySelector('h1,h2,h3');
    const allowed = ['h1', 'h2', 'h3'];
    const tag = allowed.includes(sel.value) ? sel.value : 'h2';
    const newH = document.createElement(tag);
    newH.contentEditable = 'true';
    newH.spellcheck = false;
    newH.textContent = cur?.textContent || 'Section Title';
    cur?.replaceWith(newH);
  });
  g.appendChild(sel);
}

function addFontSizeProp(wrapper) {
  const g = propGroup('Font size');
  const sel = document.createElement('select');
  sel.innerHTML = `<option value=".85rem">Small</option>
    <option value="1rem">Normal</option>
    <option value="1.15rem">Large</option>
    <option value="1.35rem">Extra Large</option>`;

  const inner = wrapper.querySelector('.cb-text p');
  sel.value = inner?.style.fontSize || '1rem';
  sel.addEventListener('change', () => {
    if (inner) inner.style.fontSize = sel.value;
  });
  g.appendChild(sel);
}

function addButtonColorProp(wrapper) {
  const g = propGroup('Button color');
  const inp = document.createElement('input');
  inp.type = 'color';
  const btn = wrapper.querySelector('.cb-button a');
  inp.value = wrapper._btnColor || '#4f6ef7';
  inp.addEventListener('input', () => {
    wrapper._btnColor = inp.value;
    if (btn) btn.style.background = inp.value;
  });
  g.appendChild(inp);
}

function addButtonUrlProp(wrapper) {
  const g = propGroup('Button URL');
  const inp = document.createElement('input');
  inp.type = 'text';
  inp.placeholder = 'https://example.com';
  const btn = wrapper.querySelector('.cb-button a');
  inp.value = btn?.getAttribute('href') || '#';
  inp.addEventListener('input', () => {
    if (!btn) return;
    // NOTE: allowlist check is kept inline (not delegated to sanitizeUrl) so that
    // static-analysis tools can verify the taint is fully eliminated at this sink.
    let safeHref = '#';
    try {
      const parsed = new URL(inp.value.trim());
      if (parsed.protocol === 'http:' || parsed.protocol === 'https:') {
        safeHref = parsed.href;
      }
    } catch (_) { /* keep '#' */ }
    btn.setAttribute('href', safeHref);
  });
  g.appendChild(inp);
}

function addImageUrlProp(wrapper) {
  const g = propGroup('Image URL');
  const inp = document.createElement('input');
  inp.type = 'text';
  inp.placeholder = 'https://...';
  const img = wrapper.querySelector('img');
  inp.value = img?.src || '';
  inp.addEventListener('change', () => setImage(wrapper, inp.value));
  g.appendChild(inp);
}

function addAltTextProp(wrapper) {
  const g = propGroup('Alt text');
  const inp = document.createElement('input');
  inp.type = 'text';
  const img = wrapper.querySelector('img');
  inp.value = img?.alt || '';
  inp.addEventListener('input', () => {
    if (img) img.alt = inp.value;
  });
  g.appendChild(inp);
}

// ── Image helpers ─────────────────────────────────────────────────────────────
function pickImage(wrapper) {
  const url = prompt('Enter image URL:', 'https://picsum.photos/800/400');
  if (url) setImage(wrapper, url);
}

function setImage(wrapper, url) {
  if (!url) return;
  // NOTE: allowlist check is kept inline (not delegated to sanitizeUrl) so that
  // static-analysis tools can verify the taint is fully eliminated at this sink.
  let safeSrc = '';
  try {
    const parsed = new URL(url.trim());
    if (parsed.protocol === 'http:' || parsed.protocol === 'https:') {
      safeSrc = parsed.href;
    }
  } catch (_) { /* ignore invalid URLs */ }
  if (!safeSrc) return;

  const container = wrapper.querySelector('.cb-image');
  const ph = container.querySelector('.img-placeholder');
  let img = container.querySelector('img');
  if (!img) {
    img = document.createElement('img');
    if (ph) ph.replaceWith(img);
    else container.appendChild(img);
  }
  img.src = safeSrc;
  img.alt = '';
  // Update props panel if open
  const urlInp = propsContent.querySelector('input[placeholder="https://..."]');
  if (urlInp) urlInp.value = safeSrc;
}

// ── Empty canvas message ──────────────────────────────────────────────────────
function updateEmptyMsg() {
  const hasBlocks = canvas.querySelector('.canvas-block');
  emptyMsg.style.display = hasBlocks ? 'none' : '';
}

// ── Preview ───────────────────────────────────────────────────────────────────
function openPreview() {
  const html = buildExportHTML(true);
  previewIframe.srcdoc = html;
  previewOverlay.classList.add('open');
}

function closePreview() {
  previewOverlay.classList.remove('open');
}

// ── Export ────────────────────────────────────────────────────────────────────
function exportSite() {
  const html = buildExportHTML(false);
  const blob = new Blob([html], { type: 'text/html' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = (pageTitleInput.value.trim() || 'my-site') + '.html';
  a.click();
  URL.revokeObjectURL(a.href);
}

function collectSiteState() {
  return {
    title: pageTitleInput.value.trim() || 'My Site',
    blocks: [...canvas.querySelectorAll('.canvas-block')].map(serializeBlock).filter(Boolean),
  };
}

function serializeBlock(wrapper) {
  const type = wrapper.dataset.type;

  if (type === 'hero') {
    const inner = wrapper.querySelector('.cb-hero');
    const button = inner?.querySelector('a');
    return {
      type,
      heading: inner?.querySelector('h1')?.textContent || 'Welcome to My Site',
      text: inner?.querySelector('p')?.textContent || 'A beautiful, fast website. Start editing to make it yours.',
      buttonText: button?.textContent || 'Get Started',
      buttonUrl: sanitizeUrl(button?.getAttribute('href') || '#'),
      background: sanitizeHeroBackground(inner?.style.background || ''),
      align: sanitizeAlignment(inner?.style.textAlign || ''),
    };
  }

  if (type === 'navbar') {
    return {
      type,
      brand: wrapper.querySelector('.nav-brand')?.textContent || 'MySite',
      links: [...wrapper.querySelectorAll('.nav-links span')].map(link => link.textContent || 'Link').slice(0, 6),
    };
  }

  if (type === 'heading') {
    const heading = wrapper.querySelector('.cb-heading h1, .cb-heading h2, .cb-heading h3');
    const inner = wrapper.querySelector('.cb-heading');
    return {
      type,
      level: sanitizeHeadingLevelValue(heading?.tagName.toLowerCase() || 'h2'),
      text: heading?.textContent || 'Section Title',
      align: sanitizeAlignment(inner?.style.textAlign || ''),
      color: sanitizeColor(wrapper._color || ''),
    };
  }

  if (type === 'text') {
    const paragraph = wrapper.querySelector('.cb-text p');
    const inner = wrapper.querySelector('.cb-text');
    return {
      type,
      text: paragraph?.textContent || 'Click here to edit your text. Add your own content, tell your story, and engage your visitors.',
      align: sanitizeAlignment(inner?.style.textAlign || ''),
      color: sanitizeColor(wrapper._color || ''),
      fontSize: sanitizeFontSizeValue(paragraph?.style.fontSize || '1rem'),
    };
  }

  if (type === 'button') {
    const button = wrapper.querySelector('.cb-button a');
    const inner = wrapper.querySelector('.cb-button');
    return {
      type,
      text: button?.textContent || 'Click Me',
      url: sanitizeUrl(button?.getAttribute('href') || '#'),
      align: sanitizeAlignment(inner?.style.textAlign || ''),
      color: sanitizeColor(wrapper._btnColor || '#4f6ef7', '#4f6ef7'),
    };
  }

  if (type === 'image') {
    const img = wrapper.querySelector('.cb-image img');
    return {
      type,
      src: img?.getAttribute('src') || '',
      alt: img?.getAttribute('alt') || '',
    };
  }

  if (type === 'columns') {
    const cols = wrapper.querySelectorAll('.cb-columns .col');
    return {
      type,
      columns: [...cols].slice(0, 2).map((col, index) => ({
        heading: col.querySelector('h4')?.textContent || `Column ${index + 1}`,
        text: col.querySelector('p')?.textContent || 'Edit this column text to describe your content.',
      })),
    };
  }

  if (type === 'divider') return { type };
  return null;
}

function normalizeSiteState(siteState) {
  const rawBlocks = Array.isArray(siteState?.blocks) ? siteState.blocks : [];
  return {
    title: safeText(siteState?.title, 'My Site').slice(0, 120) || 'My Site',
    blocks: rawBlocks.filter(block => block && typeof block === 'object').slice(0, 50),
  };
}

function buildLinkAttrs(url, forPreview, extraStyles = {}) {
  const safeHref = sanitizeUrl(url || '#');
  if (safeHref === '#') {
    return `href="#"${buildStyleAttr({
      ...(forPreview ? { 'pointer-events': 'none' } : {}),
      ...extraStyles,
    })}`;
  }
  return `href="${escapeHTML(safeHref)}"${buildStyleAttr(extraStyles)}`;
}

function buildBlockHTML(block, forPreview) {
  if (!block || typeof block !== 'object') return '';

  if (block.type === 'hero') {
    return `<section class="cb-hero"${buildStyleAttr({
      background: sanitizeHeroBackground(block.background),
      'text-align': sanitizeAlignment(block.align),
    })}>
      <h1>${escapeHTML(safeText(block.heading, 'Welcome to My Site'))}</h1>
      <p>${escapeHTML(safeText(block.text, 'A beautiful, fast website. Start editing to make it yours.'))}</p>
      <a ${buildLinkAttrs(block.buttonUrl, forPreview)}>${escapeHTML(safeText(block.buttonText, 'Get Started'))}</a>
    </section>`;
  }

  if (block.type === 'navbar') {
    const links = (Array.isArray(block.links) ? block.links : ['Home', 'About', 'Contact'])
      .map(link => `<span>${escapeHTML(safeText(link, 'Link'))}</span>`)
      .join('');
    return `<nav class="cb-navbar">
      <span class="nav-brand">${escapeHTML(safeText(block.brand, 'MySite'))}</span>
      <div class="nav-links">${links}</div>
    </nav>`;
  }

  if (block.type === 'heading') {
    const level = sanitizeHeadingLevelValue(block.level);
    return `<section class="cb-heading"${buildStyleAttr({ 'text-align': sanitizeAlignment(block.align) })}>
      <${level}${buildStyleAttr({ color: sanitizeColor(block.color || '') })}>${escapeHTML(safeText(block.text, 'Section Title'))}</${level}>
    </section>`;
  }

  if (block.type === 'text') {
    return `<section class="cb-text"${buildStyleAttr({ 'text-align': sanitizeAlignment(block.align) })}>
      <p${buildStyleAttr({
        color: sanitizeColor(block.color || ''),
        'font-size': sanitizeFontSizeValue(block.fontSize || '1rem'),
      })}>${escapeHTML(safeText(block.text, 'Click here to edit your text.'))}</p>
    </section>`;
  }

  if (block.type === 'button') {
    return `<section class="cb-button"${buildStyleAttr({ 'text-align': sanitizeAlignment(block.align) })}>
      <a ${buildLinkAttrs(block.url, forPreview, { background: sanitizeColor(block.color || '#4f6ef7', '#4f6ef7') })}>${escapeHTML(safeText(block.text, 'Click Me'))}</a>
    </section>`;
  }

  if (block.type === 'image') {
    const safeSrc = sanitizeUrl(block.src || '');
    if (!block.src || safeSrc === '#') {
      return `<section class="cb-image">
        <div class="img-placeholder"><span>🖼</span> Add an image</div>
      </section>`;
    }
    return `<section class="cb-image">
      <img src="${escapeHTML(safeSrc)}" alt="${escapeHTML(safeText(block.alt, ''))}">
    </section>`;
  }

  if (block.type === 'columns') {
    const columns = (Array.isArray(block.columns) ? block.columns : []).slice(0, 2);
    while (columns.length < 2) columns.push({ heading: `Column ${columns.length + 1}`, text: 'Edit this column text to describe your content.' });
    return `<section class="cb-columns">
      ${columns.map(col => `<div class="col">
        <h4>${escapeHTML(safeText(col.heading, 'Column'))}</h4>
        <p>${escapeHTML(safeText(col.text, 'Edit this column text to describe your content.'))}</p>
      </div>`).join('')}
    </section>`;
  }

  if (block.type === 'divider') {
    return `<section class="cb-divider"><hr></section>`;
  }

  return '';
}

function buildSiteHTMLFromState(siteState, forPreview) {
  const state = normalizeSiteState(siteState);
  const bodyParts = state.blocks.map(block => buildBlockHTML(block, forPreview)).filter(Boolean);
  const title = state.title || 'My Site';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHTML(title)}</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Segoe UI', system-ui, sans-serif; color: #1f2937; }
    .cb-hero {
      padding: 60px 24px;
      text-align: center;
      background: linear-gradient(135deg, #ede9fe, #dbeafe);
    }
    .cb-hero h1 { font-size: 2.4rem; font-weight: 800; margin-bottom: 14px; }
    .cb-hero p  { font-size: 1.1rem; color: #4b5563; max-width: 560px; margin: 0 auto 24px; }
    .cb-hero a  { display: inline-block; padding: 12px 32px; background: #4f6ef7; color: #fff; border-radius: 6px; text-decoration: none; font-weight: 700; }
    .cb-navbar { background: #fff; border-bottom: 1px solid #e5e7eb; padding: 14px 32px; display: flex; align-items: center; gap: 20px; }
    .cb-navbar .nav-brand { font-weight: 800; font-size: 1.1rem; }
    .cb-navbar .nav-links { display: flex; gap: 20px; }
    .cb-navbar .nav-links span { color: #6b7280; font-size: .9rem; }
    .cb-heading { padding: 20px 32px 8px; }
    .cb-heading h1 { font-size: 2rem; font-weight: 800; }
    .cb-heading h2 { font-size: 1.5rem; font-weight: 700; }
    .cb-heading h3 { font-size: 1.2rem; font-weight: 600; }
    .cb-text { padding: 8px 32px; }
    .cb-text p  { font-size: 1rem; line-height: 1.7; color: #374151; }
    .cb-button { padding: 16px 32px; }
    .cb-button a { display: inline-block; padding: 11px 28px; background: #4f6ef7; color: #fff; border-radius: 6px; text-decoration: none; font-weight: 600; }
    .cb-image { padding: 16px 32px; text-align: center; }
    .cb-image img { max-width: 100%; border-radius: 6px; }
    .cb-image .img-placeholder {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      width: min(100%, 720px);
      min-height: 160px;
      border: 2px dashed #d1d5db;
      border-radius: 8px;
      color: #6b7280;
      background: #f0f2f7;
    }
    .cb-columns { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; padding: 16px 32px; }
    .cb-columns .col { padding: 20px; background: #f9fafb; border-radius: 8px; }
    .cb-columns .col h4 { font-size: 1rem; font-weight: 700; margin-bottom: 8px; }
    .cb-columns .col p  { font-size: .9rem; color: #374151; }
    .cb-divider { padding: 8px 32px; }
    .cb-divider hr { border: none; border-top: 2px solid #e5e7eb; }
    @media (max-width: 600px) {
      .cb-columns { grid-template-columns: 1fr; }
      .cb-hero h1 { font-size: 1.7rem; }
    }
  </style>
</head>
<body>
${bodyParts.join('\n')}
</body>
</html>`;
}

function buildExportHTML(forPreview) {
  return buildSiteHTMLFromState(collectSiteState(), forPreview);
}

async function compressText(text) {
  if (typeof CompressionStream !== 'function') {
    return `plain.${btoa(unescape(encodeURIComponent(text))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '')}`;
  }

  const stream = new CompressionStream('gzip');
  const writer = stream.writable.getWriter();
  writer.write(new TextEncoder().encode(text));
  writer.close();
  const buffer = await new Response(stream.readable).arrayBuffer();
  return `gz.${bytesToBase64Url(new Uint8Array(buffer))}`;
}

async function decompressText(payload) {
  const [format, data = ''] = safeText(payload).split('.', 2);
  if (!data) throw new Error('Missing publish data.');

  if (format === 'plain') {
    return decodeURIComponent(escape(atob(base64UrlToBase64(data))));
  }

  if (format === 'gz') {
    if (typeof DecompressionStream !== 'function') throw new Error('This browser cannot open published links.');
    const bytes = base64UrlToBytes(data);
    const stream = new DecompressionStream('gzip');
    const writer = stream.writable.getWriter();
    writer.write(bytes);
    writer.close();
    return await new Response(stream.readable).text();
  }

  throw new Error('Unsupported publish data format.');
}

function bytesToBase64Url(bytes) {
  let binary = '';
  const chunkSize = 0x8000;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
  }
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

function base64UrlToBase64(value) {
  const padded = value.replace(/-/g, '+').replace(/_/g, '/');
  const remainder = padded.length % 4;
  const paddingLength = remainder === 0 ? 0 : 4 - remainder;
  return padded + '='.repeat(paddingLength);
}

function base64UrlToBytes(value) {
  const binary = atob(base64UrlToBase64(value));
  return Uint8Array.from(binary, char => char.charCodeAt(0));
}

function setPublishMessage(message, tone = '') {
  publishStatus.textContent = message;
  publishStatus.className = `publish-status${tone ? ` ${tone}` : ''}`;
}

async function generatePublishUrl() {
  const slug = slugifySiteName(publishSlugInput.value || pageTitleInput.value);
  const safeSlug = slug.replace(/[^a-z0-9-]/g, '');
  publishSlugInput.value = slug;
  if (!isValidSiteSlug(slug)) {
    publishUrlOutput.value = '';
    setPublishMessage('Pick a site name with 3–32 letters, numbers, or hyphens.', 'error');
    return '';
  }

  setPublishMessage('Generating your free published link...');
  const payload = await compressText(JSON.stringify(collectSiteState()));
  const url = new URL(window.location.href);
  url.search = '';
  url.hash = '';
  url.searchParams.set('published', '1');
  url.searchParams.set('site', slug);
  url.searchParams.set('data', payload);
  publishUrlOutput.value = url.toString();
  setPublishMessage(`Your site is ready. Share this free SiteMaker link for "${safeSlug}".`, 'success');
  return publishUrlOutput.value;
}

function refreshPublishUrl() {
  generatePublishUrl().catch(() => {
    publishUrlOutput.value = '';
    setPublishMessage('We could not generate a published link right now.', 'error');
  });
}

function openPublish() {
  publishSlugInput.value = slugifySiteName(pageTitleInput.value);
  publishUrlOutput.value = '';
  setPublishMessage('Create a free published link for your site.');
  publishOverlay.classList.add('open');
  refreshPublishUrl();
}

function closePublish() {
  publishOverlay.classList.remove('open');
}

async function copyPublishLink() {
  const url = publishUrlOutput.value || await generatePublishUrl();
  if (!url) return;

  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(url);
  } else {
    publishUrlOutput.focus();
    publishUrlOutput.select();
    document.execCommand('copy');
  }
  setPublishMessage('Published link copied to your clipboard.', 'success');
}

async function openPublishedSite() {
  const url = publishUrlOutput.value || await generatePublishUrl();
  if (url) window.open(url, '_blank', 'noopener');
}

async function renderPublishedSite() {
  let errorMessage = 'The publish data is missing or invalid. Create a new published link from the editor.';
  try {
    const params = new URLSearchParams(window.location.search);
    const payload = params.get('data');
    if (!payload) throw new Error('missing-publish-data');
    let parsedState;
    try {
      parsedState = JSON.parse(await decompressText(payload));
    } catch (_) {
      throw new Error('corrupted-publish-data');
    }
    const siteState = normalizeSiteState(parsedState);
    const html = buildSiteHTMLFromState(siteState, false);
    document.open();
    document.write(html);
    document.close();
    return true;
  } catch (error) {
    if (error?.message === 'corrupted-publish-data') {
      errorMessage = 'The published link contains corrupted data. Generate a fresh link from the editor.';
    } else if (error?.message === 'missing-publish-data') {
      errorMessage = 'This published link is missing its site data. Generate a fresh link from the editor.';
    }
    document.body.innerHTML = `
      <main style="min-height:100vh;display:grid;place-items:center;padding:24px;background:#f0f2f7;font-family:'Segoe UI',system-ui,sans-serif;">
        <div style="max-width:520px;background:#fff;padding:24px;border-radius:12px;box-shadow:0 20px 60px rgba(0,0,0,.12);text-align:center;">
          <h1 style="margin-bottom:12px;">This published link could not be opened</h1>
          <p style="margin-bottom:16px;color:#6b7280;">${escapeHTML(errorMessage)}</p>
          <a href="${escapeHTML(`${window.location.origin}${window.location.pathname}`)}" style="display:inline-block;padding:10px 18px;background:#4f6ef7;color:#fff;border-radius:6px;text-decoration:none;font-weight:600;">Back to SiteMaker</a>
        </div>
      </main>`;
    return false;
  }
}

function escapeHTML(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// ── Templates ─────────────────────────────────────────────────────────────────
const TEMPLATES = [
  {
    name: 'Blank',
    desc: 'Start from scratch',
    emoji: '⬜',
    blocks: [],
  },
  {
    name: 'Landing Page',
    desc: 'Hero + features + CTA',
    emoji: '🚀',
    blocks: ['navbar', 'hero', 'divider', 'heading', 'columns', 'divider', 'button'],
  },
  {
    name: 'Blog Post',
    desc: 'Heading + text sections',
    emoji: '📝',
    blocks: ['heading', 'text', 'image', 'text', 'divider', 'text'],
  },
  {
    name: 'Portfolio',
    desc: 'Showcase your work',
    emoji: '🎨',
    blocks: ['navbar', 'hero', 'heading', 'columns', 'image', 'divider', 'text'],
  },
  {
    name: 'Contact Page',
    desc: 'Info + button',
    emoji: '📧',
    blocks: ['navbar', 'heading', 'text', 'divider', 'button'],
  },
];

function buildTemplatesModal() {
  const grid = document.getElementById('templates-grid');
  TEMPLATES.forEach(tpl => {
    const card = div('template-card');
    card.innerHTML = `
      <div class="template-preview">${tpl.emoji}</div>
      <h4>${tpl.name}</h4>
      <p>${tpl.desc}</p>`;
    card.addEventListener('click', () => applyTemplate(tpl));
    grid.appendChild(card);
  });
}

function openTemplates() {
  templatesOverlay.classList.add('open');
}

function closeTemplates() {
  templatesOverlay.classList.remove('open');
}

function applyTemplate(tpl) {
  // Clear canvas
  canvas.querySelectorAll('.canvas-block').forEach(b => b.remove());
  deselect();
  // Add blocks
  tpl.blocks.forEach(type => {
    const w = createBlockWrapper(type);
    canvas.appendChild(w);
  });
  updateEmptyMsg();
  closeTemplates();
}

// ── Init ───────────────────────────────────────────────────────────────────────
function initEditor() {
  buildSidebar();
  buildTemplatesModal();
  updateEmptyMsg();

  document.getElementById('btn-preview').addEventListener('click', openPreview);
  document.getElementById('btn-export').addEventListener('click', exportSite);
  document.getElementById('btn-templates').addEventListener('click', openTemplates);
  document.getElementById('btn-publish').addEventListener('click', openPublish);
  document.getElementById('btn-preview-close').addEventListener('click', closePreview);
  document.getElementById('btn-templates-close').addEventListener('click', closeTemplates);
  document.getElementById('btn-publish-close').addEventListener('click', closePublish);
  document.getElementById('btn-copy-publish').addEventListener('click', () => { void copyPublishLink(); });
  document.getElementById('btn-open-publish').addEventListener('click', () => { void openPublishedSite(); });
  publishSlugInput.addEventListener('input', refreshPublishUrl);
  previewOverlay.addEventListener('click', e => { if (e.target === previewOverlay) closePreview(); });
  templatesOverlay.addEventListener('click', e => { if (e.target === templatesOverlay) closeTemplates(); });
  publishOverlay.addEventListener('click', e => { if (e.target === publishOverlay) closePublish(); });
}

const urlParams = new URLSearchParams(window.location.search);
if (urlParams.get('published') === '1' && urlParams.has('data')) {
  void renderPublishedSite();
} else {
  initEditor();
}
