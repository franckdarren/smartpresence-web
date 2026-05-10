-- Migration: Soft delete pour la table users
-- À exécuter manuellement sur Supabase SQL Editor

ALTER TABLE users ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP;
