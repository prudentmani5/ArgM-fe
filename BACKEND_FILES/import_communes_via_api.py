#!/usr/bin/env python3
"""
Script to import Communes via REST API
République du Burundi - 42 Communes

Usage:
    python import_communes_via_api.py --url http://your-backend-url
"""

import requests
import json
import argparse
import time
from typing import List, Dict

# Communes data organized by province
COMMUNES_DATA = {
    "BUHUMUZA": {
        "province_id": "1",
        "communes": [
            {"code": "BUH-001", "name": "Butaganzwa"},
            {"code": "BUH-002", "name": "Butihinda"},
            {"code": "BUH-003", "name": "Cankuzo"},
            {"code": "BUH-004", "name": "Gisagara"},
            {"code": "BUH-005", "name": "Gisuru"},
            {"code": "BUH-006", "name": "Muyinga"},
            {"code": "BUH-007", "name": "Ruyigi"},
        ]
    },
    "BUJUMBURA": {
        "province_id": "2",
        "communes": [
            {"code": "BJM-001", "name": "Bubanza"},
            {"code": "BJM-002", "name": "Bukinanyana"},
            {"code": "BJM-003", "name": "Cibitoke"},
            {"code": "BJM-004", "name": "Isare"},
            {"code": "BJM-005", "name": "Mpanda"},
            {"code": "BJM-006", "name": "Mugere"},
            {"code": "BJM-007", "name": "Mugina"},
            {"code": "BJM-008", "name": "Muhuta"},
            {"code": "BJM-009", "name": "Mukaza"},
            {"code": "BJM-010", "name": "Ntahangwa"},
            {"code": "BJM-011", "name": "Rwibaga"},
        ]
    },
    "BURUNGA": {
        "province_id": "3",
        "communes": [
            {"code": "BRG-001", "name": "Bururi"},
            {"code": "BRG-002", "name": "Makamba"},
            {"code": "BRG-003", "name": "Matana"},
            {"code": "BRG-004", "name": "Musongati"},
            {"code": "BRG-005", "name": "Nyanza"},
            {"code": "BRG-006", "name": "Rumonge"},
            {"code": "BRG-007", "name": "Rutana"},
        ]
    },
    "BUTANYERERA": {
        "province_id": "4",
        "communes": [
            {"code": "BTN-001", "name": "Busoni"},
            {"code": "BTN-002", "name": "Kayanza"},
            {"code": "BTN-003", "name": "Kiremba"},
            {"code": "BTN-004", "name": "Kirundo"},
            {"code": "BTN-005", "name": "Matongo"},
            {"code": "BTN-006", "name": "Muhanga"},
            {"code": "BTN-007", "name": "Ngozi"},
            {"code": "BTN-008", "name": "Tangara"},
        ]
    },
    "GITEGA": {
        "province_id": "5",
        "communes": [
            {"code": "GTG-001", "name": "Bugendana"},
            {"code": "GTG-002", "name": "Gishubi"},
            {"code": "GTG-003", "name": "Gitega"},
            {"code": "GTG-004", "name": "Karusi"},
            {"code": "GTG-005", "name": "Kiganda"},
            {"code": "GTG-006", "name": "Muramvya"},
            {"code": "GTG-007", "name": "Mwaro"},
            {"code": "GTG-008", "name": "Nyabihanga"},
            {"code": "GTG-009", "name": "Shombo"},
        ]
    }
}


def create_commune(base_url: str, commune_data: Dict, session: requests.Session = None) -> bool:
    """
    Create a single commune via REST API

    Args:
        base_url: Base URL of the API
        commune_data: Commune data dict
        session: Optional requests session for connection pooling

    Returns:
        True if successful, False otherwise
    """
    if session is None:
        session = requests.Session()

    endpoint = f"{base_url}/api/reference-data/communes/new"

    payload = {
        "code": commune_data["code"],
        "name": commune_data["name"],
        "isActive": True,
        "province": {
            "id": commune_data["province_id"]
        }
    }

    try:
        response = session.post(
            endpoint,
            json=payload,
            headers={"Content-Type": "application/json"},
            timeout=10
        )

        if response.status_code in [200, 201]:
            print(f"✓ Created: {commune_data['code']} - {commune_data['name']}")
            return True
        else:
            print(f"✗ Failed: {commune_data['code']} - {commune_data['name']} (Status: {response.status_code})")
            print(f"  Response: {response.text}")
            return False

    except requests.exceptions.RequestException as e:
        print(f"✗ Error creating {commune_data['code']}: {str(e)}")
        return False


def import_all_communes(base_url: str, delay: float = 0.5) -> Dict[str, int]:
    """
    Import all 42 communes via REST API

    Args:
        base_url: Base URL of the API
        delay: Delay between requests in seconds (to avoid overwhelming the server)

    Returns:
        Dict with success/failure counts
    """
    session = requests.Session()
    results = {
        "total": 0,
        "success": 0,
        "failed": 0,
        "by_province": {}
    }

    print("\n" + "="*60)
    print("IMPORTING COMMUNES - République du Burundi")
    print("="*60 + "\n")

    for province_name, province_data in COMMUNES_DATA.items():
        print(f"\n📍 Province: {province_name} ({len(province_data['communes'])} communes)")
        print("-" * 60)

        province_results = {"success": 0, "failed": 0}

        for commune in province_data["communes"]:
            commune["province_id"] = province_data["province_id"]

            success = create_commune(base_url, commune, session)

            results["total"] += 1
            if success:
                results["success"] += 1
                province_results["success"] += 1
            else:
                results["failed"] += 1
                province_results["failed"] += 1

            # Small delay to avoid overwhelming the server
            time.sleep(delay)

        results["by_province"][province_name] = province_results
        print(f"\n  Province {province_name}: {province_results['success']} réussies, {province_results['failed']} échouées")

    session.close()

    # Print summary
    print("\n" + "="*60)
    print("SUMMARY")
    print("="*60)
    print(f"Total communes: {results['total']}")
    print(f"✓ Success: {results['success']}")
    print(f"✗ Failed: {results['failed']}")
    print(f"\nSuccess rate: {(results['success']/results['total']*100):.1f}%")

    print("\n📊 By Province:")
    for province, counts in results["by_province"].items():
        print(f"  {province:15s}: {counts['success']:2d} / {counts['success'] + counts['failed']:2d}")

    print("="*60 + "\n")

    return results


def main():
    parser = argparse.ArgumentParser(
        description="Import Burundi Communes via REST API"
    )
    parser.add_argument(
        "--url",
        required=True,
        help="Base URL of the API (e.g., http://localhost:8080)"
    )
    parser.add_argument(
        "--delay",
        type=float,
        default=0.5,
        help="Delay between requests in seconds (default: 0.5)"
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Print what would be done without actually making API calls"
    )

    args = parser.parse_args()

    if args.dry_run:
        print("\n🔍 DRY RUN MODE - No API calls will be made\n")
        total = sum(len(p["communes"]) for p in COMMUNES_DATA.values())
        print(f"Would import {total} communes:")
        for province, data in COMMUNES_DATA.items():
            print(f"\n  {province} ({len(data['communes'])} communes):")
            for commune in data["communes"]:
                print(f"    - {commune['code']}: {commune['name']}")
    else:
        results = import_all_communes(args.url, args.delay)

        # Exit with error code if there were failures
        if results["failed"] > 0:
            exit(1)


if __name__ == "__main__":
    main()
