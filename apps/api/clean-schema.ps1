$content = Get-Content -Path "prisma\schema.prisma" -Raw
$content = $content -replace ' @db\.Decimal\([^)]+\)', ''
$content = $content -replace ' @db\.Date', ''
Set-Content -Path "prisma\schema.prisma" -Value $content -NoNewline
Write-Host "Schema cleaned successfully!"
