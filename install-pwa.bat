@echo off
echo ========================================
echo Elight Sofa House - PWA Setup
echo ========================================
echo.

echo [1/3] Installing next-pwa...
call npm install next-pwa
echo.

echo [2/3] Building application...
call npm run build
echo.

echo [3/3] Starting production server...
echo.
echo ========================================
echo PWA Setup Complete!
echo ========================================
echo.
echo Next steps:
echo 1. Generate icons (see ICON_GENERATION_GUIDE.md)
echo 2. Place icons in public/icons/
echo 3. Test at http://localhost:3000
echo 4. Run Lighthouse audit in Chrome DevTools
echo 5. Deploy to Vercel
echo.
echo Starting server...
echo Open: http://localhost:3000
echo.
call npm start
