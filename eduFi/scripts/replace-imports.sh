#!/bin/bash

echo "Replacing ~ imports with @ imports..."

# Find all TypeScript and JavaScript files in src directory
find src -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" | while read file; do
  # Replace ~/ with @/ in import statements
  sed -i 's|from '\''~/|from '\''@/|g' "$file"
  sed -i 's|from "~/|from "@/|g' "$file"
  sed -i 's|require('\''~/|require('\''@/|g' "$file"
  sed -i 's|require("~/|require("@/|g' "$file"
  
  echo "Updated: $file"
done

echo "Import replacement completed!"
