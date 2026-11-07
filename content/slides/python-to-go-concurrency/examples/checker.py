"""Threaded baseline: python3 checker.py http://localhost:8000/ ..."""

import sys
from concurrent.futures import ThreadPoolExecutor, as_completed
from urllib.request import Request, urlopen


def check(url):
    with urlopen(Request(url, method="HEAD"), timeout=0.5) as response:
        return response.status


def main(urls):
    # Finite teaching batch: active calls are bounded, submissions are not.
    with ThreadPoolExecutor(max_workers=8) as pool:
        futures = {pool.submit(check, url): url for url in urls}
        for future in as_completed(futures):
            url = futures[future]
            try:
                print(url, future.result())
            except Exception as exc:
                print(url, exc)


if __name__ == "__main__":
    if not sys.argv[1:]:
        sys.exit("usage: python3 checker.py URL [URL ...]")
    main(sys.argv[1:])
