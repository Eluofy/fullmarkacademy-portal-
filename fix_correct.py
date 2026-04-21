from pathlib import Path
import re

path = Path('index.html')
html = path.read_text(encoding='utf-8')

# Create proper structure with grades and times together
primary_content = '''<h3>ابتدائي</h3>
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

for i in range(1, 11):
    primary_content += f'\n<tr><td>مدرس {i}</td><td></td><td></td><td></td><td></td><td></td><td></td><td></td>'
    for day in range(7):
        primary_content += f'''<td><div class="grade-checkboxes"><label><input type="checkbox" name="grade-primary-{i}" value="grade1" checked> الصف الأول <input type="text" class="schedule-time-input" placeholder="التوقيت"></label><label><input type="checkbox" name="grade-primary-{i}" value="grade2" checked> الصف الثاني <input type="text" class="schedule-time-input" placeholder="التوقيت"></label><label><input type="checkbox" name="grade-primary-{i}" value="grade3"> الصف الثالث <input type="text" class="schedule-time-input" placeholder="التوقيت"></label><label><input type="checkbox" name="grade-primary-{i}" value="grade4"> الصف الرابع <input type="text" class="schedule-time-input" placeholder="التوقيت"></label><label><input type="checkbox" name="grade-primary-{i}" value="grade5"> الصف الخامس <input type="text" class="schedule-time-input" placeholder="التوقيت"></label><label><input type="checkbox" name="grade-primary-{i}" value="grade6"> الصف السادس <input type="text" class="schedule-time-input" placeholder="التوقيت"></label></div></td>'''
    primary_content += '</tr>'

primary_content += '''
              </tbody>
            </table>
          </div>
        </section>'''

prep_content = '''<h3>اعدادي</h3>
          <div class="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th rowspan="2">اسم المدرس</th>
                  <th rowspan="2">المادة</th>
                  <th colspan="3">سعر الحجز</th>
                  <th colspan="3">أيام الأسبوع</th>
                </tr>
                <tr>
                  <th>أولى</th>
                  <th>ثانية</th>
                  <th>ثالثة</th>
                  <th>الأحد</th>
                  <th>الاثنين</th>
                  <th>الثلاثاء</th>
                </tr>
              </thead>
              <tbody>'''

for i in range(1, 11):
    prep_content += f'\n<tr><td>مدرس {i}</td><td></td><td></td><td></td><td></td>'
    for day in range(3):
        prep_content += f'''<td><div class="grade-checkboxes"><label><input type="checkbox" name="grade-preparatory-{i}" value="grade1" checked> الصف الأول <input type="text" class="schedule-time-input" placeholder="التوقيت"></label><label><input type="checkbox" name="grade-preparatory-{i}" value="grade2" checked> الصف الثاني <input type="text" class="schedule-time-input" placeholder="التوقيت"></label><label><input type="checkbox" name="grade-preparatory-{i}" value="grade3"> الصف الثالث <input type="text" class="schedule-time-input" placeholder="التوقيت"></label></div></td>'''
    prep_content += '</tr>'

prep_content += '''
              </tbody>
            </table>
          </div>
        </section>'''

sec_content = '''<h3>ثانوي</h3>
          <div class="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th rowspan="2">اسم المدرس</th>
                  <th rowspan="2">المادة</th>
                  <th colspan="3">سعر الحجز</th>
                  <th colspan="3">أيام الأسبوع</th>
                </tr>
                <tr>
                  <th>أولى</th>
                  <th>ثانية</th>
                  <th>ثالثة</th>
                  <th>الأحد</th>
                  <th>الاثنين</th>
                  <th>الثلاثاء</th>
                </tr>
              </thead>
              <tbody>'''

for i in range(1, 9):
    sec_content += f'\n<tr><td>مدرس {i}</td><td></td><td></td><td></td><td></td>'
    for day in range(3):
        sec_content += f'''<td><div class="grade-checkboxes"><label><input type="checkbox" name="grade-secondary-{i}" value="grade1" checked> الصف الأول <input type="text" class="schedule-time-input" placeholder="التوقيت"></label><label><input type="checkbox" name="grade-secondary-{i}" value="grade2" checked> الصف الثاني <input type="text" class="schedule-time-input" placeholder="التوقيت"></label><label><input type="checkbox" name="grade-secondary-{i}" value="grade3"> الصف الثالث <input type="text" class="schedule-time-input" placeholder="التوقيت"></label></div></td>'''
    sec_content += '</tr>'

sec_content += '''
              </tbody>
            </table>
          </div>
        </section>'''

# Replace sections in HTML
html = re.sub(r'<h3>ابتدائي</h3>.*?</section>', primary_content, html, flags=re.DOTALL)
html = re.sub(r'<h3>اعدادي</h3>.*?</section>', prep_content, html, flags=re.DOTALL)
html = re.sub(r'<h3>ثانوي</h3>.*?</section>', sec_content, html, flags=re.DOTALL)

path.write_text(html, encoding='utf-8')
print('✓ تم الإصلاح - الجداول بالشكل الصحيح الآن')
