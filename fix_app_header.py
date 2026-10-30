import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

# Replace the "Integrate Store Connectors" button with a User Guides button
connectors_btn = r'<button\s*onClick=\{.*?setIsCredentialsOpen\(true\).*?\s*className=.*?"configure-api-btn"\s*>\s*<Settings.*?/>\s*Integrate Store Connectors\s*</button>'
user_guides_btn = """<button
                onClick={() => {
                  if (!openTabs.includes('guide')) {
                    setOpenTabs([...openTabs, 'guide']);
                  }
                  setActiveTab('guide');
                }}
                className="flex items-center gap-1.5 text-xs bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-lg font-semibold transition-all border border-indigo-500 shadow-sm"
                id="open-user-guides-btn"
              >
                <BookOpen className="w-4 h-4 text-white" />
                User Guides
              </button>"""
content = re.sub(connectors_btn, user_guides_btn, content, flags=re.DOTALL)

# Remove the Global Status overview that contains Threshold Limit Warning and Low Stock Warning
status_overview = r'\{/\* Global Status overview inside the top workspace bar \*/\}.*?</div>\s*</div>\s*</div>\s*\{/\* Active View Container Area \*/\}'
replacement = """</div>
          </div>
          {/* Active View Container Area */}"""
content = re.sub(status_overview, replacement, content, flags=re.DOTALL)

with open('src/App.tsx', 'w') as f:
    f.write(content)
