$files = Get-ChildItem -Path "src" -Recurse -Include "*.jsx","*.js" |
  Where-Object { $_.FullName -notmatch "colors\.js" }

foreach ($file in $files) {
  $content = Get-Content $file.FullName -Raw
  $updated = $content

  # Old sky-blue shadows → primary blue shadow
  $updated = $updated -replace 'rgba\(14,\s*165,\s*233,\s*0\.25\)', 'rgba(1, 64, 167, 0.2)'
  $updated = $updated -replace 'rgba\(14,\s*165,\s*233,\s*0\.15\)', 'rgba(1, 64, 167, 0.15)'
  $updated = $updated -replace 'rgba\(14,\s*165,\s*233,\s*0\.12\)', 'rgba(1, 64, 167, 0.1)'
  $updated = $updated -replace 'rgba\(14,\s*165,\s*233,\s*0\.3\)',  'rgba(1, 64, 167, 0.25)'
  $updated = $updated -replace 'rgba\(14,\s*165,\s*233,\s*0\.35\)', 'rgba(1, 64, 167, 0.3)'
  $updated = $updated -replace 'rgba\(2,\s*132,\s*199,\s*0\.3\)',   'rgba(1, 64, 167, 0.25)'
  $updated = $updated -replace 'rgba\(2,\s*132,\s*199,\s*0\.35\)',  'rgba(1, 64, 167, 0.3)'
  $updated = $updated -replace 'rgba\(2,\s*132,\s*199,\s*0\.28\)',  'rgba(1, 64, 167, 0.25)'
  $updated = $updated -replace 'rgba\(2,\s*132,\s*199,\s*0\.25\)',  'rgba(1, 64, 167, 0.2)'

  # Yellow/amber shadows → remove (set to none / neutral)
  $updated = $updated -replace 'rgba\(245,\s*158,\s*11,\s*0\.25\)', 'rgba(1, 64, 167, 0.15)'
  $updated = $updated -replace 'rgba\(217,\s*119,\s*6,\s*0\.2\)',   'rgba(1, 64, 167, 0.12)'

  if ($updated -ne $content) {
    Set-Content $file.FullName $updated -NoNewline
    Write-Host "Updated: $($file.Name)"
  }
}
Write-Host "Done."
