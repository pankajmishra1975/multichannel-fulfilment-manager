with open('src/components/TemplateDesigner.tsx', 'r') as f:
    content = f.read()

import re

# We will move handlePointerMove and handlePointerUp into a useEffect attached to window,
# OR we can just keep them on the canvas but add `window.addEventListener`.
# Actually, the simplest fix for "pointer capture lost" is to use window events.

# Let's check where handlePointerMove and handlePointerUp are defined.
# We can replace them with window event listeners inside a useEffect.
