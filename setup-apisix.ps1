# script to setup APISIX routes and plugins for SI-ALAT
# Usage: .\setup-apisix.ps1

$AdminUrl = "http://localhost:9180"
$AdminKey = "AuLapHCJgMSJuVwaLOvxzdDyLzenMBkY"

Write-Host "=============================================" -ForegroundColor Cyan
Write-Host "⚙️ SETUP APISIX ROUTES & PLUGINS FOR SI-ALAT" -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan

# Headers for Admin API
$headers = @{
    "X-API-KEY" = $AdminKey
    "Content-Type" = "application/json"
}

# 1. Register JWT Consumer
Write-Host "[1/3] Mendaftarkan Consumer untuk JWT Authentication..." -ForegroundColor Yellow
$consumerBody = @{
    username = "sialat-jwt-consumer"
    plugins = @{
        "jwt-auth" = @{
            key = "si-alat-key"
            secret = "si-alat-super-secret-key-2024" # Harus sama dengan JWT_SECRET di backend
        }
    }
} | ConvertTo-Json -Depth 5

try {
    $resConsumer = Invoke-RestMethod -Uri "$AdminUrl/apisix/admin/consumers" -Method Put -Headers $headers -Body $consumerBody -ErrorAction Stop
    Write-Host "✅ Consumer berhasil didaftarkan!" -ForegroundColor Green
} catch {
    Write-Host "❌ Gagal mendaftarkan Consumer: $_" -ForegroundColor Red
}

# 2. Register Route: /api/auth/login (Public, with Rate Limiting)
Write-Host "[2/3] Mendaftarkan Route: /api/auth/login (Rate Limited)..." -ForegroundColor Yellow
$loginRouteBody = @{
    uri = "/api/auth/login"
    methods = @("POST")
    upstream = @{
        type = "roundrobin"
        nodes = @{
            "host.docker.internal:3000" = 1 # Mengarah ke Next.js app port 3000
        }
    }
    plugins = @{
        "limit-count" = @{
            count = 5            # Maksimal 5 kali coba
            time_window = 60      # Dalam 60 detik
            rejected_code = 429  # Mengembalikan status 429 Too Many Requests
            key_type = "var"
            key = "remote_addr"   # Batasi per IP Address pengirim
        }
    }
} | ConvertTo-Json -Depth 5

try {
    $resLogin = Invoke-RestMethod -Uri "$AdminUrl/apisix/admin/routes/login" -Method Put -Headers $headers -Body $loginRouteBody -ErrorAction Stop
    Write-Host "✅ Route Login dengan Rate Limiting berhasil didaftarkan!" -ForegroundColor Green
} catch {
    Write-Host "❌ Gagal mendaftarkan Route Login: $_" -ForegroundColor Red
}

# 3. Register Route: /api/* (Protected with JWT Auth, except login)
Write-Host "[3/3] Mendaftarkan Route: /api/* (Terproteksi JWT)..." -ForegroundColor Yellow
$protectedRouteBody = @{
    uri = "/api/*"
    upstream = @{
        type = "roundrobin"
        nodes = @{
            "host.docker.internal:3000" = 1
        }
    }
    plugins = @{
        "jwt-auth" = @{} # Aktifkan plugin JWT
    }
} | ConvertTo-Json -Depth 5

try {
    $resProtected = Invoke-RestMethod -Uri "$AdminUrl/apisix/admin/routes/protected-api" -Method Put -Headers $headers -Body $protectedRouteBody -ErrorAction Stop
    Write-Host "✅ Route API Terproteksi JWT berhasil didaftarkan!" -ForegroundColor Green
} catch {
    Write-Host "❌ Gagal mendaftarkan Route Terproteksi: $_" -ForegroundColor Red
}

Write-Host "=============================================" -ForegroundColor Cyan
Write-Host "🎉 Konfigurasi APISIX Selesai!" -ForegroundColor Green
Write-Host "Sekarang akses melalui APISIX di: http://localhost:9080" -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan
