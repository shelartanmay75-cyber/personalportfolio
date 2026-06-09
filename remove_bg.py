from PIL import Image
import numpy as np

img = Image.open("profile.jpg").convert("RGBA")
data = np.array(img)

r, g, b, a = data[:,:,0], data[:,:,1], data[:,:,2], data[:,:,3]

# Mask: pixels that are near-white (background)
threshold = 230
mask = (r > threshold) & (g > threshold) & (b > threshold)

# Make those pixels transparent
data[mask] = [0, 0, 0, 0]

result = Image.fromarray(data)
result.save("profile_nobg.png")
print("Saved profile_nobg.png successfully!")
