from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
import argparse


BASE_DIR = Path(__file__).resolve().parent


class GradeScopeHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(BASE_DIR), **kwargs)

    def do_GET(self):
        if self.path == "/":
            self.path = "/index.html"

        if self.path == "/study-planner":
            self.path = "/study-planner.html"

        super().do_GET()


def main():
    parser = argparse.ArgumentParser(description="Run the GradeScope mini product server.")
    parser.add_argument("--port", type=int, default=8000, help="Local port for the website.")
    args = parser.parse_args()

    server = ThreadingHTTPServer(("127.0.0.1", args.port), GradeScopeHandler)
    print("GradeScope mini product server is running.")
    print(f"Open: http://127.0.0.1:{args.port}/about-product.html")
    print(f"Mini product: http://127.0.0.1:{args.port}/study-planner.html")
    server.serve_forever()


if __name__ == "__main__":
    main()
