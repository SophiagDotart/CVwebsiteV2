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
  // MENU TRANSLATIONS
  // =========================
  const menuTranslations = {
    en: {
      about: "About & Contact",
      projects: "Projects",
      network: "Network",
      publicStuff: "Public Appearances"
    },
    de: {
      about: "Über mich & Kontakt",
      projects: "Projekte",
      network: "Netzwerk",
      publicStuff: "Öffentliche Auftritte"
    },
    es: {
      about: "Sobre mí & Contacto",
      projects: "Proyectos",
      network: "Red",
      publicStuff: "Apariciones públicas"
    }
  };

  function updateMenuLanguage() {
    const allMenuLinks = document.querySelectorAll("a[data-page]");

    allMenuLinks.forEach(link => {
      const page = link.dataset.page;
      if (menuTranslations[currentLang][page]) {
        link.textContent = menuTranslations[currentLang][page];
      }
    });
  }

  updateMenuLanguage();

  // =========================
  // DROPDOWN MENU (TOP)
  // =========================
  const toggle = document.getElementById("menuToggle");
  const dropdown = document.querySelector(".dropdownMenu");

  toggle.addEventListener("click", (e) => {
    e.stopPropagation();
    dropdown.classList.toggle("active");
  });

  // Close when clicking a menu link
  document.querySelectorAll(".dropdownMenu a").forEach(link => {
    link.addEventListener("click", () => {
      dropdown.classList.remove("active");
    });
  });

  // =========================
  // LANGUAGE SWITCH
  // =========================
  const langButtons = document.querySelectorAll("#langSwitch button");
  const overlay = document.getElementById("overlay");

  langButtons.forEach(btn => {
    if (btn.dataset.lang === currentLang) {
      btn.classList.add("active");
    }

    btn.addEventListener("click", () => {
      currentLang = btn.dataset.lang;
      localStorage.setItem("lang", currentLang);

      langButtons.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");

      updateMenuLanguage();

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

        initFilters();

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

      // 🔥 close top dropdown after navigation
      dropdown.classList.remove("active");
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

      // 🔥 only one dropdown open
      mainBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        groups.forEach(g => g.classList.remove("active"));
        group.classList.toggle("active");
      });

      buttons.forEach(btn => {
        btn.addEventListener("click", () => {

          const value = btn.dataset.filter;
          activeFilters[groupName] = value;

          buttons.forEach(b => b.classList.remove("active"));
          btn.classList.add("active");

          if (value !== "all") {
            group.classList.add("has-active");
          } else {
            group.classList.remove("has-active");
          }

          applyFilters(items);

          // 🔥 close after selection
          group.classList.remove("active");
        });
      });
    });

    // 🔥 close filters when clicking outside
    document.addEventListener("click", (e) => {
      if (!e.target.closest(".filterGroup")) {
        groups.forEach(g => g.classList.remove("active"));
      }
    });
  }

  function applyFilters(items) {

    items.forEach(item => {

      const normalize = str => str.trim().toLowerCase();

      const statusList = (item.dataset.status || "former")
        .split(",")
        .map(normalize);

      const typeList = (item.dataset.type || "")
        .split(",")
        .map(normalize);

      const topicList = (item.dataset.topic || "")
        .split(",")
        .map(normalize);

      const match =
        (activeFilters.status === "all" || statusList.includes(normalize(activeFilters.status))) &&
        (activeFilters.type === "all" || typeList.includes(normalize(activeFilters.type))) &&
        (activeFilters.topic === "all" || topicList.includes(normalize(activeFilters.topic)));

      item.classList.toggle("hidden", !match);
    });
  }

  // =========================
  // GLOBAL OUTSIDE CLICK
  // =========================
  document.addEventListener("click", (e) => {

    // close top dropdown
    if (!e.target.closest("#menuToggle") && !e.target.closest(".dropdownMenu")) {
      dropdown.classList.remove("active");
    }
  });

  // =========================
  // CLOSE OVERLAY
  // =========================
  closeBtn.addEventListener("click", closeOverlay);

  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) closeOverlay();
  });

});