with open('index.html', 'r', encoding='utf-8') as f:
    text = f.read()
import re
for i, line in enumerate(text.splitlines(), 1):
    if line.count('"') % 2 != 0:
        print(f'Odd number of quotes at line {i}: {line}')
