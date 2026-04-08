const DEFAULT_UPLOADS = [
  {
    title: "Moon Whisper",
    category: "Portraits",
    description: "Detailed portrait work with handwritten textures and symbolic line art.",
    image_url: "images/about.jpg",
  },
  {
    title: "Silent Mark",
    category: "Sketches",
    description: "Sketchbook-style layouts with raw line energy and dramatic contrast.",
    image_url: "images/contact.jpg",
  },
  {
    title: "Crimson Gate",
    category: "Fantasy",
    description: "Dark world concepts for eerie settings, symbols, and dreamlike scenes.",
    image_url: "images/services.jpg",
  },
];

const AUTH_KEY = "dracky_auth";
const PROFILE_KEY = "dracky_profile";
const UPLOADS_KEY = "dracky_uploads";
const API_BASE = window.location.protocol === "file:" ? "http://127.0.0.1:5000" : "";

let galleryUploads = [...DEFAULT_UPLOADS];
let currentProfile = {
  authenticated: false,
  user: null,
  uploads: [],
};
let entryGateResolved = false;

function getStoredAuth() {
  return localStorage.getItem(AUTH_KEY) === "true";
}

function setStoredAuth(value) {
  localStorage.setItem(AUTH_KEY, String(value));
}

function getStoredProfile() {
  try {
    return JSON.parse(localStorage.getItem(PROFILE_KEY) || "null");
  } catch {
    return null;
  }
}

function setStoredProfile(profile) {
  localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
}

function clearStoredProfile() {
  localStorage.removeItem(PROFILE_KEY);
}

function getStoredUploads() {
  try {
    const parsed = JSON.parse(localStorage.getItem(UPLOADS_KEY) || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveStoredUpload(upload) {
  const uploads = getStoredUploads();
  uploads.unshift(upload);
  localStorage.setItem(UPLOADS_KEY, JSON.stringify(uploads));
}

function clearStoredUploads() {
  localStorage.removeItem(UPLOADS_KEY);
}

function shouldUseLocalMode(error) {
  return (
    error.message.includes("Backend connection failed") ||
    error.message.includes("Database error")
  );
}

function syncBackendStatus(status) {
  document.body.dataset.backendStatus = status;
}

function initCustomCursor() {
  if (window.matchMedia("(pointer: coarse)").matches) {
    return;
  }

  const aura = document.createElement("div");
  aura.className = "cursor-aura";
  const core = document.createElement("div");
  core.className = "cursor-core";
  document.body.append(aura, core);

  let auraX = window.innerWidth / 2;
  let auraY = window.innerHeight / 2;
  let coreX = auraX;
  let coreY = auraY;
  let targetX = auraX;
  let targetY = auraY;

  document.addEventListener("pointermove", (event) => {
    targetX = event.clientX;
    targetY = event.clientY;
  });

  document.querySelectorAll("a, button, input, textarea, select, .gallery-card").forEach((element) => {
    element.addEventListener("pointerenter", () => {
      document.body.classList.add("cursor-hover");
    });
    element.addEventListener("pointerleave", () => {
      document.body.classList.remove("cursor-hover");
    });
  });

  function tick() {
    auraX += (targetX - auraX) * 0.18;
    auraY += (targetY - auraY) * 0.18;
    coreX += (targetX - coreX) * 0.38;
    coreY += (targetY - coreY) * 0.38;

    aura.style.transform = `translate(${auraX}px, ${auraY}px) translate(-50%, -50%)`;
    core.style.transform = `translate(${coreX}px, ${coreY}px) translate(-50%, -50%)`;
    window.requestAnimationFrame(tick);
  }

  window.requestAnimationFrame(tick);
}

function initParticleField() {
  const canvas = document.createElement("canvas");
  canvas.className = "particle-canvas";
  document.body.prepend(canvas);

  const context = canvas.getContext("2d");
  if (!context) {
    return;
  }

  const particles = [];

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  function buildParticles() {
    particles.length = 0;
    const count = Math.max(28, Math.floor(window.innerWidth / 44));

    for (let index = 0; index < count; index += 1) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.45,
        vy: (Math.random() - 0.5) * 0.45,
        radius: Math.random() * 1.8 + 0.8,
      });
    }
  }

  function draw() {
    context.clearRect(0, 0, canvas.width, canvas.height);

    particles.forEach((particle, index) => {
      particle.x += particle.vx;
      particle.y += particle.vy;

      if (particle.x < 0 || particle.x > canvas.width) {
        particle.vx *= -1;
      }

      if (particle.y < 0 || particle.y > canvas.height) {
        particle.vy *= -1;
      }

      context.beginPath();
      context.fillStyle = "rgba(142, 242, 255, 0.55)";
      context.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
      context.fill();

      for (let inner = index + 1; inner < particles.length; inner += 1) {
        const other = particles[inner];
        const dx = particle.x - other.x;
        const dy = particle.y - other.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < 140) {
          context.beginPath();
          context.strokeStyle = `rgba(122, 141, 255, ${0.14 - distance / 1100})`;
          context.lineWidth = 1;
          context.moveTo(particle.x, particle.y);
          context.lineTo(other.x, other.y);
          context.stroke();
        }
      }
    });

    window.requestAnimationFrame(draw);
  }

  resize();
  buildParticles();
  draw();

  window.addEventListener("resize", () => {
    resize();
    buildParticles();
  });
}

function createEntryOverlay() {
  const overlay = document.createElement("div");
  overlay.className = "entry-overlay";
  overlay.innerHTML = `
    <div class="entry-grid"></div>
    <div class="entry-panel">
      <p class="entry-kicker">Access Gateway</p>
      <p class="entry-sigil">𐒐λ𐒄ᎴᎿ𐒢, 𐒢𐒐Ꮏ𐒢Ⲅ Ꮏ𐒀 ᏧλⲄᏥᏊ𐒀ⲄᏓᏧ</p>
      <p class="entry-subtitle">Enter the digital gallery and unlock the animated world.</p>
      <div class="entry-actions">
        <button class="button button-primary entry-button" type="button" id="entryEnterButton">Enter</button>
        <button class="button button-secondary entry-button" type="button" id="entryExitButton">Exit</button>
      </div>
    </div>
  `;
  return overlay;
}

function initEntryExperience() {
  if (entryGateResolved) {
    return Promise.resolve();
  }

  const hasEntered = sessionStorage.getItem("ddw_entry_state") === "entered";
  const isFailed = sessionStorage.getItem("ddw_entry_state") === "failed";

  if (hasEntered) {
    document.body.classList.add("site-ready");
    entryGateResolved = true;
    return Promise.resolve();
  }

  const overlay = createEntryOverlay();
  document.body.classList.add("site-locked");
  if (isFailed) {
    document.body.classList.add("app-failed");
    overlay.classList.add("is-failed");
  }
  document.body.appendChild(overlay);

  return new Promise((resolve) => {
    const enterButton = document.getElementById("entryEnterButton");
    const exitButton = document.getElementById("entryExitButton");

    function unlockSite() {
      sessionStorage.setItem("ddw_entry_state", "entered");
      document.body.classList.remove("site-locked", "app-failed");
      document.body.classList.add("site-ready");
      overlay.classList.remove("is-failed");
      overlay.classList.add("is-leaving");
      entryGateResolved = true;

      window.setTimeout(() => {
        overlay.remove();
        resolve();
      }, 720);
    }

    function failSite() {
      sessionStorage.setItem("ddw_entry_state", "failed");
      document.body.classList.add("app-failed");
      overlay.classList.add("is-failed");
      const subtitle = overlay.querySelector(".entry-subtitle");
      if (subtitle) {
        subtitle.textContent = "Website access blocked. Press Enter to restore the gallery.";
      }
    }

    enterButton.addEventListener("click", unlockSite);
    exitButton.addEventListener("click", failSite);
  });
}

function initMotionEffects() {
  document.body.classList.add("site-ready");

  const revealTargets = document.querySelectorAll(
    ".page-hero, .section, .info-card, .panel-card, .gallery-card, .metric-card, .spotlight-card"
  );

  if (revealTargets.length) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.14,
        rootMargin: "0px 0px -50px 0px",
      }
    );

    revealTargets.forEach((target, index) => {
      target.classList.add("motion-reveal");
      target.style.setProperty("--reveal-delay", `${Math.min(index * 0.05, 0.35)}s`);
      observer.observe(target);
    });
  }

  document.querySelectorAll(".site-nav a, .button, .filter-chip").forEach((element) => {
    element.addEventListener("pointermove", (event) => {
      const rect = element.getBoundingClientRect();
      const offsetX = ((event.clientX - rect.left) / rect.width - 0.5) * 12;
      const offsetY = ((event.clientY - rect.top) / rect.height - 0.5) * 12;
      element.style.setProperty("--pointer-x", `${offsetX}px`);
      element.style.setProperty("--pointer-y", `${offsetY}px`);
    });

    element.addEventListener("pointerleave", () => {
      element.style.removeProperty("--pointer-x");
      element.style.removeProperty("--pointer-y");
    });
  });

  document.querySelectorAll(".info-card, .panel-card, .gallery-card, .spotlight-card, .metric-card").forEach((card) => {
    card.addEventListener("pointermove", (event) => {
      const rect = card.getBoundingClientRect();
      const rotateY = ((event.clientX - rect.left) / rect.width - 0.5) * 10;
      const rotateX = -((event.clientY - rect.top) / rect.height - 0.5) * 10;
      card.style.transform = `perspective(1200px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-8px)`;
    });

    card.addEventListener("pointerleave", () => {
      card.style.transform = "";
    });
  });

  const heroBanner = document.querySelector(".hero-banner");
  const heroPanel = document.querySelector(".hero-panel");
  const heroGeometry = document.querySelector(".hero-geometry");

  if (heroBanner && heroPanel && heroGeometry) {
    heroBanner.addEventListener("pointermove", (event) => {
      const rect = heroBanner.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - 0.5;
      const y = (event.clientY - rect.top) / rect.height - 0.5;
      heroPanel.style.transform = `translate3d(${x * 18}px, ${y * 16}px, 0)`;
      heroGeometry.style.transform = `translate3d(${x * -26}px, ${y * -22}px, 0)`;
    });

    heroBanner.addEventListener("pointerleave", () => {
      heroPanel.style.transform = "";
      heroGeometry.style.transform = "";
    });
  }

  const transitionOverlay = document.createElement("div");
  transitionOverlay.className = "page-transition";
  document.body.appendChild(transitionOverlay);

  document.querySelectorAll(".site-nav a, .site-brand").forEach((link) => {
    link.addEventListener("click", (event) => {
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
        return;
      }

      const href = link.getAttribute("href");
      if (!href || href.startsWith("#")) {
        return;
      }

      event.preventDefault();
      transitionOverlay.classList.add("is-active");
      window.setTimeout(() => {
        window.location.href = href;
      }, 420);
    });
  });
}

function applyContentMap(content) {
  document.querySelectorAll("[data-global-key]").forEach((element) => {
    const key = element.dataset.globalKey;
    const item = content.global?.[key];
    if (item) {
      element.textContent = item.value;
    }
  });

  document.querySelectorAll("[data-content-key]").forEach((element) => {
    const key = element.dataset.contentKey;
    const item = content.page?.[key];
    if (!item) {
      return;
    }

    if (element.tagName === "A" && element.dataset.contentMode === "href-text") {
      const href = key === "card1_text" ? `mailto:${item.value}` : `https://${item.value}`;
      element.href = href;
      element.textContent = item.value;
      return;
    }

    element.textContent = item.value;
  });
}

async function requestJson(url, options = {}) {
  let response;

  try {
    response = await fetch(`${API_BASE}${url}`, {
      credentials: "same-origin",
      ...options,
      headers: {
        Accept: "application/json",
        ...(options.headers || {}),
      },
    });
    syncBackendStatus("online");
  } catch {
    syncBackendStatus("offline");
    throw new Error(
      "Backend connection failed. Start backend/app.py and open the site from http://127.0.0.1:5000"
    );
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || "Request failed");
  }

  return data;
}

function createGalleryCard(upload) {
  const card = document.createElement("article");
  card.className = "gallery-card";
  card.dataset.category = upload.category;
  card.innerHTML = `
    <img src="${upload.image_url}" alt="${upload.title}">
    <div class="gallery-copy">
      <span>${upload.category}</span>
      <h3>${upload.title}</h3>
      <p>${upload.description}</p>
    </div>
  `;
  return card;
}

function renderSavedUploads() {
  const artGallery = document.getElementById("artGallery");

  if (!artGallery) {
    return;
  }

  artGallery.innerHTML = "";
  galleryUploads.forEach((upload) => artGallery.appendChild(createGalleryCard(upload)));
}

function renderProfileSections() {
  const isAuthorized = currentProfile.authenticated;
  const profile = currentProfile.user;
  const uploads = currentProfile.uploads || [];

  const profileTargets = [
    {
      name: document.getElementById("profileName"),
      handle: document.getElementById("profileHandle"),
      avatar: document.getElementById("profileAvatar"),
      text: document.getElementById("profileMessage"),
    },
    {
      name: document.getElementById("uploadProfileName"),
      handle: document.getElementById("uploadProfileHandle"),
      avatar: document.getElementById("uploadProfileAvatar"),
      text: document.getElementById("uploadProfileText"),
    },
  ];

  profileTargets.forEach((target) => {
    if (!target.name || !target.handle || !target.avatar || !target.text) {
      return;
    }

    const name = profile?.name || "Dark Creator";
    const username = profile?.username || "dracky_artist";

    target.name.textContent = name;
    target.handle.textContent = `@${username}`;
    target.avatar.textContent = name.charAt(0).toUpperCase();
    target.text.textContent = isAuthorized
      ? "Profile active. You can publish portraits, sketching work, and user arts."
      : "Create an account or log in to unlock professional uploads.";
  });

  const profileAccess = document.getElementById("profileAccess");
  const profileUploadCount = document.getElementById("profileUploadCount");
  const profileUploads = document.getElementById("profileUploads");

  if (profileAccess) {
    profileAccess.textContent = isAuthorized ? "Active" : "Locked";
  }

  if (profileUploadCount) {
    profileUploadCount.textContent = String(uploads.length);
  }

  if (profileUploads) {
    if (!uploads.length) {
      profileUploads.innerHTML =
        '<p class="empty-note">No uploads yet. Add your portraits, sketches, or fantasy arts from the upload page.</p>';
    } else {
      profileUploads.innerHTML = "";
      uploads.slice(0, 4).forEach((upload) => {
        const item = document.createElement("article");
        item.className = "mini-gallery-item";
        item.innerHTML = `
          <img src="${upload.image_url}" alt="${upload.title}">
          <div>
            <h3>${upload.title}</h3>
            <p>${upload.category}</p>
          </div>
        `;
        profileUploads.appendChild(item);
      });
    }
  }
}

function initGalleryFilters() {
  const filterBar = document.getElementById("galleryFilters");
  const artGallery = document.getElementById("artGallery");

  if (!filterBar || !artGallery) {
    return;
  }

  filterBar.addEventListener("click", (event) => {
    const button = event.target.closest("[data-filter]");

    if (!button) {
      return;
    }

    const filter = button.dataset.filter;
    filterBar.querySelectorAll(".filter-chip").forEach((chip) => chip.classList.remove("active"));
    button.classList.add("active");

    artGallery.querySelectorAll(".gallery-card").forEach((card) => {
      const matches = filter === "all" || card.dataset.category === filter;
      card.style.display = matches ? "" : "none";
    });
  });
}

async function refreshGallery() {
  try {
    const data = await requestJson("/api/artworks");
    galleryUploads = [...(data.artworks || []), ...DEFAULT_UPLOADS];
  } catch (error) {
    galleryUploads = [...getStoredUploads(), ...DEFAULT_UPLOADS];
    console.error(error);
  }

  renderSavedUploads();
}

async function refreshProfile() {
  try {
    currentProfile = await requestJson("/api/profile");
  } catch (error) {
    currentProfile = {
      authenticated: getStoredAuth(),
      user: getStoredProfile(),
      uploads: getStoredUploads(),
    };
    console.error(error);
  }

  renderProfileSections();
}

async function refreshSiteContent() {
  const page = document.body.dataset.page;

  if (!page) {
    return;
  }

  try {
    const [globalContent, pageContent] = await Promise.all([
      requestJson("/api/site-content/global"),
      requestJson(`/api/site-content/${page}`),
    ]);

    applyContentMap({
      global: globalContent.content || {},
      page: pageContent.content || {},
    });
  } catch (error) {
    console.error(error);
  }
}

function initProfilePage() {
  const logoutButton = document.getElementById("logoutButton");
  const logoutStatus = document.getElementById("logoutStatus");

  if (!logoutButton || !logoutStatus) {
    return;
  }

  logoutButton.addEventListener("click", async () => {
    try {
      await requestJson("/api/logout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({}),
      });
      logoutStatus.textContent = "You have been logged out successfully.";
      await Promise.all([refreshGallery(), refreshProfile()]);
    } catch (error) {
      if (shouldUseLocalMode(error)) {
        setStoredAuth(false);
        clearStoredProfile();
        clearStoredUploads();
        await Promise.all([refreshGallery(), refreshProfile()]);
        logoutStatus.textContent = "Logged out in local mode.";
      } else {
        logoutStatus.textContent = error.message;
      }
    }
  });
}

function initUploadPage() {
  const signupForm = document.getElementById("signupForm");
  const loginForm = document.getElementById("loginForm");
  const artForm = document.getElementById("artForm");
  const uploadSection = document.getElementById("uploadSection");
  const uploadPageNotice = document.getElementById("uploadPageNotice");

  if (!signupForm || !loginForm || !artForm || !uploadSection || !uploadPageNotice) {
    return;
  }

  const signupName = document.getElementById("signupName");
  const signupUsername = document.getElementById("signupUsername");
  const signupEmail = document.getElementById("signupEmail");
  const signupPassword = document.getElementById("signupPassword");
  const signupStatus = document.getElementById("signupStatus");
  const loginUser = document.getElementById("loginUser");
  const loginPassword = document.getElementById("loginPassword");
  const googleLoginButton = document.getElementById("googleLoginButton");
  const loginStatus = document.getElementById("loginStatus");
  const artStatus = document.getElementById("artStatus");
  const artTitle = document.getElementById("artTitle");
  const artCategory = document.getElementById("artCategory");
  const artDescription = document.getElementById("artDescription");
  const artFile = document.getElementById("artFile");
  const artPreviewImage = document.getElementById("artPreviewImage");
  const artPreviewTitle = document.getElementById("artPreviewTitle");
  const artPreviewCategory = document.getElementById("artPreviewCategory");
  const artPreviewDescription = document.getElementById("artPreviewDescription");

  function syncAccess() {
    if (currentProfile.authenticated) {
      uploadSection.classList.remove("locked");
      uploadPageNotice.textContent = "Account active. You can now upload artwork and publish it to collections.";
    } else {
      uploadSection.classList.add("locked");
      uploadPageNotice.textContent = "Browsing collections is free. Upload access is reserved for signed-in creators.";
    }
  }

  artTitle?.addEventListener("input", () => {
    artPreviewTitle.textContent = artTitle.value.trim() || "Untitled Art";
  });

  artCategory?.addEventListener("change", () => {
    artPreviewCategory.textContent = artCategory.value;
  });

  artDescription?.addEventListener("input", () => {
    artPreviewDescription.textContent =
      artDescription.value.trim() || "Your uploaded art preview will appear here before publish.";
  });

  signupForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    try {
      await requestJson("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: signupName.value.trim(),
          username: signupUsername.value.trim(),
          email: signupEmail.value.trim(),
          password: signupPassword.value,
        }),
      });
      signupStatus.textContent = "Signup complete. Upload access unlocked.";
      loginStatus.textContent = "";
      signupForm.reset();
      await refreshProfile();
      syncAccess();
    } catch (error) {
      if (shouldUseLocalMode(error)) {
        setStoredAuth(true);
        setStoredProfile({
          name: signupName.value.trim() || "Dark Creator",
          username: signupUsername.value.trim() || "dracky_artist",
          email: signupEmail.value.trim(),
        });
        signupStatus.textContent = "Signup complete in local mode. Backend is offline.";
        loginStatus.textContent = "";
        signupForm.reset();
        await refreshProfile();
        syncAccess();
      } else {
        signupStatus.textContent = error.message;
      }
    }
  });

  loginForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    try {
      await requestJson("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          login: loginUser.value.trim(),
          password: loginPassword.value,
        }),
      });
      loginStatus.textContent = "Login successful. Upload access unlocked.";
      signupStatus.textContent = "";
      loginForm.reset();
      await refreshProfile();
      syncAccess();
    } catch (error) {
      if (shouldUseLocalMode(error)) {
        const profile = getStoredProfile();
        setStoredAuth(true);
        if (!profile) {
          setStoredProfile({
            name: loginUser.value.trim() || "Dark Creator",
            username: loginUser.value.trim() || "dracky_artist",
            email: "",
          });
        }
        loginStatus.textContent = "Login successful in local mode. Backend is offline.";
        signupStatus.textContent = "";
        loginForm.reset();
        await refreshProfile();
        syncAccess();
      } else {
        loginStatus.textContent = error.message;
      }
    }
  });

  googleLoginButton?.addEventListener("click", async () => {
    try {
      const status = await requestJson("/api/auth/google/status");
      if (!status.configured) {
        loginStatus.textContent = "Google login needs GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in the backend .env.";
        return;
      }

      window.location.href = `${API_BASE}/api/login/google`;
    } catch (error) {
      if (shouldUseLocalMode(error)) {
        loginStatus.textContent = "Google login needs backend OAuth setup. Local mode cannot use Google sign-in.";
      } else {
        loginStatus.textContent = error.message;
      }
    }
  });

  artFile.addEventListener("change", (event) => {
    const [file] = event.target.files;
    artPreviewImage.src = file ? URL.createObjectURL(file) : "images/about.jpg";
    artStatus.textContent = "";
  });

  artForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    if (!currentProfile.authenticated) {
      artStatus.textContent = "Please sign up or log in before uploading.";
      syncAccess();
      return;
    }

    if (!artFile.files.length) {
      artStatus.textContent = "Please choose an image before uploading to the collection.";
      return;
    }

    const formData = new FormData();
    formData.append("title", artTitle.value.trim() || "Untitled Art");
    formData.append("category", artCategory.value);
    formData.append(
      "description",
      artDescription.value.trim() || "User-submitted artwork from Dracky Dark World."
    );
    formData.append("image", artFile.files[0]);

    try {
      await requestJson("/api/artworks", {
        method: "POST",
        body: formData,
      });

      artStatus.textContent = "Artwork uploaded successfully. View it on the Collections page.";
      artForm.reset();
      artPreviewImage.src = "images/about.jpg";
      artPreviewTitle.textContent = "Untitled Art";
      artPreviewCategory.textContent = "Portraits";
      artPreviewDescription.textContent =
        "Your uploaded art preview will appear here before publish.";
      await Promise.all([refreshGallery(), refreshProfile()]);
      syncAccess();
    } catch (error) {
      if (shouldUseLocalMode(error)) {
        saveStoredUpload({
          title: artTitle.value.trim() || "Untitled Art",
          category: artCategory.value,
          description:
            artDescription.value.trim() || "User-submitted artwork from Dracky Dark World.",
          image_url: artPreviewImage.src,
        });
        artStatus.textContent = "Artwork uploaded in local mode. Backend is offline.";
        artForm.reset();
        artPreviewImage.src = "images/about.jpg";
        artPreviewTitle.textContent = "Untitled Art";
        artPreviewCategory.textContent = "Portraits";
        artPreviewDescription.textContent =
          "Your uploaded art preview will appear here before publish.";
        await Promise.all([refreshGallery(), refreshProfile()]);
        syncAccess();
      } else {
        artStatus.textContent = error.message;
      }
    }
  });

  syncAccess();
}

async function initApp() {
  await initEntryExperience();
  await Promise.all([refreshGallery(), refreshProfile(), refreshSiteContent()]);
  initParticleField();
  initCustomCursor();
  initMotionEffects();
  initGalleryFilters();
  initProfilePage();
  initUploadPage();
}

initApp();
