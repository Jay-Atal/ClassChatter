# Get current working directory
$CWD = Get-Location

# Function to clean up processes on exit
function Cleanup {
    if ($flaskProcess -and !$flaskProcess.HasExited) {
        Stop-Process -Id $flaskProcess.Id -Force
    }
    if ($npmProcess -and !$npmProcess.HasExited) {
        Stop-Process -Id $npmProcess.Id -Force
    }
}

fnm env --use-on-cd | Out-String | Invoke-Expression

# Register the cleanup function to run on script exit
Register-EngineEvent PowerShell.Exiting -Action { Cleanup }

# Navigate to the backend directory and start the Flask server
Set-Location -Path "backend"
$flaskProcess = Start-Process -NoNewWindow -FilePath "flask" -ArgumentList "run --host=0.0.0.0" -PassThru

# Navigate to the frontend directory and start npm
Set-Location -Path "../frontend"
$npmProcess = Start-Process -NoNewWindow -FilePath "cmd.exe" -ArgumentList "/c npm start" -PassThru

Set-Location -Path $CWD

# Keep the script running until manually exited
Wait-Process -Id $flaskProcess.Id, $npmProcess.Id