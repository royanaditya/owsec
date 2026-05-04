import re

with open(r'd:\owsec\index.html', 'r', encoding='utf-8') as f:
    content = f.read()

lines = content.splitlines()
for i, line in enumerate(lines):
    if 'letter-arabic' in line:
        lines[i] = '        <p class="letter-arabic">بَارَكَ اللَّهُ فِي عُمْرِك</p>'
    elif 'Happy 22nd birthday' in line:
        lines[i] = '        <p class="letter-greeting">Happy 22nd birthday, my sweetheart 🤍</p>'

with open(r'd:\owsec\index.html', 'w', encoding='utf-8') as f:
    f.write('\n'.join(lines))
print('Done!')
