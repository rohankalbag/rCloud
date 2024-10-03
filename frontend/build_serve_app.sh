#!/bin/bash

IP_ADDRESS=$(ipconfig getifaddr en0)
echo "EXPO_PUBLIC_BACKEND_API_URL=http://$IP_ADDRESS:3000" > .env

npx expo export --platform web
npx serve dist -p 8081