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
    const allTags = new Set();
    container.innerHTML = "";

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

      section.innerHTML = `
        <div class="group1">
          <div class="research__headline_containner">
            <div class="panel__headline">
              ${item.title || "テーマ未入力"}
            </div>
            <div class="panel__block"></div>
          </div>
          <img src="${item.image_for_title || '/img/research/calypso.jpg'}">
        </div>
      `;
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

        chip.innerHTML = `
          <span class="chip__label">${tag}</span>
          <span class="chip__knob"></span>
        `;

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

      modalBody.innerHTML =
        marked.parse(section.dataset.content);

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
