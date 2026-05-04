with open('index.html', 'r', encoding='utf-8') as f:
    text = f.read()

import re

# 1. Update the .page CSS class to include the jeans texture
jeans_texture = """
    .page {
      position: fixed;
      inset: 0;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      opacity: 0;
      pointer-events: none;
      transition: opacity 0.8s ease;
      background-color: #2b4566; /* Denim blue base */
      background-image: 
        repeating-linear-gradient(45deg, rgba(255,255,255,0.03) 0px, rgba(255,255,255,0.03) 1px, transparent 1px, transparent 3px),
        repeating-linear-gradient(-45deg, rgba(0,0,0,0.08) 0px, rgba(0,0,0,0.08) 1px, transparent 1px, transparent 3px),
        url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.25'/%3E%3C/svg%3E");
    }
"""

# Replace the original .page definition
text = re.sub(r'\.page\s*\{[^}]*\}', jeans_texture.strip(), text, count=1)

# 2. Remove backgrounds from #page0, #page1, #page2, #page3
text = re.sub(r'#page0\s*\{\s*background:[^;]+;\s*\}', '#page0 {\n      /* background removed for global jeans texture */\n    }', text)
text = re.sub(r'#page1\s*\{\s*background:[^;]+;\s*\}', '#page1 {\n      /* background removed for global jeans texture */\n    }', text)
text = re.sub(r'#page2\s*\{(\s*)background:[^;]+;', r'#page2 {\g<1>/* background removed */', text)
text = re.sub(r'#page3\s*\{(\s*)background:[^;]+;', r'#page3 {\g<1>/* background removed */', text)

# 3. Text color fixes for dark background
# page1-title is currently var(--mauve) probably. Let's make sure it's light.
text = re.sub(r'(\.page1-title\s*\{[^\}]*)color:\s*var\(--mauve\);', r'\1color: var(--cream);', text)

# p3-message is currently var(--mauve) probably. Let's make sure it's light.
text = re.sub(r'(\.p3-message\s*\{[^\}]*)color:\s*var\(--mauve\);', r'\1color: var(--cream);', text)

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(text)
print('Done!')
