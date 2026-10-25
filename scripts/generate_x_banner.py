import os
from PIL import Image, ImageDraw, ImageFont, ImageFilter

def create_banner():
    width = 1500
    height = 500
    
    # 1. Base Dark Background (#07090E) with subtle grid & glow
    banner = Image.new("RGBA", (width, height), (7, 9, 14, 255))
    draw = ImageDraw.Draw(banner)
    
    # Subtle ambient gradient glows
    # Cyan glow on top right
    glow_cyan = Image.new("RGBA", (width, height), (0, 0, 0, 0))
    glow_draw = ImageDraw.Draw(glow_cyan)
    glow_draw.ellipse([width - 500, -100, width + 200, 450], fill=(0, 240, 255, 35))
    # Emerald glow on bottom right
    glow_draw.ellipse([width - 350, 200, width + 100, 600], fill=(16, 185, 129, 30))
    glow_cyan = glow_cyan.filter(ImageFilter.GaussianBlur(80))
    banner = Image.alpha_composite(banner, glow_cyan)
    draw = ImageDraw.Draw(banner)
    
    # Draw subtle futuristic grid lines in background (right side)
    grid_color = (30, 41, 59, 40)
    for x in range(300, width, 60):
        draw.line([(x, 0), (x, height)], fill=grid_color, width=1)
    for y in range(0, height, 60):
        draw.line([(300, y), (width, y)], fill=grid_color, width=1)
        
    # Load and place official logo
    logo_path = os.path.join(os.path.dirname(__file__), "..", "assets", "official_logo.jpg")
    if os.path.exists(logo_path):
        logo_img = Image.open(logo_path).convert("RGBA")
        logo_size = 280
        logo_img = logo_img.resize((logo_size, logo_size), Image.Resampling.LANCZOS)
        # Create circular mask for smooth rounded look
        mask = Image.new("L", (logo_size, logo_size), 0)
        mask_draw = ImageDraw.Draw(mask)
        mask_draw.rounded_rectangle([0, 0, logo_size, logo_size], radius=35, fill=255)
        
        # Position logo slightly to the left/center
        logo_x = 380
        logo_y = (height - logo_size) // 2
        banner.paste(logo_img, (logo_x, logo_y), mask)
        
        # Draw sleek neon cyan border around logo
        draw.rounded_rectangle(
            [logo_x - 2, logo_y - 2, logo_x + logo_size + 2, logo_y + logo_size + 2],
            radius=36,
            outline=(0, 240, 255, 140),
            width=2
        )
    
    # Add High-End Text & Badges (Right Side)
    # We use default font or system sans-serif fonts
    try:
        font_title = ImageFont.truetype("arialbd.ttf", 52)
        font_sub = ImageFont.truetype("arial.ttf", 26)
        font_mono = ImageFont.truetype("consola.ttf", 20)
        font_badge = ImageFont.truetype("arialbd.ttf", 16)
    except:
        font_title = ImageFont.load_default()
        font_sub = ImageFont.load_default()
        font_mono = ImageFont.load_default()
        font_badge = ImageFont.load_default()
        
    text_x = 720
    
    # Category Pill
    pill_box = [text_x, 95, text_x + 360, 130]
    draw.rounded_rectangle(pill_box, radius=17, fill=(15, 23, 42, 220), outline=(0, 240, 255, 80), width=1)
    draw.text((text_x + 18, 103), "⚡ UNIVERSAL AI PROJECT BRIDGE", fill=(0, 240, 255, 255), font=font_badge)
    
    # Title
    draw.text((text_x, 150), "Write Rules Once.", fill=(255, 255, 255, 255), font=font_title)
    draw.text((text_x, 210), "Run Them Everywhere.", fill=(0, 240, 255, 255), font=font_title)
    
    # Subtitle
    draw.text((text_x, 280), "Cursor  •  Claude Code  •  ChatGPT  •  Gemini", fill=(148, 163, 184, 255), font=font_sub)
    
    # 3 Badges Box
    badges_y = 345
    badges = [
        ("✓ 98.5% AST Parity", (16, 185, 129, 255), (6, 78, 59, 140), (16, 185, 129, 90)),
        ("🔐 In-RAM 0 Logs", (56, 189, 248, 255), (12, 74, 110, 140), (56, 189, 248, 90)),
        ("$1.99 Single Pass", (244, 63, 94, 255), (136, 19, 55, 140), (244, 63, 94, 90)),
    ]
    
    curr_x = text_x
    for text, text_color, bg_color, border_color in badges:
        badge_w = len(text) * 11 + 24
        draw.rounded_rectangle([curr_x, badges_y, curr_x + badge_w, badges_y + 34], radius=8, fill=bg_color, outline=border_color, width=1)
        draw.text((curr_x + 12, badges_y + 8), text, fill=text_color, font=font_badge)
        curr_x += badge_w + 14
        
    # Terminal command preview at bottom right
    cmd_text = "$ npx promptshift --to=claude"
    draw.text((text_x, 410), cmd_text, fill=(100, 116, 139, 255), font=font_mono)
    
    # Save output banner in public/assets/ and assets/
    out_dir = os.path.join(os.path.dirname(__file__), "..", "public", "assets")
    os.makedirs(out_dir, exist_ok=True)
    out_path = os.path.join(out_dir, "x_banner_1500x500.png")
    
    # Convert RGBA to RGB for JPEG/PNG compatibility
    rgb_banner = Image.new("RGB", (width, height), (7, 9, 14))
    rgb_banner.paste(banner, mask=banner.split()[3])
    rgb_banner.save(out_path, format="PNG", quality=95)
    print(f"Banner generated successfully: {out_path}")
    
    # Also save as JPEG for optimal Twitter upload compression (< 5MB)
    out_jpg = os.path.join(out_dir, "x_banner_1500x500.jpg")
    rgb_banner.save(out_jpg, format="JPEG", quality=92)
    print(f"Banner JPG generated successfully: {out_jpg}")

if __name__ == "__main__":
    create_banner()
