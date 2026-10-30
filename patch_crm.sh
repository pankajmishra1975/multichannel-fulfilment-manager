#!/bin/bash
sed -i 's/import React, { useState, useMemo, useEffect }/import React, { useState, useMemo, useEffect } from "react";\nimport { useCrm } from "..\/hooks\/useCrm";/g' src/components/CrmView.tsx

# Wait, the first sed might be tricky. Let's just do it with python.
python3 -c "
import sys
content = open('src/components/CrmView.tsx').read()
content = content.replace('import React, { useState, useMemo, useEffect } from \'react\';', 'import React, { useState, useMemo, useEffect } from \'react\';\nimport { useCrm } from \'../hooks/useCrm\';')
open('src/components/CrmView.tsx', 'w').write(content)
"
