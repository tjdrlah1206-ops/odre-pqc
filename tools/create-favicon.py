from pathlib import Path
from PIL import Image, ImageDraw
root = Path(__file__).resolve().parents[1]
image = Image.new('RGBA', (64, 64), '#061018')
draw = ImageDraw.Draw(image)
draw.rectangle((15, 13, 49, 51), outline='#a7e8ef', width=3)
draw.line((23, 25, 41, 25), fill='#49c6d6', width=3)
draw.line((32, 25, 32, 42), fill='#49c6d6', width=3)
image.save(root / 'favicon.ico', sizes=[(16, 16), (32, 32), (64, 64)])
