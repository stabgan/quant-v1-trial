# Kill any existing Node.js processes running Next.js
Get-Process | Where-Object {$_.ProcessName -eq "node" -and $_.CommandLine -like "*next*"} | Stop-Process -Force

# Change to the project directory
cd $PSScriptRoot

# Start the Next.js development server on port 3566
bun run dev 