const engagementDate = new Date("2026-08-23T00:00:00+05:30");
const photoVariantToggle = document.querySelector("#photo-variant-toggle");
const galleryImages = [...document.querySelectorAll("img[data-base]")];
const photoCards = [...document.querySelectorAll("[data-photo-base]")];
const lightbox = document.querySelector("#lightbox");
const lightboxImage = lightbox.querySelector("img");

const units = {
  days: document.querySelector("#days"),
  hours: document.querySelector("#hours"),
  minutes: document.querySelector("#minutes"),
  seconds: document.querySelector("#seconds"),
};

let currentPhotoVariant = 1;

function syncToggleState() {
  if (photoVariantToggle) photoVariantToggle.checked = currentPhotoVariant === 2;
}

function getRequestedPhotoVariant() {
  return photoVariantToggle?.checked ? 2 : 1;
}

function buildImagePath(basePath, variant) {
  return `${basePath}${variant === 2 ? "2" : ""}.jpg`;
}

function applyPhotoVariant(variant) {
  currentPhotoVariant = variant;
  syncToggleState();

  galleryImages.forEach((image) => {
    image.src = buildImagePath(image.dataset.base, variant);
  });

  photoCards.forEach((card) => {
    card.dataset.photo = buildImagePath(card.dataset.photoBase, variant);
  });

  const activeCard = document.querySelector("[data-photo-base].is-active");
  if (lightbox.open && activeCard) {
    lightboxImage.src = activeCard.dataset.photo;
  }
}

function setUnit(element, value, minimumLength = 2) {
  const nextValue = String(value).padStart(minimumLength, "0");
  if (element.textContent === nextValue) return;
  element.textContent = nextValue;
  element.classList.remove("tick");
  requestAnimationFrame(() => element.classList.add("tick"));
}

function updateCountdown() {
  const distance = engagementDate.getTime() - Date.now();
  if (distance <= 0) {
    Object.values(units).forEach((unit) => { unit.textContent = "00"; });
    document.querySelector("#countdown-note").textContent = "Today, forever begins. ♥";
    return;
  }

  const day = 1000 * 60 * 60 * 24;
  const hour = 1000 * 60 * 60;
  const minute = 1000 * 60;
  setUnit(units.days, Math.floor(distance / day));
  setUnit(units.hours, Math.floor((distance % day) / hour));
  setUnit(units.minutes, Math.floor((distance % hour) / minute));
  setUnit(units.seconds, Math.floor((distance % minute) / 1000));
}

syncToggleState();
applyPhotoVariant(currentPhotoVariant);
if (photoVariantToggle) {
  photoVariantToggle.addEventListener("change", () => {
    applyPhotoVariant(getRequestedPhotoVariant());
  });
}

updateCountdown();
setInterval(updateCountdown, 1000);

const observer = new IntersectionObserver(
  (entries) => entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add("visible");
      observer.unobserve(entry.target);
    }
  }),
  { threshold: 0.14 }
);
document.querySelectorAll(".reveal").forEach((element) => observer.observe(element));

function makeHeart(x, y) {
  const heart = document.createElement("span");
  heart.className = "floating-heart";
  heart.textContent = Math.random() > 0.35 ? "♥" : "♡";
  heart.style.left = `${x}px`;
  heart.style.top = `${y}px`;
  heart.style.setProperty("--drift", `${Math.round(Math.random() * 50 - 25)}px`);
  heart.style.fontSize = `${0.8 + Math.random() * 0.75}rem`;
  document.body.appendChild(heart);
  heart.addEventListener("animationend", () => heart.remove());
}

document.querySelector("#love-button").addEventListener("click", (event) => {
  const bounds = event.currentTarget.getBoundingClientRect();
  for (let index = 0; index < 7; index += 1) {
    setTimeout(() => makeHeart(bounds.left + bounds.width / 2, bounds.top + bounds.height / 2), index * 55);
  }
});

photoCards.forEach((card) => {
  card.addEventListener("click", () => {
    photoCards.forEach((item) => item.classList.remove("is-active"));
    card.classList.add("is-active");
    lightboxImage.src = card.dataset.photo;
    lightboxImage.alt = card.querySelector("img").alt;
    lightbox.showModal();
  });
});
lightbox.querySelector(".lightbox-close").addEventListener("click", () => {
  photoCards.forEach((card) => card.classList.remove("is-active"));
  lightbox.close();
});
lightbox.addEventListener("click", (event) => {
  if (event.target === lightbox) {
    photoCards.forEach((card) => card.classList.remove("is-active"));
    lightbox.close();
  }
});
