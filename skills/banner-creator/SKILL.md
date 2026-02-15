---
name: banner-creator
description: Create banners using AI image generation. Discuss format/style, generate variations, iterate with user feedback, crop to target ratio. Use when user wants to create a banner, header, hero image, cover image, GitHub banner, Twitter header, or readme banner.
---

# Banner Creator Skill

Create professional banners through AI image generation with an iterative design process.

## Prerequisites

**Required API Keys (set in environment):**
- `GEMINI_API_KEY` - Get from [Google AI Studio](https://aistudio.google.com/apikey)

**Required Skills:**
- `nanobanana` - AI image generation (Gemini 3 Pro Image)



## File Output Location

All generated files should be saved to the `.skill-archive` directory:

```
.skill-archive/banner-creator/<yyyy-mm-dd-summaryname>/
```

**Example:**
```
.skill-archive/banner-creator/2026-01-19-opc-banner/
  banner-01.png
  banner-02.png
  ...
  banner-03-cropped.png
  preview.html
```

## Workflow

### Step 1: Discovery & Requirements

Before generating, gather requirements from user:

**Ask about:**
1. **Purpose** - Where will the banner be used?
   - GitHub README
   - Twitter/X header
   - LinkedIn banner
   - Website hero
   - YouTube channel art

2. **Target ratio/size** - See [references/formats.md](./references/formats.md):
   - `2:1` (1280x640) - GitHub README
   - `3:1` (1500x500) - Twitter header
   - `16:9` (1920x1080) - Website hero

3. **Style preference**:
   - Match existing logo/brand?
   - Pixel art / 8-bit retro
   - Minimalist / flat design
   - Gradient / modern
   - Illustrated / artistic

4. **Content elements**:
   - Brand name / project name?
   - Tagline / slogan?
   - Logo character to include?

5. **Color preferences**:
   - Existing brand colors?
   - Let AI decide?

**Wait for user confirmation before proceeding!**

### Step 2: Generate Banner Variations

Generate 20 banner variations using the `nanobanana` skill:

```bash
# Generate single banner
python3 <nanobanana_skill_dir>/scripts/generate.py "{style} banner for {brand}, {description}, {text elements}" \
  --ratio 21:9 -o .skill-archive/banner-creator/<date-name>/banner-01.png

# Batch generate 20 banners
python3 <nanobanana_skill_dir>/scripts/batch_generate.py "{style} banner for {brand}, {description}, {text elements}" \
  -n 20 --ratio 21:9 -d .skill-archive/banner-creator/<date-name> -p banner
```

**Guidelines:**
- Generate at `21:9` ratio (widest available), crop later to target
- Use batch_generate.py for multiple variations (includes auto-delay)
- Use sequential naming: `banner-01.png`, `banner-02.png`, etc.

**Image Editing (for incorporating existing logo):**
```bash
python3 <nanobanana_skill_dir>/scripts/generate.py "add {logo character} to the left side of the banner" \
  -i /path/to/existing-logo.png --ratio 21:9 -o banner-with-logo.png
```

### Step 3: Create HTML Preview

Copy the preview template and open in browser:

```bash
cp <skill_dir>/templates/preview.html .skill-archive/banner-creator/<yyyy-mm-dd-summaryname>/preview.html
```

Then open in default browser:

```bash
open .skill-archive/banner-creator/<yyyy-mm-dd-summaryname>/preview.html
```

**IMPORTANT:** Update the HTML to include the correct number of banners generated.

### Step 4: Iterate with User

Ask user which banners they prefer:
- "Which banners do you like? (e.g., #3, #7, #15)"
- "What do you like about them?"
- "Any changes you'd want?"

Based on feedback:
1. Generate 10-20 more variations of favorite styles
2. Use naming: `banner-{original}-v{n}.png` (e.g., `banner-03-v1.png`)
3. Update HTML preview
4. Repeat until user selects final banner

### Step 5: Crop to Target Ratio

Once user approves a banner, crop to target size:

```bash
python3 <skill_dir>/scripts/crop_banner.py {input.png} {output.png} --ratio 2:1 --width 1280
```

**Common targets:**
- GitHub README: `--ratio 2:1 --width 1280` → 1280x640
- Twitter header: `--ratio 3:1 --width 1500` → 1500x500
- Website hero: `--ratio 16:9 --width 1920` → 1920x1080

### Step 6: Deliver Final Assets

Present final deliverables:

```
## Final Banner Assets

| File | Description | Size |
|------|-------------|------|
| banner-03.png | Original (21:9) | 2016x864 |
| banner-03-cropped.png | GitHub README (2:1) | 1280x640 |

All files saved to: `.skill-archive/banner-creator/<yyyy-mm-dd-summaryname>/`
Copy final banner to user's desired location.
```

## Quick Reference

### Common Prompt Patterns

**With Text:**
```
Wide banner for {brand}, {style} style, featuring "{text}" prominently displayed, {colors}, {scene/elements}
```

**With Character:**
```
Wide banner featuring {character description}, {style} style, {scene}, text "{brand name}" on {position}, {colors}
```

**Abstract/Gradient:**
```
Abstract {style} banner, {colors} gradient, geometric patterns, modern tech feel, text "{brand}" centered
```

**Scene-based:**
```
{Style} illustration banner, {scene description}, {character} in {action}, "{brand}" text overlay, {colors}
```

### Supported Aspect Ratios

Generate at widest ratio, then crop:
- `21:9` - Ultra-wide (recommended for generation)
- `16:9` - Wide
- `3:2` - Standard wide

## References

- [references/formats.md](./references/formats.md) - Common banner sizes by platform
- [examples/opc-banner-creation.md](./examples/opc-banner-creation.md) - Full example conversation
