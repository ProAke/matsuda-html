"""Import the user-owned HTML export (not PHP). Requires beautifulsoup4.
Usage: python scripts/import-legacy.py [directory containing downloaded HTML/assets]
Only this build-time importer accepts source HTML; the website has no upload/write endpoint.
"""
import json,re,shutil,sys
from pathlib import Path
from bs4 import BeautifulSoup,Comment
root=Path(__file__).resolve().parents[1]
src=Path(sys.argv[1] if len(sys.argv)>1 else root/'google_drive')
public=root/'public/legacy'
pages={'home':'index','company':'company','links':'management','business':'business','awards':'awarded','environment':'career','contact':'contactus'}
langs={'th':'','en':'_en','ja':'_jp','zh':'_cn'}
missing=set()
def write(path,data):
 path.parent.mkdir(parents=True,exist_ok=True)
 path.write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n')
def asset(path):
 path=path.removeprefix('./').split('?')[0]
 if path.startswith(('http:', 'https:')): return path
 if not path.startswith(('images/','uploads/','fonts/')): return path
 source=src/Path(path).name
 target=public/path
 if source.exists():
  target.parent.mkdir(parents=True,exist_ok=True);shutil.copyfile(source,target)
 else: missing.add(path)
 return '/legacy/'+path
allowed={'div','span','p','br','hr','h1','h2','h3','h4','strong','b','em','i','u','ul','ol','li','a','img','table','tbody','thead','tr','td','th','iframe','section'}
def clean(node,lang):
 if not node:return ''
 soup=BeautifulSoup(str(node),'html.parser')
 for c in soup.find_all(string=lambda text:isinstance(text,Comment)): c.extract()
 for tag in list(soup.find_all(['script','style','form','object','embed','link','meta','input','textarea','button'])):tag.decompose()
 # Cloudflare masking used a separate XOR key for each hyperlink; decode that rather than guessing addresses.
 for a in soup.select('a[href*="/cdn-cgi/l/email-protection#"]'):
  encoded=a['href'].split('#')[-1]
  try:
   data=bytes.fromhex(encoded);email=bytes(x^data[0] for x in data[1:]).decode();a['href']='mailto:'+email;a.clear();a.string=email
  except (ValueError,UnicodeError):a.decompose()
 for tag in list(soup.find_all()):
  if tag.name not in allowed:tag.unwrap();continue
  for attr in list(tag.attrs):
   if attr not in ['class','id','style','src','href','title','alt','width','height','colspan','rowspan','border','cellspacing','cellpadding','align','valign','loading','referrerpolicy','allowfullscreen']:del tag[attr]
  if 'style' in tag.attrs:
   # Keep original static typography, but never imported execution or external CSS.
   style=tag['style']
   if re.search(r'expression|javascript:|url\s*\(|behavior\s*:',style,re.I):del tag['style']
  for attr in ['src','href']:
   val=tag.get(attr,'').strip()
   if not val:continue
   if re.match(r'^(javascript|data|vbscript):',val,re.I):del tag[attr];continue
   if val.startswith(('./images/','./uploads/','images/','uploads/')):tag[attr]=asset(val)
   elif attr=='href':
    match=re.match(r'^(index|company|management|business|awarded|career|contactus)(?:_(en|jp|cn))?\.(html|php)(?:\?.*)?$',val)
    if match:
     page=next(k for k,v in pages.items() if v==match[1]);l={'en':'en','jp':'ja','cn':'zh',None:'th'}[match[2]];tag[attr]='/'+l+('' if page=='home' else '/'+page)
  if tag.name=='iframe':
   if not tag.get('src','').startswith('https://www.google.com/maps/embed'):
    tag.decompose();continue
   tag['title']={'en':'Matsuda Sangyo location','th':'แผนที่มัตสึดะ ซังเกียว','ja':'松田産業の所在地','zh':'松田产业位置'}[lang];tag['loading']='lazy';tag['referrerpolicy']='no-referrer'
  if tag.name=='img':tag['alt']=tag.get('alt','');tag['loading']='lazy'
  if tag.name=='a' and re.search(r'\.(jpg|png)$', tag.get('href',''), re.I):tag['target']='_blank';tag['rel']='noopener noreferrer'
  if tag.name=='a' and tag.get('href','').startswith(('http:','https:')):tag['target']='_blank';tag['rel']='noopener noreferrer'
 return str(soup)
for lang,suffix in langs.items():
 out={}
 for page,stem in pages.items():
  filename=src/(stem+suffix+'.html')
  soup=BeautifulSoup(filename.read_text(),'html.parser')
  raw=filename.read_text()
  content_match=re.search(r"<div class=['\"]content['\"][^>]*>",raw)
  footer_match=re.search(r"<div class=['\"]footer['\"]",raw)
  main=BeautifulSoup(raw[content_match.end():footer_match.start()], 'html.parser')
  # Export contains a broken duplicate hero with negative positioning; original slider is retained instead.
  for tag in main.select('.hero-banner'):tag.decompose()
  background=main.select_one('img.bg-management2')
  panel=main.select_one('.div-management2')
  if background and panel:panel.append(background.extract())
  for link in main.select('.div-awarded-d > a'):
   link['class']=['hpl-list-1']
   if link.img:link.img['alt']=link.get('title','')
  for tag in main.select('.div-contactus3'):tag.decompose() # PHP feedback endpoint is unavailable in a no-backend website.
  # For old gallery popup links: use local full documents in a new tab, not the PHP/jquery popup.
  for a in main.select('a[href]'):
   if re.search(r'\.(jpg|png)$',a['href'],re.I):a['target']='_blank';a['rel']='noopener noreferrer'
  if page=='home':
   out[page]={
    'introduction':clean(main.select_one('.div-index2'),lang),
    'diagram':clean(main.select_one('#div-index3'),lang),
    'businessTitle':main.select_one('.div-index4 h2').get_text(' ',strip=True),
    'businessDescription':main.select_one('.div-index4 .wrapper2 > p').get_text(' ',strip=True),
    'map':clean(main.select_one('iframe'),lang),
   }
  else:out[page]={'html':clean(main,lang)}
  if page=='home':
   out['header']={'nav':[a.get_text(' ',strip=True) for a in soup.select('#menu-top > li > a')]}
   out['footer']={'html':clean(soup.select_one('.footer'),lang)}
 write(root/f'data/legacy/{lang}.json',out)
# Preserve native source CSS; fix asset locations and font paths for Nuxt's public directory.
css=(src/'template.css').read_text()
css=re.sub(r'@font-face\s*\{.*?\}', '',css,flags=re.S)
css=re.sub(r'url\(([^)]+)\)',lambda m:'url("'+asset(m[1].strip('\"\'').replace('../../',''))+'")',css)
for font,name in [('font1','CordiaUPC'),('font2','InSeeDang'),('font3','supermarket')]:
 asset('fonts/'+name+'.woff')
 css='@font-face{font-family:'+font+';src:url("/legacy/fonts/'+name+'.woff") format("woff");font-display:swap}\n'+css
# Missing decorative files belong to unused legacy/admin selectors; do not emit broken requests.
for path in missing:
 css=css.replace('url("/legacy/'+path+'")','none')
(root/'assets/css/legacy-original.css').write_text(css)
assets=json.loads((root/'data/assets.json').read_text())
def localize(value):
 if isinstance(value,str) and value.startswith('/legacy/'):return asset(value.removeprefix('/legacy/'))
 if isinstance(value,str) and value.startswith('https://hi.matsuda-sangyothailand.com/'):return asset(value.split('https://hi.matsuda-sangyothailand.com/')[1])
 if isinstance(value,list):return [localize(x) for x in value]
 if isinstance(value,dict):return {k:localize(v) for k,v in value.items()}
 return value
write(root/'data/assets.json',localize(assets))
write(root/'data/legacy/import-report.json',{'source':'Google Drive matsuda-html (HTML export)','languages':list(langs),'pagesPerLanguage':7,'missingSourceFiles':sorted(missing),'notes':['No PHP or legacy JavaScript executed.','Broken duplicate hero/negative top margins removed.','PHP feedback form omitted; contact via published phone/email.','6 certificates available in HTML export; no inaccessible pagination invented.']})
print('Imported 28 pages. Missing files:',len(missing));print('\n'.join(sorted(missing)))
