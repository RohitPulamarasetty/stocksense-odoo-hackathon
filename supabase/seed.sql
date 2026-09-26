-- Demo dataset: a small industrial hardware distributor.
-- Safe to re-run: clears master data tables first.

truncate table products, partners, locations, warehouses, categories restart identity cascade;

insert into categories (id, name) values
  ('11111111-1111-1111-1111-111111111101', 'Metals & Rods'),
  ('11111111-1111-1111-1111-111111111102', 'Bearings & Fasteners'),
  ('11111111-1111-1111-1111-111111111103', 'Piping'),
  ('11111111-1111-1111-1111-111111111104', 'Sheet Metal');

insert into warehouses (id, name, short_code, address) values
  ('22222222-2222-2222-2222-222222222201', 'Main Warehouse', 'MAIN', 'Plot 14, MIDC Industrial Area, Pune'),
  ('22222222-2222-2222-2222-222222222202', 'Production Unit', 'PROD', 'Plot 22, MIDC Industrial Area, Pune');

insert into locations (warehouse_id, name, short_code) values
  ('22222222-2222-2222-2222-222222222201', 'Receiving', 'RECV'),
  ('22222222-2222-2222-2222-222222222201', 'Rack A', 'RACK-A'),
  ('22222222-2222-2222-2222-222222222201', 'Rack B', 'RACK-B'),
  ('22222222-2222-2222-2222-222222222201', 'Dispatch', 'DISP'),
  ('22222222-2222-2222-2222-222222222202', 'Production Floor', 'FLOOR'),
  ('22222222-2222-2222-2222-222222222202', 'Staging', 'STAGE');

insert into partners (name, type, contact) values
  ('Aravind Steel Traders', 'vendor', 'aravind.steel@example.com'),
  ('Konkan Bearings Pvt Ltd', 'vendor', 'sales@konkanbearings.example.com'),
  ('Shree PVC Industries', 'vendor', 'orders@shreepvc.example.com'),
  ('Deccan Fabricators', 'customer', 'purchase@deccanfab.example.com'),
  ('Vishwa Engineering Works', 'customer', 'stores@vishwaengg.example.com');

insert into products (sku, name, category_id, uom, unit_cost, reorder_level, reorder_qty) values
  ('ST-RD-001', 'Steel Rod 12mm', '11111111-1111-1111-1111-111111111101', 'kg', 82.00, 200, 500),
  ('ST-RD-002', 'Steel Rod 16mm', '11111111-1111-1111-1111-111111111101', 'kg', 88.50, 200, 500),
  ('AL-SH-003', 'Aluminium Sheet 4x8 ft', '11111111-1111-1111-1111-111111111104', 'sheet', 3400.00, 15, 30),
  ('MS-SH-004', 'MS Sheet 2mm', '11111111-1111-1111-1111-111111111104', 'sheet', 2150.00, 20, 40),
  ('PVC-2-001', 'PVC Pipe 2 inch', '11111111-1111-1111-1111-111111111103', 'unit', 265.00, 50, 150),
  ('PVC-4-002', 'PVC Pipe 4 inch', '11111111-1111-1111-1111-111111111103', 'unit', 520.00, 30, 100),
  ('BRG-6204', 'Industrial Bearing 6204', '11111111-1111-1111-1111-111111111102', 'unit', 145.00, 40, 100),
  ('BRG-6304', 'Industrial Bearing 6304', '11111111-1111-1111-1111-111111111102', 'unit', 210.00, 30, 80),
  ('BLT-M12-01', 'Hex Bolt M12x50', '11111111-1111-1111-1111-111111111102', 'box', 620.00, 10, 25),
  ('NUT-M12-01', 'Hex Nut M12', '11111111-1111-1111-1111-111111111102', 'box', 380.00, 10, 25);
