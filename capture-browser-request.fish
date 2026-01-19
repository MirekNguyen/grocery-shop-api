#!/usr/bin/env fish

# Script to help capture and test browser request
# Run this after copying cURL from browser DevTools

echo "📋 Foodora Browser Request Capture Helper"
echo "=========================================="
echo ""
echo "STEPS:"
echo "1. Open https://www.foodora.cz in your browser"
echo "2. Open DevTools (F12) → Network tab"
echo "3. Click 'Preserve log'"
echo "4. Navigate to: Potraviny → Drůbež (or any subcategory)"
echo "5. Filter network by 'graphql'"
echo "6. Find POST to cz.fd-api.com/api/v5/graphql"
echo "7. Right-click → Copy → Copy as cURL (bash)"
echo "8. Paste the cURL command below and save to: working-request.sh"
echo ""
echo "Then run:"
echo "  bash working-request.sh | jq . > working-response.json"
echo ""
echo "This will save the working response so we can compare!"
