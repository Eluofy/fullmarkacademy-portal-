from pathlib import Path
import re

path = Path(r'c:\Users\modyp\OneDrive\Desktop\FullMarkAcademy\index.html')
text = path.read_text(encoding='utf-8')

def repl(match):
    repl.counter += 1
    content = match.group(1)
    if repl.counter == 1:
        return f'<td><input type="text" class="schedule-table-input" value="{content}" placeholder="اسم المدرس"></td>'
    elif repl.counter == 2:
        return f'<td><input type="text" class="schedule-table-input" value="{content}" placeholder="المادة"></td>'
    else:
        return f'<td><input type="text" class="schedule-table-input" value="{content}" placeholder="سعر الحجز"></td>'

pattern = re.compile(r'<td\s+contenteditable="true">(.*?)</td>', re.DOTALL)

rows = text.split('<tr>')
for i in range(1, len(rows)):
    repl.counter = 0
    rows[i] = pattern.sub(repl, rows[i], count=8)

new_text = '<tr>'.join(rows)
path.write_text(new_text, encoding='utf-8')
print('done')
