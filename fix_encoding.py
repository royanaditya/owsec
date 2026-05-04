with open(r'd:\owsec\index.html', 'rb') as f:
    raw = f.read()

# The corruption pattern:
# Original UTF-8 byte e2 was encoded as â (c3 a2) 
# Original byte 94 was encoded as " (e2 80 9c) -- but shifted
# Actually, the bytes got treated as cp1252, converted to Unicode, then encoded as UTF-8
# e2 in cp1252 = â (U+00E2), 80 in cp1252 = € (U+20AC), 94 in cp1252 = " (U+201C)
# So e2 94 80 (─) became â"€ 

# Fix: decode as UTF-8 to get the garbled text, then encode each char 
# through cp1252 to recover original bytes, then decode as UTF-8

text = raw.decode('utf-8')

# We need to reverse: for each char, get its cp1252 byte value, then collect bytes and decode as UTF-8
result = []
i = 0
chars = list(text)
while i < len(chars):
    c = chars[i]
    cp = ord(c)
    
    # Check if this could be a garbled multi-byte sequence
    # cp1252 maps: 0x80-0x9F have special chars, 0xA0-0xFF map to same Unicode
    try:
        b = c.encode('cp1252')
        if len(b) == 1 and b[0] >= 0x80:
            # This might be part of a garbled UTF-8 sequence
            # Collect up to 4 bytes
            byte_buf = bytearray([b[0]])
            j = i + 1
            while j < len(chars) and len(byte_buf) < 4:
                try:
                    nb = chars[j].encode('cp1252')
                    if len(nb) == 1 and nb[0] >= 0x80:
                        byte_buf.append(nb[0])
                        j += 1
                    else:
                        break
                except:
                    break
            
            # Try to decode the collected bytes as UTF-8
            try:
                decoded = bytes(byte_buf).decode('utf-8')
                result.append(decoded)
                i = j
                continue
            except:
                pass
    except:
        pass
    
    result.append(c)
    i += 1

fixed = ''.join(result)
fixed = fixed.replace('\r', '')

with open(r'd:\owsec\index.html', 'w', encoding='utf-8', newline='\n') as f:
    f.write(fixed)

# Verify
count = sum(1 for c in fixed if ord(c) == 0xe2)  # â
print(f"Done. File size: {len(fixed)} chars")
print(f"Remaining garbled â: {fixed.count(chr(0xe2))}")

# Check one of the comments
for i, line in enumerate(fixed.split('\n'), 1):
    if 'PAGES' in line:
        print(f"Line {i}: {line.strip()}")
        break
