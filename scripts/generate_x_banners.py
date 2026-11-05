#!/usr/bin/env python3
"""
Generate ultra-clean, modern, marketing and CTA-driven Twitter/X banners (1500x500).
Designed specifically to respect Twitter's avatar safe zone (bottom-left)
and drive clicks to https://promptshift.dev.
"""

import os
from PIL import Image, ImageDraw, ImageFont

OUTPUT_DIR = os.path.join(os.getcwd(), 'public', 'assets')
os.makedirs(OUTPUT_DIR, exist_ok=True)

FONTS_DIR = r'C:\Windows\Fonts'

def get_font(name, size):
    path = os.path.join(FONTS_DIR, name)
    if os.path.exists(path):
        try:
            return ImageFont.truetype(path, size)
        except Exception:
            pass
    return ImageFont.load_default()

# Fonts
FONT_TITLE = get_font('segoeuib.ttf', 52)
FONT_HEADING = get_font('segoeuib.ttf', 38)
FONT_BTN = get_font('segoeuib.ttf', 22)
FONT_TAG = get_font('segoeuib.ttf', 16)
FONT_SUB = get_font('segoeui.ttf', 21)
FONT_DETAIL = get_font('segoeui.ttf', 17)
FONT_TINY = get_font('segoeui.ttf', 14)

FONT_MONO = get_font('consola.ttf', 19)
FONT_MONO_SM = get_font('consola.ttf', 15)

# Palette
BG_DARK = (11, 17, 26)          # #0B111A
CYAN_ACCENT = (0, 242, 254)      # #00F2FE
MINT_ACCENT = (16, 185, 129)     # #10B981
TEXT_WHITE = (255, 255, 255)
TEXT_MUTED = (160, 175, 195)     # #A0AFC3
TEXT_DIM = (100, 116, 139)       # #64748B

def draw_grid_background(width=1500, height=500):
    img = Image.new('RGBA', (width, height), BG_DARK)
    
    # Ambient glowing gradient on the right side
    glow = Image.new('RGBA', (width, height), (0, 0, 0, 0))
    gdraw = ImageDraw.Draw(glow)
    
    center_x, center_y = 1180, 250
    for r in range(480, 0, -20):
        alpha = int(24 * (1.0 - r / 480.0))
        gdraw.ellipse([center_x - r, center_y - int(r * 0.7), center_x + r, center_y + int(r * 0.7)], fill=(0, 210, 255, alpha))

    # Grid lines
    grid_img = Image.new('RGBA', (width, height), (0, 0, 0, 0))
    grdraw = ImageDraw.Draw(grid_img)
    step = 50
    for x in range(0, width, step):
        grdraw.line([(x, 0), (x, height)], fill=(255, 255, 255, 6), width=1)
    for y in range(0, height, step):
        grdraw.line([(0, y), (width, y)], fill=(255, 255, 255, 6), width=1)

    img = Image.alpha_composite(img, glow)
    img = Image.alpha_composite(img, grid_img)
    return img

def create_banner_v1_saas_cta():
    """
    Banner Option 1: Clean, high-converting B2B SaaS layout.
    - Safe left zone for avatar.
    - Powerful headline: 'Stop rewriting AI rules.'
    - High-contrast green/cyan CTA Button: 'Try Free in Browser -> promptshift.dev'
    - Right side: Visual IDE bridge card showing Cursor, Claude Code, Copilot & Windsurf.
    """
    img = draw_grid_background()
    draw = ImageDraw.Draw(img)

    left_x = 230  # Safely right of mobile avatar overlay

    # 1. Super-badge
    tag_y = 48
    tag_text = "UNIVERSAL AI CODING RULES BRIDGE"
    t_bbox = draw.textbbox((0, 0), tag_text, font=FONT_TAG)
    tw = t_bbox[2] - t_bbox[0] + 28
    th = 30
    draw.rounded_rectangle([left_x, tag_y, left_x + tw, tag_y + th], radius=15, fill=(15, 34, 52, 230), outline=(0, 210, 255, 120), width=1)
    draw.text((left_x + 14, tag_y + 6), tag_text, font=FONT_TAG, fill=CYAN_ACCENT)

    # 2. Main Headline
    head_y = 96
    draw.text((left_x, head_y), "Stop rewriting AI rules.", font=FONT_TITLE, fill=TEXT_WHITE)
    
    # 3. Subheadline
    sub_y = 168
    draw.text((left_x, sub_y), "Sync Cursor, Claude Code, Copilot & Windsurf in 1 click.", font=FONT_SUB, fill=TEXT_MUTED)

    # 4. PRIMARY CALL TO ACTION BUTTON (Prominent, High-converting)
    btn_x, btn_y = left_x, 224
    btn_text = "Try Free in Browser   ->   promptshift.dev"
    b_bbox = draw.textbbox((0, 0), btn_text, font=FONT_BTN)
    bw_text = b_bbox[2] - b_bbox[0]
    btn_w = bw_text + 56
    btn_h = 58
    
    # Gradient CTA button
    btn_img = Image.new('RGBA', (btn_w, btn_h), (0, 0, 0, 0))
    bdraw = ImageDraw.Draw(btn_img)
    for bx in range(btn_w):
        t = bx / float(btn_w)
        r = int(0 * (1 - t) + 16 * t)
        g = int(225 * (1 - t) + 185 * t)
        b = int(245 * (1 - t) + 129 * t)
        bdraw.line([(bx, 0), (bx, btn_h)], fill=(r, g, b, 255))
        
    mask = Image.new('L', (btn_w, btn_h), 0)
    ImageDraw.Draw(mask).rounded_rectangle([0, 0, btn_w, btn_h], radius=14, fill=255)
    img.paste(btn_img, (btn_x, btn_y), mask)

    draw.text((btn_x + 28, btn_y + 15), btn_text, font=FONT_BTN, fill=(11, 17, 26))

    # 5. Secondary Trust Badges underneath button
    sub_badges_y = 302
    draw.text((left_x, sub_badges_y), "Free for <= 2 files   *   No signup   *   100% in-RAM   *   $1.99 Single Pass", font=FONT_DETAIL, fill=TEXT_MUTED)

    # 6. Terminal pill
    term_y = 348
    draw.rounded_rectangle([left_x, term_y, left_x + 370, term_y + 42], radius=9, fill=(18, 27, 41, 230), outline=(33, 49, 73, 220), width=1)
    draw.text((left_x + 18, term_y + 10), "$ npx promptshift --to=claude", font=FONT_MONO, fill=(0, 242, 254))

    # 7. RIGHT SIDE: Sleek Visual Card
    card_x, card_y, card_w, card_h = 860, 52, 580, 396
    draw.rounded_rectangle([card_x, card_y, card_x + card_w, card_y + card_h], radius=18, fill=(18, 27, 41, 240), outline=(45, 65, 95, 240), width=1)
    
    # Card Header
    draw.ellipse([card_x + 20, card_y + 18, card_x + 30, card_y + 28], fill=(239, 68, 68))
    draw.ellipse([card_x + 38, card_y + 18, card_x + 48, card_y + 28], fill=(245, 158, 11))
    draw.ellipse([card_x + 56, card_y + 18, card_x + 66, card_y + 28], fill=(16, 185, 129))
    draw.text((card_x + 80, card_y + 14), "promptshift.dev   -   Multi-IDE Rules Sync", font=FONT_MONO_SM, fill=TEXT_MUTED)

    items = [
        ("Cursor IDE", ".cursor/rules/*.mdc", (0, 210, 255)),
        ("Claude Code", "CLAUDE.md (Project XML)", (217, 119, 6)),
        ("GitHub Copilot", "copilot-instructions.md", (96, 165, 250)),
        ("Windsurf Cascade", ".windsurfrules", (52, 211, 153)),
    ]

    item_y = card_y + 54
    for name, filename, col in items:
        draw.rounded_rectangle([card_x + 20, item_y, card_x + card_w - 20, item_y + 58], radius=10, fill=(11, 17, 26, 220), outline=(30, 41, 59), width=1)
        draw.ellipse([card_x + 38, item_y + 23, card_x + 50, item_y + 35], fill=col)
        draw.text((card_x + 62, item_y + 16), name, font=FONT_BTN, fill=TEXT_WHITE)
        draw.text((card_x + 250, item_y + 18), filename, font=FONT_MONO_SM, fill=TEXT_MUTED)
        draw.text((card_x + card_w - 60, item_y + 16), "OK", font=FONT_BTN, fill=(16, 185, 129))
        item_y += 68

    # Status line inside card
    stat_y = card_y + card_h - 40
    draw.text((card_x + 24, stat_y), "98.5% AST Parity   |   In-RAM Secret Sanitizer   |   Glama Grade A", font=FONT_TINY, fill=(0, 242, 254))

    out_path = os.path.join(OUTPUT_DIR, 'x_banner_marketing_cta_v1.png')
    img.save(out_path, format='PNG')
    print("[OK] Generated Banner V1:", out_path)
    return out_path

def create_banner_v2_terminal_proof():
    """
    Banner Option 2: Direct Developer Pitch + Terminal Proof.
    - Large punchy headline: 'One Rulebook. Every AI Editor.'
    - Prominent CTA: 'Start Free at promptshift.dev'
    - Terminal with clean 0.4s sync output.
    """
    img = draw_grid_background()
    draw = ImageDraw.Draw(img)

    left_x = 230

    # Tag
    draw.text((left_x, 48), "ZERO VENDOR LOCK-IN", font=FONT_TAG, fill=(0, 242, 254))

    # Headline
    draw.text((left_x, 82), "One Rulebook.", font=FONT_TITLE, fill=TEXT_WHITE)
    draw.text((left_x, 140), "Every AI Editor.", font=FONT_TITLE, fill=(0, 242, 254))

    # Subhead
    draw.text((left_x, 212), "Sync Cursor, Claude Code, Copilot & Windsurf in 1 click.", font=FONT_SUB, fill=TEXT_MUTED)

    # CTA Button
    btn_x, btn_y = left_x, 262
    btn_text = "Start Free at promptshift.dev   ->"
    b_bbox = draw.textbbox((0, 0), btn_text, font=FONT_BTN)
    bw_text = b_bbox[2] - b_bbox[0]
    btn_w = bw_text + 52
    btn_h = 56
    draw.rounded_rectangle([btn_x, btn_y, btn_x + btn_w, btn_y + btn_h], radius=12, fill=(16, 185, 129), outline=(52, 211, 153), width=1)
    draw.text((btn_x + 26, btn_y + 14), btn_text, font=FONT_BTN, fill=(11, 17, 26))

    # Details
    draw.text((left_x, 340), "No credit card needed   *   Up to 2 files 100% Free   *   $1.99 Repo Pass", font=FONT_DETAIL, fill=TEXT_MUTED)
    draw.text((left_x, 380), "Available via Web Studio, CLI (npx promptshift), and Glama Grade A MCP", font=FONT_TINY, fill=TEXT_DIM)

    # Right Side: Terminal Box
    term_x, term_y, term_w, term_h = 820, 52, 620, 396
    draw.rounded_rectangle([term_x, term_y, term_x + term_w, term_y + term_h], radius=16, fill=(14, 20, 30, 245), outline=(40, 56, 80), width=1)
    
    # Top bar
    draw.ellipse([term_x + 18, term_y + 16, term_x + 28, term_y + 26], fill=(239, 68, 68))
    draw.ellipse([term_x + 36, term_y + 16, term_x + 46, term_y + 26], fill=(245, 158, 11))
    draw.ellipse([term_x + 54, term_y + 16, term_x + 64, term_y + 26], fill=(16, 185, 129))
    draw.text((term_x + 80, term_y + 13), "bash - promptshift 0.4s universal transpile", font=FONT_MONO_SM, fill=TEXT_MUTED)

    lines = [
        ("$ npx promptshift --source cursor --target claude", (255, 255, 255)),
        ("", (0,0,0)),
        ("Detected: 4 .cursor/rules/*.mdc files", (0, 242, 254)),
        ("Secret Sanitizer: 2 leaked API keys redacted in RAM", (245, 158, 11)),
        ("AST Semantic Parity: 98.5% Certified", (16, 185, 129)),
        ("Generated: CLAUDE.md + project XML", (148, 163, 184)),
        ("Generated: .claude/mcp.json (zero retention)", (148, 163, 184)),
        ("", (0,0,0)),
        ("Done in 0.38s! Zero duplicate prompts.", (16, 185, 129)),
        ("Web Studio & 4-in-1 Export: https://promptshift.dev", (0, 242, 254))
    ]

    ty = term_y + 54
    for ltext, col in lines:
        if ltext:
            draw.text((term_x + 22, ty), ltext, font=FONT_MONO, fill=col)
        ty += 30

    out_path = os.path.join(OUTPUT_DIR, 'x_banner_terminal_cta_v2.png')
    img.save(out_path, format='PNG')
    print("[OK] Generated Banner V2:", out_path)
    return out_path

def create_banner_v3_minimal_punchy():
    """
    Banner Option 3: Modern Minimalist / Linear-Style.
    High contrast, ultra-clean, maximum readability on mobile with official Chevron logo.
    """
    img = draw_grid_background()
    draw = ImageDraw.Draw(img)

    left_x = 230

    # Clean brand tag
    draw.text((left_x, 50), "PROMPTSHIFT   |   DEVREL & PRODUCTIVITY", font=FONT_TAG, fill=(0, 242, 254))

    # Huge punchy statement
    draw.text((left_x, 90), "AI Rules that work", font=FONT_TITLE, fill=TEXT_WHITE)
    draw.text((left_x, 150), "in every editor.", font=FONT_TITLE, fill=(0, 242, 254))

    # Supported IDEs
    draw.text((left_x, 226), "Cursor   *   Claude Code   *   GitHub Copilot   *   Windsurf", font=FONT_BTN, fill=TEXT_WHITE)
    draw.text((left_x, 268), "Keep your coding standards in sync across all 4 AI assistants in 1 click.", font=FONT_SUB, fill=TEXT_MUTED)

    # CTA Button and badges
    btn_x, btn_y = left_x, 325
    btn_text = "Try Free   ->   promptshift.dev"
    b_bbox = draw.textbbox((0, 0), btn_text, font=FONT_BTN)
    bw_text = b_bbox[2] - b_bbox[0]
    btn_w = bw_text + 48
    btn_h = 56
    draw.rounded_rectangle([btn_x, btn_y, btn_x + btn_w, btn_y + btn_h], radius=12, fill=(0, 242, 254), outline=(0, 242, 254), width=1)
    draw.text((btn_x + 24, btn_y + 15), btn_text, font=FONT_BTN, fill=(11, 17, 26))

    term_pill_x = btn_x + btn_w + 20
    draw.rounded_rectangle([term_pill_x, btn_y, term_pill_x + 260, btn_y + btn_h], radius=12, fill=(18, 27, 41, 230), outline=(33, 49, 73), width=1)
    draw.text((term_pill_x + 22, btn_y + 17), "$ npx promptshift", font=FONT_MONO, fill=(16, 185, 129))

    # Guarantee
    draw.text((left_x, 405), "Free for <= 2 files   *   No signup   *   Grade A MCP on Glama", font=FONT_DETAIL, fill=TEXT_MUTED)

    # Right side: Visual Chevron Logo with subtle glow
    logo_path = os.path.join(OUTPUT_DIR, 'official_logo.jpg')
    if os.path.exists(logo_path):
        try:
            logo = Image.open(logo_path).convert('RGBA')
            logo = logo.resize((360, 360), Image.Resampling.LANCZOS)
            
            logo_mask = Image.new('L', (360, 360), 0)
            ImageDraw.Draw(logo_mask).rounded_rectangle([0, 0, 360, 360], radius=40, fill=255)
            
            img.paste(logo, (1060, 70), logo_mask)
            draw.rounded_rectangle([1060, 70, 1420, 430], radius=40, outline=(0, 242, 254, 120), width=2)
        except Exception as e:
            print("Logo load error:", e)

    out_path = os.path.join(OUTPUT_DIR, 'x_banner_minimal_v3.png')
    img.save(out_path, format='PNG')
    print("[OK] Generated Banner V3:", out_path)
    return out_path

if __name__ == '__main__':
    v1 = create_banner_v1_saas_cta()
    v2 = create_banner_v2_terminal_proof()
    v3 = create_banner_v3_minimal_punchy()
    
    # Overwrite the default public/assets/x_banner_1500x500.png with the refined V1 banner
    import shutil
    default_banner = os.path.join(OUTPUT_DIR, 'x_banner_1500x500.png')
    shutil.copy2(v1, default_banner)
    print("[OK] Set V1 as primary:", default_banner)
