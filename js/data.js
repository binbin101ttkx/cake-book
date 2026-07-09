// ========== Supabase 初始化 ==========

const SUPABASE_URL = 'https://dqknfgrupnsoztercesj.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_7vYkTaY_edqTlltNRqU_LQ_vi9v9GYX';
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ========== 蛋糕数据操作 ==========

async function getCakes() {
  const { data, error } = await supabase
    .from('cakes')
    .select('*')
    .order('created_at', { ascending: true });
  
  if (error) {
    console.error('获取蛋糕列表失败:', error);
    return [];
  }
  
  // 如果没有蛋糕，返回默认数据
  if (!data || data.length === 0) {
    return getDefaults();
  }
  
  return data;
}

function getDefaults() {
  return [
    {id: "default_1", name: "草莓奶油蛋糕", description: "新鲜草莓搭配动物奶油"},
    {id: "default_2", name: "葡萄慕斯蛋糕", description: "香浓葡萄口味慕斯"},
    {id: "default_3", name: "芒果千层蛋糕", description: "层层芒果夹心"},
    {id: "default_4", name: "抹茶红豆蛋糕", description: "清香抹茶配红豆"},
    {id: "default_5", name: "樱桃蛋糕", description: "酸甜樱桃点缀"},
    {id: "default_6", name: "蓝莓芝士蛋糕", description: "酸甜蓝莓芝士"},
    {id: "default_7", name: "樱花草莓蛋糕", description: "粉色樱花草莓"},
    {id: "default_8", name: "焦糖玛奇朵蛋糕", description: "焦糖玛奇朵风味"},
    {id: "default_9", name: "紫薯蛋糕", description: "健康紫薯口味"},
    {id: "default_10", name: "薄荷巧克力蛋糕", description: "清新薄荷巧克力"}
  ];
}

async function addCake(name, desc, imageDataUrl) {
  const cake = {
    name: name,
    description: desc || '精美蛋糕',
    image: imageDataUrl,
    created_at: new Date().toISOString()
  };
  
  const { data, error } = await supabase
    .from('cakes')
    .insert(cake)
    .select()
    .single();
  
  if (error) {
    console.error('添加蛋糕失败:', error);
    throw error;
  }
  
  return data;
}

async function removeCake(id) {
  const { error } = await supabase
    .from('cakes')
    .delete()
    .eq('id', id);
  
  if (error) {
    console.error('删除蛋糕失败:', error);
    throw error;
  }
  
  return true;
}

async function resetCakes() {
  const { error } = await supabase
    .from('cakes')
    .delete()
    .neq('id', ''); // 清空所有
  
  if (error) {
    console.error('重置蛋糕列表失败:', error);
    throw error;
  }
  
  // 重新插入默认数据
  const defaults = getDefaults();
  for (const def of defaults) {
    await addCake(def.name, def.description, '');
  }
  
  return defaults;
}

// ========== 订单数据操作 ==========

async function getOrders() {
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('获取订单列表失败:', error);
    return [];
  }
  
  return data || [];
}

async function addOrder(orderData) {
  const order = {
    ...orderData,
    created_at: new Date().toISOString(),
    status: 'pending'
  };
  
  const { data, error } = await supabase
    .from('orders')
    .insert(order)
    .select()
    .single();
  
  if (error) {
    console.error('添加订单失败:', error);
    throw error;
  }
  
  return data;
}

async function updateOrderStatus(orderId, status) {
  const { data, error } = await supabase
    .from('orders')
    .update({ status })
    .eq('id', orderId)
    .select()
    .single();
  
  if (error) {
    console.error('更新订单状态失败:', error);
    throw error;
  }
  
  return data;
}

async function deleteOrder(orderId) {
  const { error } = await supabase
    .from('orders')
    .delete()
    .eq('id', orderId);
  
  if (error) {
    console.error('删除订单失败:', error);
    throw error;
  }
  
  return true;
}

// ========== 工具函数 ==========

function escapeHtml(str) {
  if (!str) return '';
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

function formatDateTimeLocal(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  const h = String(date.getHours()).padStart(2, '0');
  const mi = String(date.getMinutes()).padStart(2, '0');
  return `${y}-${m}-${d}T${h}:${mi}`;
}

function showToast(msg) {
  const old = document.querySelector('.toast');
  if (old) old.remove();
  
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = msg;
  document.body.appendChild(toast);
  
  setTimeout(() => toast.remove(), 3000);
}
