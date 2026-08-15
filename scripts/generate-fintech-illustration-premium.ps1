Add-Type -AssemblyName System.Drawing

$size = 1024
$bitmap = New-Object System.Drawing.Bitmap($size, $size, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
$graphics = [System.Drawing.Graphics]::FromImage($bitmap)
$graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$graphics.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
$graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$graphics.Clear([System.Drawing.Color]::Transparent)

function Color([string]$hex, [int]$alpha = 255) {
  $base = [System.Drawing.ColorTranslator]::FromHtml($hex)
  return [System.Drawing.Color]::FromArgb($alpha, $base.R, $base.G, $base.B)
}
function Solid([string]$hex, [int]$alpha = 255) { New-Object System.Drawing.SolidBrush((Color $hex $alpha)) }
function Gradient([System.Drawing.RectangleF]$rect, [string]$start, [string]$end, [float]$angle = 45) {
  New-Object System.Drawing.Drawing2D.LinearGradientBrush($rect, (Color $start), (Color $end), $angle)
}
function RoundRect([float]$x,[float]$y,[float]$width,[float]$height,[float]$radius) {
  $path = New-Object System.Drawing.Drawing2D.GraphicsPath
  $diameter = $radius * 2
  $path.AddArc($x,$y,$diameter,$diameter,180,90)
  $path.AddArc($x+$width-$diameter,$y,$diameter,$diameter,270,90)
  $path.AddArc($x+$width-$diameter,$y+$height-$diameter,$diameter,$diameter,0,90)
  $path.AddArc($x,$y+$height-$diameter,$diameter,$diameter,90,90)
  $path.CloseFigure()
  return $path
}

# Ambient orbit and bubbles.
$orbitPen = New-Object System.Drawing.Pen((Color '#7DECF5' 110), 22)
$graphics.DrawArc($orbitPen, 170, 100, 720, 720, 196, 238)
$graphics.FillEllipse((Solid '#7DECF5' 80), 610, 80, 210, 210)
$graphics.FillEllipse((Solid '#1AD2E3' 95), 120, 520, 150, 150)
$graphics.FillEllipse((Solid '#2DA9F5' 95), 780, 570, 112, 112)

# Floor shadow.
$shadowPath = New-Object System.Drawing.Drawing2D.GraphicsPath
$shadowPath.AddEllipse(210, 756, 650, 145)
$shadowBrush = Gradient ([System.Drawing.RectangleF]::new(210,756,650,145)) '#0A3D91' '#209BEA' 0
$graphics.FillPath($shadowBrush, $shadowPath)

# Coin stacks behind the vault.
$coinDark = Solid '#F5A51C'; $coinMid = Solid '#FFBD3F'; $coinLight = Solid '#FFE18A'
foreach ($coin in @(@(650,270,150),@(730,335,122),@(604,355,132))) {
  $x=$coin[0];$y=$coin[1];$w=$coin[2]
  $graphics.FillRectangle($coinDark,$x,$y+28,$w,90)
  $graphics.FillEllipse($coinMid,$x,$y+70,$w,58)
  $graphics.FillEllipse($coinLight,$x,$y,$w,58)
  $graphics.FillEllipse($coinMid,$x+15,$y+13,$w-30,34)
}

# Main safe, with softer premium geometry.
$safeRect = [System.Drawing.RectangleF]::new(225,280,590,520)
$safePath = RoundRect 225 280 590 520 100
$safeGradient = Gradient $safeRect '#1478E5' '#0848B8' 55
$graphics.FillPath($safeGradient,$safePath)

# Rim highlight clipped into the top half.
$highlight = New-Object System.Drawing.Drawing2D.GraphicsPath
$highlight.AddArc(245,300,160,160,180,90); $highlight.AddArc(635,300,160,160,270,90)
$highlight.AddLine(795,380,795,510); $highlight.AddBezier(795,510,650,430,395,430,245,535)
$highlight.AddLine(245,380,245,380); $highlight.CloseFigure()
$highlightBrush = Gradient ([System.Drawing.RectangleF]::new(245,300,550,235)) '#39B7F7' '#1675DF' 90
$graphics.FillPath($highlightBrush,$highlight)

# Soft gloss strip.
$gloss = RoundRect 285 323 410 38 19
$graphics.FillPath((Solid '#FFFFFF' 42),$gloss)

# Vault door layered rings.
$graphics.FillEllipse((Solid '#062E78' 110), 292, 370, 456, 368)
$doorGradient = Gradient ([System.Drawing.RectangleF]::new(305,350,430,400)) '#0B4BB6' '#052F7F' 90
$graphics.FillEllipse($doorGradient,305,350,430,400)
$graphics.FillEllipse((Solid '#0E70D8'),344,389,352,322)
$graphics.FillEllipse((Solid '#DBF8FF'),371,416,298,268)
$innerGradient = Gradient ([System.Drawing.RectangleF]::new(398,440,244,220)) '#28BDF2' '#0B69D5' 40
$graphics.FillEllipse($innerGradient,398,440,244,220)

# Dial hub and six handles.
$handlePen = New-Object System.Drawing.Pen((Color '#063B96'), 24)
$handlePen.StartCap=[System.Drawing.Drawing2D.LineCap]::Round; $handlePen.EndCap=[System.Drawing.Drawing2D.LineCap]::Round
$cx=520;$cy=550;$r1=52;$r2=108
foreach($angle in @(0,60,120,180,240,300)){
  $rad=$angle*[Math]::PI/180
  $x1=$cx+[Math]::Cos($rad)*$r1; $y1=$cy+[Math]::Sin($rad)*$r1
  $x2=$cx+[Math]::Cos($rad)*$r2; $y2=$cy+[Math]::Sin($rad)*$r2
  $graphics.DrawLine($handlePen,$x1,$y1,$x2,$y2)
}
$graphics.FillEllipse((Solid '#063B96'),462,492,116,116)
$graphics.FillEllipse((Solid '#2ED0EB'),489,519,62,62)

# Side hinge and locking accents.
$hinge = RoundRect 730 415 46 225 23
$graphics.FillPath((Solid '#063B96'),$hinge)
$graphics.FillEllipse((Solid '#56DFF0'),739,436,28,28)
$graphics.FillEllipse((Solid '#56DFF0'),739,589,28,28)

# Feet with cyan undershine.
foreach($x in @(302,665)){
  $foot = RoundRect $x 765 106 70 24
  $graphics.FillPath((Solid '#063B96'),$foot)
  $graphics.FillEllipse((Solid '#20D4E6' 100),$x+12,817,82,20)
  $foot.Dispose()
}

# Floating sparkle diamonds and dots.
function Diamond([float]$x,[float]$y,[float]$s,[string]$hex){
  $p=New-Object System.Drawing.Drawing2D.GraphicsPath
  $p.AddPolygon([System.Drawing.PointF[]]@([System.Drawing.PointF]::new($x,$y-$s),[System.Drawing.PointF]::new($x+$s,$y),[System.Drawing.PointF]::new($x,$y+$s),[System.Drawing.PointF]::new($x-$s,$y)))
  $graphics.FillPath((Solid $hex),$p);$p.Dispose()
}
Diamond 230 250 25 '#FFFFFF'; Diamond 852 420 22 '#70F0F3'; Diamond 746 170 18 '#FFFFFF'
$graphics.FillEllipse((Solid '#0B61CE'),157,362,46,46)
$graphics.FillEllipse((Solid '#FFFFFF'),171,376,18,18)

$outputDirectory = Join-Path $PSScriptRoot '..\output\illustrations'
New-Item -ItemType Directory -Force -Path $outputDirectory | Out-Null
$outputPath = Join-Path $outputDirectory 'fintech-savings-safe-premium.png'
$bitmap.Save($outputPath,[System.Drawing.Imaging.ImageFormat]::Png)

@($orbitPen,$shadowPath,$shadowBrush,$coinDark,$coinMid,$coinLight,$safePath,$safeGradient,$highlight,$highlightBrush,$gloss,$doorGradient,$innerGradient,$handlePen,$hinge,$graphics,$bitmap) | ForEach-Object { if($_){$_.Dispose()} }
Write-Output (Resolve-Path $outputPath)
