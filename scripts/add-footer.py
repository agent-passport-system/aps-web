#!/usr/bin/env python3
"""Add new footer to all AEOESS subpages and create FAQ page."""
import re, os

WEB = os.path.expanduser('~/aeoess_web')

NEW_FOOTER = '''<footer class="site-footer-sub">
  <div class="footer-inner">
    <div class="footer-grid-sub">
      <div class="fcol"><h4>Protocol</h4><a href="protocol.html">Overview</a><a href="passport.html">Technical Spec</a><a href="compare.html">Compare</a><a href="threat-model.html">Threat Model</a><a href="aivss.html">AIVSS</a></div>
      <div class="fcol"><h4>Community</h4><a href="agora.html">Agora</a><a href="board.html">Board</a><a href="world.html">Agent District</a><a href="bot.html">Agent</a></div>
      <div class="fcol"><h4>Resources</h4><a href="media.html">Media Kit</a><a href="bio.html">Bio</a><a href="blog.html">Dev Log</a><a href="faq.html">FAQ</a><a href="llms.txt">llms.txt</a></div>
      <div class="fcol"><h4>Papers</h4><a href="https://doi.org/10.5281/zenodo.18749779" target="_blank">Agent Social Contract</a><a href="https://doi.org/10.5281/zenodo.18932404" target="_blank">Monotonic Narrowing</a></div>
    </div>
    <div class="footer-bar">
      <span>AEOESS &copy; 2026 &middot; Apache-2.0 &middot; <a href="bio.html">Tymofii Pidlisnyi</a></span>
      <span class="footer-links"><a href="https://www.npmjs.com/package/agent-passport-system" target="_blank">npm</a><a href="https://pypi.org/project/agent-passport-system/" target="_blank">PyPI</a><a href="https://github.com/aeoess" target="_blank">GitHub</a></span>
    </div>
  </div>
</footer>'''

FOOTER_CSS = '''
<style>
.site-footer-sub{border-top:1px solid rgba(255,255,255,.08);padding:2rem 0 1.5rem;margin-top:3rem}
.footer-inner{max-width:1200px;margin:0 auto;padding:0 2rem}
.footer-grid-sub{display:grid;grid-template-columns:repeat(4,1fr);gap:1.5rem;margin-bottom:1.5rem}
.fcol h4{font:500 .6rem 'JetBrains Mono',monospace;color:#d4a574;text-transform:uppercase;letter-spacing:.08em;margin-bottom:.5rem}
.fcol a{display:block;font:.75rem/1.8 'DM Sans',sans-serif;color:#8a857f;text-decoration:none;transition:color .2s}
.fcol a:hover{color:#e8e4de}
.footer-bar{display:flex;justify-content:space-between;align-items:center;padding-top:1rem;border-top:1px solid rgba(255,255,255,.06);font:.7rem 'DM Sans',sans-serif;color:#5a5550}
.footer-bar a{color:#5a5550;text-decoration:none;transition:color .2s}
.footer-bar a:hover{color:#d4a574}
.footer-links{display:flex;gap:.8rem}
.footer-links a{font:.65rem 'JetBrains Mono',monospace}
@media(max-width:768px){.footer-grid-sub{grid-template-columns:repeat(2,1fr)}}
@media(max-width:480px){.footer-grid-sub{grid-template-columns:1fr}}
</style>
'''

# Old footer patterns to replace
OLD_PATTERNS = [
    r'<footer>\s*<div>AEOESS.*?</footer>',
    r'<footer class="site-footer">\s*<div>AEOESS.*?</footer>',
]

PAGES = [
    'agora.html', 'blog.html', 'bot.html', 'compare.html',
    'media.html', 'passport.html', 'protocol.html', 'threat-model.html',
    'world.html', 'board.html', 'bio.html', 'aivss.html', 'overview.html'
]

replaced = 0
for page in PAGES:
    path = os.path.join(WEB, page)
    if not os.path.exists(path):
        print(f"SKIP {page} (not found)")
        continue
    
    with open(path, 'r') as f:
        html = f.read()
    
    # Check if already has new footer
    if 'site-footer-sub' in html:
        print(f"SKIP {page} (already has new footer)")
        continue
    
    # Try to replace old footer
    found = False
    for pat in OLD_PATTERNS:
        if re.search(pat, html, re.DOTALL):
            html = re.sub(pat, NEW_FOOTER, html, count=1, flags=re.DOTALL)
            found = True
            break
    
    if not found:
        # Insert before </body> if no old footer found
        html = html.replace('</body>', NEW_FOOTER + '\n</body>')
    
    # Add footer CSS before </head> if not already there
    if '.site-footer-sub' not in html:
        html = html.replace('</head>', FOOTER_CSS + '</head>')
    
    with open(path, 'w') as f:
        f.write(html)
    
    replaced += 1
    print(f"DONE {page}")

print(f"\nUpdated {replaced} pages")
