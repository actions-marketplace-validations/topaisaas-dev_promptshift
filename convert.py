"""
OmniProject CLI — 1-Click Universal AI Project Converter
Usage:
    python convert.py
    python convert.py --source "path/to/project" --output "path/to/output"
"""

import os
import sys
import argparse
from core.engine import OmniProjectEngine

def main():
    parser = argparse.ArgumentParser(description="1-Click AI Project Converter (Gemini, Claude, OpenAI, Cursor)")
    parser.add_argument("--source", type=str, default=".", help="Source workspace path of the AI project to convert")
    parser.add_argument("--output", type=str, default="./exports", help="Output directory for generated packages")
    
    args = parser.parse_args()
    
    source_dir = os.path.abspath(args.source)
    output_dir = os.path.abspath(args.output)
    
    print(f"[*] Starting OmniProject AI Conversion...")
    print(f"[*] Source Project: {source_dir}")
    print(f"[*] Destination Directory: {output_dir}")
    
    engine = OmniProjectEngine(source_dir)
    res = engine.convert_to_all(output_dir)
    
    print("\n[+] 1-CLICK CONVERSION COMPLETED SUCCESSFULLY!")
    print(f"[+] Project: {res['project_name']}")
    print(f"[+] Rules Converted: {res['rules_count']}")
    print(f"[+] Knowledge Documents: {res['knowledge_files_count']}")
    print(f"[+] Autonomy Preserved: {res['autonomy_preserved']}")
    print(f"[+] Claude Package: {os.path.join(output_dir, 'claude_export')}")
    print(f"[+] OpenAI Package: {os.path.join(output_dir, 'openai_export')}")
    print(f"[+] Universal CAPS Pivot: {res['caps_file']}")
    print(f"[+] Audit Report: {res['report_file']}")

if __name__ == "__main__":
    main()
