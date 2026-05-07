# Desktop Signing Guide

## macOS
Set in CI/secrets:
- `APPLE_CERTIFICATE`
- `APPLE_CERTIFICATE_PASSWORD`
- `APPLE_SIGNING_IDENTITY`
- `APPLE_ID`, `APPLE_PASSWORD`, `APPLE_TEAM_ID`

Then run:
```bash
npm run tauri:build
```

## Windows
Set in CI/secrets:
- `WINDOWS_CERTIFICATE`
- `WINDOWS_CERTIFICATE_PASSWORD`
- `WINDOWS_TIMESTAMP_URL`

Then run:
```bash
npm run tauri:build
```

This repository currently scaffolds targets (`msi`, `dmg`) in `tauri.conf.json`.
