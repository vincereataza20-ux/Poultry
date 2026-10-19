const PHOTO = "https://images.unsplash.com/photo-1548550023-2bdb3c5beed7?auto=format&fit=crop&w=900&q=80";
const PHOTO_ALT = "https://images.unsplash.com/photo-1589927986089-35812388d1f4?auto=format&fit=crop&w=900&q=80";
const STORAGE_KEY = "meadow-cluck-products";

const breedPhotos = {
  "buff orpington": { age: 4, image: "Image/4months%20buff%20orpington.jpg" },
  "plymouth rock": { age: 4, image: "Image/4months%20plymouth.jpg" },
  "blue australorp": { age: 5, image: "Image/5months%20blue%20australorp.jpg" },
  "rhode island red": { age: 5, image: "Image/5months%20rhode%20island%20red.jpg" },
  "speckled sussex": { age: 6, image: "Image/6months%20speckled%20sussex.jpg" },
  welsummer: { age: 6, image: "Image/6months%20welsummer.jpg" }
};

const matchBreedPhoto = (product) => breedPhotos[String(product.breed || "").trim().toLowerCase()];

function matchProductToBreedPhoto(product) {
  const match = matchBreedPhoto(product);
  return match ? { ...product, age: match.age, image: match.image } : product;
}

const starterProducts = [
  { id: "marigold", name: "Marigold", breed: "Buff Orpington", age: 4, price: 32, stock: 6, image: breedPhotos["buff orpington"].image, description: "A sunny little sweetheart who loves a lap and never says no to a treat. A lovely first hen for a growing flock.", traits: "Gentle · beginner friendly · fluffy" },
  { id: "penny", name: "Penny", breed: "Plymouth Rock", age: 4, price: 30, stock: 4, image: breedPhotos["plymouth rock"].image, description: "Curious, confident, and always first to greet you at the gate. Penny is happiest when she has a patch of grass to explore.", traits: "Curious · hardy · people-loving" },
  { id: "bluebell", name: "Bluebell", breed: "Blue Australorp", age: 5, price: 38, stock: 3, image: breedPhotos["blue australorp"].image, description: "A calm, glossy-feathered beauty with a sweet nature. She is settling into her grown-up feathers and ready for her new home.", traits: "Calm · lovely layer · easygoing" },
  { id: "ginger", name: "Ginger", breed: "Rhode Island Red", age: 5, price: 36, stock: 2, image: breedPhotos["rhode island red"].image, description: "Bright-eyed and full of character, Ginger is a sturdy, sociable hen who enjoys company and a good dust bath.", traits: "Sociable · robust · confident" },
  { id: "clover", name: "Clover", breed: "Speckled Sussex", age: 6, price: 45, stock: 3, image: breedPhotos["speckled sussex"].image, description: "Clover is a gentle, well-grown girl with beautiful speckled feathers and a relaxed, friendly personality.", traits: "Friendly · cold-hardy · sweet" },
  { id: "peaches", name: "Peaches", breed: "Welsummer", age: 6, price: 48, stock: 0, image: breedPhotos.welsummer.image, description: "A striking, mature hen with a steady temperament. Peaches is currently reserved, but check back with us soon.", traits: "Steady · distinctive · outdoorsy" }
];

let products = loadProducts();
let activeFilter = "all";
let searchTerm = "";
let toastTimeout;

const $ = (selector) => document.querySelector(selector);
const escapeHtml = (value = "") => String(value).replace(/[&<>"']/g, (character) => ({
  "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
}[character]));
const money = (amount) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount);
const ageGroup = (age) => `${age} months`;

function loadProducts() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return starterProducts.map((product) => ({ ...product }));
    const parsed = JSON.parse(saved);
    if (!Array.isArray(parsed) || parsed.some((product) => !product.id || !product.name || !Number.isFinite(Number(product.age)))) {
      throw new Error("Saved flock data has an invalid format.");
    }
    return parsed.map(matchProductToBreedPhoto);
  } catch (error) {
    console.error("Could not load saved flock inventory:", error);
    return starterProducts.map((product) => ({ ...product }));
  }
}

function saveProducts() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
  } catch (error) {
    console.error("Could not save flock inventory:", error);
    showToast("Your changes couldn't be saved. Check browser storage.");
  }
}

function showToast(message) {
  const toast = $("#toast");
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => toast.classList.remove("show"), 2700);
}

function stockLabel(product) {
  if (product.stock < 1) return '<span class="stock-tag sold-out">Reserved</span>';
  if (product.stock < 3) return `<span class="stock-tag low">Only ${product.stock} left</span>`;
  return `<span class="stock-tag">${product.stock} available</span>`;
}

function renderProducts() {
  const query = searchTerm.trim().toLowerCase();
  const visible = products.filter((product) => {
    const matchesAge = activeFilter === "all" || (activeFilter === "6" ? product.age >= 6 : product.age === Number(activeFilter));
    const matchesQuery = !query || `${product.name} ${product.breed} ${product.traits}`.toLowerCase().includes(query);
    return matchesAge && matchesQuery;
  });
  $("#all-count").textContent = products.length;
  $("#product-grid").innerHTML = visible.map((product) => `
    <article class="product-card">
      <div class="product-photo" data-details="${escapeHtml(product.id)}" tabindex="0" role="button" aria-label="View ${escapeHtml(product.name)}'s details">
        <img src="${escapeHtml(product.image || PHOTO)}" alt="${escapeHtml(product.name)}, a ${escapeHtml(product.breed)} chicken" loading="lazy" />
        <span class="age-tag">${ageGroup(Number(product.age))} old</span>${stockLabel(product)}
      </div>
      <div class="product-info">
        <div class="product-subtitle"><span>${escapeHtml(product.breed)}</span><span class="rating">★★★★★</span></div>
        <div class="product-title-row"><h3>${escapeHtml(product.name)}</h3><span class="product-price">${money(Number(product.price))}</span></div>
        <p class="product-description">${escapeHtml(product.description)}</p>
        <div class="product-card-bottom"><span class="trait-line">${escapeHtml(product.traits)}</span><button class="detail-link" type="button" data-details="${escapeHtml(product.id)}">Meet her ↗</button></div>
      </div>
    </article>`).join("");
  $("#empty-state").hidden = visible.length > 0;
}

function openProduct(id) {
  const product = products.find((item) => item.id === id);
  if (!product) return;
  $("#modal-content").innerHTML = `
    <div class="detail-layout">
      <img src="${escapeHtml(product.image || PHOTO)}" alt="${escapeHtml(product.name)}, a ${escapeHtml(product.breed)} chicken" />
      <div class="detail-copy">
        <span class="eyebrow">${escapeHtml(product.breed)} · ${ageGroup(Number(product.age))} old</span>
        <h2 id="modal-title">Meet ${escapeHtml(product.name)}.</h2>
        <p>${escapeHtml(product.description)}</p>
        <div class="detail-traits"><strong>A little about her</strong><br />${escapeHtml(product.traits)}<br />Raised outdoors with room to roam.</div>
        <div class="detail-price">${money(Number(product.price))}</div>
        <p>${product.stock > 0 ? `${product.stock} ready for a new home` : "Currently reserved — ask us when she will be available."}</p>
      </div>
    </div>`;
  $("#modal-backdrop").hidden = false;
  $(".modal-close").focus();
}

function renderInventory() {
  const totalHens = products.reduce((total, product) => total + Number(product.stock), 0);
  $("#admin-stats").innerHTML = `
    <div class="stat-card"><span>Hen listings</span><strong>${products.length}</strong></div>
    <div class="stat-card"><span>Hens available</span><strong>${totalHens}</strong></div>
    <div class="stat-card"><span>Reserved listings</span><strong>${products.filter((product) => Number(product.stock) === 0).length}</strong></div>`;
  $("#inventory-count").textContent = `(${products.length})`;
  $("#inventory-list").innerHTML = products.length ? products.map((product) => `
    <div class="inventory-row">
      <img src="${escapeHtml(product.image || PHOTO)}" alt="" />
      <div><h4>${escapeHtml(product.name)} · ${money(Number(product.price))}</h4><p>${escapeHtml(product.breed)} · ${ageGroup(Number(product.age))} · ${product.stock} available</p></div>
      <div class="inventory-controls"><button type="button" data-edit="${escapeHtml(product.id)}">Edit</button><button class="delete-item" type="button" data-delete="${escapeHtml(product.id)}">Remove</button></div>
    </div>`).join("") : '<p class="inventory-empty">No hens in the flock yet. Add the first one using the form.</p>';
}

function resetForm() {
  $("#product-form").reset();
  $("#edit-id").value = "";
  $("#form-age").value = "4";
  $("#form-stock").value = "1";
  $("#form-heading").textContent = "Add a hen";
  $("#save-product").innerHTML = "Add to flock <span>↗</span>";
  $("#cancel-edit").hidden = true;
}

function editProduct(id) {
  const product = products.find((item) => item.id === id);
  if (!product) return;
  $("#edit-id").value = product.id;
  $("#form-name").value = product.name;
  $("#form-breed").value = product.breed;
  $("#form-age").value = product.age;
  $("#form-price").value = product.price;
  $("#form-stock").value = product.stock;
  $("#form-image").value = matchBreedPhoto(product)?.image === product.image || product.image === PHOTO || product.image === PHOTO_ALT ? "" : product.image;
  $("#form-description").value = product.description;
  $("#form-traits").value = product.traits;
  $("#form-heading").textContent = `Editing ${product.name}`;
  $("#save-product").innerHTML = "Save changes <span>↗</span>";
  $("#cancel-edit").hidden = false;
  $("#product-form").scrollIntoView({ behavior: "smooth", block: "start" });
  $("#form-name").focus({ preventScroll: true });
}

function openAdmin() {
  $("#admin-panel").hidden = false;
  renderInventory();
  resetForm();
  $("#admin-close").focus();
}

document.addEventListener("click", (event) => {
  const detailsButton = event.target.closest("[data-details]");
  if (detailsButton) openProduct(detailsButton.dataset.details);
  const editButton = event.target.closest("[data-edit]");
  if (editButton) editProduct(editButton.dataset.edit);
  const deleteButton = event.target.closest("[data-delete]");
  if (deleteButton) {
    const product = products.find((item) => item.id === deleteButton.dataset.delete);
    if (!product) return;
    if (!confirm(`Remove ${product.name} from the flock?`)) return;
    products = products.filter((item) => item.id !== product.id);
    saveProducts();
    renderInventory();
    renderProducts();
    showToast(`${product.name} removed from listings.`);
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    $("#modal-backdrop").hidden = true;
  }
  if ((event.key === "Enter" || event.key === " ") && event.target.matches(".product-photo[data-details]")) {
    event.preventDefault();
    openProduct(event.target.dataset.details);
  }
});

document.querySelectorAll(".filter-chip").forEach((button) => {
  button.addEventListener("click", () => {
    activeFilter = button.dataset.filter;
    document.querySelectorAll(".filter-chip").forEach((chip) => chip.classList.toggle("active", chip === button));
    renderProducts();
  });
});
$("#search-input").addEventListener("input", (event) => {
  searchTerm = event.target.value;
  renderProducts();
});
$("#admin-trigger").addEventListener("click", openAdmin);
$("#admin-close").addEventListener("click", () => { $("#admin-panel").hidden = true; });
$("#cancel-edit").addEventListener("click", resetForm);
$(".modal-close").addEventListener("click", () => { $("#modal-backdrop").hidden = true; });
$("#modal-backdrop").addEventListener("click", (event) => { if (event.target === $("#modal-backdrop")) $("#modal-backdrop").hidden = true; });

$("#product-form").addEventListener("submit", (event) => {
  event.preventDefault();
  const editId = $("#edit-id").value;
  const existing = products.find((product) => product.id === editId);
  const record = {
    id: editId || `hen-${Date.now().toString(36)}`,
    name: $("#form-name").value.trim(),
    breed: $("#form-breed").value.trim(),
    age: Number($("#form-age").value),
    price: Number($("#form-price").value),
    stock: Number($("#form-stock").value),
    image: $("#form-image").value.trim() || existing?.image || PHOTO,
    description: $("#form-description").value.trim(),
    traits: $("#form-traits").value.trim() || "Outdoor raised · healthy · friendly"
  };
  if (![record.age, record.price, record.stock].every(Number.isFinite) || !Number.isInteger(record.age) || !Number.isInteger(record.stock) || record.age < 4 || record.price < 0 || record.stock < 0) {
    showToast("Check age, price, and available hens before saving.");
    return;
  }
  Object.assign(record, matchProductToBreedPhoto(record));
  if (existing) products = products.map((product) => product.id === editId ? record : product);
  else products.unshift(record);
  saveProducts();
  renderInventory();
  renderProducts();
  resetForm();
  showToast(existing ? `${record.name}'s listing updated.` : `${record.name} added to the flock.`);
});

renderProducts();
