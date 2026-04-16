#!/usr/bin/env python3
"""Add data-boat attributes to boat card containers and inject prices.js script tag."""
import re, os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

FILES = [
    'private-sunset.html',
    'private-snorkeling.html',
    'whale-watching.html',
    'bachelorette-party.html',
    'fleet.html',
    'index.html',
    'HOME-1.html',
    'scuba-diving.html',
]

# Map boat display name (in <h4>) to data-boat ID
BOAT_ID_MAP = {
    "Luxury Yacht 51'": 'yacht-51',
    "Luxury Yacht 46'": 'yacht-51',
    "Luxury Yacht 45'": 'yacht-45',
    "Luxury Yacht 42'": 'yacht-42',
    "Sailing Boat 42'": 'sailing-42',
    "Sailing Boat 38'": 'sailing-38',
}

SCRIPT_TAG = '<script src="js/prices.js" defer></script>'

total_edits = 0

for filename in FILES:
    filepath = os.path.join(ROOT, filename)
    if not os.path.exists(filepath):
        print(f'SKIP (not found): {filename}')
        continue

    with open(filepath, 'r', encoding='utf-8') as f:
        html = f.read()

    edits = 0

    for boat_name, boat_id in BOAT_ID_MAP.items():
        # Find all <h4...>BOAT_NAME</h4> positions
        escaped = re.escape(boat_name)
        h4_pattern = re.compile(r'<h4[^>]*>' + escaped + r'</h4>')

        for m in h4_pattern.finditer(html):
            h4_pos = m.start()

            # Look backwards up to 3000 chars for the nearest card container div
            search_start = max(0, h4_pos - 3000)
            before = html[search_start:h4_pos]

            # Find all card-like div openings (the rounded card containers)
            card_re = re.compile(
                r'<div class="(?:w-full )?bg-white border border-border-light rounded-\[(?:2\.5rem|1\.5rem)\][^"]*"'
            )

            last_match = None
            for cm in card_re.finditer(before):
                last_match = cm

            if last_match and 'data-boat' not in last_match.group(0):
                abs_pos = search_start + last_match.start()
                original = last_match.group(0)
                # Insert data-boat attribute before the closing quote
                replacement = original[:-1] + '" data-boat="' + boat_id + '"'
                html = html[:abs_pos] + html[abs_pos:].replace(original, replacement, 1)
                edits += 1

    # Add prices.js script tag if not already present
    if 'prices.js' not in html:
        html = html.replace('</body>', SCRIPT_TAG + '\n</body>')
        edits += 1

    if edits > 0:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(html)
        print(f'UPDATED: {filename} ({edits} edits)')
        total_edits += edits
    else:
        print(f'NO CHANGES: {filename}')

print(f'\nTotal edits: {total_edits}')
