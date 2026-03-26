-- Migration: Add guest contact and professional fields
-- Created: 2026-03-26

ALTER TABLE guests ADD COLUMN IF NOT EXISTS title TEXT;
ALTER TABLE guests ADD COLUMN IF NOT EXISTS organisation TEXT;
ALTER TABLE guests ADD COLUMN IF NOT EXISTS social_handle TEXT;
ALTER TABLE guests ADD COLUMN IF NOT EXISTS website TEXT;
ALTER TABLE guests ADD COLUMN IF NOT EXISTS expertise TEXT;
