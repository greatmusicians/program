@echo off

SET original_dir="%cd%"

IF "%~1"=="pull" (
  CALL :pull Menschen
  CALL :pull Menschen2
  CALL :pull program
  CALL :pull other
) ELSE (
  CALL :push Menschen
  CALL :push Menschen2
  CALL :push program
  CALL :push other
)

EXIT /B %ERRORLEVEL%

:push
cd "%~1"
echo ==================== git push ====================
echo %cd%
git.exe add .
git.exe add -u
git.exe commit -m "first commit"
git.exe push -u origin main
cd "%original_dir%"
EXIT /B 0

:pull
cd "%~1"
echo ==================== git pull ====================
echo %cd%
git.exe pull
cd "%original_dir%"
EXIT /B 0