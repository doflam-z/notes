from flask import Flask, jsonify, send_from_directory
import os
import json

app = Flask(__name__)

# Configuration for document directory path
DOCS_PATH = os.path.join(os.path.dirname(__file__), 'docs')

@app.route('/')
def index():
    """Serve the main application page"""
    return send_from_directory('.', 'index.html')

@app.route('/docs/<path:path>')
def docs_redirect(path):
    """Handle /docs path redirects to main page for frontend routing"""
    return send_from_directory('.', 'index.html')

@app.route('/<path:path>')
def serve_static(path):
    """Serve static files"""
    return send_from_directory('.', path)

@app.route('/api/documents')
def get_documents():
    """Get all document directory structures"""
    try:
        directories = []

        # Traverse docs directory
        if os.path.exists(DOCS_PATH):
            for dir_name in sorted(os.listdir(DOCS_PATH)):
                dir_path = os.path.join(DOCS_PATH, dir_name)

                # Only process directories
                if os.path.isdir(dir_path):
                    files = []

                    # Get all .md files in directory
                    for file_name in sorted(os.listdir(dir_path)):
                        if file_name.endswith('.md'):
                            files.append(file_name)

                    directories.append({
                        'name': dir_name,
                        'files': files
                    })

        return jsonify(directories)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/document/<dir_name>/<path:file_name>')
def get_document(dir_name, file_name):
    """Get specific document content"""
    try:
        # Security check to prevent directory traversal attacks
        if '..' in dir_name or '..' in file_name:
            return jsonify({'error': 'Invalid path'}), 400

        file_path = os.path.join(DOCS_PATH, dir_name, file_name)

        # Check if file exists and is a file
        if os.path.exists(file_path) and os.path.isfile(file_path):
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
            return jsonify({'content': content})
        else:
            return jsonify({'error': 'File not found'}), 404
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    # Run the application
    app.run(debug=True, host='0.0.0.0', port=5001)