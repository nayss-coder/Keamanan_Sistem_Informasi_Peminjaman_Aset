# script to setup APISIX routes and plugins for SI-ALAT
# Usage: .\setup-apisix.ps1

$AdminUrl = "http://localhost:9180"
$AdminKey = "edd1c9f034335f136f87ad84b625c8f1"
$NextJsPort = 3001

Write-Host "=============================================" -ForegroundColor Cyan
Write-Host "⚙️ SETUP APISIX ROUTES & PLUGINS FOR SI-ALAT" -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan

# Headers for Admin API
$headers = @{
    "X-API-KEY" = $AdminKey
    "Content-Type" = "application/json"
}

# 0. Register SSL Certificate
$crtPath = "C:\Users\denny\Downloads\proyek-apisix\proyek-apisix\ssl\sialat.crt"
$keyPath = "C:\Users\denny\Downloads\proyek-apisix\proyek-apisix\ssl\sialat.key"
if (Test-Path $crtPath) {
    Write-Host "[0/4] Mendaftarkan Sertifikat SSL..." -ForegroundColor Yellow
    $certContent = Get-Content -Raw -Path $crtPath
    $keyContent = Get-Content -Raw -Path $keyPath
    $sslBody = @{
        cert = $certContent
        key = $keyContent
        snis = @("localhost", "127.0.0.1")
    } | ConvertTo-Json -Depth 2
    try {
        $resSsl = Invoke-RestMethod -Uri "$AdminUrl/apisix/admin/ssls/sialat-ssl" -Method Put -Headers $headers -Body $sslBody -ErrorAction Stop
        Write-Host "✅ Sertifikat SSL berhasil didaftarkan!" -ForegroundColor Green
    } catch {
        Write-Host "❌ Gagal mendaftarkan SSL: $_" -ForegroundColor Red
    }
}


# 1. Register JWT Consumer
Write-Host "[1/3] Mendaftarkan Consumer untuk JWT Authentication..." -ForegroundColor Yellow
$consumerBody = @{
    username = "sialat-jwt-consumer"
    plugins = @{
        "jwt-auth" = @{
            key = "si-alat-key"
            secret = "si-alat-super-secret-key-2024"
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
Write-Host "[2/4] Mendaftarkan Route: /api/auth/login (Rate Limited & Traced)..." -ForegroundColor Yellow
$loginRouteBody = @{
    uri = "/api/auth/login"
    methods = @("POST")
    priority = 10
    upstream = @{
        type = "roundrobin"
        nodes = @{
            "host.docker.internal:$NextJsPort" = 1
        }
    }
    plugins = @{
        "limit-count" = @{
            count = 5
            time_window = 60
            rejected_code = 429
            key_type = "var"
            key = "remote_addr"
        }
        "skywalking" = @{}
        "redirect" = @{
            http_to_https = $true
        }
    }
} | ConvertTo-Json -Depth 5

try {
    $resLogin = Invoke-RestMethod -Uri "$AdminUrl/apisix/admin/routes/login" -Method Put -Headers $headers -Body $loginRouteBody -ErrorAction Stop
    Write-Host "✅ Route Login dengan Rate Limiting & Tracing berhasil didaftarkan!" -ForegroundColor Green
} catch {
    Write-Host "❌ Gagal mendaftarkan Route Login: $_" -ForegroundColor Red
}

# 3. Register Route: /api/* (Protected with JWT Auth, except login)
Write-Host "[3/4] Mendaftarkan Route: /api/* (Terproteksi JWT & Traced)..." -ForegroundColor Yellow
$protectedRouteBody = @{
    uri = "/api/*"
    priority = 5
    upstream = @{
        type = "roundrobin"
        nodes = @{
            "host.docker.internal:$NextJsPort" = 1
        }
    }
    plugins = @{
        "jwt-auth" = @{}
        "skywalking" = @{}
        "redirect" = @{
            http_to_https = $true
        }
    }
} | ConvertTo-Json -Depth 5

try {
    $resProtected = Invoke-RestMethod -Uri "$AdminUrl/apisix/admin/routes/protected-api" -Method Put -Headers $headers -Body $protectedRouteBody -ErrorAction Stop
    Write-Host "✅ Route API Terproteksi JWT & Tracing berhasil didaftarkan!" -ForegroundColor Green
} catch {
    Write-Host "❌ Gagal mendaftarkan Route Terproteksi: $_" -ForegroundColor Red
}

# 4. Register Route: /* (Frontend Web UI Proxy - Public)
Write-Host "[4/4] Mendaftarkan Route: /* (Frontend Web UI & Traced)..." -ForegroundColor Yellow
$frontendRouteBody = @{
    uri = "/*"
    priority = 1
    upstream = @{
        type = "roundrobin"
        nodes = @{
            "host.docker.internal:$NextJsPort" = 1
        }
    }
    plugins = @{
        "skywalking" = @{}
        "redirect" = @{
            http_to_https = $true
        }
    }
} | ConvertTo-Json -Depth 5

try {
    $resFrontend = Invoke-RestMethod -Uri "$AdminUrl/apisix/admin/routes/frontend-routes" -Method Put -Headers $headers -Body $frontendRouteBody -ErrorAction Stop
    Write-Host "✅ Route Frontend Web UI berhasil didaftarkan!" -ForegroundColor Green
} catch {
    Write-Host "❌ Gagal mendaftarkan Route Frontend: $_" -ForegroundColor Red
}

Write-Host "=============================================" -ForegroundColor Cyan
Write-Host "🎉 Konfigurasi APISIX Selesai!" -ForegroundColor Green
Write-Host "Sekarang akses melalui APISIX di: http://localhost:9080" -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan
