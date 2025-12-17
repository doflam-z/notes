# Gunicorn configuration file for Note application

# Server socket
bind = "0.0.0.0:5001"

# Worker processes
workers = 4
worker_class = "sync"
worker_connections = 1000

# Restart workers after this many requests, to help prevent memory leaks
max_requests = 1000
max_requests_jitter = 100

# Timeout
timeout = 30

# Graceful shutdown timeout
graceful_timeout = 30

# Keep workers alive for longer
keepalive = 5

# Logging
accesslog = "-"
errorlog = "-"
loglevel = "info"

# Process naming
proc_name = "note_app"

# Server mechanics
preload_app = True
daemon = False
pidfile = "/tmp/gunicorn.pid"
user = None
group = None
tmp_upload_dir = None

# SSL (uncomment and configure if using HTTPS)
# keyfile = "/path/to/keyfile"
# certfile = "/path/to/certfile"