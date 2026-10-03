"""
Automated Test Suite: Conversion Parity & Autonomy Preservation
"""

import unittest
import os
from core.engine import OmniProjectEngine

class TestConversionParity(unittest.TestCase):
    def test_full_project_conversion(self):
        workspace = os.path.abspath(".")
        engine = OmniProjectEngine(workspace)
        output_dir = os.path.join(workspace, "exports")
        
        res = engine.convert_to_all(output_dir)
        
        self.assertTrue(res["autonomy_preserved"])
        self.assertGreaterEqual(res["claude_parity_score"], 90)
        self.assertGreaterEqual(res["openai_parity_score"], 90)
        self.assertTrue(os.path.exists(res["caps_file"]))
        self.assertTrue(os.path.exists(res["report_file"]))
        self.assertTrue(os.path.exists(res["claude_files"]["CLAUDE.md"]))
        self.assertTrue(os.path.exists(res["openai_files"][".cursorrules"]))

if __name__ == "__main__":
    unittest.main()
