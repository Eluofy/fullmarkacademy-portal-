from pathlib import Path
import re

path = Path('index.html')
html = path.read_text(encoding='utf-8')

primary_header = '''<h3>ابتدائي</h3>
          <div class="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th rowspan="2">اسم المدرس</th>
                  <th rowspan="2">المادة</th>
                  <th colspan="6">سعر الحجز</th>
                  <th colspan="7">أيام الأسبوع</th>
                </tr>
                <tr>
                  <th>أولى</th>
                  <th>ثانية</th>
                  <th>ثالثة</th>
                  <th>رابعة</th>
                  <th>خامسة</th>
                  <th>سادسة</th>
                  <th>الأحد</th>
                  <th>الاثنين</th>
                  <th>الثلاثاء</th>
                  <th>الأربعاء</th>
                  <th>الخميس</th>
                  <th>الجمعة</th>
                  <th>السبت</th>
                </tr>
              </thead>
              <tbody>'''

row_template = '''<tr><td>{label}</td><td></td><td></td><td></td><td></td><td></td><td></td><td></td>{days}</tr>'''

def build_day_cells(section, teacher_num):
    grades = []
    if section == 'اعدادي':
        grades = [
            ('grade1', 'الصف الأول'),
            ('grade2', 'الصف الثاني'),
            ('grade3', 'الصف الثالث')
        ]
    elif section == 'ثانوي':
        grades = [
            ('grade1', 'الصف الأول'),
            ('grade2', 'الصف الثاني'),
            ('grade3', 'الصف الثالث')
        ]
    else:
        grades = [
            ('grade1', 'الصف الأول'),
            ('grade2', 'الصف الثاني'),
            ('grade3', 'الصف الثالث'),
            ('grade4', 'الصف الرابع'),
            ('grade5', 'الصف الخامس'),
            ('grade6', 'الصف السادس')
        ]

    day_cells = ''
    for day in range(7):
        checkbox_html = '<div class="grade-checkboxes">'
        for value, title in grades:
            checked = ' checked' if value in ('grade1', 'grade2') else ''
            checkbox_html += f'<label><input type="checkbox" name="grade-{section}-{teacher_num}" value="{value}"{checked}> {title} <input type="text" class="schedule-time-input" placeholder="التوقيت"></label>'
        checkbox_html += '</div>'
        day_cells += f'<td>{checkbox_html}</td>'
    return day_cells

section_pattern = re.compile(r'(<section class="schedule-section">\s*<h3>اعدادي</h3>.*?<table>).*?</table>.*?</section>', re.DOTALL)

new_prep_section = primary_header + '\n'
for i in range(1, 11):
    new_prep_section += row_template.format(label=f'مدرس {i}', days=build_day_cells('اعدادي', i)) + '\n'
new_prep_section += '              </tbody>\n            </table>\n          </div>\n        </section>'

html = re.sub(section_pattern, '<section class="schedule-section">\n          ' + new_prep_section, html, count=1)

section_pattern = re.compile(r'(<section class="schedule-section">\s*<h3>ثانوي</h3>.*?<table>).*?</table>.*?</section>', re.DOTALL)
new_sec_section = primary_header + '\n'
for i in range(1, 9):
    new_sec_section += row_template.format(label=f'مدرس {i}', days=build_day_cells('ثانوي', i)) + '\n'
new_sec_section += '              </tbody>\n            </table>\n          </div>\n        </section>'

html = re.sub(section_pattern, '<section class="schedule-section">\n          ' + new_sec_section, html, count=1)

path.write_text(html, encoding='utf-8')
print('جدول الاعدادي والثانوي تم تزامنهما مع جدول الابتدائي')
