# rCloud Backend

## Get started

1. Install dependencies

   ```bash
   python3 -m venv .venv
   source .venv/bin/activate
   pip install -r requirements.txt
   ```

2. Configure the app by creating a `config.json` in the backend directory
    
    ```json
    {
        "SQLALCHEMY_DATABASE_URI": "sqlite:///rcloud.db",
        "SECRET_KEY" : "enter_a_strong_secret_key",
        "CLOUD_STORAGE_ROOT_PATH" : "enter_path_to_your_cloud_filesystem_root_dir"
    }
    ```

2. Start the app for local development

   ```bash
   python3 main.py
   ```

3. Ready to deploy ?

    ```bash
   gunicorn -w 4 -b 0.0.0.0:3000 'main:app' --daemon
    ```