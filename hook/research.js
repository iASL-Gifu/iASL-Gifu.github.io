function goBackOrRedirect() {
    if (document.referrer) {
        window.history.back();
        return;
    }

    window.location.href = '/index.html';
}

async function loadResearchList() {
  const response = await fetch(
    "../research/research.csv"
  );

  const csv = await response.text();

  const rows = csv.trim().split("\n");
  const headers = rows[0].split(",");

  return rows.slice(1).map(row => {
    const values = row.split(",");

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
    item => item.mdPath?.trim()
  );
  
  Promise.all(
    validResearchData.map(item =>
      fetch(item.mdPath).then(res => res.text())
    )
  ).then(texts => {
    container.innerHTML = "";

    texts.forEach(md => {
      const { meta, content } = parseMarkdown(md);
      const { summary, detail } = splitContent(content);

      const section = document.createElement("section");

      section.dataset.tags = meta.tags || "";
      section.dataset.grade = meta.grade || "";
      section.dataset.summary = summary;
      section.dataset.detail = detail;
      section.dataset.title = meta.title;
      section.dataset.image_for_lists = meta.image_for_list;
      section.dataset.image_for_detail_1 = meta.image_for_detail_1 || "";
      section.dataset.image_for_detail_2 = meta.image_for_detail_2 || "";
      section.dataset.image_for_detail_3 = meta.image_for_detail_3 || "";
      section.dataset.image_for_detail_4 = meta.image_for_detail_4 || "";
      section.innerHTML = `
        <div class="group1">
          <div class="research__headline_containner">
            <div class="panel__headline">
              ${meta.title || "テーマ未入力"}
            </div>
            <div class="panel__block"></div>
          </div>
          <img src="${meta.image_for_lists || '/img/research/calypso.jpg'}">
          <div class="panel__summery">${section.dataset.summary || "summery未入力"}</div>
        </div>
      `;

      container.appendChild(section);
      allItems.push(section);
    });
  });


  function splitContent(content) {
    const [_, summary = "", detail = ""] =
      content.split(/## summary|## detail/);

    return {
      summary: summary.trim(),
      detail: detail.trim()
    };
  }

  if (!container.dataset.bound) {
    container.addEventListener("click", (e) => {
      const wrapper = e.target.closest(".group1");
      if (!wrapper) return;

      const section = wrapper.parentElement;

      modalBody.innerHTML = `
        <h1>${section.dataset.title}</h1>
        <img src="${section.dataset.image_for_detail_1}">
        <img src="${section.dataset.image_for_detail_2}">
        <img src="${section.dataset.image_for_detail_3}">
        <img src="${section.dataset.image_for_detail_4}">
        <div class="modal__text">${marked.parse(section.dataset.detail)}</div>
      `;

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
      const tags = (item.dataset.tags || "").split(" ");
      const grade = item.dataset.grade || "";

      const tagMatch =
        selectedTags.size === 0 ||
        [...selectedTags].every(t => tags.includes(t));

      const gradeMatch =
        selectedGrades.size === 0 ||
        selectedGrades.has(grade);

      item.style.display = (tagMatch && gradeMatch) ? "block" : "none";
    });
  }

  document.querySelectorAll(".panel__content")
  .forEach(el => el.classList.add("panel__content--active"));
}

function parseMarkdown(md) {
const match = md.match(/^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/);

  if (!match) {
    return { meta: {}, content: md };
  }

  const metaLines = match[1].split(/\r?\n/);
  const meta = {};

  metaLines.forEach(line => {
    const [key, ...rest] = line.split(':');
    if (!key) return;
    meta[key.trim()] = rest.join(':').trim();
  });

  return {
    meta,
    content: match[2]
  };
}

document.addEventListener("DOMContentLoaded", initResearchPage);
