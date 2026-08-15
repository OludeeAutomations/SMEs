Add-Type -AssemblyName System.Drawing

$size = 768
$bitmap = New-Object System.Drawing.Bitmap($size, $size, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
$graphics = [System.Drawing.Graphics]::FromImage($bitmap)
$graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$graphics.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
$graphics.Clear([System.Drawing.Color]::Transparent)

function Brush([string]$hex) {
  return New-Object System.Drawing.SolidBrush([System.Drawing.ColorTranslator]::FromHtml($hex))
}

$navy = Brush '#083B8C'
$blue = Brush '#1264D7'
$azure = Brush '#2096E8'
$cyan = Brush '#17D4E5'
$light = Brush '#A9F3F5'
$white = Brush '#FFFFFF'
$shadow = Brush '#0A56B8'
$gold = Brush '#FFB83E'
$goldLight = Brush '#FFD778'

# Soft abstract backing bubbles.
$graphics.FillEllipse($light, 390, 185, 265, 265)
$graphics.FillEllipse($cyan, 292, 280, 190, 190)
$graphics.FillEllipse($azure, 470, 85, 128, 128)

# Coin stack behind the safe.
$graphics.FillEllipse($goldLight, 472, 205, 152, 62)
$graphics.FillRectangle($gold, 472, 233, 152, 83)
$graphics.FillEllipse($gold, 472, 275, 152, 62)
$graphics.FillEllipse($goldLight, 472, 246, 152, 55)

# Main rounded safe body.
$safe = New-Object System.Drawing.Drawing2D.GraphicsPath
$safe.AddArc(220, 280, 125, 125, 180, 90)
$safe.AddArc(515, 280, 125, 125, 270, 90)
$safe.AddArc(515, 505, 125, 125, 0, 90)
$safe.AddArc(220, 505, 125, 125, 90, 90)
$safe.CloseFigure()
$graphics.FillPath($blue, $safe)

# Safe top highlight and bottom depth.
$graphics.FillEllipse($azure, 258, 306, 344, 205)
$graphics.FillEllipse($shadow, 258, 397, 344, 205)
$graphics.FillEllipse($navy, 283, 330, 294, 246)
$graphics.FillEllipse($white, 317, 363, 226, 178)
$graphics.FillEllipse($azure, 340, 382, 180, 142)

# Vault dial center and spokes.
$graphics.FillEllipse($navy, 395, 422, 70, 70)
$pen = New-Object System.Drawing.Pen([System.Drawing.ColorTranslator]::FromHtml('#083B8C'), 18)
$pen.StartCap = [System.Drawing.Drawing2D.LineCap]::Round
$pen.EndCap = [System.Drawing.Drawing2D.LineCap]::Round
$graphics.DrawLine($pen, 430, 390, 430, 420)
$graphics.DrawLine($pen, 430, 494, 430, 522)
$graphics.DrawLine($pen, 365, 457, 397, 457)
$graphics.DrawLine($pen, 463, 457, 495, 457)

# Small shine accents.
$graphics.FillEllipse($white, 328, 255, 44, 44)
$graphics.FillEllipse($cyan, 612, 358, 72, 72)
$graphics.FillEllipse($white, 634, 380, 28, 28)

# Feet.
$graphics.FillRectangle($navy, 287, 596, 72, 42)
$graphics.FillRectangle($navy, 500, 596, 72, 42)

$outputDirectory = Join-Path $PSScriptRoot '..\output\illustrations'
New-Item -ItemType Directory -Force -Path $outputDirectory | Out-Null
$outputPath = Join-Path $outputDirectory 'fintech-savings-safe.png'
$bitmap.Save($outputPath, [System.Drawing.Imaging.ImageFormat]::Png)

$pen.Dispose()
$safe.Dispose()
$graphics.Dispose()
$bitmap.Dispose()
@($navy, $blue, $azure, $cyan, $light, $white, $shadow, $gold, $goldLight) | ForEach-Object { $_.Dispose() }

Write-Output (Resolve-Path $outputPath)
