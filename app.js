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

/** Allow only http/https/relative URLs; block javascript: and data: URLs */
function sanitizeUrl(url) {
  if (!url) return '#';
  const trimmed = url.trim();
  try {
    const parsed = new URL(trimmed, window.location.href);
    if (parsed.protocol === 'javascript:' || parsed.protocol === 'data:') return '#';
  } catch (_) {
    // relative URL – allow as-is
  }
  return trimmed;
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
const pageTitleInput  = document.getElementById('page-title-input');

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
    if (btn) btn.setAttribute('href', sanitizeUrl(inp.value));
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
  const container = wrapper.querySelector('.cb-image');
  const ph = container.querySelector('.img-placeholder');
  let img = container.querySelector('img');
  if (!img) {
    img = document.createElement('img');
    if (ph) ph.replaceWith(img);
    else container.appendChild(img);
  }
  img.src = sanitizeUrl(url);
  img.alt = '';
  // Update props panel if open
  const urlInp = propsContent.querySelector('input[placeholder="https://..."]');
  if (urlInp) urlInp.value = url;
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

function buildExportHTML(forPreview) {
  const title = pageTitleInput.value.trim() || 'My Site';
  const bodyParts = [];

  // Collect blocks
  canvas.querySelectorAll('.canvas-block').forEach(wrapper => {
    const inner = wrapper.querySelector('[class^="cb-"]');
    if (!inner) return;
    // Clone and strip editor chrome
    const clone = inner.cloneNode(true);
    clone.querySelectorAll('[contenteditable]').forEach(el => {
      el.removeAttribute('contenteditable');
      el.removeAttribute('spellcheck');
    });
    // Fix links
    clone.querySelectorAll('a').forEach(a => {
      if (!a.getAttribute('href') || a.getAttribute('href') === '#') {
        a.setAttribute('href', '#');
        a.style.pointerEvents = forPreview ? 'none' : '';
      }
    });
    bodyParts.push(clone.outerHTML);
  });

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
buildSidebar();
buildTemplatesModal();
updateEmptyMsg();

// Wire up global buttons
document.getElementById('btn-preview').addEventListener('click', openPreview);
document.getElementById('btn-export').addEventListener('click', exportSite);
document.getElementById('btn-templates').addEventListener('click', openTemplates);
document.getElementById('btn-preview-close').addEventListener('click', closePreview);
document.getElementById('btn-templates-close').addEventListener('click', closeTemplates);
previewOverlay.addEventListener('click', e => { if (e.target === previewOverlay) closePreview(); });
templatesOverlay.addEventListener('click', e => { if (e.target === templatesOverlay) closeTemplates(); });
