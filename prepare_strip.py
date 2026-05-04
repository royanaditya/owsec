from PIL import Image

def process_image():
    print("Opening strip2.png...")
    img = Image.open('strip2.png')
    img = img.convert("RGBA")
    
    datas = img.getdata()
    
    newData = []
    print("Processing pixels...")
    for item in datas:
        # Check if green is dominant
        r, g, b, a = item
        if g > 150 and r < 100 and b < 100:
            # Change green pixel to fully transparent
            newData.append((255, 255, 255, 0))
        else:
            newData.append(item)
            
    img.putdata(newData)
    
    output_path = 'strip2_transparent.png'
    print(f"Saving to {output_path}...")
    img.save(output_path, "PNG")
    print("Done!")

if __name__ == "__main__":
    process_image()
