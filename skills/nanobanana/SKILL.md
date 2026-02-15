---
name: nanobanana
description: Generate and edit images using Google Gemini 3 Pro Image (Nano Banana Pro). Supports text-to-image, image editing, various aspect ratios, and high-resolution output (2K/4K). Use when user wants to generate images, create images, use Gemini image generation, or do AI image generation.
---

# Nano Banana - AI Image Generation

Generate and edit images using Google's Gemini 3 Pro Image model (`gemini-3-pro-image-preview`, nicknamed "Nano Banana Pro" 🍌).

## Prerequisites

**Required:**
- `GEMINI_API_KEY` - Get from [Google AI Studio](https://aistudio.google.com/apikey)
- Python 3.10+ with `google-genai` package

**Install dependencies:**
```bash
pip install google-genai pillow
```

## Quick Start

### Generate an image:
```bash
python3 <skill_dir>/scripts/generate.py "a cute robot mascot, pixel art style" -o robot.png
```

### Edit an existing image:
```bash
python3 <skill_dir>/scripts/generate.py "make the background blue" -i input.jpg -o output.png
```

### Generate with specific aspect ratio:
```bash
python3 <skill_dir>/scripts/generate.py "cinematic landscape" --ratio 21:9 -o landscape.png
```

### Generate high-resolution 4K image:
```bash
python3 <skill_dir>/scripts/generate.py "professional product photo" --size 4K -o product.png
```

## Script Reference

### `scripts/generate.py`

Main image generation script.

```
Usage: generate.py [OPTIONS] PROMPT

Arguments:
  PROMPT              Text prompt for image generation

Options:
  -o, --output PATH   Output file path (default: auto-generated)
  -i, --input PATH    Input image for editing (optional)
  -r, --ratio RATIO   Aspect ratio (1:1, 16:9, 9:16, 21:9, etc.)
  -s, --size SIZE     Image size: 2K or 4K (default: standard)
  --search            Enable Google Search grounding for accuracy
  -v, --verbose       Show detailed output
```

**Supported aspect ratios:**
- `1:1` - Square (default)
- `2:3`, `3:2` - Portrait/Landscape
- `3:4`, `4:3` - Standard
- `4:5`, `5:4` - Photo
- `9:16`, `16:9` - Widescreen
- `21:9` - Ultra-wide/Cinematic

### `scripts/batch_generate.py`

Generate multiple images with sequential naming.

```
Usage: batch_generate.py [OPTIONS] PROMPT

Arguments:
  PROMPT              Text prompt for image generation

Options:
  -n, --count N       Number of images to generate (default: 10)
  -d, --dir PATH      Output directory
  -p, --prefix STR    Filename prefix (default: "image")
  -r, --ratio RATIO   Aspect ratio
  -s, --size SIZE     Image size (2K/4K)
  --delay SECONDS     Delay between generations (default: 3)
```

**Example:**
```bash
python3 <skill_dir>/scripts/batch_generate.py "pixel art logo" -n 20 -d ./logos -p logo
```

## Python API

You can also use the module directly:

```python
from generate import generate_image, edit_image

# Generate image
result = generate_image(
    prompt="a futuristic city at night",
    output_path="city.png",
    aspect_ratio="16:9",
    image_size="4K"
)

# Edit existing image
result = edit_image(
    prompt="add flying cars to the sky",
    input_path="city.png",
    output_path="city_edited.png"
)
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `GEMINI_API_KEY` | Google Gemini API key | Required |
| `IMAGE_OUTPUT_DIR` | Default output directory | `./nanobanana-images` |

## Features

### Text-to-Image Generation
Create images from text descriptions. The model excels at:
- Photorealistic images
- Artistic styles (pixel art, illustration, etc.)
- Product photography
- Landscapes and scenes

### Image Editing
Transform existing images with natural language:
- Style transfer
- Object addition/removal
- Background changes
- Color adjustments

### High-Resolution Output
- **Standard**: Fast generation, good quality
- **2K**: Enhanced detail (2048px)
- **4K**: Maximum quality (3840px), best for text rendering

### Google Search Grounding
Enable `--search` for factually accurate images involving:
- Real people, places, landmarks
- Current events
- Specific products or brands

## Best Practices

### Prompt Writing

**Good prompts include:**
- Subject description
- Style/aesthetic
- Lighting and mood
- Composition details
- Color palette

**Example:**
```
"A cozy coffee shop interior, warm lighting, vintage aesthetic, 
wooden furniture, plants on shelves, morning sunlight through windows, 
soft focus background, 35mm film photography style"
```

### Batch Generation Tips

1. Generate 10-20 variations to explore options
2. Use consistent prompts for style coherence
3. Add 3-5 second delays to avoid rate limits
4. Review results and iterate on best candidates

## Rate Limits

- Gemini API has usage quotas
- Add delays between batch generations
- Check your quota at [Google AI Studio](https://aistudio.google.com/)

## Troubleshooting

**"API key not found"**
- Set `GEMINI_API_KEY` environment variable
- Or pass via `--api-key` option

**"No image in response"**
- Prompt may have triggered safety filters
- Try rephrasing to avoid sensitive content

**"Rate limit exceeded"**
- Wait a few seconds and retry
- Reduce batch size or add longer delays

## References

- [references/prompts.md](./references/prompts.md) - Prompt examples by category
- [examples/](./examples/) - Example usage scripts
