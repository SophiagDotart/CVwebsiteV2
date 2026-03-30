document.addEventListener("DOMContentLoaded", () => {

  // =========================
  // STATE
  // =========================
  let currentLang = localStorage.getItem("lang") || "en";

  let activeFilters = {
    status: "all",
    type: "all",
    topic: "all"
  };

  // =========================
  // DROPDOWN MENU
  // =========================
  const toggle = document.getElementById("menuToggle");
  const dropdown = document.querySelector(".dropdownMenu");

  toggle.addEventListener("click", () => {
    dropdown.classList.toggle("active");
  });

  // =========================
  // LANGUAGE SWITCH
  // =========================
  const langButtons = document.querySelectorAll("#langSwitch button");

  langButtons.forEach(btn => {
    if (btn.dataset.lang === currentLang) {
      btn.classList.add("active");
    }

    btn.addEventListener("click", () => {
      currentLang = btn.dataset.lang;
      localStorage.setItem("lang", currentLang);

      langButtons.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");

      if (overlay.classList.contains("active")) {
        const activeLink = document.querySelector(".bottomNav a.active");
        if (activeLink) {
          const page = activeLink.dataset.page;
          loadPage(`subpages/${currentLang}/${page}.html`);
        }
      }
    });
  });

  // =========================
  // OVERLAY SYSTEM
  // =========================
  const overlay = document.getElementById("overlay");
  const overlayContent = document.querySelector(".overlayContent");
  const overlayText = document.getElementById("overlayText");
  const closeBtn = document.getElementById("closeOverlay");

  function openOverlay() {
    overlay.classList.add("active");
    document.body.classList.add("overlay-open");
  }

  function closeOverlay() {
    overlay.classList.remove("active");
    document.body.classList.remove("overlay-open");
  }

  // =========================
  // LOAD PAGE
  // =========================
  async function loadPage(url) {
    try {
      const response = await fetch(url);
      const html = await response.text();

      overlayContent.classList.add("fade-out");

      setTimeout(() => {
        overlayText.innerHTML = html;
        overlayContent.classList.remove("fade-out");

        initFilters(); // 🔥 re-init filters after load

      }, 200);

    } catch (err) {
      overlayText.innerHTML = "<p>Error loading content.</p>";
    }
  }

  // =========================
  // NAVIGATION
  // =========================
  const links = document.querySelectorAll("a[data-page]");

  links.forEach(link => {
    link.addEventListener("click", async (e) => {
      e.preventDefault();

      const page = link.dataset.page;

      document.querySelectorAll(".bottomNav a").forEach(a => {
        a.classList.remove("active");
      });

      const activeLink = document.querySelector(
        `.bottomNav a[data-page="${page}"]`
      );

      if (activeLink) activeLink.classList.add("active");

      const url = `subpages/${currentLang}/${page}.html`;

      await loadPage(url);

      if (!overlay.classList.contains("active")) {
        openOverlay();
      }
    });
  });

  // =========================
  // FILTER SYSTEM
  // =========================
  function initFilters() {

    const groups = overlayText.querySelectorAll(".filterGroup");
    const items = overlayText.querySelectorAll(".cardDetails li");

    groups.forEach(group => {

      const mainBtn = group.querySelector(".filterMain");
      const buttons = group.querySelectorAll("[data-filter]");
      const groupName = group.dataset.group;

      // toggle dropdown
      mainBtn.addEventListener("click", () => {
        group.classList.toggle("active");
      });

      buttons.forEach(btn => {
        btn.addEventListener("click", () => {

          const value = btn.dataset.filter;

          // update state
          activeFilters[groupName] = value;

          // update button UI
          buttons.forEach(b => b.classList.remove("active"));
          btn.classList.add("active");

          // highlight main button if not "all"
          if (value !== "all") {
            group.classList.add("has-active");
          } else {
            group.classList.remove("has-active");
          }

          applyFilters(items);
        });
      });
    });
  }

  function applyFilters(items) {

    items.forEach(item => {

      // split multi-tags into arrays
      const statusList = (item.dataset.status || "former").split(",");
      const typeList = (item.dataset.type || "").split(",");
      const topicList = (item.dataset.topic || "").split(",");

      const match =
        (activeFilters.status === "all" || statusList.includes(activeFilters.status)) &&
        (activeFilters.type === "all" || typeList.includes(activeFilters.type)) &&
        (activeFilters.topic === "all" || topicList.includes(activeFilters.topic));

      item.classList.toggle("hidden", !match);
    });
  }

  // =========================
  // CLOSE
  // =========================
  closeBtn.addEventListener("click", closeOverlay);

  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) closeOverlay();
  });

});