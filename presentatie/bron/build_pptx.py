"""Build the KBC Weerbericht deck as an animated .pptx (LibreOffice Impress + PowerPoint)."""
import sys
from pptx import Presentation
from pptx.util import Emu, Pt
from pptx.dml.color import RGBColor
from pptx.enum.shapes import MSO_SHAPE, MSO_CONNECTOR
from pptx.enum.text import PP_ALIGN, MSO_ANCHOR, MSO_AUTO_SIZE
from pptx.oxml.ns import qn
from lxml import etree
from PIL import Image

import os
HERE = os.path.dirname(os.path.abspath(__file__))
OUT = sys.argv[1] if len(sys.argv) > 1 else f"{HERE}/KBC-Weerbericht.pptx"
PX = 6350  # EMU per px on a 1920x1080 canvas

# KBC design tokens (kdl-design-tokens, kbc.be)
NAVY, DEEP, ACC, ACC6, ACC_D = "0D2A50", "021E43", "0097DB", "007AB1", "46ADE0"
LIGHT, WHITE, BODY_L, BODY_D, BORDER = "EFF6FF", "FFFFFF", "45658F", "BFDAFF", "BFDAFF"
YEL, ORA, RED, GRN, CARD_D_LINE, FOOT_D = "FECC00", "F29400", "E2001A", "009036", "1E4474", "8FA9CC"
FONT, MONO = "Nunito Sans", "Courier New"

prs = Presentation()
prs.slide_width, prs.slide_height = Emu(1920 * PX), Emu(1080 * PX)
BLANK = prs.slide_layouts[6]
TOTAL = 23


def E(v):
    return Emu(int(v * PX))


def rgb(h):
    return RGBColor.from_string(h)


class Deck:
    def __init__(self):
        self.n = 0

    def slide(self, bg, transition="fade", notes=""):
        s = prs.slides.add_slide(BLANK)
        s.background.fill.solid()
        s.background.fill.fore_color.rgb = rgb(bg)
        s._anim = []  # steps: (shapes, effect, dur)
        s._trans = transition
        s._dark = bg in (NAVY, DEEP)
        self.n += 1
        s._num = self.n
        if notes:
            s.notes_slide.notes_text_frame.text = notes
        return s


D = Deck()


def runs_of(t):
    """'plain **bold** plain' -> [(text, bold)]"""
    parts = t.split("**")
    return [(p, i % 2 == 1) for i, p in enumerate(parts) if p]


def fill_tf(tf, paras, pad=0, anchor=MSO_ANCHOR.TOP):
    tf.word_wrap = True
    tf.auto_size = MSO_AUTO_SIZE.NONE
    tf.vertical_anchor = anchor
    for side in ("margin_left", "margin_right", "margin_top", "margin_bottom"):
        setattr(tf, side, E(pad if not isinstance(pad, tuple) else pad[0 if "top" in side or "bottom" in side else 1]))
    first = True
    for p in paras:
        para = tf.paragraphs[0] if first else tf.add_paragraph()
        first = False
        para.alignment = {"l": PP_ALIGN.LEFT, "c": PP_ALIGN.CENTER, "r": PP_ALIGN.RIGHT}[p.get("align", "l")]
        para.line_spacing = p.get("lh", 1.25)
        if p.get("before"):
            para.space_before = Pt(p["before"] / 2)
        for text, b in runs_of(p["t"]):
            r = para.add_run()
            r.text = text
            f = r.font
            f.name = p.get("font", FONT)
            f.size = Pt(p.get("size", 32) / 2)
            f.bold = b or p.get("bold", False)
            f.italic = p.get("italic", False)
            f.color.rgb = rgb(p.get("bcolor", p.get("color", NAVY)) if b else p.get("color", NAVY))
            if p.get("caps"):
                rPr = r._r.get_or_add_rPr()
                rPr.set("cap", "all")
                rPr.set("spc", "300")


def text(s, x, y, w, h, paras, anchor=MSO_ANCHOR.TOP):
    if isinstance(paras, dict):
        paras = [paras]
    tb = s.shapes.add_textbox(E(x), E(y), E(w), E(h))
    fill_tf(tb.text_frame, paras, 0, anchor)
    return tb


def box(s, x, y, w, h, fill=WHITE, line=BORDER, radius=16, paras=None, pad=36, anchor=MSO_ANCHOR.TOP, shape=None):
    shp = s.shapes.add_shape(shape or (MSO_SHAPE.ROUNDED_RECTANGLE if radius else MSO_SHAPE.RECTANGLE), E(x), E(y), E(w), E(h))
    if radius and shape is None:
        shp.adjustments[0] = min(0.5, radius / min(w, h))
    if fill:
        shp.fill.solid(); shp.fill.fore_color.rgb = rgb(fill)
    else:
        shp.fill.background()
    if line:
        shp.line.color.rgb = rgb(line); shp.line.width = Emu(2 * PX)
    else:
        shp.line.fill.background()
    shp.shadow.inherit = False
    if paras:
        fill_tf(shp.text_frame, paras, pad, anchor)
    return shp


GIF = os.path.join(HERE, "..", "gif")


def pic(s, key, variant, x, y, w, h):
    path = f"{GIF}/{key}_{variant}.gif"
    iw, ih = Image.open(path).size
    k = min(w / iw, h / ih)
    pw, ph = iw * k, ih * k
    return s.shapes.add_picture(path, E(x + (w - pw) / 2), E(y + (h - ph) / 2), E(pw), E(ph))


def line(s, x1, y1, x2, y2, color=BODY_L, width=3, arrow=False, dash=False):
    c = s.shapes.add_connector(MSO_CONNECTOR.STRAIGHT, E(x1), E(y1), E(x2), E(y2))
    c.line.color.rgb = rgb(color)
    c.line.width = Emu(width * PX)
    ln = c.line._get_or_add_ln()
    if dash:
        etree.SubElement(ln, qn("a:prstDash")).set("val", "dash")
    if arrow:
        t = etree.SubElement(ln, qn("a:tailEnd")); t.set("type", "triangle"); t.set("w", "med"); t.set("len", "med")
    return c


def anim(s, shapes, effect="fade", dur=500, gap=None):
    if not isinstance(shapes, (list, tuple)):
        shapes = [shapes]
    s._anim.append((shapes, effect, dur, gap))


def eyebrow(s, t, y=112, x=128, w=1664, dark=None):
    dark = s._dark if dark is None else dark
    return text(s, x, y, w, 36, {"t": t, "size": 24, "bold": True, "caps": True, "color": ACC_D if dark else ACC6})


def title(s, t, y=156, h=80, size=72, x=128, w=1664, dark=None, color=None):
    dark = s._dark if dark is None else dark
    return text(s, x, y, w, h, {"t": t, "size": size, "bold": True, "lh": 1.05, "color": color or ("FFFFFF" if dark else NAVY)})


def head(s, eb, t, lines=1, size=72):
    a = eyebrow(s, eb)
    b = title(s, t, h=int(size * 1.12 * lines), size=size)
    anim(s, [a, b], "rise", 500)
    return 156 + int(size * 1.12 * lines)


def footer(s, src=None):
    col = FOOT_D if s._dark else BODY_L
    text(s, 128, 1000, 1400, 34, {"t": src or "KBC Weerbericht · Jij kiest het weer · Team Trojan Horse", "size": 22, "color": col})
    text(s, 1592, 1000, 200, 34, {"t": f"{s._num} / {TOTAL}", "size": 22, "color": col, "align": "r"})


def body(t, size=28, color=None, dark=False, **kw):
    return dict(t=t, size=size, color=color or (BODY_D if dark else BODY_L), bcolor="FFFFFF" if dark else NAVY, **kw)


def h3(t, size=40, color=None, dark=False, **kw):
    return dict(t=t, size=size, bold=True, lh=1.1, color=color or ("FFFFFF" if dark else NAVY), **kw)


# ---------------------------------------------------------------- slides
# 1 cover
s = D.slide(NAVY, "fade", "KBC Weerbericht voorspelt je financiële weer, zodat je het zelf kan kiezen. Kate wordt de weervrouw die altijd aan jouw kant staat, ook als dat KBC geld kost. We bouwen geen nieuwe feature, maar een nieuwe manier van kijken.")
a = eyebrow(s, "Tectonic hackathon Kortrijk · Team Trojan Horse", y=230, w=1100)
b = text(s, 128, 290, 1000, 320, {"t": "KBC\nWeerbericht", "size": 140, "bold": True, "lh": 0.95, "color": "FFFFFF"})
zon = pic(s, "zon", "d", 1310, 140, 440, 420)
wolk = pic(s, "bewolkt", "d", 1060, 470, 620, 470)
c = text(s, 128, 630, 1000, 100, {"t": "Jij kiest het weer.", "size": 72, "bold": True, "color": YEL})
d = text(s, 128, 750, 980, 110, body("Een financieel weerbericht voor de komende 14 dagen, met Kate als weervrouw die altijd aan jouw kant staat.", 32, dark=True))
anim(s, a, "fade", 400); anim(s, b, "rise", 700); anim(s, zon, "zoom", 600); anim(s, wolk, "rise", 600)
anim(s, c, "fade", 600); anim(s, d, "fade", 500)

# 2 hook
s = D.slide(LIGHT, "fade", "Openingszin van de pitch. De saldo-melding is het beeld van 0:00 tot 0:20 in de demo. Test-Aankoop 2025: slechts 54% van de gezinnen ervaart geen financiële stress, bijna de helft dus wel.")
a = eyebrow(s, "Het probleem", y=200, w=1000)
b = text(s, 128, 250, 1040, 420, [{"t": "Je bank vertelt je wat er gebeurd is.", "size": 84, "bold": True, "lh": 1.05},
                                  {"t": "Wij vertellen je wat er komt.", "size": 84, "bold": True, "lh": 1.05, "color": ACC6, "before": 20}])
card = box(s, 1232, 320, 560, 290, WHITE, BORDER, 28, [
    {"t": "Gisteren · 23:14", "size": 24, "color": BODY_L},
    {"t": "Je rekening staat € 142,30 in het rood.", "size": 32, "bold": True, "color": RED, "before": 12},
    {"t": "Een melding die altijd te laat komt.", "size": 24, "color": BODY_L, "before": 12}])
st = text(s, 128, 760, 1400, 60, body("Slechts **54%** van de Belgische gezinnen zegt in 2025 géén financiële stress te ervaren.", 32))
footer(s, "Bron: Test-Aankoop, Consumentenbarometer 2025")
anim(s, [a, b], "rise", 600); anim(s, card, "zoom", 500); anim(s, st, "fade", 500)

# 3 probleem
s = D.slide(LIGHT, "fade", "De bank van vandaag vertelt je wat er gebeurd is, niet wat er komt. Vier pijnpunten: achteraf, productdenken, een reactieve assistent en advies met een dubbele pet.")
y0 = head(s, "Het probleem", "Vier redenen waarom bankieren achter de feiten aanloopt", 2) + 40
cards = [("Achteraf in plaats van vooraf", "Overzichten en budgetgrafieken kijken terug. Niemand stuurt zijn leven bij op de grafiek van vorige maand."),
         ("Producten in plaats van mensen", "Een klant is een lijst van rekeningen, kredieten en polissen. Het levensmoment dat ze allemaal raakt, ziet niemand als geheel."),
         ("Kate reageert", "Ze beantwoordt vragen en doet voorstellen, maar de klant moet nog altijd zelf weten dat hij iets moet vragen."),
         ("Advies met een dubbele pet", "Een bank die advies geeft, verkoopt ook. Klanten voelen dat en vertrouwen gepersonaliseerde voorstellen niet volledig.")]
for i, (t, dsc) in enumerate(cards):
    x, y = 128 + (i % 2) * 848, y0 + (i // 2) * 290
    anim(s, box(s, x, y, 816, 270, WHITE, BORDER, 16, [h3(t), body(dsc, before=14)]), "rise", 450)
footer(s)

# 4 cijfers
s = D.slide(NAVY, "fade", "Kate draait sinds oktober 2025 op GPT-4.1, telt 80 miljoen gesprekken sinds de start, en KBC zegt zelf dat Kate nooit iets uitvoert zonder expliciete goedkeuring van de klant. Het weerbericht is de volgende stap: van proactief naar voorspellend.")
y0 = head(s, "Waar we op bouwen", "Van proactief naar voorspellend") + 40
nums = [("2,3 mln", "unieke gebruikers van KBC Mobile in België"), ("5,8 mln", "digitale klanten met Kate in 5 landen"),
        ("70%", "van de klantvragen lost Kate vandaag zelfstandig op"), ("140+", "situaties waarin Kate al proactief voorstellen doet")]
for i, (n, dsc) in enumerate(nums):
    x, y = 128 + (i % 2) * 848, y0 + (i // 2) * 320
    anim(s, box(s, x, y, 816, 300, DEEP, CARD_D_LINE, 16, [{"t": n, "size": 104, "bold": True, "color": YEL, "lh": 1.0}, body(dsc, 32, dark=True, before=10)], pad=(32, 40)), "zoom", 450)
footer(s, "Bronnen: KBC persbericht “Vijf jaar Kate” (24/11/2025) · KBC Newsroom (07/12/2024)")

# 5 concept
s = D.slide(LIGHT, "fade", "Iedereen snapt een weerbericht in twee seconden, van student tot gepensioneerde. De bank ziet geen transacties meer, maar het weer dat eraan komt in iemands leven.")
yb = head(s, "Het concept", "Je app opent met 14 dagen weer")
p = text(s, 128, yb + 16, 1664, 90, body("Elke dag krijgt een weertype, berekend uit vaste lasten, gewoontes, inkomsten en herkende levensmomenten.", 32))
anim(s, p, "fade", 400)
days = [("do 1", "zon", "Zon"), ("vr 2", "donder", "Donder"), ("za 3", "bewolkt", "Bewolkt"), ("zo 4", "zon", "Zon"),
        ("ma 5", "regen", "Regen"), ("di 6", "bewolkt", "Bewolkt"), ("wo 7", "bewolkt", "Bewolkt"),
        ("do 8", "zon", "Zon"), ("vr 9", "donder", "Donder"), ("za 10", "bewolkt", "Bewolkt"), ("zo 11", "zon", "Zon"),
        ("ma 12", "storm", "Storm"), ("di 13", "regen", "Regen"), ("wo 14", "regenboog", "Regenboog")]
y0 = yb + 130
for i, (dname, k, lab) in enumerate(days):
    x, y = 128 + (i % 7) * 240, y0 + (i // 7) * 266
    c = box(s, x, y, 224, 250, WHITE, BORDER, 16)
    t1 = text(s, x, y + 14, 224, 36, {"t": dname, "size": 24, "bold": True, "color": BODY_L, "align": "c"})
    im = pic(s, k, "w", x + 22, y + 56, 180, 140)
    t2 = text(s, x, y + 200, 224, 36, {"t": lab, "size": 24, "align": "c"})
    anim(s, [c, t1, im, t2], "zoom", 300, gap=120)
footer(s, "Illustratie: voorspelling voor oktober 2026 · 3D-iconen geanimeerd in Blender")


# 6-7 lexicon
def lex_rows(s, rows, y0, step, h):
    cols = [(128, 140), (292, 220), (536, 340), (900, 380), (1304, 488)]
    hdr = []
    for (x, w), t in zip(cols, ["Weer", "", "Betekenis", "Voorbeeld", "Wat Kate doet"]):
        hdr.append(text(s, x, y0 - 44, w, 34, {"t": t, "size": 22, "bold": True, "caps": True, "color": ACC6}))
    anim(s, hdr, "fade", 300)
    for i, (icon, name, bet, vb, kate) in enumerate(rows):
        y = y0 + i * step
        grp = [box(s, 128, y, 1664, 2, BORDER, None, 0)]
        if icon in ("seizoen", "klimaat"):
            shp = MSO_SHAPE.BLOCK_ARC if icon == "seizoen" else MSO_SHAPE.DONUT
            grp.append(box(s, 158, y + (h - 80) / 2, 80, 80, ACC, None, 0, shape=shp))
        else:
            grp.append(pic(s, icon, "l", 128, y + 8, 140, h - 16))
        grp.append(text(s, 292, y, 220, h, {"t": name, "size": 36, "bold": True}, MSO_ANCHOR.MIDDLE))
        grp.append(text(s, 536, y, 340, h, {"t": bet, "size": 28, "lh": 1.15}, MSO_ANCHOR.MIDDLE))
        grp.append(text(s, 900, y, 380, h, body(vb, lh=1.15), MSO_ANCHOR.MIDDLE))
        grp.append(text(s, 1304, y, 488, h, {"t": kate, "size": 28, "lh": 1.15}, MSO_ANCHOR.MIDDLE))
        anim(s, grp, "rise", 450)


s = D.slide(LIGHT, "fade", "Het weerlexicon vertaalt financiële situaties naar weer dat iedereen kent. Bewolkt betekent: Kate doet niets. Stilte is ook advies.")
yb = head(s, "Het weerlexicon · 1/2", "Het dagelijkse weer")
lex_rows(s, [("zon", "Zon", "Ruime buffer, geen grote uitgaven", "Loon net binnen", "Stelt voor om een deel naar een doel te sturen"),
             ("bewolkt", "Bewolkt", "Krap maar veilig", "Eind van de maand", "Niets: stilte is ook advies"),
             ("regen", "Regen", "Grote geplande uitgave", "Autoverzekering, schoolrekening", "Toont hoe snel het weer opklaart"),
             ("donder", "Donder", "Piek van impulsuitgaven", "Vrijdagavond uitgaan", "Herschikt de dagen erna, zonder oordeel")],
         yb + 90, 158, 150)
footer(s)

s = D.slide(LIGHT, "fade", "Storm, mist en regenboog zijn de uitzonderlijke dagen. Seizoen en klimaat zijn de lange termijn: een levensfase wisselt de hele voorspelling, het klimaat toont je toekomst-jij.")
yb = head(s, "Het weerlexicon · 2/2", "Extreem weer, seizoen en klimaat")
lex_rows(s, [("storm", "Storm", "Meerdere lasten tegelijk", "Huur, kotwaarborg en verjaardag in één week", "Waarschuwt vooraf, biedt een renteloze buffer van enkele dagen"),
             ("mist", "Mist", "Onzeker inkomen", "Freelancer, interim, seizoenswerk", "Rekent met een bandbreedte in plaats van één getal"),
             ("regenboog", "Regenboog", "Herstel na een zware periode", "Eerste maand zonder rood staan", "Viert het en stelt een volgende stap voor"),
             ("seizoen", "Seizoen", "Een levensfase", "Jong gezin, kind op kot, pensioen", "Wisselt de hele voorspelling en alle playbooks"),
             ("klimaat", "Klimaat", "Je lange termijn", "Pensioen, huis, beleggen", "Toont je toekomst-jij")],
         yb + 86, 128, 122)
footer(s)

# 8 kiezen
s = D.slide(NAVY, "push", "De voorspelling is geen oordeel, maar een knop. Voorbeeld 3: Kate zet een zomerseizoen klaar en toont vanaf wanneer het elke week een beetje opklaart. Dit is het hart van de demo met Lotte.")
yb = head(s, "Jij kiest het weer", "De voorspelling is een knop")
p = text(s, 128, yb + 12, 1664, 50, body("De klant sleept scenario's in de week en ziet het weer live veranderen.", 32, dark=True))
anim(s, p, "fade", 400)
scen = [("“Ik ga vrijdag uit met €60”", [("donder", "vr donder"), ("bewolkt", "za bewolkt"), ("zon", "zo zon")]),
        ("“Ik stel die nieuwe gsm een maand uit”", [("storm", "volgende week"), ("regen", "wordt regen")]),
        ("“Ik wil in augustus op reis”", [("bewolkt", "nu"), ("zon", "elke week zonniger")])]
for i, (q, fc) in enumerate(scen):
    y = yb + 100 + i * 196
    qb = box(s, 128, y, 720, 160, DEEP, CARD_D_LINE, 16, [{"t": q, "size": 36, "bold": True, "color": "FFFFFF", "lh": 1.15}], pad=(20, 36), anchor=MSO_ANCHOR.MIDDLE)
    ar = box(s, 888, y + 55, 100, 50, YEL, None, 0, shape=MSO_SHAPE.RIGHT_ARROW)
    anim(s, qb, "rise", 450); anim(s, ar, "fade", 250)
    for j, (k, lab) in enumerate(fc):
        x = 1030 + j * 250
        im = pic(s, k, "d", x, y - 6, 220, 124)
        tl = text(s, x - 10, y + 120, 240, 40, {"t": lab, "size": 24, "color": BODY_D, "align": "c"})
        anim(s, [im, tl], "zoom", 350, gap=250)
footer(s)

# 9 na donder
s = D.slide(LIGHT, "fade", "Het principe: na regen komt zonneschijn, en de bank toont je hoe snel. Pitchzin: na donder komt zon, geen verwijt, wel een nieuwe week.")
yb = head(s, "Geen betutteling", "Na donder komt zon")
card = box(s, 128, yb + 50, 820, 420, WHITE, BORDER, 28, [
    {"t": "Kate · zaterdag 08:30", "size": 24, "bold": True, "color": ACC6},
    {"t": "“Gisteren was het onweer. Geen probleem, ik heb je week herschikt: vandaag bewolkt, vanaf donderdag weer zon. Je spaardoel voor de reis blijft op schema.”", "size": 36, "lh": 1.3, "before": 16}], pad=44)
anim(s, card, "rise", 500)
for j, k in enumerate(["donder", "bewolkt", "zon"]):
    anim(s, pic(s, k, "l", 1000 + j * 264, yb + 150, 250, 230), "zoom", 450, gap=350)
p = text(s, 128, yb + 520, 1664, 110, body("Geen “je gaf te veel uit aan Panos”. **Een zware uitgave is een weertype, geen fout.**", 32))
anim(s, p, "fade", 500)
footer(s)

# 10 belofte
s = D.slide(YEL, "fade", "De hardste keuze in ons concept, en net daarom de sterkste. Kate evolueert van een assistent die antwoordt naar een meteoroloog die vooruitkijkt: ze meldt zich wanneer het weer verandert en zwijgt wanneer er niets te melden valt.")
z = pic(s, "zon", "y", 1400, 96, 400, 380)
a = text(s, 128, 218, 1200, 36, {"t": "De Kate-belofte", "size": 24, "bold": True, "caps": True})
b = text(s, 128, 270, 1300, 460, {"t": "Kate kiest jou. Ook als dat ons iets kost.", "size": 140, "bold": True, "lh": 0.98})
c = text(s, 128, 760, 1200, 120, {"t": "De marge van KBC is geen input voor Kate's advies. Ze rangschikt opties enkel op wat de klant eraan heeft.", "size": 36, "lh": 1.3})
anim(s, z, "zoom", 600); anim(s, a, "fade", 300); anim(s, b, "rise", 700); anim(s, c, "fade", 500)

# 11 kate advies
s = D.slide(LIGHT, "fade", "Waarom dit KBC geld oplevert: vertrouwen, levenslange klantwaarde en differentiatie. In de demo raadt Kate de familie Peeters een eigen KBC-product af.")
y0 = head(s, "Klant eerst, ook tegen KBC in", "Wat Kate zegt, en waarom dat loont") + 40
ex = [("“Je betaalt €14 per maand voor een verzekering die je sinds je verhuis niet meer nodig hebt. Zal ik ze stopzetten?”", 180),
      ("“Deze KBC-lening is voor jouw situatie niet de goedkoopste optie. Wil je dat ik uitleg waarom?”", 140),
      ("Vergeten abonnementen, dubbele verzekeringen of een te duur energiecontract: Kate spoort ze op en zegt ze op.", 180)]
y = y0
for t, h in ex:
    anim(s, box(s, 128, y, 808, h, WHITE, BORDER, 16, [{"t": t, "size": 28, "lh": 1.3}], pad=(24, 32), anchor=MSO_ANCHOR.MIDDLE), "rise", 400)
    y += h + 20
why = [("Vertrouwen wordt meetbaar", "Wie één keer merkt dat de bank tegen haar eigen omzet in adviseerde, gelooft elk volgend advies."),
       ("Levenslange waarde boven marge", "Een klant die blijft, is meer waard dan één extra verkochte polis."),
       ("Differentiatie", "Elke bank kan personaliseren. Geen enkele bank durft te zeggen dat haar assistent tegen haarzelf in aan jouw kant staat.")]
for i, (t, dsc) in enumerate(why):
    y = y0 + i * 176
    bar = box(s, 984, y, 8, 150, YEL, None, 0)
    tx = text(s, 1016, y, 776, 160, [h3(t, 36), body(dsc, before=8)])
    anim(s, [bar, tx], "rise", 400)
footer(s, "Context: 41% van de Belgen geeft €200 tot €500 per maand uit aan abonnementen (ING-rondvraag)")

# 12 waarschuwing
s = D.slide(NAVY, "push", "Niet elk weer is een budgetkwestie. Code oranje: vroeg en menselijk ingrijpen, niet via een aanmaning drie maanden later. Code rood: de fraudedemo met Jos. Schuilplaats is de emotionele kern: personaliseren betekent ook weten wanneer je moet zwijgen.")
stm = pic(s, "storm", "d", 1500, 60, 300, 250)
anim(s, stm, "zoom", 500)
y0 = head(s, "Weerwaarschuwingen", "Soms beschermen, soms zwijgen") + 54
warn = [(ORA, "Code oranje", "Financiële nood", "Stijgend gokpatroon, voor het eerst uitgestelde betalingen, een loon dat wegvalt.", "Kate grijpt menselijk en vroeg in: een gesprek, een betalingsplan, doorverwijzing naar hulp."),
        (RED, "Code rood", "Fraude", "Eerste overschrijving naar een onbekend IBAN na een “hallo mama, nieuw nummer”-bericht, of een oudere klant die afwijkt van een patroon van jaren.", "Kate houdt de betaling even vast en belt: “Dit lijkt op een bekende oplichting. Mag ik even meekijken?”"),
        (ACC, "Schuilplaats", "Zorgmodus", "Rouw, scheiding of ontslag: de hele bank schakelt om.", "Commerciële communicatie stopt, één vaste contactpersoon, vervaldagen schuiven op, papierwerk stap voor stap.")]
for i, (col, lab, t, sig, act) in enumerate(warn):
    x = 128 + i * 564
    c = box(s, x, y0, 536, 620, DEEP, CARD_D_LINE, 16, [
        {"t": lab, "size": 24, "bold": True, "caps": True, "color": "FFFFFF"}, h3(t, 44, dark=True, before=10),
        body(f"**Signaal.** {sig}", dark=True, before=18, lh=1.3), body(f"**Kate.** {act}", dark=True, before=14, lh=1.3)], pad=(44, 36))
    bar = box(s, x, y0, 536, 14, col, None, 0)
    anim(s, [c, bar], "rise", 500)
footer(s)

# 13 fraude
s = D.slide(LIGHT, "fade", "Febelfin: 49 miljoen euro phishingbuit in 2024; de sector kon 75% van de frauduleuze overschrijvingen detecteren, tegenhouden of terugvorderen. Eerste drie maanden van 2025: meer dan 3,6 miljoen gemelde phishinggevallen. Pitchzin: soms betekent personaliseren beschermen.")
y0 = head(s, "Code rood in cijfers", "Fraudeurs overtuigen mensen steeds vaker zelf te betalen", 2) + 40
fn = [("€49 mln", "buit via phishing in België in 2024"), ("3,6 mln", "gemelde phishingberichten in het eerste kwartaal van 2025"),
      ("75%", "van de frauduleuze overschrijvingen gedetecteerd, tegengehouden of teruggevorderd")]
for i, (n, dsc) in enumerate(fn):
    x = 128 + i * 565
    c = box(s, x, y0, 533, 370, WHITE, BORDER, 16, [{"t": n, "size": 104, "bold": True, "color": RED, "lh": 1.0}, body(dsc, 30, before=10)], pad=(40, 36))
    bar = box(s, x, y0, 533, 12, RED, None, 0)
    anim(s, [c, bar], "zoom", 450)
p = text(s, 128, y0 + 410, 1500, 110, body("Hulpvraagfraude (“hallo mama, nieuw nummer”) omzeilt elke technische check: de klant keurt zelf goed. **Daarom belt Kate vóór de betaling vertrekt.**", 32, lh=1.3))
anim(s, p, "fade", 500)
footer(s, "Bronnen: Febelfin, dossier phishing 2025 · VRT NWS (07/04/2026) · Brussels Times")

# 14 klimaat
s = D.slide(LIGHT, "fade", "Signalen voor een seizoenswissel: een eerste betaling aan een kinderopvang, een maandelijkse overschrijving naar een kotbaas, een huurwaarborg, een wegvallend loon. Dat alles samenbrengen kan alleen een bankverzekeraar als KBC. Playbooks zijn plug-ins op dezelfde motor.")
yb = head(s, "Seizoenen = levensmomenten", "Het weer is je week, het klimaat is je leven", 2)
p = text(s, 128, yb + 12, 1664, 90, body("Een eerste betaling aan een kinderopvang of kotbaas wisselt het seizoen. Er schuift een playbook in dat bank, verzekeren en beleggen samenbrengt.", 30, lh=1.3))
anim(s, p, "fade", 400)
pb = [("Kind op kot", "Kotbudget voor ouder én student samen, kotverzekering, studentenrekening, zomerjob-seizoen.", "Gemiddelde kot in Gent: ± €500 per maand"),
      ("Jong gezin", "Kinderbijslag in de voorspelling, tweedehands babyspullen via partners, een spaarplan voor het kind.", ""),
      ("Verhuis", "Eén verhuisknop voor adreswijziging, energie, brandverzekering en lening.", ""),
      ("Pensioen", "Inkomen dat verandert, nalatenschap plannen, zorgmodus paraat.", "")]
for i, (t, dsc, x_) in enumerate(pb):
    paras = [h3(t), body(dsc, before=12, lh=1.3)] + ([{"t": x_, "size": 24, "bold": True, "color": ACC6, "before": 12}] if x_ else [])
    anim(s, box(s, 128 + i * 422, yb + 120, 398, 450, WHITE, BORDER, 16, paras, pad=32), "rise", 400)
footer(s, "Bron kotprijs: CIB Vlaanderen via student.be (2025)")

# 15 toekomst
s = D.slide(NAVY, "fade", "Klimaat wordt zo tastbaar. In de demo: een audiofragment van toekomst-jij voor Lotte, als slot van 2:40 tot 3:00.")
rb = pic(s, "regenboog", "d", 1332, 72, 460, 236)
a = eyebrow(s, "Klimaat · Toekomst-jij", y=318)
b = text(s, 128, 370, 1500, 260, {"t": "“Weet je nog dat je in 2026 elke maand €50 begon opzij te zetten? Daardoor konden we in 2040 dat huis kopen.”", "size": 64, "bold": True, "lh": 1.2, "color": "FFFFFF"})
c = text(s, 128, 660, 1400, 110, body("De klant praat met zijn eigen stem van over 30 jaar, gemaakt met ElevenLabs. Toekomst-jij rekent op de echte voorspelling en verandert mee als je vandaag ander weer kiest.", 32, dark=True, lh=1.3))
anim(s, rb, "zoom", 700); anim(s, a, "fade", 300); anim(s, b, "fade", 900); anim(s, c, "fade", 500)

# 16 agent
s = D.slide(LIGHT, "fade", "Net zoals een weerdienst zijn voorspelling levert aan je telefoon, je auto en je slimme speaker, levert KBC het financiële weer aan elk kanaal. In de demo bevragen we één endpoint van de Weer-API. Het API-voorbeeld is illustratief.")
yb = head(s, "De klant van 2030", "Vandaag lees jij het weerbericht. Morgen leest je assistent het mee.", 2, size=64) + 36
ch = [("In de app", "Het weerbericht als startscherm, met de knoppen om het weer te kiezen."),
      ("Via Kate", "In woord en stem: meldingen, gesprekken, de ochtend na de donder."),
      ("Via de KBC Weer-API", "De persoonlijke AI-agent van de klant leest het weer en plant er agenda, aankopen en reis mee.")]
for i, (t, dsc) in enumerate(ch):
    y = yb + i * 180
    c = box(s, 128, y, 864, 160, WHITE, BORDER, 16, [h3(t, 32), body(dsc, 26, before=6)], pad=(22, 100), anchor=MSO_ANCHOR.MIDDLE)
    dot = box(s, 156, y + 52, 56, 56, ACC, None, 0, shape=MSO_SHAPE.OVAL, paras=[{"t": str(i + 1), "size": 28, "bold": True, "color": "FFFFFF", "align": "c"}], pad=0, anchor=MSO_ANCHOR.MIDDLE)
    anim(s, [c, dot], "rise", 400)
code = box(s, 1032, yb, 760, 520, NAVY, None, 20, [
    {"t": "agent → KBC Weer-API", "size": 24, "color": FOOT_D, "font": MONO},
    {"t": "“Hoe ziet het weer eruit als mijn eigenaar volgende maand verhuist?”", "size": 26, "color": "FFFFFF", "font": MONO, "before": 14, "lh": 1.3},
    {"t": "GET /weer?scenario=verhuis", "size": 24, "color": ACC_D, "font": MONO, "before": 14},
    {"t": "scope: enkel-lezen", "size": 24, "color": ACC_D, "font": MONO},
    {"t": "→ wk 1 zon · wk 2 storm · wk 3 regen · wk 4 zon", "size": 24, "color": YEL, "font": MONO, "before": 14, "lh": 1.3},
    body("De klant bepaalt welke agents het weer mogen lezen: enkel kijken, of ook handelen binnen grenzen die de klant zet.", 24, dark=True, before=20, lh=1.3)], pad=36)
anim(s, code, "fade", 600)
footer(s, "Context: EU-verordening FiDA gefaseerd vanaf 2027 · KBC: Kate voert niets uit zonder goedkeuring klant (11/2025)")

# 17 motor
s = D.slide(LIGHT, "fade", "De voorspelling zelf is gewone rekenkunde op vaste lasten, gewoontes en inkomsten en kost per klant bijna niets. Daardoor draait ze elke nacht voor alle 2,3 miljoen klanten en werkt ze bij zodra er een nieuw signaal binnenkomt. Het dure taalmodel wordt enkel ingezet voor klanten die die dag effectief een melding krijgen. Een nieuw levensmoment is een nieuw playbook op dezelfde motor, geen nieuw project.")
head(s, "Onder de motorkap · moments engine", "Rekenen voor iedereen, het taalmodel enkel voor wie een melding krijgt", 2, size=56)
steps = [("Signalen", "Transacties, app-gedrag en bevestigingen van de klant"), ("Momenten", "Regels en lichte ML op de stroom, goedkoop per klant"),
         ("Voorspelling", "14 dagen per klant: nachtelijke batch, bijgewerkt bij events"), ("Playbooks", "Seizoen kiezen, advies rangschikken op klantbelang, of zwijgen"),
         ("Kate (Gemini)", "Formuleert de boodschap, enkel voor wie vandaag een melding krijgt"), ("Kanalen", "App, Kate in woord en stem, Weer-API voor agents")]
W, G, TOP, H = 250, 32, 360, 300
for i, (t, dsc) in enumerate(steps):
    x = 128 + i * (W + G)
    hl = i == 4
    b = box(s, x, TOP, W, H, "E5F4FF" if hl else WHITE, ACC6 if hl else BORDER, 16,
            [{"t": str(i + 1), "size": 24, "bold": True, "color": ACC6}, h3(t, 28, before=6), body(dsc, 24, before=8, lh=1.2)], pad=(20, 20))
    grp = [b]
    if i < 5:
        grp.append(line(s, x + W, TOP + H / 2, x + W + G, TOP + H / 2, arrow=True))
    anim(s, grp, "rise", 350, gap=200)
FB = (690, 750, 560, 160)
last_cx, first_cx = 128 + 5 * (W + G) + W / 2, 128 + W / 2
fy = FB[1] + FB[3] / 2
l1 = line(s, last_cx, TOP + H, last_cx, fy, dash=True)
l2 = line(s, last_cx, fy, FB[0] + FB[2], fy, dash=True, arrow=True)
fb = box(s, *FB, "FFF7D6", YEL, 16, [h3("Klant corrigeert", 30), body("Bevestigt of verbetert een herkend moment", 24, before=4)], pad=(18, 28))
l3 = line(s, FB[0], fy, first_cx, fy, dash=True)
l4 = line(s, first_cx, fy, first_cx, TOP + H, dash=True, arrow=True)
t1 = text(s, 1290, fy + 12, 220, 36, body("reactie", 24))
t2 = text(s, 300, fy + 12, 260, 36, body("nieuw signaal", 24))
anim(s, [l1, l2, t1], "fade", 400); anim(s, fb, "zoom", 400); anim(s, [l3, l4, t2], "fade", 400)
footer(s, "Playbooks zijn plug-ins · Stilte is de standaard · Demo: teller met duizenden synthetische klanten")

# 18 vertrouwen
s = D.slide(NAVY, "fade", "Een bank die je leven voorspelt, is een droom of een nachtmerrie. Het verschil zit in controle bij de klant. Personalisatie wordt een gesprek, niet iets dat je overkomt.")
y0 = head(s, "Vertrouwen en privacy", "Controle ligt bij de klant") + 40
tr = [("Altijd een waarom", "Bij elke voorspelling en elk advies een knop “Waarom zie ik dit?” met de signalen die meespeelden."),
      ("De klant corrigeert het model", "“Klopt het dat je kind op kot gaat?” Bevestigen, verbeteren of “hier wil ik niets over horen”."),
      ("Gevoelige momenten enkel met toestemming", "Een zwangerschap of scheiding raadt de bank niet luidop. Ze vraagt eerst of de klant hulp wil."),
      ("Security by design", "Elke klant ziet enkel zijn eigen weer, elke agent enkel wat de klant toeliet. Aikido controleert: geen IDOR, strikte autorisatie.")]
for i, (t, dsc) in enumerate(tr):
    x, y = 128 + (i % 2) * 848, y0 + (i // 2) * 320
    c = box(s, x, y, 816, 300, DEEP, CARD_D_LINE, 16, [h3(t, 34, dark=True), body(dsc, dark=True, before=12, lh=1.3)], pad=(32, 36))
    anim(s, c, "rise", 400)
footer(s)

# 19 personas
s = D.slide(LIGHT, "push", "Lotte toont het kernconcept. Peeters toont seizoenen en de Kate-belofte. Jos toont bescherming met code rood en de ElevenLabs-stem van Kate.")
y0 = head(s, "Demo", "Drie persona's, drie minuten") + 40
per = [("donder", "Lotte, 23", "Eerste job, gaat graag uit, spaart voor een reis.", "Jij kiest het weer, en na donder komt zon."),
       ("storm", "Familie Peeters", "Dochter vertrekt in september op kot in Gent.", "Seizoenswissel, storm voorspeld, Kate raadt een eigen KBC-product af."),
       ("mist", "Jos, 74", "Weduwnaar, woont alleen.", "Weerwaarschuwing code rood bij een fraudepoging.")]
for i, (k, n, sit, demo) in enumerate(per):
    x = 128 + i * 565
    c = box(s, x, y0, 533, 640, WHITE, BORDER, 16)
    im = pic(s, k, "w", x + 30, y0 + 24, 240, 190)
    tx = text(s, x + 36, y0 + 230, 461, 390, [h3(n, 44), body(sit, before=12, lh=1.3), {"t": demo, "size": 28, "bold": True, "lh": 1.3, "before": 24}])
    anim(s, [c, im, tx], "rise", 450)
footer(s, "Alle data is synthetisch. Elke persona heeft een tijdlijn van transacties die we in de demo vooruitspoelen.")


# 20 script, 21 bouwen: tables
def table(s, y, rows, widths, size=24, colors=None, row_h=80):
    shp = s.shapes.add_table(len(rows), len(rows[0]), E(128), E(y), E(1664), E(row_h * len(rows)))
    tbl = shp.table
    for j, w in enumerate(widths):
        tbl.columns[j].width = E(w)
    for i, r in enumerate(rows):
        tbl.rows[i].height = E(row_h if i else 56)
        for j, v in enumerate(r):
            cell = tbl.cell(i, j)
            cell.fill.solid()
            cell.fill.fore_color.rgb = rgb(NAVY if i == 0 else (WHITE if i % 2 else LIGHT))
            cell.margin_left = cell.margin_right = E(18)
            cell.margin_top = cell.margin_bottom = E(10)
            cell.vertical_anchor = MSO_ANCHOR.MIDDLE
            col = "FFFFFF" if i == 0 else ((colors or {}).get((i, j)) or NAVY)
            fill_tf(cell.text_frame, [{"t": v, "size": size, "bold": i == 0 or j == 0 and bool(colors is None), "color": col, "lh": 1.15}], 0, MSO_ANCHOR.MIDDLE)
            cell.margin_left = cell.margin_right = E(18)
    return shp


s = D.slide(LIGHT, "fade", "Demovideo onder drie minuten. Elke scène heeft één pitchzin.")
y0 = head(s, "Demo", "Het script in drie minuten") + 36
script = [("Tijd", "Scène", "Wat we zeggen"),
          ("0:00–0:20", "Een saldo-melding die te laat komt", "“Je bank vertelt je wat er gebeurd is. Wij vertellen je wat er komt.”"),
          ("0:20–1:05", "Lotte sleept “vrijdag uitgaan, €60” in: vrijdag donder, zondag zon, zaterdag de melding van Kate", "“Jij kiest het weer. En na donder komt zon.”"),
          ("1:05–1:45", "Peeters: kotbetaling, seizoen “Kind op kot”, storm in september, buffer en geschrapte polis", "“Kate kiest jou, ook als dat ons iets kost.”"),
          ("1:45–2:15", "Jos: onbekend IBAN na verdacht bericht, code rood, Kate belt", "“Soms betekent personaliseren: beschermen.”"),
          ("2:15–2:40", "Schaalteller met duizenden synthetische klanten, agent bevraagt de Weer-API", "“Dit werkt voor 2,3 miljoen klanten, en voor hun assistenten in 2030.”"),
          ("2:40–3:00", "Toekomst-jij spreekt Lotte toe, slot met de tagline", "“KBC Weerbericht. Jij kiest het weer.”")]
anim(s, table(s, y0, script, [220, 800, 644], 24, row_h=96), "fade", 600)
footer(s)

s = D.slide(LIGHT, "fade", "We bouwen het weerbericht en de motor erachter. De rest tonen we als visie op dezelfde motor.")
y0 = head(s, "Scope", "Wat we vanavond bouwen, wat we pitchen") + 36
bp = [("Onderdeel", "Status vanavond"),
      ("Synthetische klanten: 3 persona's + bulk voor de schaalteller", "Bouwen"),
      ("Weervoorspelling per dag (14 dagen) uit transacties", "Bouwen"),
      ("Jij kiest het weer: scenario's passen de voorspelling live aan", "Bouwen"),
      ("Momentdetectie: kind op kot, fraudesignaal", "Bouwen, regelgebaseerd"),
      ("Kate-meldingen in gewone taal via Gemini", "Bouwen"),
      ("Kate raadt eigen product af (Peeters)", "Bouwen, vaste regel in playbook"),
      ("Code rood met stem via ElevenLabs", "Bouwen als het past"),
      ("Toekomst-jij", "Bonus: één audiofragment"),
      ("Weer-API voor agents", "Eén endpoint in de demo"),
      ("Zorgmodus, verhuisknop, andere playbooks", "Enkel pitch")]
cols = {(i, 1): (ORA if v == "Enkel pitch" else ACC6) for i, (_, v) in enumerate(bp) if i}
anim(s, table(s, y0, bp, [1064, 600], 24, colors=cols, row_h=56), "fade", 600)
footer(s)

# 22 slot
s = D.slide(NAVY, "fade", "Slotzin. Pitchzinnen om te onthouden: na regen komt zonneschijn, en wij tonen je hoe snel. Soms betekent personaliseren zwijgen, soms beschermen.")
for i, k in enumerate(["zon", "bewolkt", "regen", "donder", "storm", "mist", "regenboog"]):
    anim(s, pic(s, k, "d", 212 + i * 216, 220, 200, 180), "zoom", 350, gap=150)
a = text(s, 128, 450, 1664, 140, {"t": "KBC Weerbericht", "size": 120, "bold": True, "color": "FFFFFF", "align": "c"})
b = text(s, 128, 610, 1664, 100, {"t": "Jij kiest het weer.", "size": 72, "bold": True, "color": YEL, "align": "c"})
c = text(s, 310, 750, 1300, 110, body("Iedereen snapt een weerbericht, van student tot gepensioneerde. Daarom werkt het voor 2,3 miljoen klanten.", 32, dark=True, align="c", lh=1.3))
anim(s, a, "rise", 600); anim(s, b, "fade", 600); anim(s, c, "fade", 500)

# 23 bronnen
s = D.slide(LIGHT, "fade", "3D-weericonen gemodelleerd en geanimeerd in Blender 5.2 (EEVEE). Kleuren uit de KBC design tokens (kbc.be); Nunito Sans vervangt het gelicentieerde MuseoSans.")
y0 = head(s, "Bronnen", "Waar de cijfers vandaan komen") + 36
src = ["KBC, persbericht “Kate: vijf jaar, vijf mijlpalen” (24/11/2025), kbc.com",
       "KBC Newsroom, Spaargids.be: beste digitale bank, zesde jaar op rij (07/12/2024)",
       "Test-Aankoop, Consumentenbarometer 2025",
       "Febelfin, “If it smells phishy, it probably is”: dossier phishing (2025)",
       "VRT NWS, phishing-meldingen stijgen (07/04/2026) · Brussels Times, phishing kost Belgen € 40 mln",
       "Student.be / CIB Vlaanderen, gemiddelde kotprijs Gent (2025)",
       "Computable.be, ING-rondvraag abonnementen bij ± 400 Belgen",
       "Herbert Smith Freehills Kramer, EU Financial Data Access Regulation (12/03/2026)",
       "KBC design tokens (kdl-design-tokens), kbc.be",
       "Conceptdocument “KBC Weerbericht: Jij kiest het weer” (@Quinten, 30/09/2026)"]
lst = text(s, 128, y0, 1664, 640, [body("•  " + t, 26, lh=1.25, before=10 if i else 0) for i, t in enumerate(src)])
anim(s, lst, "fade", 600)
footer(s)

assert D.n == TOTAL, D.n

# ---------------------------------------------------------------- animation + transition XML
P = "http://schemas.openxmlformats.org/presentationml/2006/main"


def effect_xml(ids, spid, effect, dur, node):
    i = next(ids)
    preset = {"fade": ("10", "0"), "rise": ("42", "0"), "zoom": ("53", "16")}[effect]
    tgt = f'<p:tgtEl><p:spTgt spid="{spid}"/></p:tgtEl>'
    x = [f'<p:par><p:cTn id="{i}" presetID="{preset[0]}" presetClass="entr" presetSubtype="{preset[1]}" fill="hold" grpId="0" nodeType="{node}"><p:stCondLst><p:cond delay="0"/></p:stCondLst><p:childTnLst>',
         f'<p:set><p:cBhvr><p:cTn id="{next(ids)}" dur="1" fill="hold"><p:stCondLst><p:cond delay="0"/></p:stCondLst></p:cTn>{tgt}<p:attrNameLst><p:attrName>style.visibility</p:attrName></p:attrNameLst></p:cBhvr><p:to><p:strVal val="visible"/></p:to></p:set>',
         f'<p:animEffect transition="in" filter="fade"><p:cBhvr><p:cTn id="{next(ids)}" dur="{dur}"/>{tgt}</p:cBhvr></p:animEffect>']

    def anim_attr(attr, a, b):
        return (f'<p:anim calcmode="lin" valueType="num"><p:cBhvr><p:cTn id="{next(ids)}" dur="{dur}" fill="hold"/>{tgt}'
                f'<p:attrNameLst><p:attrName>{attr}</p:attrName></p:attrNameLst></p:cBhvr><p:tavLst>'
                f'<p:tav tm="0"><p:val><p:strVal val="{a}"/></p:val></p:tav><p:tav tm="100000"><p:val><p:strVal val="{b}"/></p:val></p:tav></p:tavLst></p:anim>')
    if effect == "rise":
        x.append(anim_attr("ppt_x", "#ppt_x", "#ppt_x"))
        x.append(anim_attr("ppt_y", "#ppt_y+.08", "#ppt_y"))
    if effect == "zoom":
        x.append(anim_attr("ppt_w", "#ppt_w*0.3", "#ppt_w"))
        x.append(anim_attr("ppt_h", "#ppt_h*0.3", "#ppt_h"))
    x.append("</p:childTnLst></p:cTn></p:par>")
    return "".join(x)


def timing_xml(steps):
    import itertools
    ids = itertools.count(4)
    t = 0
    outer = []
    spids = []
    for shapes, effect, dur, gap in steps:
        inner = []
        for k, shp in enumerate(shapes):
            inner.append(effect_xml(ids, shp.shape_id, effect, dur, "afterEffect" if k == 0 else "withEffect"))
            spids.append(shp.shape_id)
        outer.append(f'<p:par><p:cTn id="{next(ids)}" fill="hold"><p:stCondLst><p:cond delay="{t}"/></p:stCondLst><p:childTnLst>{"".join(inner)}</p:childTnLst></p:cTn></p:par>')
        t += gap if gap is not None else int(dur * 0.7)
    return (f'<p:timing xmlns:p="{P}"><p:tnLst><p:par><p:cTn id="1" dur="indefinite" restart="never" nodeType="tmRoot"><p:childTnLst>'
            f'<p:seq concurrent="1" nextAc="seek"><p:cTn id="2" dur="indefinite" nodeType="mainSeq"><p:childTnLst>'
            f'<p:par><p:cTn id="3" fill="hold"><p:stCondLst><p:cond delay="indefinite"/><p:cond evt="onBegin" delay="0"><p:tn val="2"/></p:cond></p:stCondLst><p:childTnLst>'
            f'{"".join(outer)}</p:childTnLst></p:cTn></p:par></p:childTnLst></p:cTn>'
            f'<p:prevCondLst><p:cond evt="onPrev" delay="0"><p:tgtEl><p:sldTgt/></p:tgtEl></p:cond></p:prevCondLst>'
            f'<p:nextCondLst><p:cond evt="onNext" delay="0"><p:tgtEl><p:sldTgt/></p:tgtEl></p:cond></p:nextCondLst></p:seq>'
            f'</p:childTnLst></p:cTn></p:par></p:tnLst></p:timing>')


for s in prs.slides:
    root = s._element
    tr = {"fade": '<p:fade/>', "push": '<p:push dir="u"/>'}[s._trans]
    root.append(etree.fromstring(f'<p:transition xmlns:p="{P}" spd="med">{tr}</p:transition>'))
    if s._anim:
        root.append(etree.fromstring(timing_xml(s._anim)))

prs.save(OUT)
print("saved", OUT)
