$b64 = Get-Content 'C:\Users\LENOVO\Documents\portfolio website try2\profile_b64.txt' -Raw
$dataUrl = 'data:image/jpeg;base64,' + $b64.Trim()
$js = "const HERO_IMG_B64 = '$dataUrl';"
[System.IO.File]::WriteAllText('C:\Users\LENOVO\Documents\portfolio website try2\hero_img.js', $js)
Write-Host "Done, length: $($js.Length)"
