import http.server
import base64
import io
from ocr import *

class PostHandler(http.server.SimpleHTTPRequestHandler):
    def do_POST(self):
        content_len = self.headers.get("Content-Length")
        if content_len is not None:
            body = str(self.rfile.read(int(content_len)))
            body = body.replace('b\'data:image/png;base64,', '')
        img = base64.b64decode(body)
        buf = io.BytesIO(img)
        pred = ocr.classify(buf)
        self.send_response(code=200, message=pred[0])
        self.end_headers()

server_address = ('', 8000)
ocr = OCR()
server = http.server.HTTPServer(server_address, PostHandler)
server.serve_forever()