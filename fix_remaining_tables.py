from pathlib import Path
import re

path = Path('index.html')
text = path.read_text(encoding='utf-8')

# Pattern for preparatory and secondary rows (3 days instead of 6)
# Format: <tr><td>مدرس X</td><td></td>...<td><div class="grade-checkboxes">...</div></td><td></td>...

def process_table_rows(tbody_match):
    tbody_content = tbody_match.group(0)
    
    # Find all <tr> elements
    rows = list(re.finditer(r'<tr>.*?</tr>', tbody_content, re.DOTALL))
    
    new_rows = []
    for row in rows:
        row_text = row.group(0)
        
        # Match preparatory/secondary format (with 3-column prices)
        row_match = re.match(
            r'<tr><td>([^<]+)</td>((?:<td>.*?</td>){6})<td>(<div class="grade-checkboxes">.*?</div>)</td>(?:<td></td>)*</tr>',
            row_text,
            re.DOTALL
        )
        
        if row_match:
            name = row_match.group(1)
            prices = row_match.group(2)
            grades_div = row_match.group(3)
            
            # Count how many days: if 3 prices (7 columns before grades), then 3 days; otherwise 7 days
            prices_count = len(re.findall(r'<td>.*?</td>', prices))
            day_count = 3 if prices_count == 3 else 7
            
            # Build day columns with the grades div
            day_cols = ''.join([
                f'<td>{grades_div.replace("class=\"grade-checkboxes\"", "class=\"grade-checkboxes day-grade\"")}</td>'
                for _ in range(day_count)
            ])
            
            new_row = f'<tr><td>{name}</td>{prices}{day_cols}</tr>'
            new_rows.append(new_row)
        else:
            new_rows.append(row_text)
    
    return '<tbody>\n' + '\n'.join(new_rows) + '\n</tbody>'

# Replace all tbody contents
text = re.sub(r'<tbody>.*?</tbody>', process_table_rows, text, flags=re.DOTALL)

path.write_text(text, encoding='utf-8')
print('Completed: All schedule tables restructured')
