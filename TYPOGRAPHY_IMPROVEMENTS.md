# 📝 Typography Readability Improvements

## Issues Identified

1. **Extremely Small Text**: 8-10px is below WCAG minimum (16px recommended)
2. **Low Contrast**: Opacity 40-60% makes text hard to read
3. **Inconsistent Sizing**: No clear typography scale
4. **Body Text Too Small**: Product descriptions at 14px (text-sm) are hard to read

## Typography Scale (Recommended)

### Headings
- **H1 (Hero)**: `text-5xl md:text-8xl` (48px / 96px) ✅ Good
- **H1 (Page)**: `text-4xl md:text-6xl` (36px / 60px) ✅ Good
- **H2**: `text-3xl md:text-4xl` (30px / 36px)
- **H3**: `text-2xl md:text-3xl` (24px / 30px)

### Body Text
- **Large Body**: `text-lg md:text-xl` (18px / 20px) - For hero descriptions
- **Body**: `text-base md:text-lg` (16px / 18px) - For product descriptions
- **Small Body**: `text-sm md:text-base` (14px / 16px) - For secondary text

### Metadata/Labels
- **Label (Large)**: `text-xs md:text-sm` (12px / 14px) - For important labels
- **Label (Small)**: `text-[11px] md:text-xs` (11px / 12px) - For metadata
- **Micro**: `text-[10px]` (10px) - Only for very small UI elements

### Buttons
- **Primary**: `text-sm md:text-base` (14px / 16px)
- **Secondary**: `text-xs md:text-sm` (12px / 14px)

## Opacity Guidelines

- **Primary Text**: `opacity-100` (no opacity) or `opacity-90` minimum
- **Secondary Text**: `opacity-80` minimum (not 60%)
- **Tertiary Text**: `opacity-70` minimum (not 40%)
- **Disabled/Hints**: `opacity-50` (only for non-critical info)

## Implementation Plan

### Priority 1: Product Detail Page
- Increase product description from `text-sm` to `text-base md:text-lg`
- Increase metadata labels from `text-[9px]` to `text-xs md:text-sm`
- Increase button text from `text-[10px]` to `text-sm md:text-base`
- Remove or increase opacity on important text

### Priority 2: Atlas Collection Page
- Increase territory buttons text size
- Improve hero description readability
- Increase product card text sizes

### Priority 3: Global Improvements
- Update all `text-[8px]` to `text-[11px]` minimum
- Update all `text-[9px]` to `text-xs`
- Update all `text-[10px]` to `text-xs md:text-sm`
- Increase opacity on all text to minimum 70%

## WCAG Compliance

- **Minimum Body Text**: 16px (1rem) for readability
- **Minimum Contrast**: 4.5:1 for normal text, 3:1 for large text
- **Line Height**: 1.5 minimum for body text
