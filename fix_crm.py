content = open('src/components/CrmView.tsx').read()
content = content.replace('import React, { useState, useMemo, useEffect } from "react";\nimport { useCrm } from "../hooks/useCrm"; from \'react\';', 'import React, { useState, useMemo, useEffect } from "react";\nimport { useCrm } from "../hooks/useCrm";')
open('src/components/CrmView.tsx', 'w').write(content)
