from PIL import Image

input_path = "C:/Users/HP/.gemini/antigravity-ide/brain/63d44d43-7970-4636-a17d-ca4658f553aa/media__1786431421596.jpg"

raw_img = Image.open(input_path)
raw_img.convert("RGB").save("public/logo-original.jpg")

img = raw_img.convert("RGBA")
width, height = img.size

# Make transparent background (convert near-white background pixels to RGBA 0)
datas = img.getdata()
newData = []
for item in datas:
    # Check if pixel is close to white (R>240, G>240, B>240)
    if item[0] > 235 and item[1] > 235 and item[2] > 235:
        newData.append((255, 255, 255, 0))
    else:
        newData.append(item)

transparent_img = Image.new("RGBA", img.size)
transparent_img.putdata(newData)

# Save full transparent logo
transparent_img.save("public/logo.png")

# Crop Icon only (top portion with stylized D)
icon_crop = transparent_img.crop((0, 0, width, int(height * 0.62)))
bbox = icon_crop.getbbox()
if bbox:
    icon_cropped = icon_crop.crop(bbox)
    icon_cropped.save("public/logo-icon.png")
    
    # Create favicon.ico
    max_dim = max(icon_cropped.size)
    icon_square = Image.new("RGBA", (max_dim, max_dim), (255, 255, 255, 0))
    offset = ((max_dim - icon_cropped.width) // 2, (max_dim - icon_cropped.height) // 2)
    icon_square.paste(icon_cropped, offset)
    icon_square.save("public/favicon.ico", format="ICO", sizes=[(32,32), (64,64)])

print("Successfully generated all logo assets!")
