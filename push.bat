@echo off
setlocal

for /f "delims=" %%i in ('git rev-parse --show-toplevel 2^>nul') do set "REPO_ROOT=%%i"
if not defined REPO_ROOT (
    echo This directory is not inside a Git repository.
    exit /b 1
)

pushd "%REPO_ROOT%" >nul

call :run_git add -A || goto :error

git diff --cached --quiet
if errorlevel 1 (
    call :run_git commit --allow-empty-message -m "" || goto :error
) else (
    echo No staged changes to commit.
)

call :run_git push || goto :error

echo.
echo Git add/commit/push completed successfully.
popd >nul
exit /b 0

:run_git
git %* >nul
if errorlevel 1 (
    git %*
    exit /b %errorlevel%
)
exit /b 0

:error
echo.
echo One or more Git commands failed. Check the output above for details.
if defined REPO_ROOT popd >nul
exit /b 1
