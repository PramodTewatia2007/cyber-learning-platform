/**
 * Script to sync YouTube links from YouTube_Links_Manager.xlsx into src/data/youtube_links.json
 *
 * Usage:
 *   node scripts/sync-excel-youtube.mjs [path-to-xlsx]
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const defaultExcelPath = path.join(
  process.env.USERPROFILE || 'C:\\Users\\Pramod',
  'Downloads',
  'YouTube_Links_Manager.xlsx'
);

const excelPath = process.argv[2] || defaultExcelPath;
const outputPath = path.join(__dirname, '..', 'src', 'data', 'youtube_links.json');

console.log('Reading Excel file:', excelPath);

if (!fs.existsSync(excelPath)) {
  console.log(`Excel file not found at ${excelPath}. Skipping.`);
  process.exit(0);
}

// Use python to extract filled links
const pythonScript = `
import zipfile, xml.etree.ElementTree as ET, re, json, sys

excel_path = sys.argv[1]
output_path = sys.argv[2]

try:
    with zipfile.ZipFile(excel_path) as z:
        shared_strings = []
        if 'xl/sharedStrings.xml' in z.namelist():
            tree = ET.fromstring(z.read('xl/sharedStrings.xml'))
            for si in tree.findall('{http://schemas.openxmlformats.org/spreadsheetml/2006/main}si'):
                text = ''.join(t.text for t in si.findall('.//{http://schemas.openxmlformats.org/spreadsheetml/2006/main}t') if t.text)
                shared_strings.append(text)
                
        sheet = ET.fromstring(z.read('xl/worksheets/sheet1.xml'))
        rows = []
        for r in sheet.findall('.//{http://schemas.openxmlformats.org/spreadsheetml/2006/main}row'):
            row_dict = {}
            for c in r.findall('{http://schemas.openxmlformats.org/spreadsheetml/2006/main}c'):
                cell_ref = c.get('r')
                col_letter = re.match(r'([A-Z]+)', cell_ref).group(1)
                v = c.find('{http://schemas.openxmlformats.org/spreadsheetml/2006/main}v')
                val = ''
                if v is not None and v.text is not None:
                    if c.get('t') == 's':
                        val = shared_strings[int(v.text)]
                    else:
                        val = v.text
                row_dict[col_letter] = val
            rows.append(row_dict)

    links_map = {}
    for r in rows[1:]:
        file_id = r.get('F', '').strip()
        yt_url = r.get('E', '').strip()
        clean_title = r.get('D', '').strip()
        if yt_url:
            if file_id:
                links_map[file_id] = yt_url
            if clean_title:
                links_map[clean_title] = yt_url

    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(links_map, f, indent=2)

    print(f"Successfully extracted {len(links_map)} YouTube links to {output_path}")
except Exception as e:
    print(f"Error reading Excel: {e}")
`;

try {
  execSync(`python -c "${pythonScript.replace(/"/g, '\\"')}" "${excelPath}" "${outputPath}"`, {
    stdio: 'inherit',
  });
} catch (err) {
  console.error('Error running python extractor:', err.message);
}
