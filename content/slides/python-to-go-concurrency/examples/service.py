"""Sequential POST /checks baseline. Local fixtures: python3 demo.py fixtures.

Run python3 service.py, then use the same JSON request as the Go service.
This is the service we are rewriting, not a production server: unlike Go it
has no cooperative batch cancellation. Each blocking URL call has a timeout.
"""

import json
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from urllib.error import HTTPError, URLError
from urllib.request import HTTPRedirectHandler, Request, build_opener

ALLOWED = {f"http://127.0.0.1:9099/{path}" for path in ("ok", "broken", "slow")}


class NoRedirect(HTTPRedirectHandler):
    def redirect_request(self, req, fp, code, msg, headers, newurl):
        return None


CLIENT = build_opener(NoRedirect)


def check(url):
    result = {"url": url, "status": 0, "error": ""}
    try:
        with CLIENT.open(Request(url, method="HEAD"), timeout=0.5) as response:
            result["status"] = response.status
    except HTTPError as exc:
        result.update(status=exc.code, error=f"HTTP status {exc.code}")
        exc.close()
    except (URLError, TimeoutError, OSError) as exc:
        result["error"] = str(exc)
    return result


def run(urls):
    return [check(url) for url in urls]


class Handler(BaseHTTPRequestHandler):
    def do_POST(self):
        if self.path != "/checks":
            self.send_error(404)
            return
        try:
            size = int(self.headers.get("Content-Length", "0"))
            if not 0 < size <= 65536:
                raise ValueError("body must be 1..65536 bytes")
            data = json.loads(self.rfile.read(size))
            if not isinstance(data, dict) or set(data) != {"urls"}:
                raise ValueError("expected urls object")
            urls = data["urls"]
            if not isinstance(urls, list) or len(urls) > 1000:
                raise ValueError("urls must be an array of at most 1000 targets")
            if any(not isinstance(url, str) or url not in ALLOWED for url in urls):
                raise ValueError("target not allowlisted")
        except (ValueError, KeyError) as exc:
            self.send_error(400, str(exc))
            return
        output = json.dumps({"results": run(urls), "batch_error": ""}).encode()
        self.send_response(200)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(output)))
        self.end_headers()
        try:
            self.wfile.write(output)
        except (BrokenPipeError, ConnectionResetError):
            pass  # Baseline limitation: work already ran after the caller left.

    def log_message(self, *_):
        pass


if __name__ == "__main__":
    print("Python POST /checks on 127.0.0.1:18080", flush=True)
    ThreadingHTTPServer(("127.0.0.1", 18080), Handler).serve_forever()
