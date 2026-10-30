import re

with open('src/components/ShippingView.tsx', 'r') as f:
    content = f.read()

replacement_import = """import { 
  Truck, 
  HelpCircle, 
  ChevronRight, 
  Activity, 
  Layers, 
  ArrowRight,
  Calculator,
  Compass,
  Zap,
  CheckCircle
} from 'lucide-react';
import PackagePresetsManager from './PackagePresetsManager';"""

content = content.replace("import {\n  Truck,\n  HelpCircle,\n  ChevronRight,\n  Activity,\n  Layers,\n  ArrowRight,\n  Calculator,\n  Compass,\n  Zap,\n  CheckCircle\n} from 'lucide-react';", replacement_import)

replacement_bottom = """            </div>
          </div>

        </div>

      </div>
      
      <div className="mt-8">
        <PackagePresetsManager unitSystem={unitSystem} />
      </div>

    </div>
  );
}"""

content = re.sub(r'            </div>\n          </div>\n\n        </div>\n\n      </div>\n\n    </div>\n  \);\n\}', replacement_bottom, content)

with open('src/components/ShippingView.tsx', 'w') as f:
    f.write(content)
