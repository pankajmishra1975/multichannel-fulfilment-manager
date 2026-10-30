#!/bin/bash
sed -i '/<div className="flex items-center gap-2 shrink-0">/,/<\/div>/d' src/components/PrinterSettingsView.tsx
