import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

# Let's remove the slide-over panel
slide_over_pattern = r"              \{\/\* Slide-over detail panel when activeOrder is present \*\/\}.*?                \<\/\>\n              \)\}"

content = re.sub(slide_over_pattern, "", content, flags=re.DOTALL)

with open('src/App.tsx', 'w') as f:
    f.write(content)
