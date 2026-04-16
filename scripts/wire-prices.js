#!/usr/bin/env node
// Adds data-boat attributes to boat card containers and injects prices.js script tag.
// Run: node scripts/wire-prices.js

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');

// Files to process
const files = [
  'private-sunset.html',
  'private-snorkeling.html',
  'whale-watching.html',
  'bachelorette-party.html',
  'fleet.html',
  'index.html',
  'HOME-1.html',
  'scuba-diving.html',
  'shared-sunset.html',
  'shared-snorkeling.html',
  'shuttle-service.html',
];

// Map: heading text => data-boat ID
const boatIdMap = {
  "Luxury Yacht 51'": 'yacht-51',
  "Luxury Yacht 46'": 'yacht-51',
  "Luxury Yacht 45'": 'yacht-45',
  "Luxury Yacht 42'": 'yacht-42',
  "Sailing Boat 42'": 'sailing-42',
  "Sailing Boat 38'": 'sailing-38',
};

// Comment patterns => data-boat ID
const commentMap = {
  "51'": 'yacht-51',
  "46'": 'yacht-51',
  "45'": 'yacht-45',
  "42' Luxury": 'yacht-42',
  "Luxury Yacht 42": 'yacht-42',
  "Luxury Yacht 45": 'yacht-45',
  "Luxury Yacht 46": 'yacht-51',
  "Luxury Yacht 51": 'yacht-51',
  "42' Sailing": 'sailing-42',
  "Sailing Boat 42": 'sailing-42',
  "Sailing 42": 'sailing-42',
  "38'": 'sailing-38',
  "Sailing Boat 38": 'sailing-38',
  "Sailing 38": 'sailing-38',
};

const scriptTag = '<script src="js/prices.js" defer></script>';

let totalEdits = 0;

files.forEach(function(filename) {
  const filepath = path.join(ROOT, filename);
  if (!fs.existsSync(filepath)) {
    console.log('SKIP (not found):', filename);
    return;
  }

  let html = fs.readFileSync(filepath, 'utf8');
  let edits = 0;

  // 1. Add data-boat to card containers
  // Strategy: find <h4> tags containing boat names, then find their ancestor card div
  // The h4 pattern: <h4 class="...">Luxury Yacht 51'</h4>
  Object.entries(boatIdMap).forEach(function([name, boatId]) {
    // Find all h4 elements with this boat name
    const h4Pattern = new RegExp('<h4[^>]*>' + name.replace(/'/g, "['\u2019]").replace(/\(/g, '\\(').replace(/\)/g, '\\)') + '</h4>', 'g');
    let match;
    while ((match = h4Pattern.exec(html)) !== null) {
      const h4Pos = match.index;

      // Walk backwards to find the nearest card container div
      // Look for the pattern: <div class="w-full bg-white border OR <div class="bg-white border
      // within ~2000 chars before the h4
      const searchStart = Math.max(0, h4Pos - 3000);
      const before = html.substring(searchStart, h4Pos);

      // Find the last card-like div opening before h4
      const cardPatterns = [
        /(<div class="(?:w-full )?bg-white border border-border-light rounded-\[(?:2\.5rem|1\.5rem)\][^"]*")(?!.*data-boat)/g,
      ];

      let lastCardMatch = null;
      let lastCardPos = -1;
      cardPatterns.forEach(function(cp) {
        let cm;
        while ((cm = cp.exec(before)) !== null) {
          if (cm.index > lastCardPos) {
            lastCardMatch = cm;
            lastCardPos = cm.index;
          }
        }
      });

      if (lastCardMatch && !lastCardMatch[0].includes('data-boat')) {
        const absPos = searchStart + lastCardPos;
        const original = lastCardMatch[1];
        const replacement = original.slice(0, -1) + '" data-boat="' + boatId + '"';

        // Only replace this specific occurrence
        html = html.substring(0, absPos) + html.substring(absPos).replace(original, replacement);
        edits++;
      }
    }
  });

  // 2. Add prices.js script tag if not already present
  if (!html.includes('prices.js')) {
    html = html.replace('</body>', scriptTag + '\n</body>');
    edits++;
  }

  if (edits > 0) {
    fs.writeFileSync(filepath, html, 'utf8');
    console.log('UPDATED:', filename, '(' + edits + ' edits)');
    totalEdits += edits;
  } else {
    console.log('NO CHANGES:', filename);
  }
});

console.log('\nTotal edits:', totalEdits);
