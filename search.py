with open('index.html', 'r', encoding='utf-8') as f:
    text = f.read()

lines = text.splitlines()
for i, line in enumerate(lines):
    if 'envelope' in line and 'onclick' in line:
        print(f'{i}: {line.strip()}')
    if 'function ' in line and 'open' in line:
        print(f'{i}: {line.strip()}')
