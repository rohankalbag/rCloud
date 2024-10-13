# rCloud - rohan's Cloud

rCloud is a secure file storage and sharing platform designed to provide users with a seamless and reliable way to store, share, and access their files from anywhere. It is currently a work under progress. It will be used to setup my homelab server as a cloud storage accessible to any device connected to my local WiFi network

It uses **React Native** for the frontend and **Flask** for the backend. It deploys both the frontend and backend in tandem using **Nginx** ([Help Installing Nginx](https://ubuntu.com/tutorials/install-and-configure-nginx#2-installing-nginx))

## Recommended System Requirements 
```
npm == 10.8.2
node == v20.18.0
python3 == 3.10.12
nginx
```

## Usage Instructions

After installing the above system requirements:
- go to `./frontend` and follow `README.md`
- go to `./backend` and follow `README.md`
- once you are ready to deploy on Nginx, run `sudo ./serve_app.sh`, first make sure the script has execute permissions
