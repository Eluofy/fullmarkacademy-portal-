from pathlib import Path
import re

path = Path('index.html')
html = path.read_text(encoding='utf-8')

# Define the proper table headers with sub-columns for grade and time
headers = {
    'ابتدائي': {
        'days': 7,
        'prices': ['أولى', 'ثانية', 'ثالثة', 'رابعة', 'خامسة', 'سادسة'],
        'grades': ['الصف الأول', 'الصف الثاني', 'الصف الثالث', 'الصف الرابع', 'الصف الخامس', 'الصف السادس'],
        'day_names': ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت']
    },
    'اعدادي': {
        'days': 3,
        'prices': ['أولى', 'ثانية', 'ثالثة'],
        'grades': ['الصف الأول', 'الصف الثاني', 'الصف الثالث'],
        'day_names': ['الأحد', 'الاثنين', 'الثلاثاء']
    },
    'ثانوي': {
        'days': 3,
        'prices': ['أولى', 'ثانية', 'ثالثة'],
        'grades': ['الصف الأول', 'الصف الثاني', 'الصف الثالث'],
        'day_names': ['الأحد', 'الاثنين', 'الثلاثاء']
    }
}

grade_mapping = {
    'ابتدائي': 'primary',
    'اعدادي': 'preparatory',
    'ثانوي': 'secondary'
}

def build_header(section_name):
    config = headers[section_name]
    grade_type = grade_mapping[section_name]
    
    # First header row
    header1 = '<tr><th rowspan="2">اسم المدرس</th><th rowspan="2">المادة</th>'
    
    # Add price columns
    header1 += '<th colspan="' + str(len(config['prices'])) + '">سعر الحجز</th>'
    
    # Add day columns with colspan=2 (one for grade, one for time)
    header1 += '<th colspan="' + str(config['days'] * 2) + '">أيام الأسبوع</th></tr>'
    
    # Second header row
    header2 = '<tr>'
    
    # Add price sub-headers
    for price in config['prices']:
        header2 += '<th>' + price + '</th>'
    
    # Add day/time pairs
    for day in config['day_names']:
        header2 += '<th>الصف</th><th>التوقيت</th>'
    
    header2 += '</tr>'
    
    return '<thead>' + header1 + header2 + '</thead>'

def build_rows(section_name, num_teachers):
    config = headers[section_name]
    grade_type = grade_mapping[section_name]
    
    rows = '<tbody>\n'
    
    for teacher_num in range(1, num_teachers + 1):
        row = '<tr><td>مدرس ' + str(teacher_num) + '</td><td></td>'
        
        # Add price cells (empty)
        for _ in config['prices']:
            row += '<td></td>'
        
        # Add grade and time cells for each day
        for day_idx in range(config['days']):
            row += '<td><div class="grade-checkboxes">'
            for grade_idx, grade_name in enumerate(config['grades']):
                grade_num = grade_idx + 1
                checkbox_checked = 'checked' if grade_idx < 2 else ''
                row += f'<label><input type="checkbox" name="grade-{grade_type}-{teacher_num}" value="grade{grade_num}" {checkbox_checked}> {grade_name}</label>'
            row += '</div></td>'
            row += '<td><input type="text" class="schedule-time-input" placeholder="التوقيت"></td>'
        
        row += '</tr>\n'
        rows += row
    
    rows += '</tbody>'
    return rows

# Replace primary table
primary_pattern = r'<h3>ابتدائي</h3>.*?<table>.*?</table>'
primary_table = '<h3>ابتدائي</h3>\n          <div class="table-wrapper">\n            <table>\n' + build_header('ابتدائي') + '\n' + build_rows('ابتدائي', 10) + '\n            </table>\n          </div>'
html = re.sub(primary_pattern, primary_table, html, flags=re.DOTALL)

# Replace preparatory table
prep_pattern = r'<h3>اعدادي</h3>.*?<table>.*?</table>'
prep_table = '<h3>اعدادي</h3>\n          <div class="table-wrapper">\n            <table>\n' + build_header('اعدادي') + '\n' + build_rows('اعدادي', 10) + '\n            </table>\n          </div>'
html = re.sub(prep_pattern, prep_table, html, flags=re.DOTALL)

# Replace secondary table
secondary_pattern = r'<h3>ثانوي</h3>.*?<table>.*?</table>'
secondary_table = '<h3>ثانوي</h3>\n          <div class="table-wrapper">\n            <table>\n' + build_header('ثانوي') + '\n' + build_rows('ثانوي', 8) + '\n            </table>\n          </div>'
html = re.sub(secondary_pattern, secondary_table, html, flags=re.DOTALL)

path.write_text(html, encoding='utf-8')
print('تم إعادة بناء جميع الجداول بنجاح')
