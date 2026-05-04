import json
from PIL import Image

templates_data = []

# Assuming width is always 1875 originally, but we'll calculate dynamically
TARGET_WIDTH = 800

for i in range(1, 7):
    filename = f'template{i}.png'
    print(f'Processing {filename}...')
    try:
        img = Image.open(filename).convert('RGBA')
        width, height = img.size
        
        # Calculate scale
        scale = TARGET_WIDTH / float(width)
        new_height = int(height * scale)
        
        # 1. Detect green pixels in ORIGINAL image
        pixels = img.load()
        green_pixels = []
        for y in range(0, height, 5):
            for x in range(0, width, 5):
                r, g, b, a = pixels[x, y]
                # the green screen color
                if g > 150 and r < 100 and b < 100:
                    green_pixels.append((x, y))
                    
        if not green_pixels:
            print(f'  No green pixels found in {filename}!')
            continue
            
        # Group into regions
        green_pixels.sort(key=lambda p: p[1])
        clusters = []
        current_cluster = [green_pixels[0]]
        
        for p in green_pixels[1:]:
            if p[1] - current_cluster[-1][1] < 150:
                current_cluster.append(p)
            else:
                clusters.append(current_cluster)
                current_cluster = [p]
        clusters.append(current_cluster)
        
        # 2. Make green pixels transparent
        # It's faster to process pixel data directly
        datas = img.getdata()
        newData = []
        for item in datas:
            r, g, b, a = item
            if g > 150 and r < 100 and b < 100:
                newData.append((255, 255, 255, 0))
            else:
                newData.append(item)
        img.putdata(newData)
        
        # 3. Scale down
        img = img.resize((TARGET_WIDTH, new_height), Image.Resampling.LANCZOS)
        
        # Save
        out_name = f'template{i}_trans.png'
        img.save(out_name, "PNG")
        
        # 4. Save scaled regions
        regions = []
        for c in clusters:
            xs = [p[0] for p in c]
            ys = [p[1] for p in c]
            rx, ry, rw, rh = min(xs), min(ys), max(xs)-min(xs), max(ys)-min(ys)
            
            # Scale coordinates
            regions.append({
                'x': int(rx * scale),
                'y': int(ry * scale),
                'w': int(rw * scale),
                'h': int(rh * scale)
            })
            
        templates_data.append({
            'id': i,
            'src': out_name,
            'regions': regions
        })
        print(f'  Saved {out_name} with {len(regions)} regions.')
        
    except Exception as e:
        print(f'Error processing {filename}: {e}')

print('\n--- JS DATA ---')
print(json.dumps(templates_data, indent=2))
