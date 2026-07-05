// ========== 主应用逻辑 ==========

let selectedCake = null;

// --- 页面切换 ---
function showPage(pageId) {
  ['catalog-page', 'order-page', 'admin-page'].forEach(id => {
    const el = document.getElementById(id);
    if (id === pageId) {
      el.classList.remove('page-hidden');
    } else {
      el.classList.add('page-hidden');
    }
  });
}

function goToCatalog() {
  showPage('catalog-page');
  renderCatalog();
}

function goBack() {
  showPage('catalog-page');
  renderCatalog();
}

// --- 图册渲染 ---
function renderCatalog() {
  const cakes = getCakes();
  const grid = document.getElementById('cake-grid');
  const empty = document.getElementById('no-cakes');
  
  grid.innerHTML = '';
  
  if (cakes.length === 0) {
    empty.style.display = 'block';
    return;
  }
  empty.style.display = 'none';
  
  cakes.forEach(cake => {
    const card = document.createElement('div');
    card.className = 'cake-card';
    card.innerHTML = `
      <img src="${cake.image}" alt="${cake.name}" loading="lazy">
      <div class="cake-info">
        <div class="cake-name">${escapeHtml(cake.name)}</div>
        <div class="cake-desc">${escapeHtml(cake.desc)}</div>
      </div>
    `;
    card.onclick = () => selectCake(cake);
    grid.appendChild(card);
  });
}

// --- 选蛋糕 ---
function selectCake(cake) {
  selectedCake = cake;
  
  // 显示大图预览
  const lb = document.getElementById('lightbox');
  lb.style.display = 'flex';
  lb.querySelector('img').src = cake.image;
  lb.querySelector('.lb-info h3').textContent = cake.name;
  lb.querySelector('.lb-info p').textContent = cake.desc;
  
  // 绑定按钮事件
  lb.querySelector('.lb-confirm').onclick = () => {
    lb.style.display = 'none';
    openOrderPage();
  };
  lb.querySelector('.lb-cancel').onclick = () => {
    lb.style.display = 'none';
  };
}

function openOrderPage() {
  if (!selectedCake) return;
  
  document.getElementById('preview-img').src = selectedCake.image;
  document.getElementById('preview-name').textContent = selectedCake.name;
  document.getElementById('cake-style').value = selectedCake.name;
  
  // 设置默认交货时间为明天
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(10, 0, 0, 0);
  document.getElementById('delivery-time').value = formatDateTimeLocal(tomorrow);
  
  // 清空其他字段
  document.getElementById('cust-name').value = '';
  document.getElementById('cust-phone').value = '';
  document.getElementById('cake-size').value = '';
  document.getElementById('cust-age').value = '';
  document.getElementById('greeting-msg').value = '';
  
  showPage('order-page');
}

function formatDateTimeLocal(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  const h = String(date.getHours()).padStart(2, '0');
  const mi = String(date.getMinutes()).padStart(2, '0');
  return `${y}-${m}-${d}T${h}:${mi}`;
}

// --- 复制订单 ---
function copyOrder() {
  const name = document.getElementById('cust-name').value.trim();
  const phone = document.getElementById('cust-phone').value.trim();
  const style = document.getElementById('cake-style').value.trim();
  const size = document.getElementById('cake-size').value;
  const age = document.getElementById('cust-age').value.trim();
  const time = document.getElementById('delivery-time').value;
  const greeting = document.getElementById('greeting-msg').value.trim();
  
  // 校验必填项
  if (!name || !phone || !style || !size || !time) {
    showToast('请填写所有必填项（标*）');
    return;
  }
  
  // 格式化时间
  let formattedTime = time.replace('T', ' ');
  
  // 构建订单文本
  let order = `🎂 蛋糕订购\n`;
  order += `━━━━━━━━━━━━━━\n`;
  order += `姓名：${name}\n`;
  order += `电话：${phone}\n`;
  order += `款式：${style}\n`;
  order += `尺寸：${size}\n`;
  if (age) order += `年龄：${age}岁\n`;
  order += `交货：${formattedTime}\n`;
  if (greeting) order += `贺卡：${greeting}\n`;
  order += `━━━━━━━━━━━━━━\n`;
  order += `\n（已选中蛋糕：${selectedCake.name}）`;
  
  // 复制到剪贴板
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(order).then(() => {
      showToast('✅ 订单已复制！去微信粘贴发给店主吧');
    }).catch(() => {
      fallbackCopy(order);
    });
  } else {
    fallbackCopy(order);
  }
}

function fallbackCopy(text) {
  const ta = document.createElement('textarea');
  ta.value = text;
  ta.style.position = 'fixed';
  ta.style.left = '-9999px';
  document.body.appendChild(ta);
  ta.select();
  try {
    document.execCommand('copy');
    showToast('✅ 订单已复制！去微信粘贴发给店主吧');
  } catch (e) {
    showToast('❌ 复制失败，请手动复制');
  }
  document.body.removeChild(ta);
}

// --- 分享到微信 ---
function shareToWechat() {
  copyOrder();
  showToast('💬 打开微信，粘贴发送给店主即可');
}

// --- 管理员：上传图片 ---
function handleUpload(event) {
  const file = event.target.files[0];
  if (!file) return;
  
  // 限制大小 2MB
  if (file.size > 2 * 1024 * 1024) {
    showToast('图片太大啦，请选小于2MB的图片');
    return;
  }
  
  const reader = new FileReader();
  reader.onload = function(e) {
    const imageData = e.target.result;
    const name = prompt('蛋糕名称：', file.name.replace(/\.[^.]+$/, ''));
    if (name === null) return; // 取消
    
    const desc = prompt('蛋糕描述：', '');
    if (desc === null) return;
    
    addCake(name, desc, imageData);
    showToast('✅ 添加成功！');
    renderAdminList();
  };
  reader.readAsDataURL(file);
  
  // 重置 input 以便重复上传同一文件
  event.target.value = '';
}

// --- 管理员：删除蛋糕 ---
function deleteCake(id) {
  if (!confirm('确定删除这款蛋糕吗？')) return;
  
  removeCake(id);
  showToast('✅ 已删除');
  renderAdminList();
  renderCatalog();
}

// --- 管理员列表 ---
function renderAdminList() {
  const cakes = getCakes();
  const list = document.getElementById('admin-cake-list');
  list.innerHTML = '';
  
  if (cakes.length === 0) {
    list.innerHTML = '<p style="color:#aaa;text-align:center;padding:20px;">暂无蛋糕</p>';
    return;
  }
  
  cakes.forEach(cake => {
    const item = document.createElement('div');
    item.className = 'admin-item';
    item.innerHTML = `
      <img src="${cake.image}" alt="${cake.name}">
      <div class="item-info">
        <div class="item-name">${escapeHtml(cake.name)}</div>
        <div class="item-desc">${escapeHtml(cake.desc)}</div>
      </div>
      <button class="delete-btn" onclick="deleteCake('${cake.id}')">删除</button>
    `;
    list.appendChild(item);
  });
}

// --- 进入管理员后台 ---
function enterAdmin() {
  const pw = prompt('请输入管理密码：');
  if (pw === 'admin123') {
    showPage('admin-page');
    renderAdminList();
  } else if (pw !== null) {
    showToast('❌ 密码错误');
  }
}

// --- 轻提示 ---
function showToast(msg) {
  // 移除已有的 toast
  const old = document.querySelector('.toast');
  if (old) old.remove();
  
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = msg;
  document.body.appendChild(toast);
  
  setTimeout(() => toast.remove(), 3000);
}

// --- 工具函数 ---
function escapeHtml(str) {
  if (!str) return '';
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

// --- 初始化 ---
document.addEventListener('DOMContentLoaded', function() {
  renderCatalog();
  
  // 双击底部页脚进入管理后台
  document.querySelector('.catalog-footer').addEventListener('dblclick', enterAdmin);
});
