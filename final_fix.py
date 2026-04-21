from pathlib import Path
import re

path = Path('index.html')
html = path.read_text(encoding='utf-8')

# Split into sections and process each separately
sections = html.split('<section class="schedule-section">')
processed = [sections[0]]  # Keep everything before first section

days_map = {
    'ابتدائي': 7,  # 6 grades + 7 days = 7 columns
    'اعدادي': 3,   # 3 grades + 3 days = 3 columns
    'ثانوي': 3,    # 3 grades + 3 days = 3 columns
    'كورسات': 7    # all stages + 7 days
}

for section_text in sections[1:]:
    # Determine which section this is
    section_name = ''
    for name in days_map:
        if f'<h3>{name}</h3>' in section_text:
            section_name = name
            break
    
    if not section_name:
        processed.append('<section class="schedule-section">' + section_text)
        continue
    
    num_days = days_map[section_name]
    
    # Process tbody
    tbody_pattern = r'<tbody>(.*?)</tbody>'
    tbody_match = re.search(tbody_pattern, section_text, re.DOTALL)
    
    if tbody_match:
        tbody_content = tbody_match.group(1)
        # Find all rows
        row_pattern = r'<tr>([^<].*?)</tr>'
        
        def process_row(row_match):
            row_content = row_match.group(0)
            
            # Extract name, prices, and grades div
            # Pattern: <tr><td>name</td><td>...</td>...<td><div class="grade-checkboxes">...</div></td><td></td>...</tr>
            name_match = re.search(r'<tr><td>([^<]+)</td>', row_content)
            if not name_match:
                return row_content
            
            name = name_match.group(1)
            
            # Extract prices (get all td before the grades div)
            prices_match = re.search(r'<tr><td>[^<]+</td>((?:<td>(?!<div)[^<]*</td>)*)', row_content)
            prices = prices_match.group(1) if prices_match else ''
            
            # Extract grades div
            grades_match = re.search(r'<div class="grade-checkboxes">[^<].*?</div>', row_content, re.DOTALL)
            if not grades_match:
                return row_content
            
            grades_div = grades_match.group(0)
            
            # Build new row with grades div repeated for each day
            day_cols = ''.join([
                f'<td>{grades_div.replace("class=\"grade-checkboxes\"", "class=\"grade-checkboxes day-grade\"")}</td>'
                for _ in range(num_days)
            ])
            
            new_row = f'<tr><td>{name}</td>{prices}{day_cols}</tr>'
            return new_row
        
        new_tbody = re.sub(r'<tr>.*?</tr>', process_row, tbody_content, flags=re.DOTALL)
        new_section = section_text.replace(tbody_match.group(0), f'<tbody>{new_tbody}</tbody>')
        processed.append('<section class="schedule-section">' + new_section)
    else:
        processed.append('<section class="schedule-section">' + section_text)

html = ''.join(processed)
path.write_text(html, encoding='utf-8')
print('Fixed all remaining schedule tables')
