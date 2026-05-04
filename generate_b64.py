import base64
from PIL import Image

# Resize and compress the template
img = Image.open('strip2_transparent.png')
# Resize to width 800
wpercent = (800/float(img.size[0]))
hsize = int((float(img.size[1])*float(wpercent)))
img = img.resize((800, hsize), Image.Resampling.LANCZOS)
img.save('strip2_small.png', optimize=True)

# Generate base64
with open('strip2_small.png', 'rb') as f:
    b64 = base64.b64encode(f.read()).decode('utf-8')

# Write to a js file
with open('template_b64.js', 'w') as f:
    f.write('const templateBase64 = "data:image/png;base64,' + b64 + '";\n')

print('Done! Saved to template_b64.js')
