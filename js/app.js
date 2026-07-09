// ========== 主应用逻辑 ==========

let selectedCake = null;
let isLoading = true;

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
async function renderCatalog() {
  const cakes = await getCakes();
  const grid = document.getElementById('cake-grid');
  const empty = document.getElementById('no-cakes');
  
  grid.innerHTML = '';
  
  if (!cakes || cakes.length === 0) {
    empty.style.display = 'block';
    return;
  }
  empty.style.display = 'none';
  
  cakes.forEach((cake, index) => {
    const card = document.createElement('div');
    card.className = 'cake-card';
    card.setAttribute('data-cake-id', index);
    
    // 如果有图片就显示，没有就用默认图
    const imgSrc = cake.image && cake.image !== '' ? cake.image : 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300"><rect fill="%23f5e6d3" width="400" height="300"/><text x="200" y="150" text-anchor="middle" font-size="40">🎂</text></svg>';
    
    card.innerHTML = `
      <img src="${escapeHtml(imgSrc)}" alt="${escapeHtml(cake.name)}" loading="lazy" style="width:100%;height:160px;object-fit:cover;display:block;">
      <div class="cake-info">
        <div class="cake-name">${escapeHtml(cake.name)}</div>
        <div class="cake-desc">${escapeHtml(cake.description || '')}</div>
      </div>
    `;
    grid.appendChild(card);
  });
  
  // 用事件委托处理点击
  grid.onclick = function(e) {
    const card = e.target.closest('.cake-card');
    if (card) {
      const index = parseInt(card.getAttribute('data-cake-id'));
      if (cakes[index]) {
        showLightbox(cakes[index]);
      }
    }
  };
  
  // 大图遮罩绑定事件
  const lb = document.getElementById('lightbox');
  if (lb) {
    document.getElementById('lb-close').onclick = function() {
      lb.style.display = 'none';
    };
    document.getElementById('lb-back').onclick = function() {
      lb.style.display = 'none';
    };
    document.getElementById('lb-order').onclick = function() {
      lb.style.display = 'none';
      openOrderPage(selectedCake);
    };
    lb.onclick = function(e) {
      if (e.target === lb) lb.style.display = 'none';
    };
  }
}

// --- 选蛋糕（显示大图预览） ---
function showLightbox(cake) {
  if (!cake) {
    showToast('❌ 蛋糕信息不存在');
    return;
  }
  
  selectedCake = cake;
  
  const lb = document.getElementById('lightbox');
  if (lb) {
    lb.style.display = 'flex';
    const imgSrc = cake.image && cake.image !== '' ? cake.image : 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300"><rect fill="%23f5e6d3" width="400" height="300"/><text x="200" y="150" text-anchor="middle" font-size="40">🎂</text></svg>';
    document.getElementById('lb-image').src = imgSrc;
    document.getElementById('lb-name').textContent = cake.name;
    document.getElementById('lb-desc').textContent = cake.description || '';
  }
}

// --- 打开订购页 ---
function openOrderPage(cake) {
  if (!cake) {
    showToast('❌ 蛋糕信息不存在');
    return;
  }
  
  const imgSrc = cake.image && cake.image !== '' ? cake.image : 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300"><rect fill="%23f5e6d3" width="400" height="300"/><text x="200" y="150" text-anchor="middle" font-size="40">🎂</text></svg>';
  document.getElementById('preview-img').src = imgSrc;
  document.getElementById('preview-name').textContent = cake.name;
  document.getElementById('cake-style').value = cake.name;
  
  // 设置默认交货时间为明天上午10点
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

// --- 复制订单 ---
async function copyOrder() {
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
  if (selectedCake) {
    order += `\n（已选中蛋糕：${selectedCake.name}）`;
  }
  
  // 复制到剪贴板
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(order);
      showToast('✅ 订单已复制！去微信粘贴发给店主吧');
      
      // 同时保存到数据库
      await saveOrder({
        customer_name: name,
        phone: phone,
        style: style,
        size: size,
        age: age ? parseInt(age) : null,
        delivery_time: new Date(formattedTime).toISOString(),
        greeting: greeting,
        cake_name: selectedCake ? selectedCake.name : style
      });
    } else {
      showToast('⚠️ 复制失败，请手动复制');
    }
  } catch (err) {
    showToast('❌ 复制失败，请手动复制');
  }
}

// --- 保存订单到数据库 ---
async function saveOrder(orderData) {
  try {
    const result = await addOrder(orderData);
    console.log('订单已保存:', result);
  } catch (error) {
    console.error('保存订单失败:', error);
  }
}

// --- 发送到飞书 ---
async function sendToFeishu(orderData) {
  const webhookUrl = 'https://open.feishu.cn/open-apis/bot/v2/hook/3a2ab45d-4e15-467e-b7c4-b3d6e97c1f5a';
  
  const content = `🎂 **新蛋糕订单**
━━━━━━━━━━━━━━
姓名：${orderData.name}
电话：${orderData.phone}
款式：${orderData.style}
尺寸：${orderData.size}
${orderData.age ? '年龄：' + orderData.age + '岁\n' : ''}${orderData.time ? '交货：' + orderData.time.replace('T', ' ') + '\n' : ''}${orderData.greeting ? '贺卡：' + orderData.greeting + '\n' : ''}蛋糕：${orderData.cakeName}
━━━━━━━━━━━━━━`;

  const data = {
    msg_type: 'interactive',
    card: {
      config: { wide_screen_mode: true },
      header: {
        title: { tag: 'plain_text', content: '🎂 新蛋糕订单' },
        template: 'red'
      },
      elements: [{
        tag: 'markdown',
        content: content
      }]
    }
  };

  return fetch(webhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).then(res => res.json());
}

// --- 分享到微信（复制文本 + 发飞书） ---
async function shareToWechat() {
  const name = document.getElementById('cust-name').value.trim();
  const phone = document.getElementById('cust-phone').value.trim();
  const style = document.getElementById('cake-style').value.trim();
  const size = document.getElementById('cake-size').value;
  const age = document.getElementById('cust-age').value.trim();
  const time = document.getElementById('delivery-time').value;
  const greeting = document.getElementById('greeting-msg').value.trim();
  
  if (!name || !phone || !style || !size || !time) {
    showToast('请填写所有必填项（标*）');
    return;
  }
  
  // 1. 先保存到数据库
  await saveOrder({
    customer_name: name,
    phone: phone,
    style: style,
    size: size,
    age: age ? parseInt(age) : null,
    delivery_time: new Date(time.replace('T', ' ')).toISOString(),
    greeting: greeting,
    cake_name: selectedCake ? selectedCake.name : style
  });
  
  // 2. 再发送到飞书
  const orderData = {
    name: name,
    phone: phone,
    style: style,
    size: size,
    age: age,
    time: time.replace('T', ' '),
    greeting: greeting,
    cakeName: selectedCake ? selectedCake.name : style
  };
  
  showToast('⏳ 正在发送订单到飞书...');
  
  try {
    await sendToFeishu(orderData);
    showToast('✅ 订单已发送！');
  } catch (err) {
    console.error('飞书发送失败:', err);
    showToast('⚠️ 飞书发送失败，订单已保存');
  }
}

// --- 管理员：上传图片 ---
async function handleUpload(event) {
  const file = event.target.files[0];
  if (!file) return;
  
  // 限制大小 2MB
  if (file.size > 2 * 1024 * 1024) {
    showToast('图片太大啦，请选小于2MB的图片');
    return;
  }
  
  const reader = new FileReader();
  reader.onload = async function(e) {
    const imageData = e.target.result;
    const name = prompt('蛋糕名称：', file.name.replace(/\.[^.]+$/, ''));
    if (name === null) return; // 取消
    
    const desc = prompt('蛋糕描述：', '');
    if (desc === null) return;
    
    try {
      await addCake(name, desc, imageData);
      showToast('✅ 添加成功！');
      renderAdminList();
    } catch (error) {
      showToast('❌ 添加失败，请检查网络');
    }
  };
  reader.readAsDataURL(file);
  
  // 重置 input 以便重复上传同一文件
  event.target.value = '';
}

// --- 管理员：删除蛋糕 ---
async function deleteCake(id) {
  if (!confirm('确定删除这款蛋糕吗？')) return;
  
  try {
    await removeCake(id);
    showToast('✅ 已删除');
    renderAdminList();
    renderCatalog();
  } catch (error) {
    showToast('❌ 删除失败');
  }
}

// --- 管理员列表 ---
async function renderAdminList() {
  const cakes = await getCakes();
  const list = document.getElementById('admin-cake-list');
  list.innerHTML = '';
  
  if (cakes.length === 0) {
    list.innerHTML = '<p style="color:#aaa;text-align:center;padding:20px;">暂无蛋糕</p>';
    return;
  }
  
  cakes.forEach(cake => {
    const item = document.createElement('div');
    item.className = 'admin-item';
    
    const imgSrc = cake.image && cake.image !== '' ? cake.image : 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="80" height="80"><rect fill="%23f5e6d3" width="80" height="80"/><text x="40" y="45" text-anchor="middle" font-size="30">🎂</text></svg>';
    
    item.innerHTML = `
      <img src="${escapeHtml(imgSrc)}" alt="${escapeHtml(cake.name)}" style="width:60px;height:60px;object-fit:cover;border-radius:4px;">
      <div class="item-info">
        <div class="item-name">${escapeHtml(cake.name)}</div>
        <div class="item-desc">${escapeHtml(cake.description || '')}</div>
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
document.addEventListener('DOMContentLoaded', async function() {
  // 加载数据
  await getCakes(); // 预加载确保数据就绪
  
  renderCatalog();
  
  // 管理按钮点击事件
  var adminBtn = document.getElementById('admin-btn');
  if (adminBtn) {
    adminBtn.onclick = function(e) {
      e.preventDefault();
      e.stopPropagation();
      enterAdmin();
    };
  }
});
