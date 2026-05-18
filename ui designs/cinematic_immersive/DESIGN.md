---
name: Cinematic Immersive
colors:
  surface: '#131313'
  surface-dim: '#131313'
  surface-bright: '#393939'
  surface-container-lowest: '#0e0e0e'
  surface-container-low: '#1c1b1b'
  surface-container: '#201f1f'
  surface-container-high: '#2a2a2a'
  surface-container-highest: '#353534'
  on-surface: '#e5e2e1'
  on-surface-variant: '#e9bcb6'
  inverse-surface: '#e5e2e1'
  inverse-on-surface: '#313030'
  outline: '#af8782'
  outline-variant: '#5e3f3b'
  surface-tint: '#ffb4aa'
  primary: '#ffb4aa'
  on-primary: '#690003'
  primary-container: '#e50914'
  on-primary-container: '#fff7f6'
  inverse-primary: '#c0000c'
  secondary: '#c6c6c7'
  on-secondary: '#2f3131'
  secondary-container: '#454747'
  on-secondary-container: '#b4b5b5'
  tertiary: '#a7c8ff'
  on-tertiary: '#003061'
  tertiary-container: '#0072d7'
  on-tertiary-container: '#f8f9ff'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#ffdad5'
  primary-fixed-dim: '#ffb4aa'
  on-primary-fixed: '#410001'
  on-primary-fixed-variant: '#930007'
  secondary-fixed: '#e2e2e2'
  secondary-fixed-dim: '#c6c6c7'
  on-secondary-fixed: '#1a1c1c'
  on-secondary-fixed-variant: '#454747'
  tertiary-fixed: '#d5e3ff'
  tertiary-fixed-dim: '#a7c8ff'
  on-tertiary-fixed: '#001b3c'
  on-tertiary-fixed-variant: '#004689'
  background: '#131313'
  on-background: '#e5e2e1'
  surface-variant: '#353534'
typography:
  display-lg:
    fontFamily: Bebas Neue
    fontSize: 96px
    fontWeight: '400'
    lineHeight: 96px
    letterSpacing: 0.02em
  display-lg-mobile:
    fontFamily: Bebas Neue
    fontSize: 64px
    fontWeight: '400'
    lineHeight: 64px
  headline-lg:
    fontFamily: Bebas Neue
    fontSize: 48px
    fontWeight: '400'
    lineHeight: 48px
    letterSpacing: 0.03em
  headline-lg-mobile:
    fontFamily: Bebas Neue
    fontSize: 32px
    fontWeight: '400'
    lineHeight: 36px
  title-md:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '700'
    lineHeight: 16px
    letterSpacing: 0.05em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  unit: 8px
  gutter-desktop: 24px
  margin-desktop: 60px
  gutter-mobile: 12px
  margin-mobile: 16px
  row-gap: 48px
---

## Brand & Style
The design system is engineered to deliver a high-energy, premium cinematic experience. It prioritizes content above all else, utilizing a "lights-out" philosophy where the interface recedes into the background to let imagery and motion lead. 

The aesthetic blends **Minimalism** with **Glassmorphism**. Deep black canvases provide a high-contrast foundation, while translucent, frosted glass overlays are used for functional layers (like CRUD modals and menus) to maintain a sense of spatial depth without breaking the immersion. The emotional response is one of excitement and exclusivity, mimicking the feeling of a modern high-end theater.

## Colors
The palette is dominated by **Pitch Black (#000000)** for primary backgrounds to achieve perfect black levels on OLED screens. **Surface Gray (#141414)** is used for secondary containers and cards to create subtle separation. 

**Cinematic Red (#E50914)** is the sole brand signifier, reserved strictly for primary actions, progress bars, and critical brand touchpoints. Typography and icons primarily utilize **White (#FFFFFF)** and high-transparency whites to ensure maximum legibility against the dark void.

## Typography
The typography strategy employs a high-contrast pairing. **Bebas Neue** is used for impactful display headings and titles; its condensed, tall letterforms evoke classic movie posters and provide an authoritative, high-energy voice.

**Inter** handles all functional UI elements, body copy, and metadata. It was chosen for its exceptional legibility at small sizes and its neutral, systematic character which balances the expressive nature of the display face. Large display sizes must be scaled down aggressively for mobile viewports to maintain the composition's hierarchy.

## Layout & Spacing
The layout follows a **Fluid Grid** model designed for horizontal browsing. Content is organized into "Rows" that bleed off the edge of the screen, encouraging discovery through scrolling. 

- **Desktop:** 12-column system for static pages, but primarily relies on a flexible flex-row for movie carousels with a 60px outer margin.
- **Mobile:** 4-column system with reduced margins (16px) to maximize screen real estate for thumbnails.
- **Rhythm:** An 8px linear scale governs all padding and margins. Vertical spacing between content rows is generous (48px+) to prevent the high-contrast imagery from feeling cluttered.

## Elevation & Depth
Depth in this design system is achieved through a combination of **Tonal Layering** and **Glassmorphism**. 

1. **The Void (Base):** #000000.
2. **The Surface (Cards/Sections):** #141414 or subtle gradients.
3. **The Overlay (Modals/Popovers):** A "Glass" effect using a 20% white tint with a 20px backdrop-blur. These elements should have a 1px border of 15% white to define their edges against dark backgrounds.
4. **Active State:** Elements do not use traditional shadows; instead, they use a "Glow" effect or scale transform (1.05x) to indicate focus/hover, mimicking a projector's light.

## Shapes
The shape language is "Soft" (4px radius). This keeps the interface feeling modern and approachable without losing the precision and "edge" associated with professional cinematic equipment.

- **Thumbnails:** 4px border radius.
- **Buttons:** 4px border radius for standard actions; 2px for secondary metadata tags.
- **Inputs:** Square corners or very minimal (2px) rounding to maintain a sleek, technical appearance.

## Components
- **Cards:** High-contrast images with no visible borders in their default state. On hover, the card scales up, z-index increases, and a metadata "shelf" appears below or as an overlay.
- **Buttons:** 
  - *Primary:* Solid Red (#E50914) with White text. Bold Inter.
  - *Secondary:* Semi-transparent "Glass" with a white border or solid White with Black text for "Play" actions.
- **Input Fields:** Sleek, bottom-border only or dark-filled (#141414) with no glow. Focus state transitions the border to Primary Red.
- **CRUD Modals:** Full-screen or large centered overlays using the glassmorphism spec. Close buttons are oversized for accessibility on TV/Remote interfaces.
- **Hero Section:** Full-bleed background imagery with a bottom-to-top black gradient fade to ensure text legibility.
- **Progress Bars:** Extremely thin (2px-4px) using Cinematic Red for the "filled" state and #333333 for the "unfilled" track.