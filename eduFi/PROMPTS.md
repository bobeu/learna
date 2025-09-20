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

---

Conversation Prompts Log
------------------------

1) Improve Hero text colors for better contrast in dark/light; do not alter project settings; then update PROJECT_REBUILD_DOCUMENTATION.md with status and changes.

2) Connect campaigns UI to on-chain data using types in /types/index.ts and wagmi fetch in /components/LearnaApp.tsx; use mock campaigns only if required; extend UI for additional fields; create creator (protocol owner/manager) profile with ability to edit campaign metadata (link, imageURI, etc.), filter by connected address; display creator campaigns clickable/dynamic; apply similar for builders to show subscribed campaigns.

3) Fix next/image error due to hex-encoded image URLs (0x...); decode on read (hexToString) and normalize ipfs:// to https gateway; ensure human-readable strings.

4) For the code present, let fix a few thing. Following the project's theme, color and configuration: 1. Fix the issues in src/components/modals/LearnerProfileModal.tsx on line 78. As an additional information to help you fix it, the links attribute in ProofOfIntegration type is an array. Ensure you convert it to a list so that builders can see the different links they have submitted. 2. On the builder's profile, create a call-to-action that triggers proof of integration submission form. Using the existing TransactionModal component, extract the form data and wire it up to submit a transaction to the blockchain. The transaction will invoke the 'submitProofOfIntegration' function on the smart contract with one argument. The argument is a fixed array of string of length three. This mean that builders cannot submit more than three links. 3. Update the campaign owners profile to include a section where they can see all the builders with their link submission. Using the exported interface 'ApproveIntegrationParams' from the /types/index.ts, create a section where the owner can approve the submitted links. 4. The existing 'claimReward' system in the builders profile has changed. Now, builders need to claim reward for proof of integraton and proof of assimilation separately via designated functions 'claimRewardForPOINT' and 'claimRewardForPOASS' respectively on the smart contract. Both function accepts 2 similar arguments as follows: (a). fundIndex of type uint8, (b). epoch of type bigint. Builders. Be sure to map the funds in the epochData to a dropdown, so that the user can select which fund they wish to withdraw from. Then extract the fund index. Extract the epoch from the right source. Do the same for the 'epoch' argument. 5. Since the last edit, the ProofOfIntegration data type has changed on the smart contract. Scrutinize the project for any file that consume the data type and fix any breaking changes. 6. Revisit the LearnerProfileModal and fix any issues you may find. Ensure that it uses the latest data types from the /types/index.ts. Avoid typed variables in mapping. Remove any unused variables from the projects. 7. Lastly, scritinize the project for any files not in the program, and remove them. Be sure the project works without breaking any functionality. 8. Update the PROMPTS.md with the prompts I sent to you. 9. Update the PROGRESS.md using the format in the file. Avoid back-dating or using random date. Use the current date. 10. Run the 'yarn run build' command if you can, and update any missing dependencies in the react hooks.