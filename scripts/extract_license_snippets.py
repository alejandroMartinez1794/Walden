import io
import re
from dataclasses import dataclass

import requests
from pypdf import PdfReader


@dataclass
class Result:
    url: str
    status_code: int
    byte_len: int
    snippets: dict[str, list[str]]
    sample: str


KEYWORDS = [
    "public domain",
    "copyright",
    "permission",
    "all rights reserved",
    "trademark",
    "pfizer",
]


def normalize_spaces(s: str) -> str:
    return re.sub(r"\s+", " ", s).strip()


def extract_snippets(text: str) -> dict[str, list[str]]:
    low = text.lower()
    out: dict[str, list[str]] = {k: [] for k in KEYWORDS}

    for kw in KEYWORDS:
        start = 0
        while True:
            idx = low.find(kw, start)
            if idx == -1:
                break
            a = max(0, idx - 250)
            b = min(len(text), idx + 450)
            out[kw].append(normalize_spaces(text[a:b]))
            start = idx + len(kw)

    return {k: v for k, v in out.items() if v}


def pdf_text_from_url(url: str) -> Result:
    r = requests.get(url, timeout=90)
    status = r.status_code
    content = r.content

    reader = PdfReader(io.BytesIO(content))
    text = "\n".join((page.extract_text() or "") for page in reader.pages)
    text = text or ""

    snippets = extract_snippets(text)
    sample = normalize_spaces(text[:400])

    return Result(
        url=url,
        status_code=status,
        byte_len=len(content),
        snippets=snippets,
        sample=sample,
    )


def main() -> None:
    urls = [
        # VA / National Center for PTSD PDFs
        "https://www.ptsd.va.gov/professional/assessment/documents/PCL5_Standard_form.pdf",
        "https://www.ptsd.va.gov/professional/assessment/documents/pc-ptsd5-screen.pdf",
        "https://www.ptsd.va.gov/professional/assessment/documents/PCL5_Standard_form_Spanish.pdf",
    ]

    for url in urls:
        print(f"\n=== {url} ===")
        try:
            res = pdf_text_from_url(url)
        except Exception as e:
            print("ERROR:", repr(e))
            continue

        print(f"status={res.status_code} bytes={res.byte_len}")

        if not res.snippets:
            print("No keyword snippets found.")
            print("Sample:", res.sample)
            continue

        for kw, snippets in res.snippets.items():
            print(f"\nKW: {kw}")
            for i, snip in enumerate(snippets[:5], start=1):
                print(f"  {i}. {snip}")


if __name__ == "__main__":
    main()
