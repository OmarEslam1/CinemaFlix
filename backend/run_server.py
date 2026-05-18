import sys

sys.path.insert(0, r"D:\Software Enginnering\backend")
sys.path.insert(0, r"D:\Software Enginnering\backend\.venv\Lib\site-packages")

import uvicorn


if __name__ == "__main__":
    uvicorn.run("app.main:app", host="127.0.0.1", port=8000)
