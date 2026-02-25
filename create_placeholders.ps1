$soundDir = "assets\sounds"
$letters = @("a","b","c","d","e","f","g","h","i","j","k","l","m","n","o","p","q","r","s","t","u","v","w","x","y","z")

foreach ($letter in $letters) {
    $file = "$soundDir\$letter.mp3"
    if (-not (Test-Path $file)) {
        [System.IO.File]::WriteAllText($file, "ID3")
        Write-Host "[OK] Created $letter.mp3"
    } else {
        Write-Host "[SKIP] $letter.mp3 already exists"
    }
}

Write-Host ""
Write-Host "All placeholder audio files ready!"
