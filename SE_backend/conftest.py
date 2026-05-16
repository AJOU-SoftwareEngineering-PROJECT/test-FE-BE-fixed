import sys
import os

# Ensure the test directory is prioritized on sys.path so pytest imports
# test packages (e.g., test/scrap) rather than backend packages with the
# same name (e.g., scrap/).
THIS_DIR = os.path.dirname(__file__)
TEST_DIR = os.path.join(THIS_DIR, "test")
if TEST_DIR not in sys.path:
    sys.path.insert(0, TEST_DIR)
"""Ensure the project root is importable during test runs."""

import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))
