-- cake-book 数据库表结构

-- 蛋糕表
CREATE TABLE IF NOT EXISTS cakes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  image TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 订单表
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  style TEXT NOT NULL,
  size TEXT NOT NULL,
  age INTEGER,
  delivery_time TIMESTAMPTZ NOT NULL,
  greeting TEXT,
  cake_name TEXT,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 启用 RLS（行级安全）
ALTER TABLE cakes ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- 允许所有人读取蛋糕列表
CREATE POLICY "public_read_cakes" ON cakes FOR SELECT USING (true);

-- 允许所有人插入订单
CREATE POLICY "public_insert_orders" ON orders FOR INSERT WITH CHECK (true);

-- 允许所有人读取订单
CREATE POLICY "public_read_orders" ON orders FOR SELECT USING (true);
