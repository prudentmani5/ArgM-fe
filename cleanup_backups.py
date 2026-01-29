#!/usr/bin/env python3
"""
Optional cleanup script to remove backup files after verification
Run this ONLY after you've verified all translations are correct
"""

import os
from pathlib import Path

BASE_DIR = Path(r"C:\Users\prudence.manirakiza\Documents\AgrM\AgrM-fe\app\(AgrM-fe)\financialProducts")

def main():
    if not BASE_DIR.exists():
        print(f"Error: Base directory not found: {BASE_DIR}")
        return

    # Find all .bak files
    bak_files = list(BASE_DIR.rglob("*.bak"))

    if not bak_files:
        print("No backup files found.")
        return

    print(f"Found {len(bak_files)} backup files")
    print()
    print("WARNING: This will permanently delete all backup (.bak) files!")
    print("Make sure you have verified all translations are correct before proceeding.")
    print()

    response = input("Are you sure you want to delete all backup files? (yes/no): ")

    if response.lower() != 'yes':
        print("Cleanup cancelled.")
        return

    deleted_count = 0
    for bak_file in bak_files:
        try:
            bak_file.unlink()
            deleted_count += 1
            print(f"Deleted: {bak_file.relative_to(BASE_DIR)}")
        except Exception as e:
            print(f"Error deleting {bak_file}: {e}")

    print()
    print("="* 60)
    print(f"Cleanup complete!")
    print(f"  - {deleted_count} backup files deleted")
    print("="* 60)

if __name__ == "__main__":
    main()
