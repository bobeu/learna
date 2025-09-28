@echo off
echo Replacing ~ imports with @ imports...

for /r src %%f in (*.ts *.tsx *.js *.jsx) do (
    powershell -Command "(Get-Content '%%f') -replace 'from ''~/', 'from ''@/' | Set-Content '%%f'"
    powershell -Command "(Get-Content '%%f') -replace 'from \"~/', 'from \"@/' | Set-Content '%%f'"
    powershell -Command "(Get-Content '%%f') -replace 'require(''~/', 'require(''@/' | Set-Content '%%f'"
    powershell -Command "(Get-Content '%%f') -replace 'require(\"~/', 'require(\"@/' | Set-Content '%%f'"
    echo Updated: %%f
)

echo Import replacement completed!
pause
