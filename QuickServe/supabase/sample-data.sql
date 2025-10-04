-- Sample data for QuickServe Supabase tables
-- Run this in your Supabase SQL editor after creating the tables

-- Insert sample services
INSERT INTO public.services (category, title, description, price, duration, duration_text, status, rating, reviews, verified, available) VALUES
('Plumbing & Electrical', 'Plumbing Repair', 'Professional plumbing services for pipes, leaks, and fixture repairs', 500, '2-4 hours', '2-4 hours', 'approved', 4.8, 25, true, true),
('Plumbing & Electrical', 'Electrical Work', 'Electrical installation, repair, and maintenance services', 300, '1-3 hours', '1-3 hours', 'approved', 4.2, 18, true, true),
('Home Improvement', 'Carpentry', 'Professional carpentry and woodworking services', 400, '3-5 hours', '3-5 hours', 'approved', 4.7, 32, true, true),
('Home Improvement', 'Painting', 'Interior and exterior painting services', 600, '4-8 hours', '4-8 hours', 'approved', 4.5, 41, true, true),
('Cleaning', 'Home Cleaning', 'Complete home cleaning and sanitization services', 200, '2-3 hours', '2-3 hours', 'approved', 4.3, 67, true, true),
('Cleaning', 'Deep Cleaning', 'Thorough deep cleaning for homes and offices', 350, '4-6 hours', '4-6 hours', 'approved', 4.6, 29, true, true);

-- Insert sample users (you would typically create these through the auth system)
INSERT INTO public.users (auth_id, email, phone, name, role, status, verified) VALUES
('demo-provider-1', 'provider1@demo.com', '+919876543210', 'Raj Kumar', 'provider', 'active', true),
('demo-customer-1', 'customer1@demo.com', '+919876543211', 'Priya Sharma', 'customer', 'active', true);