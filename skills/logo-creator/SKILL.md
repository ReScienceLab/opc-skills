---
name: logo-creator
description: Create logos using AI image generation. Discuss style/ratio, generate variations, iterate with user feedback, crop, remove background, and export as SVG. Use when user wants to create a logo, icon, favicon, brand mark, mascot, emblem, or design a logo.
---

# Logo Creator Skill

Create professional logos through AI image generation with an iterative design process.

## Prerequisites

**Required API Keys (set in environment):**
- `GEMINI_API_KEY` - Get from [Google AI Studio](https://aistudio.google.com/apikey)
- `REMOVE_BG_API_KEY` - Get from [remove.bg](https://www.remove.bg/api)
- `RECRAFT_API_KEY` - Get from [recraft.ai](https://www.recraft.ai/)

**Required Skills:**
- `nanobanana` - AI image generation (Gemini 3 Pro Image)



## File Output Location

All generated files should be saved to the `.skill-archive` directory:

```
.skill-archive/logo-creator/<yyyy-mm-dd-summaryname>/
```

**Example:**
```
.skill-archive/logo-creator/2026-01-18-opc-logo/
  logo-01.png
  logo-02.png
  ...
  logo-09-cropped.png
  logo-09-nobg.png
  logo-09.svg
  preview.html
```

**Guidelines:**
- Use current date in format `yyyy-mm-dd`
- Add short summary name (project/brand name, kebab-case)
- Create directory before generating first logo
- Keep all variations and iterations in same folder
- Final approved logo should be copied to user's desired location

## Workflow

### Step 1: Discovery & Requirements

Before generating, gather requirements from user:

**Ask about:**
1. **Project/Brand name** - What is the logo for?
2. **Style preference** - See [references/styles.md](./references/styles.md) for options:
   - Pixel art / 8-bit retro
   - Minimalist / flat design
   - 3D / isometric
   - Hand-drawn / sketch
   - Mascot / character
   - Monogram / lettermark
   - Abstract / geometric

3. **Aspect ratio** - Default is 1:1 (square), options:
   - `1:1` - Square (favicons, app icons)
   - `16:9` - Wide (headers, banners)
   - `4:3` - Standard
   - `2:3` - Portrait

4. **Color preferences**:
   - Monochrome (black & white)
   - Specific brand colors
   - Let AI decide

5. **Reference images** - Any existing logos or styles to reference?

**Wait for user confirmation before proceeding!**

### Step 2: Generate Logo Variations

Generate 20 logo variations (default) using the `nanobanana` skill:

```bash
# Generate single logo
python3 <nanobanana_skill_dir>/scripts/generate.py "{style} logo for {brand}, {description}, {colors}" \
  --ratio 1:1 -o .skill-archive/logo-creator/<date-name>/logo-01.png

# Batch generate 20 logos
python3 <nanobanana_skill_dir>/scripts/batch_generate.py "{style} logo for {brand}, {description}, {colors}" \
  -n 20 --ratio 1:1 -d .skill-archive/logo-creator/<date-name> -p logo
```

**Guidelines:**
- Use batch_generate.py for multiple variations (includes auto-delay)
- Save to `.skill-archive/logo-creator/<yyyy-mm-dd-summaryname>/` directory
- Use sequential naming: `logo-01.png`, `logo-02.png`, etc.

**Prompt Tips:**
- Include style keywords: "pixel art", "minimalist", "8-bit", "flat design"
- Specify colors: "black on white", "monochrome", "blue gradient"
- Add context: "tech startup", "food brand", "gaming company"
- Request format: "icon", "emblem", "mascot", "lettermark"

### Step 3: Create HTML Preview

Copy the preview template and open in browser:

```bash
cp <skill_dir>/templates/preview.html .skill-archive/logo-creator/<yyyy-mm-dd-summaryname>/preview.html
```

Then open in default browser:

```bash
open .skill-archive/logo-creator/<yyyy-mm-dd-summaryname>/preview.html
```

**IMPORTANT:** Update the HTML to include the correct number of logos generated.

### Step 4: Iterate with User

Ask user which logos they prefer:
- "Which logos do you like? (e.g., #5, #12, #18)"
- "What do you like about them?"
- "Any changes you'd want?"

Based on feedback:
1. Generate 10-20 more variations of favorite styles
2. Use naming: `logo-{original}-v{n}.png` (e.g., `logo-05-v1.png`)
3. Update HTML preview
4. Repeat until user selects final logo

### Step 5: Finalize Logo

Once user approves a logo, process it:

**5a. Crop whitespace (make 1:1 with no margins):**
```bash
python3 <skill_dir>/scripts/crop_logo.py {input.png} {output-cropped.png}
```

**5b. Remove background:**
```bash
python3 <skill_dir>/scripts/remove_bg.py {input.png} {output-nobg.png}
```

**5c. Convert to SVG:**
```bash
python3 <skill_dir>/scripts/vectorize.py {input.png} {output.svg}
```

### Step 6: Deliver Final Assets

Present final deliverables:

```
## Final Logo Assets

| File | Description | Size |
|------|-------------|------|
| logo.png | Original | 1024x1024 |
| logo-cropped.png | No margins, 1:1 | ~800x800 |
| logo-nobg.png | Transparent background | ~800x800 |
| logo.svg | Vector (scalable) | ~20KB |

All files saved to: `.skill-archive/logo-creator/<yyyy-mm-dd-summaryname>/`
Copy final logo to user's desired location.
```

## Quick Reference

### Common Prompt Patterns

**Pixel Art:**
```
Pixel art {subject} logo, 8-bit retro style, black pixels on white background, {size}x{size} grid, minimalist icon
```

**Minimalist:**
```
Minimalist {subject} logo, flat design, clean lines, {color} on white, simple geometric shapes
```

**Mascot:**
```
Cute {animal/character} mascot logo, friendly expression, {style} style, {colors}, suitable for brand icon
```

**Lettermark:**
```
Letter "{letter}" logo, modern typography, {style} design, {colors}, clean professional look
```

### Supported Aspect Ratios

- `1:1` - Square (default for logos)
- `2:3`, `3:2` - Portrait/Landscape
- `3:4`, `4:3` - Standard
- `4:5`, `5:4` - Photo
- `9:16`, `16:9` - Wide
- `21:9` - Ultra-wide

## References

- [references/styles.md](./references/styles.md) - Logo style guide with prompt examples
- [examples/opc-logo-creation.md](./examples/opc-logo-creation.md) - Full example conversation
