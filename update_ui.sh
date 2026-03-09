#!/bin/bash

# Modify tailwind.config.js to include some custom design tokens if needed, but we can do it with inline Tailwind utility classes.
# We will rewrite app.html to have a highly polished, Vercel-like interface:
# - Header: minimal border-b, white background, black text.
# - Background: bg-[#fafafa] or bg-gray-50
# - Cards: bg-white border border-gray-200 shadow-sm rounded-lg.
# - Inputs: focus:ring-black focus:border-black rounded-md.
# - Buttons: bg-black text-white hover:bg-gray-800 rounded-md shadow-sm.

# Using sed or perl to replace the indigo theme with a minimal monochromatic theme
sed -i 's/bg-indigo-600/bg-black/g' src/app/app.html
sed -i 's/hover:bg-indigo-700/hover:bg-gray-800/g' src/app/app.html
sed -i 's/focus:ring-indigo-300/focus:ring-gray-300/g' src/app/app.html
sed -i 's/focus:ring-indigo-500/focus:ring-black/g' src/app/app.html
sed -i 's/focus:border-indigo-500/focus:border-black/g' src/app/app.html
sed -i 's/text-indigo-600/text-black/g' src/app/app.html
sed -i 's/text-indigo-800/text-gray-900/g' src/app/app.html
sed -i 's/bg-indigo-50/bg-gray-100/g' src/app/app.html
sed -i 's/text-indigo-400/text-gray-400/g' src/app/app.html
sed -i 's/active:bg-indigo-800/active:bg-black/g' src/app/app.html

# Header adjustments
sed -i 's/bg-black text-white shadow-md sticky top-0 z-50/bg-white text-black border-b border-gray-200 sticky top-0 z-50/g' src/app/app.html
# Wait, the first sed changed bg-indigo-600 to bg-black. Now we change it to bg-white.
# Let's actually just rewrite app.html fully to guarantee a premium look.

