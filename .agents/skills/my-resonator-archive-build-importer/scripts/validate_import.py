#!/usr/bin/env python3
"""Validate the conservative, pre-persistence import envelope."""
import json
import sys
from pathlib import Path

REQUIRED = {"characterKey", "displayNameObserved", "sources", "recommended", "actual", "unreadable", "conflicts", "confirmed"}

def main() -> int:
    if len(sys.argv) != 2:
        print("usage: validate_import.py <json>", file=sys.stderr)
        return 2
    data = json.loads(Path(sys.argv[1]).read_text(encoding="utf-8"))
    missing = sorted(REQUIRED - data.keys())
    if missing:
        print("missing keys: " + ", ".join(missing), file=sys.stderr)
        return 1
    sources = data["sources"]
    if not isinstance(sources, dict) or not {"recommendations", "actualBuild"} <= sources.keys():
        print("sources must contain recommendations and actualBuild", file=sys.stderr)
        return 1
    for key in ("unreadable", "conflicts"):
        if not isinstance(data[key], list):
            print(f"{key} must be a list", file=sys.stderr)
            return 1
    if not isinstance(data["confirmed"], bool):
        print("confirmed must be boolean", file=sys.stderr)
        return 1
    print("valid import envelope")
    return 0

if __name__ == "__main__":
    raise SystemExit(main())
