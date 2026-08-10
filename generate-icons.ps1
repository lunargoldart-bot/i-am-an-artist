Add-Type -AssemblyName System.Drawing

$ROOT  = "C:\Users\PC\Downloads\I-Am-An-Artist-Firebase-Migrated(1)\i-am-an-artist"
$SRC   = "$ROOT\public\logo.png"
$img   = [System.Drawing.Image]::FromFile($SRC)
$BG    = [System.Drawing.Color]::FromArgb(10,10,10)

function New-Icon([string]$Path,[int]$Px) {
  $bmp = New-Object System.Drawing.Bitmap($Px,$Px)
  $g = [System.Drawing.Graphics]::FromImage($bmp)
  $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
  $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
  $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
  $g.Clear($BG)
  $g.DrawImage($img,0,0,$Px,$Px)
  $g.Dispose()
  $bmp.Save($Path,[System.Drawing.Imaging.ImageFormat]::Png)
  $bmp.Dispose()
}

function New-IconTransparent([string]$Path,[int]$Px) {
  $bmp = New-Object System.Drawing.Bitmap($Px,$Px)
  $g = [System.Drawing.Graphics]::FromImage($bmp)
  $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
  $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
  $g.Clear([System.Drawing.Color]::FromArgb(0,0,0,0))
  $g.DrawImage($img,0,0,$Px,$Px)
  $g.Dispose()
  $bmp.Save($Path,[System.Drawing.Imaging.ImageFormat]::Png)
  $bmp.Dispose()
}

$RES     = "$ROOT\android\app\src\main\res"
$MAPDIR  = "$RES\values"
$ANYDPI  = "$RES\mipmap-anydpi-v26"
$DRAW    = "$RES\drawable"

New-Item -ItemType Directory -Path $MAPDIR,$ANYDPI,$DRAW -Force | Out-Null

# values/ic_launcher_background.xml
@"
<?xml version="1.0" encoding="utf-8"?>
<resources>
    <color name="ic_launcher_background">#0A0A0A</color>
</resources>
"@ | Set-Content "$MAPDIR\ic_launcher_background.xml"

# mipmap-anydpi-v26/ic_launcher.xml
@"
<?xml version="1.0" encoding="utf-8"?>
<adaptive-icon xmlns:android="http://schemas.android.com/apk/res/android">
    <background android:drawable="@color/ic_launcher_background"/>
    <foreground android:drawable="@drawable/ic_launcher_foreground"/>
</adaptive-icon>
"@ | Set-Content "$ANYDPI\ic_launcher.xml"

# drawable/splash_screen.xml
@"
<?xml version="1.0" encoding="utf-8"?>
<layer-list xmlns:android="http://schemas.android.com/apk/res/android">
    <item android:drawable="@color/ic_launcher_background"/>
    <item><bitmap android:gravity="center" android:src="@drawable/ic_splash_logo"/></item>
</layer-list>
"@ | Set-Content "$DRAW\splash_screen.xml"

# mipmap launcher icons + foreground + round + splash logo
$dmap = @{ ldpi=36; mdpi=48; hdpi=72; xhdpi=96; xxhdpi=144; xxxhdpi=192 }
foreach ($k in $dmap.Keys) {
  $px = $dmap[$k]
  $m = "$RES\mipmap-$k"
  New-Item -ItemType Directory -Path $m -Force | Out-Null
  New-Icon    "$m\ic_launcher.png"          $px
  New-Icon    "$m\ic_launcher_round.png"    $px
  New-IconTransparent "$m\ic_launcher_foreground.png" $px
}

# splash logo (xxxhdpi base 512)
New-Icon "$DRAW\ic_splash_logo.png" 512

# iOS icons
$ICONSET = "$ROOT\ios\App\App\Assets.xcassets\AppIcon.appiconset"
New-Item -ItemType Directory -Path $ICONSET -Force | Out-Null
$ios = @(@("AppIcon-20.png",40),@("AppIcon-20@2x.png",80),@("AppIcon-20@3x.png",120),
          @("AppIcon-29.png",58),@("AppIcon-29@2x.png",118),@("AppIcon-29@3x.png",177),
          @("AppIcon-40.png",80),@("AppIcon-40@2x.png",160),@("AppIcon-40@3x.png",240),
          @("AppIcon-60@2x.png",240),@("AppIcon-60@3x.png",360),@("AppIcon-1024.png",1024))
foreach ($e in $ios) { New-Icon "$ICONSET\$($e[0])" ($e[1]) }

$img.Dispose()
Write-Output "native-assets: complete"
Get-ChildItem -Recurse -Filter "ic_launcher*" "$RES" -Depth 2 | Select-Object -ExpandProperty Name | Sort-Object | Get-Unique
Write-Output "--- ios ---"
Get-ChildItem -Name $ICONSET
