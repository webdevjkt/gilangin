-- ===================================================
-- SQL SCHEMA FOR SERVISKU APP IN SUPABASE
-- Run this script in your Supabase SQL Editor
-- ===================================================

-- 1. Create Jobs Table
CREATE TABLE IF NOT EXISTS public.jobs (
    id TEXT PRIMARY KEY,
    service TEXT NOT NULL,
    customer TEXT NOT NULL,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    time TEXT NOT NULL DEFAULT '09:00',
    address TEXT NOT NULL,
    radius NUMERIC DEFAULT 5,
    notes TEXT,
    status TEXT NOT NULL DEFAULT 'menunggu',
    worker TEXT,
    vendor_id TEXT,
    vendor_name TEXT,
    created_at BIGINT NOT NULL DEFAULT (EXTRACT(EPOCH FROM NOW()) * 1000)::BIGINT,
    accepted_at BIGINT,
    started_at BIGINT,
    completed_at BIGINT
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;

-- Allow public read & write (adjust policy for production auth as needed)
CREATE POLICY "Allow public read jobs" ON public.jobs FOR SELECT USING (true);
CREATE POLICY "Allow public insert jobs" ON public.jobs FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update jobs" ON public.jobs FOR UPDATE USING (true);
CREATE POLICY "Allow public delete jobs" ON public.jobs FOR DELETE USING (true);

-- Enable Realtime for jobs table
ALTER PUBLICATION supabase_realtime ADD TABLE public.jobs;

-- 2. Create Vendors Table (Optional)
CREATE TABLE IF NOT EXISTS public.vendors (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    tagline TEXT,
    category TEXT NOT NULL,
    location TEXT NOT NULL,
    address TEXT,
    rating NUMERIC DEFAULT 5.0,
    review_count INT DEFAULT 0,
    starting_price NUMERIC DEFAULT 50000,
    verified BOOLEAN DEFAULT true,
    experience_years INT DEFAULT 3,
    operating_hours TEXT,
    description TEXT,
    services_offered JSONB DEFAULT '[]'::jsonb,
    badges JSONB DEFAULT '[]'::jsonb
);

ALTER TABLE public.vendors ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read vendors" ON public.vendors FOR SELECT USING (true);

-- Insert initial demo jobs if empty
INSERT INTO public.jobs (id, service, customer, date, time, address, radius, notes, status, worker, created_at)
VALUES 
('JOB-001', 'kebersihan', 'Ibu Rina', CURRENT_DATE, '09:00', 'Jl. Melati No. 12, Jakarta Selatan', 5, 'Rumah 2 lantai', 'menunggu', NULL, (EXTRACT(EPOCH FROM NOW()) * 1000)::BIGINT - 60000),
('JOB-002', 'listrik', 'Pak Joko', CURRENT_DATE, '13:30', 'Jl. Kenanga No. 4, Jakarta Timur', 10, 'Ganti stop kontak', 'diterima', 'Andi R.', (EXTRACT(EPOCH FROM NOW()) * 1000)::BIGINT - 30000),
('JOB-003', 'perbaikan', 'Bpk. Hendra', CURRENT_DATE - 1, '10:00', 'Jl. Mawar No. 7, Jakarta Pusat', 8, 'Bocor pipa dapur', 'selesai', 'Budi S.', (EXTRACT(EPOCH FROM NOW()) * 1000)::BIGINT - 90000000)
ON CONFLICT (id) DO NOTHING;
