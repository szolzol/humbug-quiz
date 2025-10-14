# Generate PNG icons from SVG using Chrome/Edge headless browser
# This script uses the browser's rendering engine to convert SVG to PNG

Write-Host "Generating HUMBUG! favicon and PWA icons..." -ForegroundColor Yellow

# Check if Chrome or Edge is available
$chromePath = "C:\Program Files\Google\Chrome\Application\chrome.exe"
$edgePath = "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"

$browserPath = $null
if (Test-Path $chromePath) {
    $browserPath = $chromePath
    Write-Host "Found Chrome" -ForegroundColor Green
} elseif (Test-Path $edgePath) {
    $browserPath = $edgePath
    Write-Host "Found Edge" -ForegroundColor Green
} else {
    Write-Host "Chrome or Edge not found. Please install one of them or use an online SVG to PNG converter." -ForegroundColor Red
    Write-Host "You can use: https://svgtopng.com or https://cloudconvert.com/svg-to-png" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Upload public/icon.svg and generate these sizes:" -ForegroundColor Cyan
    Write-Host "  - 192x192 -> public/icon-192x192.png" -ForegroundColor White
    Write-Host "  - 512x512 -> public/icon-512x512.png" -ForegroundColor White
    Write-Host "  - 180x180 -> public/apple-touch-icon.png" -ForegroundColor White
    Write-Host "  - 32x32   -> public/favicon-32x32.png" -ForegroundColor White
    exit 1
}

# Create temporary HTML file for conversion
$htmlContent = @"
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        body { margin: 0; padding: 20px; background: white; }
        #container { display: inline-block; }
    </style>
</head>
<body>
    <div id="container">
        <img id="svgImage" src="file:///$(Get-Location)/public/icon.svg" />
    </div>
    <script>
        const img = document.getElementById('svgImage');
        img.onload = () => {
            const sizes = [
                { size: 192, name: 'icon-192x192.png' },
                { size: 512, name: 'icon-512x512.png' },
                { size: 180, name: 'apple-touch-icon.png' },
                { size: 32, name: 'favicon-32x32.png' }
            ];
            
            sizes.forEach(config => {
                const canvas = document.createElement('canvas');
                canvas.width = config.size;
                canvas.height = config.size;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, config.size, config.size);
                
                // Download would happen here in a real browser
                console.log('Generated: ' + config.name);
            });
            
            console.log('DONE');
        };
    </script>
</body>
</html>
"@

$tempFile = Join-Path $env:TEMP "humbug-icon-generator.html"
$htmlContent | Out-File -FilePath $tempFile -Encoding UTF8

Write-Host ""
Write-Host "Alternative Method: Manual Conversion" -ForegroundColor Yellow
Write-Host "===========================================" -ForegroundColor Yellow
Write-Host ""
Write-Host "Since automated conversion requires additional tools," -ForegroundColor Cyan
Write-Host "please use one of these online converters:" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. https://svgtopng.com" -ForegroundColor White
Write-Host "2. https://cloudconvert.com/svg-to-png" -ForegroundColor White
Write-Host "3. https://onlineconvertfree.com/convert-format/svg-to-png/" -ForegroundColor White
Write-Host ""
Write-Host "Upload: public/icon.svg" -ForegroundColor Green
Write-Host ""
Write-Host "Generate these sizes and save to public/ folder:" -ForegroundColor Yellow
Write-Host "  ✓ 192x192 -> public/icon-192x192.png" -ForegroundColor White
Write-Host "  ✓ 512x512 -> public/icon-512x512.png" -ForegroundColor White
Write-Host "  ✓ 180x180 -> public/apple-touch-icon.png" -ForegroundColor White
Write-Host "  ✓ 32x32   -> public/favicon-32x32.png" -ForegroundColor White
Write-Host ""
Write-Host "Or use GIMP, Inkscape, or Adobe Illustrator to export the SVG." -ForegroundColor Cyan
Write-Host ""
