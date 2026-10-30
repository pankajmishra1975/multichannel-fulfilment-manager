import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

replacement_import = """import SettingsView from './components/SettingsView';
import EmailSettingsView from './components/EmailSettingsView';"""

content = content.replace("import SettingsView from './components/SettingsView';", replacement_import)

replacement_render = """            {activeTab === 'emails' && (
              <div className="flex-1 min-h-0" id="emails-tab-container">
                <EmailSettingsView />
              </div>
            )}
          </div>"""

content = content.replace("          </div>\n        )}", replacement_render + "\n        )}")

with open('src/App.tsx', 'w') as f:
    f.write(content)
