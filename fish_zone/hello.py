from PIL import Image, ImageColor
import json
import random

iridescent_colors = [
    "#3646ac",
    "#5177e0",
    "#aa71eb",
    "#fa4ada",
    "#aaddc3",
    "#efc0be",
    "#6feee9",
    "#a5e8d2",
    "#57b7ef",
    "#a851ee",
    "#e4f34e",
    "#7ee65c",
    "#41b8f0",
]

red = (200, 0, 0, 200)
blue = (0, 0, 200, 200)

def createFish(baseColorHex, lineColorHex):
    img = Image.open("base_fish.png") 
    pixels = img.load()
    for i in range(img.size[0]): # for every pixel:
        for j in range(img.size[1]):
            if (pixels[i, j])[3] == 0: # ignore clear pixels
                continue
            if (pixels[i, j])[0] == 0:
                pixels[i, j] = ImageColor.getrgb(baseColorHex)
            else:
                pixels[i, j] = ImageColor.getrgb(lineColorHex)
    return img


def addColorModifier(color):
    color_modifier = random.choice([-1 * 60, 60])
    new_color = color + color_modifier
    if new_color < 0:
        return 0
    if new_color > 255:
        return 255
    return new_color
    
def colorLines(lineColorHex):
    img = Image.open("base_fish.png") 
    pixels = img.load()
    for i in range(img.size[0]): # for every pixel:
        for j in range(img.size[1]):
            if (pixels[i, j])[3] == 0: # ignore clear pixels
                continue
            if (pixels[i, j])[0] == 0:
                color_rgb = ImageColor.getrgb(lineColorHex)
                pixels[i, j] = color_rgb
            else:
                pixels[i, j] = (0, 0, 0, 0)
    return img


def colorBase(baseColorHex):
    img = Image.open("base_fish.png") 
    pixels = img.load()
    for i in range(img.size[0]): # for every pixel:
        for j in range(img.size[1]):
            if (pixels[i, j])[3] == 0: # ignore clear pixels
                continue
            pixels[i, j] = ImageColor.getrgb(baseColorHex)
    return img

def main():
    print("Hello from fish-zone!") 
    for i in range(len(iridescent_colors)):
        fish_base = colorBase(iridescent_colors[i])
        fish_base = fish_base.rotate(90, expand=True)
        fish_base.save(f'bases/fish_{i}.png')
        fish_lines = colorLines(iridescent_colors[i])
        fish_lines = fish_lines.rotate(90, expand=True)
        fish_lines.save(f'lines/fish_{i}.png')
        


if __name__ == "__main__":
    main()
