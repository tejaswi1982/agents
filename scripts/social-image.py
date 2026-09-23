"""Optional social artwork regeneration: Pillow plus Arial-compatible local fonts.
The ready-made PNG ships in public/assets, so this is not a build dependency.
"""
from pathlib import Path
from PIL import Image,ImageDraw,ImageFont
R=Path(__file__).resolve().parents[1]
F=Path('/usr/share/fonts/opentype/urw-base35');scale=2
im=Image.new('RGB',(2400,1260),'#eeeae1');d=ImageDraw.Draw(im)
def text(x,y,copy,size,font='NimbusSans-Regular.otf',fill='#262620'):
 f=ImageFont.truetype(str(F/font),size*scale)
 d.text((x*scale,y*scale),copy,font=f,fill=fill,anchor='ls')
 return d.textlength(copy,font=f)/scale
text(67,65,'Abhinandan Tejaswi',22)
d.line((134,184,2266,184),fill='#bdb7ab',width=2)
x=66
for c in 'AGENTS':x+=text(x,320,c,198)-12
text(x,320,'.',198,fill='#a6381c')
x=73+text(73,414,'Things that ',43)
text(x,414,'do things.',43,'NimbusRoman-Italic.otf')
text(74,553,'SMALL SYSTEMS BUILT AROUND ACTUAL PROBLEMS.',16,'NimbusMonoPS-Regular.otf','#67635b')
text(1089,553,'01',16,'NimbusMonoPS-Regular.otf','#a6381c')
im.resize((1200,630),Image.Resampling.LANCZOS).save(R/'public/assets/agents-og.png',optimize=True)
