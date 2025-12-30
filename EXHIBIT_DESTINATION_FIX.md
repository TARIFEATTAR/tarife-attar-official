# Exhibit "Choose Destination" Issue - Fix

## Problem
When creating an Exhibit document in Sanity Studio, you see:
> "Cannot create a published document. Choose a destination for this document: Published"

## Root Cause
This happens when Sanity's **Releases** feature is enabled at the project level. Releases require documents to be assigned to a specific release before publishing.

## Solutions

### Solution 1: Create as Draft First (Quick Fix)
1. Click the **"Draft"** button (gray dot) instead of "Published"
2. Fill in your Exhibit fields (Title, Slug, etc.)
3. Click **"Publish"** button after saving
4. This bypasses the destination requirement

### Solution 2: Use the Dropdown (If Available)
1. Click the dropdown next to "Published" 
2. Select "Published" from the dropdown
3. This should set the destination

### Solution 3: Disable Releases in Sanity Cloud (Recommended)
1. Go to [sanity.io/manage](https://sanity.io/manage)
2. Select your project
3. Go to **Settings** → **Releases**
4. Disable Releases if you don't need versioned publishing

### Solution 4: Schema Configuration (Already Applied)
I've updated the Exhibit schema to explicitly allow direct publishing without releases. This should help, but if Releases are enabled at the project level, you may still see the prompt.

## Why This Happens
- Sanity Releases is a feature for scheduled/versioned publishing
- It's useful for content teams that need to plan releases
- For simple publishing workflows, it can be disabled

## Current Status
✅ Schema updated to allow direct publishing
⚠️ If Releases are enabled in Sanity Cloud, you may still need to use Solution 1 or 3

## Recommendation
For most use cases, **disable Releases** in Sanity Cloud settings unless you specifically need versioned publishing workflows.
