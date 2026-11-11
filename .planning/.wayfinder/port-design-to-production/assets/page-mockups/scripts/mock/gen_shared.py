import os

SITE = "https://haseebmajid.dev"
TPL = open("/tmp/ogbuild/mock-template.html").read()

TOPICS = [  # (tag slug, label, posts) -- counts from content/posts/*/index.md and tags/<t>/index.xml
    ("nix", "Nix", 43),
    ("nixos", "NixOS", 33),
    ("gitlab", "GitLab", 21),
    ("python", "Python", 16),
    ("ci-cd", "CI/CD", 14),
    ("neovim", "Neovim", 13),
    ("home-manager", "Home Manager", 13),
    ("hugo", "Hugo", 13),
    ("golang", "Go", 9),
    ("docker", "Docker", 9),
]

SOCIALS = [  # from hugo.toml [[params.socialIcons]]
    ("Mastodon", "@majiy00@hachyderm.io", "https://hachyderm.io/@majiy00"),
    ("YouTube", "@Majiy00", "https://www.youtube.com/@Majiy00"),
    ("GitLab", "hmajid2301", "https://gitlab.com/hmajid2301"),
    ("GitHub", "hmajid2301", "https://github.com/hmajid2301"),
    ("Ko-fi", "haseeb36616", "https://ko-fi.com/haseeb36616"),
]

RSS_LINE = ("RSS is a free, open way to follow websites: paste a feed address into a feed reader app "
            "and new posts show up there, no account, algorithm or inbox needed.")

COPY_JS = """<script>
document.querySelectorAll('[data-copy]').forEach(function(b){
  b.addEventListener('click',function(){
    var url=b.getAttribute('data-copy'), label=b.textContent;
    (navigator.clipboard?navigator.clipboard.writeText(url):Promise.reject()).then(function(){
      b.textContent='Copied';b.setAttribute('data-state','done');
      setTimeout(function(){b.textContent=label;b.removeAttribute('data-state')},1600);
    }).catch(function(){window.prompt('Copy this feed URL',url)});
  });
});
</script>"""

# Let the mock break out of the narrow post column to ~1100px, like the home page.
WIDE = ".main.post:has(> [data-mock-wide]){max-width:1164px}"


def write(page, alt, title, body):
    out = TPL.replace("MOCK_TITLE", title + " | Haseeb Majid").replace("<!--MOCK-->", body)
    d = f"/tmp/ogbuild/mockups/{page}/{alt}"
    os.makedirs(d, exist_ok=True)
    open(d + "/index.html", "w").write(out)
    print("wrote", d)

# Blogroll: no real data yet -- every entry is a placeholder.
BR_CATS = [("Go", 3), ("Nix", 3), ("Neovim", 2), ("Homelab", 2), ("Engineering", 3)]
BR_NAME, BR_NOTE, BR_FEED, BR_URL = "[Blog name]", "[one line on why it's worth reading]", "[feed]", "[example.com]"
BR_LATEST = "[latest post title]"
EXAMPLE_NOTE = "Example entries — replace with real ones"
