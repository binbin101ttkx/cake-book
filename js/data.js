// ========== 数据管理 ==========
// 使用 localStorage 存储蛋糕图册数据（含图片base64）

const STORAGE_KEY = 'cake_book_data';

function getCakes() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (raw) return JSON.parse(raw);
  // 默认空图册
  return [];
}

function saveCakes(cakes) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(cakes));
}

function addCake(name, desc, imageDataUrl) {
  const cakes = getCakes();
  cakes.push({
    id: Date.now().toString(),
    name: name,
    desc: desc || '精美蛋糕',
    image: imageDataUrl
  });
  saveCakes(cakes);
  return cakes;
}

function removeCake(id) {
  const cakes = getCakes().filter(c => c.id !== id);
  saveCakes(cakes);
  return cakes;
}

function clearCakes() {
  localStorage.removeItem(STORAGE_KEY);
}
