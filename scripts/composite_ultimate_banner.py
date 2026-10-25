import os
from PIL import Image, ImageDraw, ImageFont

def create_ultimate_banner():
    target_w, target_h = 1500, 500
    ai_bg_path = r"C:\Users\Admin\.gemini\antigravity\brain\5e3d06e7-9e45-4fd8-9f85-a6adfba8a266\twitter_header_banner_v2_png_1792941931018.jpg"
    
    if os.path.exists(ai_bg_path):
        bg = Image.open(ai_bg_path).convert("RGBA")
        # Center-crop to 1500x500 aspect ratio (3:1)
        orig_w, orig_h = bg.size
        # target ratio is 3.0
        crop_h = int(orig_w / 3.0)
        if crop_h <= orig_h:
            top = (orig_h - crop_h) // 2
            bg = bg.crop((0, top, orig_w, top + crop_h))
        else:
            crop_w = int(orig_h * 3.0)
            left = (orig_w - crop_w) // 2
            bg = bg.crop((left, 0, left + crop_w, orig_h))
            
        banner = bg.resize((target_w, target_h), Image.Resampling.LANCZOS)
    else:
        banner = Image.new("RGBA", (target_w, target_h), (7, 9, 14, 255))
        
    draw = ImageDraw.Draw(banner)
    
    # Darken left side slightly so profile avatar pops out cleanly
    dark_overlay = Image.new("RGBA", (target_w, target_h), (0, 0, 0, 0))
    d_draw = ImageDraw.Draw(dark_overlay)
    d_draw.rectangle([0, 0, 420, target_h], fill=(7, 9, 14, 180))
    banner = Image.alpha_composite(banner, dark_overlay)
    draw = ImageDraw.Draw(banner)
    
    # Fonts
    try:
        font_title = ImageFont.truetype("arialbd.ttf", 54)
        font_sub = ImageFont.truetype("arial.ttf", 25)
        font_mono = ImageFont.truetype("consola.ttf", 20)
        font_badge = ImageFont.truetype("arialbd.ttf", 16)
    except:
        font_title = ImageFont.load_default()
        font_sub = ImageFont.load_default()
        font_mono = ImageFont.load_default()
        font_badge = ImageFont.load_default()
        
    text_x = 480
    
    # Category Pill
    pill_box = [text_x, 90, text_x + 360, 126]
    draw.rounded_rectangle(pill_box, radius=18, fill=(10, 15, 29, 230), outline=(0, 240, 255, 120), width=1)
    draw.text((text_x + 18, 98), "⚡ UNIVERSAL AI PROJECT BRIDGE", fill=(0, 240, 255, 255), font=font_badge)
    
    # Titles
    draw.text((text_x, 145), "Write Rules Once.", fill=(255, 255, 255, 255), font=font_title)
    draw.text((text_x, 205), "Run Them Everywhere.", fill=(0, 240, 255, 255), font=font_title)
    
    # Subtitle
    draw.text((text_x, 275), "Cursor  •  Claude Code  •  ChatGPT  •  Gemini", fill=(203, 213, 225, 255), font=font_sub)
    
    # Badges
    badges_y = 335
    badges = [
        ("✓ 98.5% AST Parity", (16, 185, 129, 255), (6, 78, 59, 210), (16, 185, 129, 140)),
        ("🔐 In-RAM 0 Logs", (56, 189, 248, 255), (12, 74, 110, 210), (56, 189, 248, 140)),
        ("⚡ $1.99 Single Pass", (244, 63, 94, 255), (136, 19, 55, 210), (244, 63, 94, 140)),
    ]
    curr_x = text_x
    for text, text_color, bg_color, border_color in badges:
        badge_w = len(text) * 11 + 24
        draw.rounded_rectangle([curr_x, badges_y, curr_x + badge_w, badges_y + 34], radius=8, fill=bg_color, outline=border_color, width=1)
        draw.text((curr_x + 12, badges_y + 8), text, fill=text_color, font=font_badge)
        curr_x += badge_w + 14
        
    # Command
    cmd_box = [text_x, 395, text_x + 380, 435]
    draw.rounded_rectangle(cmd_box, radius=8, fill=(15, 23, 42, 220), outline=(51, 65, 85, 180), width=1)
    draw.text((text_x + 14, 404), "$ npx promptshift --to=claude", fill=(56, 189, 248, 255), font=font_mono)
    
    # Save
    out_dir = r"C:\Users\Admin\.gemini\antigravity\brain\5e3d06e7-9e45-4fd8-9f85-a6adfba8a266"
    final_png = os.path.join(out_dir, "x_banner_promptshift_ultimate.png")
    final_jpg = os.path.join(out_dir, "x_banner_promptshift_ultimate.jpg")
    
    rgb = Image.new("RGB", (target_w, target_h), (7, 9, 14))
    rgb.paste(banner, mask=banner.split()[3])
    rgb.save(final_png, format="PNG", quality=95)
    rgb.save(final_jpg, format="JPEG", quality=92)
    
    # Also save to public/assets/
    public_dir = os.path.join(os.path.dirname(__file__), "..", "public", "assets")
    rgb.save(os.path.join(public_dir, "x_banner_promptshift_ultimate.png"), format="PNG", quality=95)
    rgb.save(os.path.join(public_dir, "x_banner_promptshift_ultimate.jpg"), format="JPEG", quality=92)
    print("Ultimate banner saved successfully!")

if __name__ == "__main__":
    create_ultimate_banner()
