function goBackOrRedirect() {
  if (document.referrer) {
    window.history.back();
    return;
  }

  window.location.href = '/index.html';
}

const ALLOWED_MARKDOWN_TAGS = new Set([
  'H1', 'H2', 'H3', 'H4', 'H5', 'H6',
  'P', 'BR', 'HR', 'UL', 'OL', 'LI',
  'BLOCKQUOTE', 'PRE', 'CODE',
  'STRONG', 'B', 'EM', 'I', 'U', 'S', 'DEL',
  'A', 'IMG', 'DIV', 'SPAN',
  'TABLE', 'THEAD', 'TBODY', 'TR', 'TH', 'TD',
  'FIGURE', 'FIGCAPTION', 'IFRAME',
]);

const ALLOWED_IFRAME_PREFIXES = [
  'https://docs.google.com/',
  'https://www.google.com/maps/embed',
  'https://www.youtube.com/embed/',
  'https://www.youtube-nocookie.com/embed/',
  'https://speakerdeck.com/',
  'https://www.slideshare.net/',
];

function isSafeAssetUrl(urlValue, allowHash = true) {
  const trimmed = String(urlValue || '').trim();
  if (!trimmed) {
    return false;
  }
  if (allowHash && trimmed.startsWith('#')) {
    return true;
  }
  if (trimmed.startsWith('/') && !trimmed.startsWith('//')) {
    return true;
  }
  if (trimmed.startsWith('./') || trimmed.startsWith('../') || /^[a-zA-Z0-9_\-.]+(\/[a-zA-Z0-9_\-./]+)*$/.test(trimmed)) {
    return true;
  }
  try {
    const parsed = new URL(trimmed, window.location.origin);
    return parsed.protocol === 'https:' || parsed.protocol === 'http:' || parsed.protocol === 'mailto:';
  } catch {
    return false;
  }
}

function isSafeResearchMdPath(pathValue) {
  const trimmed = String(pathValue || '').trim();
  if (!trimmed || trimmed.startsWith('//') || trimmed.includes('\\')) {
    return false;
  }
  if (/^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(trimmed)) {
    return false;
  }
  return /^(\.\.\/(component\/)?research\/|\/?component\/research\/|research\/)[a-zA-Z0-9_\-]+\.md$/i.test(trimmed);
}

function sanitizeDomNode(node) {
  if (node.nodeType === Node.TEXT_NODE) {
    return document.createTextNode(node.textContent || '');
  }

  if (node.nodeType !== Node.ELEMENT_NODE) {
    return null;
  }

  const tagName = node.tagName.toUpperCase();
  if (!ALLOWED_MARKDOWN_TAGS.has(tagName)) {
    return null;
  }

  if (tagName === 'IFRAME') {
    const src = (node.getAttribute('src') || '').trim();
    if (!ALLOWED_IFRAME_PREFIXES.some((prefix) => src.startsWith(prefix))) {
      return null;
    }
  }

  const cleanEl = document.createElement(tagName.toLowerCase());
  const allowedAttrs = ['class', 'id', 'title', 'alt', 'width', 'height', 'loading', 'decoding', 'translate', 'colspan', 'rowspan'];

  for (const attr of allowedAttrs) {
    if (node.hasAttribute(attr)) {
      cleanEl.setAttribute(attr, node.getAttribute(attr));
    }
  }

  if (tagName === 'A' && node.hasAttribute('href')) {
    const href = node.getAttribute('href');
    if (isSafeAssetUrl(href, true)) {
      cleanEl.setAttribute('href', href);
      if (node.getAttribute('target') === '_blank') {
        cleanEl.setAttribute('target', '_blank');
        cleanEl.setAttribute('rel', 'noopener noreferrer');
      }
    }
  }

  if (tagName === 'IMG' && node.hasAttribute('src')) {
    const src = node.getAttribute('src');
    if (isSafeAssetUrl(src, false)) {
      cleanEl.setAttribute('src', src);
    }
  }

  if (tagName === 'IFRAME') {
    cleanEl.setAttribute('src', node.getAttribute('src'));
    cleanEl.setAttribute('frameborder', '0');
    cleanEl.setAttribute('allowfullscreen', 'true');
    cleanEl.setAttribute('sandbox', 'allow-scripts allow-same-origin allow-popups allow-presentation');
    cleanEl.setAttribute('referrerpolicy', 'no-referrer-when-downgrade');
  }

  for (const child of Array.from(node.childNodes)) {
    const sanitizedChild = sanitizeDomNode(child);
    if (sanitizedChild) {
      cleanEl.appendChild(sanitizedChild);
    }
  }

  return cleanEl;
}

function renderSafeMarkdown(container, markdownText) {
  if (!container) {
    return;
  }

  const rawHtml = typeof marked !== 'undefined' && typeof marked.parse === 'function'
    ? marked.parse(String(markdownText || ''))
    : String(markdownText || '');

  const parsedDoc = new DOMParser().parseFromString(rawHtml, 'text/html');
  const fragment = document.createDocumentFragment();

  for (const child of Array.from(parsedDoc.body.childNodes)) {
    const sanitized = sanitizeDomNode(child);
    if (sanitized) {
      fragment.appendChild(sanitized);
    }
  }

  container.replaceChildren(fragment);
}

function splitCsvLine(line) {
  const values = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];
    const nextChar = line[i + 1];

    if (char === '"' && inQuotes && nextChar === '"') {
      current += '"';
      i += 1;
      continue;
    }

    if (char === '"') {
      inQuotes = !inQuotes;
      continue;
    }

    if (char === ',' && !inQuotes) {
      values.push(current.trim());
      current = '';
      continue;
    }

    current += char;
  }

  values.push(current.trim());
  return values;
}

async function loadResearchList() {
  const response = await fetch(
    "../component/research/research.csv"
  );

  const csv = await response.text();

  const rows = csv.trim().split(/\r?\n/);
  if (!rows.length) {
    return [];
  }
  const headers = splitCsvLine(rows[0]);

    return rows.slice(1).filter(Boolean).map(row => {
      const values = splitCsvLine(row);

      return headers.reduce((obj, key, index) => {
        obj[key.trim()] = values[index]?.trim() || "";
        return obj;
      }, {});
    });
  }

async function initResearchPage() {
      const modal = document.getElementById("modal");
      const modalBody = document.getElementById("modal-body");
      const container = document.getElementById("researchs");

      if (!container) return;

      const researchData = await loadResearchList();

      const chips = document.querySelectorAll(".chip");

      let selectedTags = new Set();
      let selectedGrades = new Set();
      let allItems = [];

      chips.forEach(chip => {
        chip.addEventListener("click", () => {

          const tag = chip.dataset.tag;
          const type = chip.closest(".chips").dataset.type;

          if (type === "tag") {
            toggle(selectedTags, tag, chip);
          } else if (type === "grade") {
            toggle(selectedGrades, tag, chip);
          }

          filterItems();
        });
      });

      function toggle(set, value, el) {
        if (set.has(value)) {
          set.delete(value);
          el.classList.remove("active");
        } else {
          set.add(value);
          el.classList.add("active");
        }
      }
      const validResearchData = researchData.filter(
    item => item.mdPath?.trim() && isSafeResearchMdPath(item.mdPath)
      );

      Promise.all(
        validResearchData.map(item =>
      fetch(item.mdPath.trim()).then(res => res.text())
        )
      ).then(texts => {
        const allTags = new Set();
        container.replaceChildren();

        texts.forEach((content, index) => {
          const item = validResearchData[index];

          if (!item.title || !item.title.trim()) return;

          const tags = (item.tags || "")
            .split(/\s+/)
            .filter(Boolean);

          tags.forEach(tag => allTags.add(tag));

          const section = document.createElement("section");

          section.dataset.tags = item.tags || "";
          section.dataset.grade = item.grade || "";
          section.dataset.title = item.title || "";
          section.dataset.content = content;
          section.dataset.image_for_title = item.image_for_title || "";

          const groupDiv = document.createElement("div");
          groupDiv.className = "group1";

          const headlineContainer = document.createElement("div");
          headlineContainer.className = "research__headline_containner";

          const headlineDiv = document.createElement("div");
          headlineDiv.className = "panel__headline";
          headlineDiv.textContent = item.title || "テーマ未入力";

          const blockDiv = document.createElement("div");
          blockDiv.className = "panel__block";

          headlineContainer.appendChild(headlineDiv);
          headlineContainer.appendChild(blockDiv);

          const imgEl = document.createElement("img");
          const rawImgSrc = (item.image_for_title || "").trim();
          imgEl.src = isSafeAssetUrl(rawImgSrc, false) ? rawImgSrc : "/img/research/calypso.jpg";
          imgEl.alt = item.title || "";

          groupDiv.appendChild(headlineContainer);
          groupDiv.appendChild(imgEl);
          section.appendChild(groupDiv);

          container.appendChild(section);
          allItems.push(section);
        });

        const tagContainer =
          document.querySelector('.chips[data-type="tag"]');
        if (!tagContainer) return;

        tagContainer.querySelectorAll(".chip")
          .forEach(el => el.remove());

        [...allTags]
          .sort()
          .forEach(tag => {

            const chip = document.createElement("div");

            chip.className = "chip";
            chip.dataset.tag = tag;

            const labelSpan = document.createElement("span");
            labelSpan.className = "chip__label";
            labelSpan.textContent = tag;

            const knobSpan = document.createElement("span");
            knobSpan.className = "chip__knob";

            chip.appendChild(labelSpan);
            chip.appendChild(knobSpan);

            tagContainer.appendChild(chip);

            chip.addEventListener("click", () => {
              toggle(selectedTags, tag, chip);
              filterItems();
            });
          });

      });

      if (!container.dataset.bound) {
        container.addEventListener("click", (e) => {
          const wrapper = e.target.closest(".group1");
          if (!wrapper) return;

          const section = wrapper.parentElement;

          renderSafeMarkdown(modalBody, section.dataset.content);

          modal.classList.add("active");
        });

        container.dataset.bound = "true";
      }

      const closeBtn = document.querySelector(".modal__close");
      if (closeBtn && !closeBtn.dataset.bound) {
        closeBtn.addEventListener("click", () => {
          modal.classList.remove("active");
        });
        closeBtn.dataset.bound = "true";
      }

      if (modal && !modal.dataset.bound) {
        modal.addEventListener("click", (e) => {
          if (e.target === modal) {
            modal.classList.remove("active");
          }
        });
        modal.dataset.bound = "true";
      }

      function filterItems() {
        allItems.forEach(item => {

          const tags = (item.dataset.tags || "")
            .split(/\s+/)
            .filter(Boolean);

          const grade = item.dataset.grade || "";

          const lowerTags = tags.map(t => t.toLowerCase());
          const tagMatch =
            selectedTags.size === 0 ||
            [...selectedTags].every(t => lowerTags.includes(t.toLowerCase()));

          const gradeMatch =
            selectedGrades.size === 0 ||
            [...selectedGrades].some(g => g.toLowerCase() === grade.toLowerCase());

          item.style.display = (tagMatch && gradeMatch) ? "block" : "none";
        });
      }

      document.querySelectorAll(".panel__content")
        .forEach(el => el.classList.add("panel__content--active"));
    }

document.addEventListener("DOMContentLoaded", initResearchPage);
