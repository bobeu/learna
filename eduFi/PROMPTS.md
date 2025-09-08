# Learna Programmatic Image Generation Prompts

Use this prompt template programmatically to generate campaign images matching Learna’s style.

Parameters:
- {campaign_title}: string
- {theme_mode}: "dark" | "light"
- {primary_hex}: primary accent color (e.g., #8BEA00)
- {secondary_hex}: secondary accent color (e.g., #7C3AED)
- {text_font}: e.g., "Inter" for light mode, "JetBrains Mono" for dark mode
- {aspect_ratio}: e.g., "1:1" or "1200x1200"
- {watermark_text}: default "Learna"

Prompt:
Create a high‑resolution 3D isometric illustration of a friendly social network icon that represents the campaign. Keep it clean, modern, and minimalist. Use a bright, tasteful blend of the project colors — primary {primary_hex} and secondary {secondary_hex} — and ensure excellent contrast for {theme_mode} mode.

Composition requirements:
- Prominently display the campaign title: "{campaign_title}" as a banner/text element in the scene. Use the font {text_font} (or closest match). Text must be crisp and legible on both mobile and desktop.
- Background and foreground should follow Learna’s theme. In {theme_mode} mode, ensure sufficient contrast and readability. Avoid harsh gradients.
- Central 3D isometric icon with smooth, rounded geometry and clear, soft shadows. Thin neon highlights with {primary_hex} accents.
- Include a subtle, fading watermark "{watermark_text}" centered or softly embedded in the background. Very low opacity, non‑distracting.
- Clean lines, refined edges, and gentle depth of field. No clutter. Balanced negative space.
- Output as a square ({aspect_ratio}) or a size that fits a campaign card (safe for responsive use).

Quality & constraints:
- High resolution, sharp edges, and smooth gradients.
- Minimal noise or artifacts; web‑ready and accessible color contrast.
- Deliver PNG or WEBP with transparent or softly‑tinted background.

One‑sentence style guide:
“Dark‑first, neon‑accented, isometric, developer‑friendly, minimal UI aesthetic.”

Optional negative prompts:
- Avoid text warping, over‑glow, heavy grain, harsh shadows, or busy backgrounds.

Example values:
- {theme_mode}: dark
- {primary_hex}: #8BEA00
- {secondary_hex}: #7C3AED
- {aspect_ratio}: 1200x1200
- {text_font}: JetBrains Mono
- {watermark_text}: Learna
