"""Offline fixtures / measured demo, not a benchmark or a test suite.

python3 demo.py fixtures  # keep running for curl + both HTTP services
python3 demo.py           # build Go in a temporary directory, run the story
"""

import json
from pathlib import Path
import socket
import subprocess
import sys
import tempfile
import threading
import time
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from urllib.request import Request, urlopen

ROOT = Path(__file__).resolve().parent
ACTIVE = PEAK = 0
LOCK = threading.Lock()


class Fixture(BaseHTTPRequestHandler):
    def do_HEAD(self):
        global ACTIVE, PEAK
        with LOCK:
            ACTIVE += 1
            PEAK = max(PEAK, ACTIVE)
        try:
            time.sleep(1 if self.path == "/slow" else 0.1)
            self.send_response(503 if self.path == "/broken" else 200)
            self.end_headers()
        finally:
            with LOCK:
                ACTIVE -= 1

    def log_message(self, *_):
        pass


def wait_for_port(port):
    for _ in range(100):
        try:
            with socket.create_connection(("127.0.0.1", port), timeout=0.1):
                return
        except OSError:
            time.sleep(0.05)
    raise RuntimeError(f"service on {port} did not start")


def report(label, port, paths):
    global PEAK
    with LOCK:
        PEAK = 0
    payload = {"urls": [f"http://127.0.0.1:9099/{path}" for path in paths]}
    start = time.monotonic()
    req = Request(f"http://127.0.0.1:{port}/checks", data=json.dumps(payload).encode(),
                  headers={"Content-Type": "application/json"})
    with urlopen(req, timeout=5) as response:
        output = json.load(response)
    print(f"{label}: {len(output['results'])} results; fixture peak={PEAK}; "
          f"elapsed={time.monotonic() - start:.3f}s; batch_error={output['batch_error']!r}")
    # Status/error summaries avoid volatile transport error strings and ordering.
    print("  " + ", ".join(sorted(
        f"{r['url'].rsplit('/', 1)[-1]}:{r['status']}:" + ("error" if r['error'] else "ok")
        for r in output["results"])))


def main():
    server = ThreadingHTTPServer(("127.0.0.1", 9099), Fixture)
    if sys.argv[1:] == ["fixtures"]:
        print("Fixtures on 127.0.0.1:9099: /ok /broken /slow", flush=True)
        server.serve_forever()
        return
    threading.Thread(target=server.serve_forever, daemon=True).start()
    try:
        with tempfile.TemporaryDirectory() as tmp:
            binary = str(Path(tmp) / "checker")
            subprocess.run(["go", "build", "-o", binary, "."], cwd=ROOT, check=True)
            variants = [
                ("Python sequential", 18080, [sys.executable, str(ROOT / "service.py")]),
                ("Go sequential", 18081, [binary, "-serve", "-sequential"]),
                ("Go pool (2 workers)", 18081, [binary, "-serve"]),
            ]
            for label, port, command in variants:
                # Refuse a collision rather than measuring an unrelated local server.
                with socket.socket() as probe:
                    if probe.connect_ex(("127.0.0.1", port)) == 0:
                        raise RuntimeError(f"port {port} is already in use")
                process = subprocess.Popen(command, cwd=ROOT, stdout=subprocess.DEVNULL)
                try:
                    wait_for_port(port)
                    report(label, port, ["ok"] * 6)
                    report(label + " / failures", port, ["ok", "broken", "slow"])
                    # Let timed-out fixture handlers finish before measuring again.
                    time.sleep(1.1)
                finally:
                    process.terminate()
                    process.wait(timeout=5)
    finally:
        server.shutdown()
        server.server_close()


if __name__ == "__main__":
    main()
