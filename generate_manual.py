#!/usr/bin/env python3
"""
PrFin MIS - User Manual PDF Generator
Generates a professional, detailed PDF document for the PrFin MIS application.
"""

import os
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import cm, mm
from reportlab.lib.colors import HexColor, white, black
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_CENTER, TA_JUSTIFY, TA_LEFT, TA_RIGHT
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle,
    PageBreak, Image, KeepTogether, HRFlowable, ListFlowable, ListItem
)
from reportlab.platypus.flowables import Flowable
from reportlab.graphics.shapes import Drawing, Rect, Line

# ============================================================
# COLORS
# ============================================================
NAVY = HexColor('#1e2a4a')
GOLD = HexColor('#b8942e')
GOLD_LIGHT = HexColor('#f5f0e0')
INDIGO = HexColor('#3F51B5')
INDIGO_LIGHT = HexColor('#e8eaf6')
GREEN_DARK = HexColor('#1b5e20')
GREEN_MED = HexColor('#2e7d32')
GREEN_LIGHT = HexColor('#e8f5e9')
BLUE_LIGHT = HexColor('#e3f2fd')
BLUE_DARK = HexColor('#0d47a1')
ORANGE_LIGHT = HexColor('#fff3e0')
ORANGE_DARK = HexColor('#e65100')
RED_LIGHT = HexColor('#ffebee')
RED_DARK = HexColor('#b71c1c')
PURPLE_LIGHT = HexColor('#f3e5f5')
PURPLE_DARK = HexColor('#6a1b9a')
GREY_BG = HexColor('#fafafa')
GREY_LIGHT = HexColor('#f5f5f5')
GREY_TEXT = HexColor('#555555')
GREY_BORDER = HexColor('#cccccc')
WHITE = white
TEXT_COLOR = HexColor('#2c2c2c')

# ============================================================
# PATHS
# ============================================================
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
LOGO_PATH = os.path.join(BASE_DIR, 'public', 'layout', 'images', 'logo', 'Welcome.PNG')
OUTPUT_PATH = os.path.join(BASE_DIR, 'public', 'PrFin_MIS_Manuel_Utilisateur.pdf')

W = A4[0] - 4*cm  # usable width


# ============================================================
# CUSTOM FLOWABLES
# ============================================================
class ColoredBox(Flowable):
    """A colored box with left border accent."""
    def __init__(self, text, bg_color, border_color, width=None, style=None):
        super().__init__()
        self.text = text
        self.bg_color = bg_color
        self.border_color = border_color
        self._width = width or W
        self.style = style or styles['Body']

    def wrap(self, availWidth, availHeight):
        self._width = min(self._width, availWidth)
        p = Paragraph(self.text, self.style)
        pw, ph = p.wrap(self._width - 1.8*cm, availHeight)
        self._height = ph + 0.8*cm
        return self._width, self._height

    def draw(self):
        c = self.canv
        # background
        c.setFillColor(self.bg_color)
        c.roundRect(0, 0, self._width, self._height, 5, fill=1, stroke=0)
        # left border
        c.setFillColor(self.border_color)
        c.roundRect(0, 0, 7, self._height, 3, fill=1, stroke=0)
        # text
        p = Paragraph(self.text, self.style)
        p.wrap(self._width - 1.8*cm, self._height)
        p.drawOn(c, 1*cm, 0.35*cm)


class GoldDivider(Flowable):
    """A decorative gold divider line."""
    def __init__(self, width=None):
        super().__init__()
        self._width = width or W

    def wrap(self, availWidth, availHeight):
        self._width = availWidth
        return self._width, 8

    def draw(self):
        c = self.canv
        mid = self._width / 2
        c.setStrokeColor(GOLD)
        c.setLineWidth(2)
        c.line(mid - 4*cm, 4, mid - 0.5*cm, 4)
        c.line(mid + 0.5*cm, 4, mid + 4*cm, 4)
        c.setFillColor(GOLD)
        c.circle(mid, 4, 3, fill=1, stroke=0)


class SectionNumber(Flowable):
    """A decorative section number circle."""
    def __init__(self, number, title):
        super().__init__()
        self.number = str(number)
        self.title = title

    def wrap(self, availWidth, availHeight):
        return availWidth, 1.2*cm

    def draw(self):
        c = self.canv
        # Circle with number
        c.setFillColor(INDIGO)
        c.circle(0.6*cm, 0.6*cm, 0.5*cm, fill=1, stroke=0)
        c.setFillColor(WHITE)
        c.setFont('Helvetica-Bold', 14)
        c.drawCentredString(0.6*cm, 0.35*cm, self.number)
        # Title
        c.setFillColor(NAVY)
        c.setFont('Helvetica-Bold', 18)
        c.drawString(1.5*cm, 0.3*cm, self.title)
        # Underline
        c.setStrokeColor(GOLD)
        c.setLineWidth(2)
        c.line(1.5*cm, 0, self.canv._pagesize[0] - 4*cm, 0)


# ============================================================
# STYLES
# ============================================================
styles = getSampleStyleSheet()

def add_style(name, **kwargs):
    if name in styles.byName:
        return
    parent = kwargs.pop('parent_name', 'BodyText')
    styles.add(ParagraphStyle(name, parent=styles[parent], **kwargs))

add_style('ManualTitle', parent_name='Title', fontSize=32, textColor=NAVY, spaceAfter=6, fontName='Helvetica-Bold', alignment=TA_CENTER)
add_style('ManualSubtitle', parent_name='Normal', fontSize=14, textColor=GREY_TEXT, alignment=TA_CENTER, spaceAfter=4, fontName='Helvetica')
add_style('CoverSlogan', parent_name='Normal', fontSize=15, textColor=GOLD, alignment=TA_CENTER, fontName='Helvetica-Oblique', spaceBefore=20)
add_style('H1', parent_name='Heading1', fontSize=22, textColor=NAVY, fontName='Helvetica-Bold', spaceBefore=20, spaceAfter=14)
add_style('H2', parent_name='Heading2', fontSize=16, textColor=NAVY, fontName='Helvetica-Bold', spaceBefore=20, spaceAfter=10, leftIndent=0)
add_style('H3', parent_name='Heading3', fontSize=13, textColor=INDIGO, fontName='Helvetica-Bold', spaceBefore=14, spaceAfter=8, leftIndent=0)
add_style('Body', fontSize=11, textColor=TEXT_COLOR, fontName='Helvetica', leading=17, alignment=TA_JUSTIFY, spaceAfter=8)
add_style('BodyBold', fontSize=11, textColor=TEXT_COLOR, fontName='Helvetica-Bold', leading=17, spaceAfter=4)
add_style('BulletItem', fontSize=11, textColor=TEXT_COLOR, fontName='Helvetica', leading=17, leftIndent=24, bulletIndent=10, spaceAfter=4)
add_style('SubBullet', fontSize=10.5, textColor=TEXT_COLOR, fontName='Helvetica', leading=16, leftIndent=44, bulletIndent=30, spaceAfter=3)
add_style('StepNum', fontSize=11, textColor=TEXT_COLOR, fontName='Helvetica', leading=17, leftIndent=28, bulletIndent=10, spaceAfter=5)
add_style('NoteText', fontSize=10.5, textColor=GREEN_DARK, fontName='Helvetica', leading=16)
add_style('WarnText', fontSize=10.5, textColor=ORANGE_DARK, fontName='Helvetica-Bold', leading=16)
add_style('InfoText', fontSize=10.5, textColor=BLUE_DARK, fontName='Helvetica', leading=16)
add_style('ExampleText', fontSize=10.5, textColor=PURPLE_DARK, fontName='Helvetica-Oblique', leading=16)
add_style('TOCNum', parent_name='Normal', fontSize=13, textColor=NAVY, fontName='Helvetica-Bold', leading=22, spaceAfter=1, leftIndent=10)
add_style('TOCSub', parent_name='Normal', fontSize=11, textColor=GREY_TEXT, fontName='Helvetica', leading=18, spaceAfter=1, leftIndent=30)
add_style('Footer', parent_name='Normal', fontSize=8, textColor=GREY_TEXT, alignment=TA_CENTER)
add_style('MenuPath', fontSize=11, textColor=INDIGO, fontName='Helvetica-BoldOblique', leading=17, spaceAfter=6, leftIndent=10)
add_style('TableHeader', fontSize=10, textColor=WHITE, fontName='Helvetica-Bold', leading=14, alignment=TA_LEFT)
add_style('TableCell', fontSize=10, textColor=TEXT_COLOR, fontName='Helvetica', leading=14, alignment=TA_LEFT)


# ============================================================
# HELPER FUNCTIONS
# ============================================================
def note_box(text):
    return ColoredBox(text, GREEN_LIGHT, GREEN_MED, style=styles['NoteText'])

def warn_box(text):
    return ColoredBox(text, ORANGE_LIGHT, ORANGE_DARK, style=styles['WarnText'])

def info_box(text):
    return ColoredBox(text, BLUE_LIGHT, BLUE_DARK, style=styles['InfoText'])

def example_box(text):
    return ColoredBox(text, PURPLE_LIGHT, PURPLE_DARK, style=styles['ExampleText'])

def menu(path):
    return f'<font color="#3F51B5"><b>{path}</b></font>'

def bold(text):
    return f'<b>{text}</b>'

def make_table(headers, rows, col_widths=None):
    """Create a professionally styled table."""
    # Wrap text in Paragraphs for proper formatting
    header_style = ParagraphStyle('_th', parent=styles['Normal'], fontSize=10, textColor=WHITE, fontName='Helvetica-Bold', leading=13)
    cell_style = ParagraphStyle('_td', parent=styles['Normal'], fontSize=10, textColor=TEXT_COLOR, fontName='Helvetica', leading=13)

    proc_headers = [Paragraph(h, header_style) for h in headers]
    proc_rows = []
    for row in rows:
        proc_rows.append([Paragraph(str(c), cell_style) for c in row])

    data = [proc_headers] + proc_rows
    if col_widths is None:
        col_widths = [W / len(headers)] * len(headers)

    t = Table(data, colWidths=col_widths, repeatRows=1)
    style_cmds = [
        ('BACKGROUND', (0, 0), (-1, 0), NAVY),
        ('TEXTCOLOR', (0, 0), (-1, 0), WHITE),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('TOPPADDING', (0, 0), (-1, 0), 10),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 10),
        ('TOPPADDING', (0, 1), (-1, -1), 7),
        ('BOTTOMPADDING', (0, 1), (-1, -1), 7),
        ('LEFTPADDING', (0, 0), (-1, -1), 10),
        ('RIGHTPADDING', (0, 0), (-1, -1), 10),
        ('GRID', (0, 0), (-1, -1), 0.5, GREY_BORDER),
        ('LINEBELOW', (0, 0), (-1, 0), 2, GOLD),
    ]
    for i in range(1, len(data)):
        if i % 2 == 0:
            style_cmds.append(('BACKGROUND', (0, i), (-1, i), INDIGO_LIGHT))
    t.setStyle(TableStyle(style_cmds))
    return t


def step_box_table(title, steps):
    """Create a beautiful step-by-step box using a table."""
    cell_style = ParagraphStyle('_step', parent=styles['Normal'], fontSize=10.5, textColor=TEXT_COLOR, fontName='Helvetica', leading=16)
    num_style = ParagraphStyle('_snum', parent=styles['Normal'], fontSize=10, textColor=WHITE, fontName='Helvetica-Bold', leading=14, alignment=TA_CENTER)

    data = []
    for i, step in enumerate(steps, 1):
        # Number cell with colored background
        num_para = Paragraph(str(i), num_style)
        step_para = Paragraph(step, cell_style)
        data.append([num_para, step_para])

    t = Table(data, colWidths=[0.8*cm, W - 1.2*cm])
    style_cmds = [
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('TOPPADDING', (0, 0), (-1, -1), 6),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
        ('LEFTPADDING', (0, 0), (0, -1), 4),
        ('LEFTPADDING', (1, 0), (1, -1), 10),
        ('RIGHTPADDING', (0, 0), (-1, -1), 6),
        ('BACKGROUND', (0, 0), (-1, -1), GREY_BG),
        ('ROUNDEDCORNERS', [6, 6, 6, 6]),
        ('BOX', (0, 0), (-1, -1), 1, GREY_BORDER),
        ('LINEBELOW', (0, 0), (-1, -2), 0.5, HexColor('#e0e0e0')),
    ]
    # Color the number cells
    for i in range(len(data)):
        style_cmds.append(('BACKGROUND', (0, i), (0, i), INDIGO))
        style_cmds.append(('TEXTCOLOR', (0, i), (0, i), WHITE))

    t.setStyle(TableStyle(style_cmds))

    # Wrap with title
    title_para = Paragraph(f'<font color="#1e2a4a"><b>{title}</b></font>', styles['BodyBold'])
    return KeepTogether([title_para, Spacer(1, 4), t, Spacer(1, 8)])


def section(num, title):
    """Create a section header with number badge."""
    return KeepTogether([
        SectionNumber(num, title),
        Spacer(1, 0.3*cm)
    ])

def h2(text): return Paragraph(text, styles['H2'])
def h3(text): return Paragraph(text, styles['H3'])
def p(text): return Paragraph(text, styles['Body'])
def pb(text): return Paragraph(text, styles['BodyBold'])
def bullet(text): return Paragraph(f'<bullet>&bull;</bullet> {text}', styles['BulletItem'])
def sub_bullet(text): return Paragraph(f'<bullet>-</bullet> {text}', styles['SubBullet'])
def menu_path(path): return Paragraph(f'<font color="#3F51B5"><b>Chemin : {path}</b></font>', styles['MenuPath'])
def spacer(h=0.3): return Spacer(1, h*cm)
def hr(): return HRFlowable(width="100%", thickness=2, color=GOLD, spaceAfter=12, spaceBefore=12)


def page_header_footer(canvas, doc):
    """Add header line and footer to each page."""
    canvas.saveState()
    # Header line
    canvas.setStrokeColor(INDIGO)
    canvas.setLineWidth(1)
    canvas.line(2*cm, A4[1] - 1.5*cm, A4[0] - 2*cm, A4[1] - 1.5*cm)
    canvas.setFont('Helvetica', 7)
    canvas.setFillColor(GREY_TEXT)
    canvas.drawString(2*cm, A4[1] - 1.35*cm, "PrFin MIS - Manuel d'Utilisation")
    canvas.drawRightString(A4[0] - 2*cm, A4[1] - 1.35*cm, "CONFIDENTIEL")

    # Footer
    canvas.setStrokeColor(GOLD)
    canvas.setLineWidth(1.5)
    canvas.line(2*cm, 1.6*cm, A4[0] - 2*cm, 1.6*cm)
    canvas.setFont('Helvetica', 8)
    canvas.setFillColor(GREY_TEXT)
    canvas.drawString(2*cm, 1*cm, "Professional Financial Management Information System")
    canvas.drawRightString(A4[0] - 2*cm, 1*cm, f"Page {doc.page}")
    canvas.drawCentredString(A4[0]/2, 1*cm, "Version 10.0 - 2026")
    canvas.restoreState()

def first_page(canvas, doc):
    """Cover page has no header/footer."""
    pass


# ============================================================
# BUILD DOCUMENT
# ============================================================
def build_manual():
    doc = SimpleDocTemplate(
        OUTPUT_PATH, pagesize=A4,
        leftMargin=2*cm, rightMargin=2*cm,
        topMargin=2*cm, bottomMargin=2.5*cm,
        title="PrFin MIS - Manuel d'Utilisation",
        author="INFOSTEAM",
        subject="Manuel utilisateur complet"
    )
    story = []

    # ==================== COVER PAGE ====================
    story.append(Spacer(1, 2*cm))
    if os.path.exists(LOGO_PATH):
        story.append(Image(LOGO_PATH, width=12*cm, height=12*cm, kind='proportional'))
    story.append(Spacer(1, 0.8*cm))
    story.append(Paragraph("MANUEL D'UTILISATION", styles['ManualTitle']))
    story.append(GoldDivider())
    story.append(Spacer(1, 0.3*cm))
    story.append(Paragraph("PROFESSIONAL FINANCIAL MANAGEMENT", styles['ManualSubtitle']))
    story.append(Paragraph("INFORMATION SYSTEM", styles['ManualSubtitle']))
    story.append(Paragraph("<i>Good Finance. Real Impact.</i>", styles['CoverSlogan']))
    story.append(Spacer(1, 3*cm))

    # Version box
    ver_data = [
        [Paragraph('<b>Version</b>', styles['TableCell']), Paragraph('10.0', styles['TableCell'])],
        [Paragraph('<b>Date</b>', styles['TableCell']), Paragraph('2026', styles['TableCell'])],
        [Paragraph('<b>Statut</b>', styles['TableCell']), Paragraph('Document confidentiel - Usage interne', styles['TableCell'])],
    ]
    ver_table = Table(ver_data, colWidths=[3.5*cm, 8*cm])
    ver_table.setStyle(TableStyle([
        ('BOX', (0, 0), (-1, -1), 2, NAVY),
        ('GRID', (0, 0), (-1, -1), 0.5, GREY_BORDER),
        ('BACKGROUND', (0, 0), (0, -1), INDIGO_LIGHT),
        ('TOPPADDING', (0, 0), (-1, -1), 6),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
        ('LEFTPADDING', (0, 0), (-1, -1), 10),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ]))
    story.append(ver_table)
    story.append(PageBreak())

    # ==================== TABLE OF CONTENTS ====================
    story.append(Paragraph("TABLE DES MATIERES", styles['H1']))
    story.append(hr())
    story.append(spacer(0.3))

    toc = [
        ("0", "Introduction et Connexion au Systeme", [
            "Comment se connecter", "Comprendre l'interface", "Naviguer dans les tableaux", "Se deconnecter"
        ]),
        ("1", "Gestion des Clients", [
            "Creer un client individuel", "Creer un client entreprise", "Rechercher un client", "Statuts des clients", "Modifier / Archiver"
        ]),
        ("2", "Gestion des Groupes Solidaires", [
            "Creer un groupe", "Ajouter des membres", "Roles des membres", "Cycle de vie"
        ]),
        ("3", "Donnees de Reference", [
            "Par module", "Qui peut modifier"
        ]),
        ("4", "Module Produits Financiers", [
            "Configurer devises et frais", "Creer un produit de credit", "Parametres de calcul"
        ]),
        ("5", "Module Epargne (Operations)", [
            "Gestion de caisse", "Ouverture de compte", "Versement", "Retrait", "Virement",
            "Attestations et documents", "Cloture journaliere"
        ]),
        ("6", "Module Credit", [
            "Cycle complet", "Creer une demande", "Analyse financiere",
            "Visite de terrain", "Comite de credit", "Decaissement"
        ]),
        ("7", "Module Remboursement", [
            "Echeancier", "Enregistrer un paiement", "Retards et classification",
            "Recouvrement", "Restructuration", "Prelevement automatique"
        ]),
        ("8", "Module Comptabilite", [
            "Configuration", "Saisie des ecritures", "Clotures", "Comptes internes", "Rapports comptables"
        ]),
        ("9", "Rapprochement Bancaire", [
            "Types de rapprochement", "Rapprochement bancaire", "Gestion des ecarts"
        ]),
        ("10", "Module Depenses", [
            "Creer une demande", "Approbation multi-niveaux", "Paiement", "Budgets", "Petite caisse"
        ]),
        ("11", "Tableaux de Bord", [
            "Direction Generale", "Chef d'Agence", "Operations Credit", "Comptabilite"
        ]),
        ("12", "Administration et Utilisateurs", [
            "Creer un utilisateur", "Permissions par module", "Securite"
        ]),
        ("13", "Journal d'Audit (Tracabilite)", [
            "Informations enregistrees", "Consultation"
        ]),
        ("14", "Conseils, Bonnes Pratiques et Glossaire", []),
    ]
    for num, title, subs in toc:
        story.append(Paragraph(f'<b>{num}.</b>  {title}', styles['TOCNum']))
        if subs:
            sub_text = ' | '.join(subs)
            story.append(Paragraph(f'<font color="#888888">{sub_text}</font>', styles['TOCSub']))

    story.append(PageBreak())

    # ==================== OVERVIEW ====================
    story.append(Paragraph("VUE D'ENSEMBLE DU SYSTEME", styles['H1']))
    story.append(hr())
    story.append(p(
        "<b>PrFin MIS</b> (Professional Financial Management Information System) est une plateforme integree "
        "concue specialement pour les institutions de microfinance. Elle couvre l'ensemble du cycle financier : "
        "de l'enregistrement des clients jusqu'a la production des etats financiers, en passant par l'epargne, "
        "le credit, le remboursement, la comptabilite et la gestion des depenses."
    ))
    story.append(p(
        "Le systeme est accessible via un navigateur web (Google Chrome recommande). Chaque utilisateur "
        "dispose d'un compte personnel avec un nom d'utilisateur (adresse e-mail) et un mot de passe. "
        "Les menus visibles dependent des permissions attribuees a chaque utilisateur par l'administrateur."
    ))
    story.append(spacer(0.3))

    story.append(h3("Flux quotidien d'une agence"))
    story.append(step_box_table("Comment se deroule une journee typique ?", [
        "<b>Le matin :</b> Chaque caissier ouvre sa caisse en saisissant le solde d'ouverture (qui doit correspondre au solde de cloture de la veille).",
        "<b>Accueil des clients :</b> Les agents enregistrent de nouveaux clients, les caissiers effectuent les versements et retraits, les agents de credit traitent les demandes.",
        "<b>Operations du jour :</b> Toutes les transactions sont enregistrees dans le systeme en temps reel : depots, retraits, virements, paiements de credit, demandes de depenses.",
        "<b>En fin de journee :</b> Chaque caissier fait son comptage physique de billets et pieces, compare avec le solde systeme, et cloture sa caisse.",
        "<b>Cloture journaliere :</b> Le responsable d'agence lance la cloture journaliere qui verrouille toutes les operations du jour.",
        "<b>En fin de mois :</b> Le comptable verifie les ecritures, effectue le rapprochement bancaire, et lance la cloture mensuelle.",
        "<b>En fin d'annee :</b> Le comptable prepare les etats financiers (bilan, compte de resultat) et lance la cloture annuelle.",
    ]))
    story.append(spacer(0.3))

    story.append(h3("Modules du systeme"))
    story.append(make_table(
        ['N.', 'Module', 'Description detaillee', 'Qui l\'utilise ?'],
        [
            ['1', 'Enregistrement\nClients', 'Creation et suivi des clients individuels (personnes physiques),\ndes clients entreprises (personnes morales) et des groupes solidaires.\nGestion des statuts, validation, mise en liste noire.', 'Agents de terrain,\nguichetiers'],
            ['2', 'Produits\nFinanciers', 'Configuration des produits de credit : taux d\'interet, duree,\nmontants min/max, methodes de calcul, frais applicables,\ntypes de garanties exigees.', 'Administrateurs,\nresponsables produits'],
            ['3', 'Operations\n(Epargne)', 'Gestion quotidienne : ouverture de comptes, versements (depots),\nretraits, virements entre comptes, gestion de caisse,\ncarnets de cheques, attestations.', 'Caissiers,\nguichetiers'],
            ['4', 'Credit', 'Cycle complet de la demande de credit : initialisation, collecte\nde documents, analyse financiere, visite terrain, comite de\ncredit, decision, decaissement.', 'Agents de credit,\nanalystes, comite'],
            ['5', 'Rembour-\nsement', 'Suivi des echeanciers, enregistrement des paiements, detection\nautomatique des retards, calcul des penalites, recouvrement\ndes impayes, restructuration des prets en difficulte.', 'Agents de credit,\nagents recouvrement'],
            ['6', 'Compta-\nbilite', 'Plan comptable SYSCOHADA, saisie des ecritures (brouillard puis\nvalidation), journaux comptables, clotures journaliere/mensuelle/\nannuelle, rapports : bilan, balance, grand livre, compte de resultat.', 'Comptables'],
            ['7', 'Rapproche-\nment', 'Comparaison des soldes : releve bancaire vs ecritures, comptage\ncaisse vs systeme, portefeuille credits vs comptabilite,\nsoldes epargnants vs comptabilite.', 'Comptables,\nauditeurs'],
            ['8', 'Depenses', 'Gestion des depenses de fonctionnement avec approbation\nmulti-niveaux (N1, N2, N3), suivi budgetaire, petite caisse,\ngestion des fournisseurs.', 'Tous les employes,\nmanagers, DG'],
            ['9', 'Tableaux\nde Bord', 'Indicateurs de performance (KPIs) en temps reel adaptes\na chaque role : DG, chef d\'agence, agent de credit,\ncomptable.', 'Direction,\nmanagers'],
            ['10', 'Adminis-\ntration', 'Creation et gestion des comptes utilisateurs, attribution\ndes roles et permissions, consultation du journal d\'audit\n(tracabilite de toutes les actions).', 'Administrateurs\nsysteme'],
        ],
        col_widths=[0.8*cm, 2.2*cm, 9.5*cm, 3*cm]
    ))
    story.append(PageBreak())

    # ==================== SECTION 0: CONNEXION ====================
    story.append(section(0, "Introduction et Connexion"))
    story.append(spacer(0.3))

    story.append(h2("0.1 Comment se connecter au systeme ?"))
    story.append(p("Pour acceder a PrFin MIS, vous avez besoin d'un ordinateur avec un navigateur web et d'une connexion au reseau de l'institution."))
    story.append(step_box_table("Etapes de connexion detaillees", [
        "<b>Ouvrez Google Chrome</b> sur votre ordinateur. Chrome est le navigateur recommande car il offre la meilleure compatibilite avec le systeme. Si Chrome n'est pas installe, vous pouvez utiliser Microsoft Edge ou Firefox.",
        "<b>Tapez l'adresse du systeme</b> dans la barre d'adresse en haut du navigateur. Cette adresse vous a ete communiquee par l'administrateur (exemple : http://192.168.1.100:3000). Appuyez sur la touche <b>Entree</b> de votre clavier.",
        "<b>La page de connexion s'affiche.</b> Vous verrez le logo PrFin MIS sur le cote droit et un formulaire de connexion sur le cote gauche avec deux champs a remplir.",
        "<b>Saisissez votre nom d'utilisateur</b> dans le premier champ. Il s'agit de votre adresse e-mail professionnelle (exemple : jean.ndayisaba@institution.bi). Faites attention aux majuscules et aux fautes de frappe.",
        "<b>Saisissez votre mot de passe</b> dans le second champ. Les caracteres s'affichent sous forme de points pour des raisons de securite. Si vous souhaitez verifier ce que vous avez tape, cliquez sur l'icone en forme d'oeil a droite du champ.",
        "<b>Cliquez sur le bouton bleu ENTRER</b> pour vous connecter. Si vos identifiants sont corrects, vous serez redirige vers la page d'accueil du systeme.",
        "<b>En cas d'erreur</b>, un message rouge s'affiche en haut a droite. Verifiez votre nom d'utilisateur et votre mot de passe. Apres 5 tentatives echouees, votre compte sera temporairement bloque pendant 15 minutes.",
    ]))
    story.append(spacer())
    story.append(warn_box(
        "<b>SECURITE - Regles essentielles :</b><br/>"
        "- Ne partagez JAMAIS votre mot de passe avec un collegue, meme votre superieur<br/>"
        "- Chaque utilisateur DOIT avoir son propre compte personnel<br/>"
        "- Toutes vos actions sont enregistrees automatiquement a votre nom dans le journal d'audit<br/>"
        "- En cas d'oubli de mot de passe, contactez l'administrateur systeme pour reinitialiser<br/>"
        "- Deconnectez-vous TOUJOURS avant de quitter votre poste de travail"
    ))

    story.append(h2("0.2 Comprendre l'interface du systeme"))
    story.append(p("Une fois connecte, l'ecran principal est compose de quatre zones distinctes que vous devez connaitre :"))
    story.append(make_table(
        ['Zone', 'Position\nsur l\'ecran', 'Description detaillee'],
        [
            ['Barre du haut\n(Topbar)', 'Tout en haut\nde l\'ecran', "Bande coloree qui contient :\n- A gauche : le logo de l'institution\n- Au centre : le nom du systeme\n  'PROFESSIONAL FINANCIAL MANAGEMENT...'\n- A droite : votre nom, votre role (ex: CAISSIER),\n  et un menu deroulant pour vous deconnecter"],
            ['Barre de\nnavigation\n(Navbar)', 'Juste sous\nla topbar', "Bande contenant tous les menus du systeme :\nEnregistrement clients, Produits Finances,\nOperations, Credit, Remboursement, Comptabilite,\nRapprochement, Depenses, Administration, etc.\nCliquez sur un menu pour voir ses sous-menus."],
            ['Fil d\'Ariane\n(Breadcrumb)', 'Sous la\nnavbar', "Ligne de texte montrant votre position actuelle.\nExemple : Accueil > Comptabilite > Rapports > Balance\nVous pouvez cliquer sur chaque niveau\npour remonter dans la hierarchie."],
            ['Zone de\ncontenu', 'Centre de\nla page', "C'est la zone principale ou vous travaillez.\nElle affiche les formulaires de saisie, les tableaux\nde donnees, les rapports et les graphiques.\nSon contenu change selon le menu selectionne."],
        ],
        col_widths=[2.5*cm, 2.5*cm, 12*cm]
    ))
    story.append(spacer())
    story.append(note_box(
        "<b>Astuce :</b> Vous ne voyez que les menus correspondant a vos permissions. Si un menu est absent, "
        "c'est normal : votre role ne vous y donne pas acces. Contactez l'administrateur si vous pensez "
        "avoir besoin d'un acces supplementaire."
    ))

    story.append(h2("0.3 Comment utiliser les tableaux de donnees ?"))
    story.append(p(
        "La majorite des ecrans du systeme affichent les donnees sous forme de tableaux interactifs. "
        "Voici toutes les fonctionnalites a votre disposition :"
    ))
    story.append(make_table(
        ['Fonctionnalite', 'Comment faire ?', 'Resultat obtenu'],
        [
            ['Recherche\nglobale', 'Tapez un mot cle dans la barre\nde recherche situee en haut du\ntableau', 'Le tableau se filtre en temps reel\npendant que vous tapez. Seules les\nlignes contenant votre mot s\'affichent.'],
            ['Tri par\ncolonne', 'Cliquez une fois sur l\'en-tete\nd\'une colonne (le nom de la\ncolonne)', 'Les donnees sont triees par ordre\ncroissant (A-Z ou 0-9). Cliquez a\nnouveau pour l\'ordre decroissant.'],
            ['Pagination', 'Utilisez les boutons numerotes\n(1, 2, 3...) en bas du tableau,\nou changez le nombre de lignes\npar page (10, 25, 50)', 'Naviguez entre les differentes\npages de resultats.'],
            ['Voir les\ndetails', 'Cliquez sur l\'icone oeil (bleu)\na droite d\'une ligne', 'Ouvre une vue detaillee en lecture\nseule de l\'element selectionne.'],
            ['Modifier', 'Cliquez sur l\'icone crayon\n(jaune/orange) a droite\nd\'une ligne', 'Ouvre le formulaire de modification\npre-rempli avec les donnees actuelles.'],
            ['Supprimer', 'Cliquez sur l\'icone corbeille\n(rouge) a droite d\'une ligne', 'Une boite de dialogue demande\nconfirmation avant de supprimer.'],
            ['Valider /\nApprouver', 'Cliquez sur l\'icone coche\n(verte) a droite d\'une ligne', 'Valide ou approuve l\'element.\nAction irreversible dans certains cas.'],
        ],
        col_widths=[2.5*cm, 6*cm, 8.5*cm]
    ))

    story.append(h2("0.4 Comment se deconnecter ?"))
    story.append(step_box_table("Deconnexion du systeme", [
        "Cliquez sur <b>votre nom et votre role</b> affiches en haut a droite de l'ecran (dans la barre du haut).",
        "Un petit <b>menu deroulant</b> apparait en dessous de votre nom.",
        "Cliquez sur le <b>bouton de deconnexion</b> (icone de sortie / porte avec fleche).",
        "Vous etes automatiquement redirige vers la <b>page de connexion</b>. Votre session est terminee.",
    ]))
    story.append(spacer())
    story.append(warn_box(
        "<b>IMPORTANT :</b> Deconnectez-vous TOUJOURS avant de quitter votre poste, surtout si l'ordinateur "
        "est partage avec d'autres collegues. Ne laissez jamais votre session ouverte sans surveillance. "
        "Toute action effectuee sous votre compte est tracee a votre nom."
    ))
    story.append(PageBreak())

    # ==================== SECTION 1: CLIENTS ====================
    story.append(section(1, "Gestion des Clients"))
    story.append(spacer(0.3))
    story.append(p(
        "Ce module est le point de depart de toute activite dans le systeme. Un client doit etre "
        "enregistre dans PrFin MIS <b>avant</b> de pouvoir ouvrir un compte d'epargne, rejoindre un groupe "
        "solidaire ou deposer une demande de credit. Le systeme gere deux types de clients : les <b>clients "
        "individuels</b> (personnes physiques : agriculteurs, commercants, salaries...) et les <b>clients "
        "entreprises</b> (personnes morales : societes, associations, cooperatives...)."
    ))

    story.append(h2("1.1 Comment creer un nouveau client individuel ?"))
    story.append(menu_path("Enregistrement des clients > Clients > onglet 'Nouveau Client'"))
    story.append(step_box_table("Creation d'un client individuel - etape par etape", [
        "<b>Accedez au module Clients :</b> Dans la barre de navigation, cliquez sur le menu 'Enregistrement des clients', puis selectionnez 'Enregistrement du client'. La page des clients s'affiche avec deux onglets en haut.",
        "<b>Ouvrez le formulaire :</b> Cliquez sur l'onglet 'Nouveau Client' (le second onglet). Un formulaire vierge apparait a l'ecran.",
        "<b>Selectionnez le type 'Individuel' :</b> En haut du formulaire, choisissez le type de client 'Individuel' pour une personne physique.",
        "<b>Remplissez le NOM du client :</b> Saisissez le nom de famille du client exactement tel qu'il apparait sur sa piece d'identite. Utilisez des MAJUSCULES si possible (exemple : NDAYISABA).",
        "<b>Remplissez le PRENOM :</b> Saisissez le ou les prenoms du client (exemple : Jean-Pierre).",
        "<b>Saisissez le TELEPHONE :</b> Entrez le numero de telephone principal du client avec l'indicatif si necessaire (exemple : +257 79 123 456). Ce numero sera utilise pour contacter le client.",
        "<b>Selectionnez l'AGENCE :</b> Dans la liste deroulante, choisissez l'agence a laquelle le client sera rattache. C'est l'agence ou il effectuera ses operations.",
        "<b>Selectionnez la PROVINCE et la COMMUNE :</b> Choisissez le lieu de residence du client. Selectionnez d'abord la province, puis la commune qui se met a jour automatiquement.",
        "<b>Completez les informations optionnelles :</b> Si le client fournit ses documents, saisissez :<br/>"
        "- <b>Date de naissance</b> et <b>lieu de naissance</b><br/>"
        "- <b>Genre</b> (Masculin/Feminin) et <b>Nationalite</b><br/>"
        "- <b>Type de piece d'identite</b> (CNI, Passeport, Permis...) et son <b>numero</b><br/>"
        "- <b>Etat civil</b> (Celibataire, Marie, Veuf...)<br/>"
        "- <b>Profession</b> et <b>revenus mensuels estimes</b><br/>"
        "- <b>Adresse complete</b> et <b>e-mail</b>",
        "<b>Verifiez toutes les informations :</b> Relisez attentivement chaque champ avant de sauvegarder. Les erreurs de saisie sont difficiles a corriger une fois le client valide.",
        "<b>Cliquez sur le bouton vert 'Enregistrer' :</b> Le systeme attribue automatiquement un <b>numero de client unique</b> (exemple : CLT-2026-0001). Ce numero identifie le client dans tout le systeme.",
    ]))
    story.append(spacer())
    story.append(example_box(
        "<b>Exemple concret :</b> Mme Marie NIYONZIMA se presente a l'agence de Gitega avec sa carte nationale "
        "d'identite. L'agent cree un client de type 'Individuel', saisit : Nom = NIYONZIMA, Prenom = Marie, "
        "Telephone = +257 79 456 789, Agence = Gitega Centre, Province = Gitega, Commune = Gitega. "
        "Il ajoute le numero de CNI et la date de naissance. Apres enregistrement, Marie recoit le "
        "numero client CLT-2026-0042. Elle peut maintenant ouvrir un compte d'epargne."
    ))

    story.append(h2("1.2 Informations detaillees d'un client"))
    story.append(make_table(
        ['Champ', 'Obligatoire ?', 'Description detaillee et format attendu'],
        [
            ['Nom', 'OUI *', "Nom de famille tel qu'il apparait sur la piece d'identite officielle. En majuscules de preference."],
            ['Prenom', 'OUI *', "Prenom(s) du client. Saisissez tous les prenoms si le client en a plusieurs."],
            ['Date de naissance', 'Non', "Format JJ/MM/AAAA. Permet de calculer l'age du client et de verifier sa majorite."],
            ['Lieu de naissance', 'Non', "Ville ou commune de naissance du client."],
            ['Genre', 'Non', "Masculin ou Feminin. Utile pour les statistiques et rapports."],
            ['Nationalite', 'Non', "Pays d'origine du client. Par defaut : Burundaise."],
            ['Type piece identite', 'Non', "Type de document officiel : CNI, Passeport, Permis de conduire, Acte de naissance."],
            ['Numero piece', 'Non', "Numero unique du document d'identite. Saisir exactement comme sur le document."],
            ['Telephone', 'OUI *', "Numero principal pour contacter le client. Format : +257 XX XXX XXX."],
            ['Agence', 'OUI *', "Agence de rattachement du client. Selectionnez dans la liste deroulante."],
            ['Province', 'OUI *', "Province de residence du client."],
            ['Commune', 'OUI *', "Commune de residence. Se met a jour selon la province selectionnee."],
            ['Profession', 'Non', "Activite principale : Agriculteur, Commercant, Enseignant, Fonctionnaire..."],
            ['Revenus mensuels', 'Non', "Estimation des revenus mensuels en FBu. Important pour l'evaluation de credit."],
            ['Etat civil', 'Non', "Celibataire, Marie(e), Divorce(e), Veuf(ve). Impact sur les garanties de credit."],
        ],
        col_widths=[3*cm, 2*cm, 12*cm]
    ))

    story.append(h2("1.3 Comment rechercher un client existant ?"))
    story.append(menu_path("Enregistrement des clients > Clients > onglet 'Liste des Clients'"))
    story.append(step_box_table("Recherche et consultation d'un client", [
        "<b>Accedez a la liste des clients :</b> Cliquez sur l'onglet 'Liste des Clients'. Un tableau affiche tous les clients enregistres dans le systeme.",
        "<b>Utilisez la barre de recherche :</b> En haut du tableau, tapez le nom, le prenom, le numero de client ou le numero de telephone. Le tableau se filtre automatiquement pendant que vous tapez.",
        "<b>Consultez les details :</b> Cliquez sur l'icone oeil (bleu) a droite de la ligne du client pour voir toutes ses informations en detail.",
        "<b>Modifiez si necessaire :</b> Cliquez sur l'icone crayon (jaune) pour modifier les informations du client. Enregistrez les modifications.",
        "<b>Archivez si necessaire :</b> Cliquez sur l'icone corbeille (rouge) pour archiver un client. Le systeme demande confirmation avant de proceder.",
    ]))

    story.append(h2("1.4 Les statuts d'un client"))
    story.append(p("Chaque client passe par differents statuts au cours de sa relation avec l'institution. Comprendre ces statuts est essentiel :"))
    story.append(make_table(
        ['Statut', 'Signification detaillee', 'Le client peut-il\nfaire des operations ?'],
        [
            ['PROSPECT', "Le client vient d'etre cree dans le systeme. Son dossier\nn'a pas encore ete verifie par un responsable. C'est le\nstatut initial de tout nouveau client.", 'NON\n(en attente de\nvalidation)'],
            ['EN ATTENTE', "Le dossier du client a ete soumis pour verification.\nUn responsable doit examiner les informations et les\npieces justificatives avant de l'activer.", 'NON\n(en cours de\nverification)'],
            ['ACTIF', "Le client a ete valide et approuve par un responsable.\nIl peut maintenant ouvrir des comptes d'epargne,\nrejoindre des groupes et demander des credits.", 'OUI\n(toutes les\noperations)'],
            ['INACTIF', "Le compte du client a ete suspendu temporairement.\nRaisons possibles : inactivite prolongee, informations\na mettre a jour, demande du client.", 'NON\n(compte\nsuspendu)'],
            ['LISTE NOIRE', "Le client est interdit de toute operation avec\nl'institution. Raisons : fraude averee, impayes graves\net repetitifs, faux documents.", 'NON\n(interdit\ndefinitivement)'],
        ],
        col_widths=[2.5*cm, 10*cm, 4.5*cm]
    ))
    story.append(spacer())
    story.append(warn_box(
        "<b>REGLE FONDAMENTALE :</b> Seuls les clients ayant le statut ACTIF peuvent :<br/>"
        "- Ouvrir un compte d'epargne<br/>"
        "- Etre ajoutes a un groupe solidaire<br/>"
        "- Deposer une demande de credit<br/>"
        "- Effectuer des versements et des retraits<br/>"
        "Si un client n'apparait pas dans les listes de selection, verifiez d'abord son statut."
    ))
    story.append(PageBreak())

    # ==================== SECTION 2: GROUPES ====================
    story.append(section(2, "Gestion des Groupes Solidaires"))
    story.append(spacer(0.3))
    story.append(p(
        "Un groupe solidaire est une association de clients (generalement entre 5 et 30 personnes) qui se "
        "portent garants les uns des autres pour obtenir des credits. Le principe est simple : si un membre "
        "ne peut pas rembourser, les autres membres du groupe s'engagent a payer a sa place. Ce mecanisme "
        "reduit le risque pour l'institution et permet d'accorder des credits a des personnes qui n'ont pas "
        "de garantie materielle (hypotheque, nantissement)."
    ))

    story.append(h2("2.1 Comment creer un groupe solidaire ?"))
    story.append(menu_path("Enregistrement des clients > Enregistrement du groupe"))
    story.append(step_box_table("Creation d'un groupe solidaire", [
        "<b>Informations de base du groupe :</b> Saisissez le nom du groupe (ex: 'TWIYUNGE' - nom choisi par les membres), le type de groupe, la date de formation, et selectionnez l'agence de rattachement.",
        "<b>Localisation :</b> Selectionnez la province, la commune et la zone/colline ou le groupe se reunit habituellement.",
        "<b>Calendrier de reunion :</b> Definissez la frequence des reunions (hebdomadaire, bimensuelle ou mensuelle), le jour de la semaine (ex: Lundi), l'heure (ex: 14h00), et le lieu de reunion (ex: Sous le manguier du marche de Gitega).",
        "<b>Parametres financiers :</b> Definissez la cotisation d'adhesion (montant a payer pour rejoindre le groupe), l'objectif d'epargne mensuel par membre, le type de garantie solidaire, et le montant de garantie.",
        "<b>Enregistrez le groupe :</b> Cliquez sur 'Enregistrer'. Le groupe est cree avec le statut 'En formation'. Vous pouvez maintenant ajouter des membres.",
    ]))

    story.append(h2("2.2 Comment ajouter des membres au groupe ?"))
    story.append(step_box_table("Ajout de membres", [
        "Dans la liste des groupes, reperer votre groupe et cliquer sur l'<b>icone membres</b> (icone en forme de deux personnes) a droite de la ligne.",
        "Cliquez sur le bouton <b>'Ajouter un membre'</b>. Un formulaire de recherche s'affiche.",
        "<b>Recherchez le client</b> par son nom ou son numero. ATTENTION : seuls les clients au statut 'Actif' apparaissent dans la liste. Si un client n'apparait pas, verifiez d'abord que son statut est bien 'Actif'.",
        "<b>Selectionnez le client</b> dans les resultats de recherche.",
        "<b>Attribuez un role</b> au membre dans le groupe :<br/>"
        "- <b>President :</b> Dirige les reunions, represente le groupe aupres de l'institution<br/>"
        "- <b>Secretaire :</b> Redige les proces-verbaux des reunions, tient les registres<br/>"
        "- <b>Tresorier :</b> Gere les fonds collectes, fait les comptes du groupe<br/>"
        "- <b>Membre :</b> Participant ordinaire sans fonction specifique",
        "<b>Definissez la contribution aux parts</b> de ce membre (le nombre de parts qu'il detient dans le groupe).",
        "Cliquez sur <b>'Enregistrer'</b>. Le membre est ajoute a la liste des membres du groupe.",
    ]))
    story.append(spacer())
    story.append(note_box(
        "<b>Astuce :</b> Un groupe doit avoir au minimum un President, un Secretaire et un Tresorier. "
        "Chaque role ne peut etre attribue qu'a un seul membre. Un client ne peut etre membre "
        "que d'un seul groupe solidaire a la fois."
    ))

    story.append(h2("2.3 Cycle de vie d'un groupe"))
    story.append(make_table(
        ['Statut', 'Signification detaillee', 'Actions possibles a ce stade'],
        [
            ['En formation', "Le groupe vient d'etre cree. Les membres sont\nen cours d'ajout. Le groupe n'est pas encore\noperationnel.", "Ajouter des membres, retirer des\nmembres, modifier les informations\ndu groupe."],
            ['En attente', "Tous les membres ont ete ajoutes et le groupe\na ete soumis pour approbation par un\nresponsable.", "Aucune modification possible.\nLe responsable examine le dossier."],
            ['Actif', "Le groupe a ete approuve par un responsable.\nIl est maintenant operationnel et ses membres\npeuvent demander des credits solidaires.", "Demander des credits, effectuer\ndes operations financieres,\ntenir des reunions."],
            ['Suspendu', "Les activites du groupe sont temporairement\narretees (ex: impaye important, conflit\ninterne, demande du groupe).", "Aucune nouvelle operation.\nConsultation uniquement.\nPeut etre reactive."],
            ['Dissous', "Le groupe est definitivement ferme. Tous les\ncredits en cours doivent etre soldes avant\nla dissolution.", "Consultation de l'historique\nuniquement. Impossible a reactiver."],
        ],
        col_widths=[2.5*cm, 8*cm, 6.5*cm]
    ))
    story.append(PageBreak())

    # ==================== SECTION 3: DONNÉES DE RÉFÉRENCE ====================
    story.append(section(3, "Donnees de Reference"))
    story.append(spacer(0.3))
    story.append(p(
        "Les donnees de reference sont les <b>listes de valeurs configurables</b> utilisees dans tous les "
        "formulaires du systeme. Par exemple : la liste des provinces, les types de pieces d'identite, "
        "les secteurs d'activite, les categories de depenses, etc. Ces listes doivent etre configurees "
        "<b>avant de commencer a utiliser le systeme</b> car elles alimentent les menus deroulants."
    ))
    story.append(warn_box(
        "<b>QUI PEUT MODIFIER ?</b> Seuls les utilisateurs disposant de la permission 'SETTINGS' du module "
        "concerne peuvent ajouter, modifier ou supprimer des donnees de reference. Les utilisateurs "
        "ordinaires ne peuvent que consulter ces listes."
    ))
    story.append(spacer())
    story.append(make_table(
        ['Module', 'Chemin du menu', 'Elements a configurer'],
        [
            ['Clients', 'Enregistrement clients\n> Parametres de base', "- Provinces et Communes\n- Types de piece d'identite\n- Nationalites\n- Secteurs d'activite\n- Types de societe\n- Agences/Branches"],
            ['Produits\nFinanciers', 'Produits Finances\n> (chaque sous-menu)', "- Devises (BIF, USD, EUR)\n- Types de produit\n- Types de frais\n- Types de garanties\n- Frequences de paiement\n- Methodes de calcul d'interet"],
            ['Epargne', 'Operations\n> Donnees de Reference', "- Types d'operations\n- Statuts de livret\n- Durees de terme (pour DAT)\n- Niveaux d'autorisation de retrait"],
            ['Credit', 'Credit > Ref. Demandes\nRef. Profil Client\nRisque & Scoring', "- Statuts de demande\n- Objets de credit\n- Types de documents\n- Decisions du comite\n- Types de revenus/depenses\n- Niveaux de risque\n- Regles de scoring"],
            ['Rembour-\nsement', 'Remboursement\n> Donnees de Reference', "- Modes de remboursement\n- Etapes de recouvrement\n- Classifications de retard\n- Config. penalites\n- Regles de rappel"],
            ['Depenses', 'Depenses\n> Donnees de Reference', "- Categories de depenses\n- Niveaux de priorite\n- Modes de paiement\n- Seuils d'approbation\n- Fournisseurs"],
        ],
        col_widths=[2.2*cm, 3.8*cm, 11*cm]
    ))
    story.append(PageBreak())

    # ==================== SECTION 4: PRODUITS FINANCIERS ====================
    story.append(section(4, "Module Produits Financiers"))
    story.append(spacer(0.3))
    story.append(p(
        "Avant de pouvoir accorder des credits aux clients, l'institution doit d'abord <b>configurer ses "
        "produits de credit</b>. Un produit de credit definit toutes les conditions : quel montant minimum "
        "et maximum peut etre accorde, quel est le taux d'interet, quelle est la duree du pret, comment "
        "les interets sont calcules, quels frais sont factures, et quelles garanties sont exigees."
    ))
    story.append(p(
        "Cette configuration est generalement faite une seule fois par l'administrateur ou le responsable "
        "des produits, puis les agents de credit utilisent ces produits lors de la creation des demandes."
    ))

    story.append(h2("4.1 Pre-requis : elements a configurer avant de creer un produit"))
    story.append(p("Avant de creer votre premier produit de credit, assurez-vous d'avoir configure les elements suivants :"))
    story.append(make_table(
        ['Element', 'Chemin du menu', 'Pourquoi c\'est necessaire ?'],
        [
            ['Devises', 'Produits Finances >\nDevises', "Au moins une devise doit etre active\n(ex: BIF - Franc Burundais). Le produit\nde credit sera libelle dans cette devise."],
            ['Types de Frais', 'Produits Finances >\nTypes de Frais', "Definissez les frais que vous facturez :\nfrais de dossier, prime d'assurance,\ncommission, etc. Chaque frais a un\nnom et un mode de calcul."],
            ['Types de\nGaranties', 'Produits Finances >\nTypes de Garanties', "Definissez les types de garanties que\nvous acceptez : hypotheque, nantissement\nde materiel, caution solidaire, depot\nde garantie."],
            ['Frequences de\nPaiement', 'Produits Finances >\nFrequences de Paiement', "Definissez les frequences de remboursement\ndisponibles : mensuel, bimensuel,\ntrimestriel, semestriel, annuel."],
            ['Methodes de\nCalcul d\'Interet', 'Produits Finances >\nInterest Calculation', "Definissez les methodes de calcul :\n- Lineaire : memes interets chaque mois\n- Degressif : interets qui diminuent\n- In fine : interets payes a la fin"],
        ],
        col_widths=[3*cm, 4*cm, 10*cm]
    ))

    story.append(h2("4.2 Comment creer un produit de credit ?"))
    story.append(menu_path("Produits Finances > Tous les Produits > Nouveau Produit"))
    story.append(step_box_table("Creation complete d'un produit de credit", [
        "<b>Informations generales :</b> Saisissez un code unique pour le produit (ex: CRED-AGR pour Credit Agriculture), un nom descriptif (ex: 'Credit Agriculture'), une description detaillee, selectionnez le type de produit et la devise.",
        "<b>Parametres de montant :</b> Definissez le montant minimum que vous pouvez accorder (ex: 500 000 FBu) et le montant maximum (ex: 10 000 000 FBu). Aucun agent ne pourra creer une demande en dehors de cette fourchette.",
        "<b>Parametres de duree :</b> Definissez la duree minimum du pret (ex: 6 mois) et la duree maximum (ex: 36 mois). La duree est toujours exprimee en mois.",
        "<b>Taux d'interet :</b> Saisissez le taux annuel (ex: 18% par an) et selectionnez la methode de calcul :<br/>"
        "- <b>Lineaire (flat) :</b> Les interets sont les memes chaque mois, calcules sur le montant initial<br/>"
        "- <b>Degressif :</b> Les interets diminuent chaque mois car ils sont calcules sur le capital restant du<br/>"
        "- <b>In fine :</b> Les interets sont payes en une seule fois a la fin du pret",
        "<b>Penalites de retard :</b> Definissez le taux de penalite applique en cas de retard de paiement (ex: 2% du montant en retard par mois).",
        "<b>Ajout des frais :</b> Cliquez sur 'Ajouter un frais' pour chaque frais applicable. Pour chacun, selectionnez le type de frais et le taux ou montant (ex: Frais de dossier = 2% du montant emprunte, Assurance = 1%).",
        "<b>Ajout des garanties :</b> Cliquez sur 'Ajouter une garantie' pour chaque type de garantie exige (ex: Caution solidaire obligatoire, Nantissement de stock optionnel).",
        "<b>Enregistrement :</b> Verifiez tous les parametres, puis cliquez sur 'Enregistrer'. Le produit est cree et peut etre utilise par les agents de credit lors de la creation des demandes.",
    ]))
    story.append(spacer())
    story.append(example_box(
        "<b>Exemple concret :</b> L'institution cree le produit 'Credit Petit Commerce' avec le code CRED-COM : "
        "Montant de 200 000 a 5 000 000 FBu, duree de 3 a 24 mois, taux de 24% annuel en degressif, "
        "frais de dossier de 3%, pas de frais d'assurance, garantie caution solidaire obligatoire. "
        "Ce produit sera disponible pour tous les agents de credit lors de la creation des demandes."
    ))
    story.append(PageBreak())

    # ==================== SECTION 5: ÉPARGNE ====================
    story.append(section(5, "Module Epargne (Operations)"))
    story.append(spacer(0.3))
    story.append(p(
        "Ce module est le <b>coeur des operations quotidiennes</b> au guichet de l'agence. C'est le module "
        "le plus utilise par les caissiers et les guichetiers. Il gere toutes les operations liees aux "
        "comptes d'epargne des clients : ouverture de comptes, versements (depots d'argent), retraits "
        "(sorties d'argent), virements entre comptes, et la gestion de la caisse physique."
    ))

    story.append(h2("5.1 Gestion de Caisse - La PREMIERE chose a faire chaque matin"))
    story.append(menu_path("Operations > Operations Journalieres > Gestion de Caisse"))
    story.append(p(
        "La gestion de caisse est OBLIGATOIRE. Chaque caissier doit ouvrir sa caisse en debut de journee "
        "avant de pouvoir effectuer la moindre operation, et la fermer en fin de journee."
    ))
    story.append(step_box_table("Ouverture de caisse (a faire chaque matin AVANT toute operation)", [
        "<b>Accedez a la Gestion de Caisse</b> depuis le menu Operations > Operations Journalieres > Gestion de Caisse.",
        "<b>Verifiez votre caisse physique :</b> Avant de toucher au systeme, comptez physiquement l'argent dans votre tiroir-caisse. Ce montant doit correspondre au solde de cloture de la veille.",
        "<b>Saisissez le solde d'ouverture</b> dans le champ prevu. Ce montant represente l'argent physiquement present dans votre caisse au debut de la journee.",
        "<b>Cliquez sur 'Ouvrir la Caisse'.</b> Le systeme enregistre l'heure d'ouverture et votre solde de depart.",
        "<b>Votre caisse est maintenant ouverte.</b> Vous pouvez commencer a recevoir les clients pour des versements et des retraits.",
    ]))
    story.append(spacer())
    story.append(step_box_table("Cloture de caisse (a faire chaque soir AVANT de quitter)", [
        "<b>Comptez physiquement</b> tous les billets et pieces dans votre caisse. Faites un comptage par coupure : combien de billets de 10 000, de 5 000, de 2 000, de 1 000, etc.",
        "<b>Saisissez le detail du comptage</b> dans le systeme : indiquez le nombre de billets pour chaque coupure.",
        "<b>Le systeme calcule automatiquement :</b><br/>"
        "- Le <b>total de votre comptage physique</b> (basee sur les coupures saisies)<br/>"
        "- Le <b>solde theorique</b> (solde d'ouverture + versements recus - retraits effectues)<br/>"
        "- L'<b>ecart</b> entre les deux montants",
        "<b>Si les deux montants correspondent :</b> Votre caisse est equilibree. Bravo !<br/>"
        "<b>Si il y a un ecart :</b> Vous devez le justifier (erreur de saisie, erreur de comptage, etc.). L'ecart sera signale au responsable.",
        "<b>Cliquez sur 'Cloturer la Caisse'.</b> Votre caisse est fermee pour la journee. Le solde de cloture deviendra le solde d'ouverture de demain.",
    ]))
    story.append(spacer())
    story.append(warn_box(
        "<b>REGLE ABSOLUE :</b> Vous ne pouvez PAS effectuer de versements ou de retraits tant que votre caisse "
        "n'est pas ouverte. Le systeme vous bloquera automatiquement. De meme, ne quittez JAMAIS l'agence "
        "sans avoir cloture votre caisse."
    ))

    story.append(h2("5.2 Ouvrir un compte d'epargne pour un client"))
    story.append(menu_path("Operations > Epargne Libre > Ouverture Compte"))
    story.append(step_box_table("Ouverture d'un nouveau compte d'epargne", [
        "<b>Recherchez le client :</b> Dans le champ de recherche, tapez le nom ou le numero du client. IMPORTANT : le client doit avoir le statut 'Actif'. S'il n'apparait pas, verifiez son statut dans le module Clients.",
        "<b>Selectionnez le client</b> dans la liste des resultats. Ses informations (nom, telephone, agence) s'affichent automatiquement.",
        "<b>Choisissez le type de compte :</b><br/>"
        "- <b>Epargne libre :</b> Le client peut deposer et retirer de l'argent quand il veut, sans contrainte de duree. C'est le type le plus courant.<br/>"
        "- <b>Depot a Terme (DAT) :</b> L'argent est bloque pour une duree definie (3 mois, 6 mois, 12 mois...) en echange d'un taux d'interet plus eleve. Le client ne peut pas retirer avant l'echeance.<br/>"
        "- <b>Epargne obligatoire :</b> Un versement regulier est obligatoire (souvent lie a un credit). Le montant et la frequence sont fixes.",
        "<b>Remplissez les parametres du compte :</b> Montant minimum a maintenir sur le compte, et autres parametres specifiques au type de compte choisi.",
        "<b>Cliquez sur 'Enregistrer' :</b> Le systeme attribue automatiquement un <b>numero de compte unique</b> (ex: EP-2026-00001). Communiquez ce numero au client.",
    ]))

    story.append(h2("5.3 Effectuer un Versement (Depot d'argent)"))
    story.append(menu_path("Operations > Operations Journalieres > Versement"))
    story.append(p("Quand un client se presente au guichet pour deposer de l'argent sur son compte :"))
    story.append(step_box_table("Versement - etape par etape", [
        "<b>Selectionnez le compte du client :</b> Tapez le numero de compte ou le nom du client dans le champ de recherche. Selectionnez le bon compte dans la liste.",
        "<b>Verifiez les informations affichees :</b> Le systeme montre le nom du client, le numero de compte, le type de compte et le solde actuel. Confirmez avec le client que c'est bien son compte.",
        "<b>Saisissez le montant du depot :</b> Tapez le montant exact que le client souhaite deposer. Comptez l'argent remis par le client DEUX FOIS pour eviter les erreurs.",
        "<b>Verifiez le montant avec le client :</b> Avant de valider, annoncez le montant au client et demandez-lui de confirmer. Exemple : 'Vous deposez 500 000 FBu, c'est bien ca ?'",
        "<b>Cliquez sur 'Valider' :</b> Le versement est enregistre. Le solde du compte est <b>immediatement mis a jour</b>.",
        "<b>Imprimez le bordereau de depot :</b> Cliquez sur le bouton 'Imprimer' pour generer le bordereau. <b>Remettez-le OBLIGATOIREMENT au client</b> : c'est sa preuve de depot.",
        "<b>Rangez l'argent dans votre caisse :</b> Placez les billets recus dans votre tiroir-caisse.",
    ]))
    story.append(spacer())
    story.append(warn_box(
        "<b>ATTENTION :</b> Verifiez TOUJOURS le montant avec le client AVANT de cliquer sur 'Valider'. "
        "Apres validation, l'operation ne peut PAS etre annulee. En cas d'erreur, il faudra "
        "effectuer une operation corrective (retrait du meme montant), ce qui necessite l'approbation "
        "d'un responsable."
    ))

    story.append(h2("5.4 Effectuer un Retrait (Sortie d'argent)"))
    story.append(menu_path("Operations > Operations Journalieres > Retrait"))
    story.append(p("Quand un client souhaite retirer de l'argent de son compte :"))
    story.append(step_box_table("Retrait - etape par etape", [
        "<b>Selectionnez le compte du client :</b> Tapez le numero de compte ou le nom du client. Selectionnez le bon compte.",
        "<b>Verifiez l'identite du client :</b> Demandez une piece d'identite et comparez avec les informations du systeme. Pour les retraits importants, la verification d'identite est OBLIGATOIRE.",
        "<b>Saisissez le montant du retrait :</b> Tapez le montant que le client souhaite retirer.",
        "<b>Le systeme effectue des verifications automatiques :</b><br/>"
        "- Le <b>solde est-il suffisant ?</b> Si le solde est inferieur au montant demande, le retrait est refuse.<br/>"
        "- Le <b>solde minimum</b> sera-t-il respecte ? Chaque compte a un solde minimum a maintenir.<br/>"
        "- Y a-t-il un <b>montant bloque</b> ? (ex: garantie de credit, nantissement). Si oui, ce montant n'est pas disponible pour retrait.",
        "<b>Validation multi-niveaux selon le montant :</b><br/>"
        "- <b>Petit montant</b> (ex: moins de 500 000 FBu) : le caissier peut valider seul<br/>"
        "- <b>Montant moyen</b> (ex: 500 000 a 2 000 000 FBu) : un superviseur doit verifier et approuver<br/>"
        "- <b>Gros montant</b> (ex: plus de 2 000 000 FBu) : le responsable d'agence doit approuver<br/>"
        "Les seuils sont configurables par l'administrateur.",
        "<b>Une fois toutes les approbations obtenues :</b> Cliquez sur 'Decaisser'. Comptez l'argent DEUX FOIS avant de le remettre au client.",
        "<b>Faites signer le client :</b> Le client doit signer le bordereau de retrait comme preuve qu'il a bien recu l'argent.",
        "<b>Imprimez le bordereau de retrait :</b> Remettez un exemplaire au client et conservez un exemplaire.",
    ]))

    story.append(h2("5.5 Effectuer un Virement entre comptes"))
    story.append(menu_path("Operations > Epargne Libre > Virements"))
    story.append(step_box_table("Virement entre deux comptes", [
        "<b>Selectionnez le compte SOURCE</b> (celui d'ou l'argent va partir). Verifiez le solde disponible.",
        "<b>Selectionnez le compte DESTINATAIRE</b> (celui qui va recevoir l'argent). Ce peut etre un autre compte du meme client ou un compte d'un autre client.",
        "<b>Saisissez le montant</b> a transferer. Le montant ne peut pas depasser le solde disponible du compte source.",
        "<b>Ajoutez un motif</b> (optionnel mais fortement recommande). Exemple : 'Transfert vers DAT', 'Aide a famille', 'Remboursement pret personnel'.",
        "<b>Verifiez toutes les informations :</b> Noms des titulaires, numeros de comptes, montant. Une erreur de compte destinataire peut etre tres difficile a corriger.",
        "<b>Cliquez sur 'Valider le Virement' :</b> Le compte source est debite et le compte destinataire est credite <b>instantanement</b>. Les deux mouvements apparaissent dans l'historique des deux comptes.",
    ]))

    story.append(h2("5.6 Documents et attestations"))
    story.append(p("Le systeme permet de generer plusieurs types de documents pour les clients :"))
    story.append(make_table(
        ['Document', 'Chemin du menu', 'Description detaillee', 'Quand l\'utiliser ?'],
        [
            ['Demande de\nSituation', 'Operations >\nDemande de Situation', "Affiche le solde actuel du\ncompte, le montant disponible\net le montant bloque.", "Quand un client demande\na connaitre son solde."],
            ['Demande\nd\'Historique', 'Operations >\nDemande d\'Historique', "Liste tous les mouvements\n(depots, retraits, virements)\nsur une periode choisie.", "Quand un client veut un\nreleve de son compte."],
            ['Attestation\nNon Redevabilite', 'Operations >\nAttestation Non\nRedevabilite', "Certifie que le client n\'a\naucune dette envers\nl\'institution.", "Demande par une banque\nou un tiers pour un\nnouveau pret."],
            ['Attestation\nd\'Engagement', 'Operations >\nAttestation\nd\'Engagement', "Certifie que le client est\nmembre actif de\nl\'institution.", "Preuve d\'appartenance\npour une demande\nadministrative."],
        ],
        col_widths=[3*cm, 3.5*cm, 5.5*cm, 5*cm]
    ))

    story.append(h2("5.7 Cloture Journaliere de l'Epargne"))
    story.append(menu_path("Operations > Cloture Journaliere"))
    story.append(step_box_table("Cloture journaliere - a effectuer CHAQUE SOIR", [
        "<b>Verifiez que TOUTES les operations</b> du jour ont ete saisies et validees. Aucune operation ne doit rester en attente.",
        "<b>Verifiez que TOUTES les caisses sont cloturees :</b> Chaque caissier doit avoir ferme sa propre caisse avant la cloture journaliere.",
        "<b>Accedez a l'ecran de cloture journaliere.</b> Le systeme affiche un resume de la journee : nombre total de versements, nombre total de retraits, montant total des versements, montant total des retraits.",
        "<b>Verifiez les totaux :</b> Comparez avec vos registres manuels si vous en tenez.",
        "<b>Cliquez sur 'Lancer la Cloture' :</b> Le systeme verrouille toutes les operations du jour.",
        "<b>Apres cloture :</b> AUCUNE operation ne peut etre modifiee ou annulee pour cette journee. Si une erreur est decouverte apres la cloture, il faudra passer une operation corrective le jour suivant.",
    ]))
    story.append(spacer())
    story.append(warn_box(
        "<b>IRREVERSIBLE :</b> La cloture journaliere ne peut PAS etre annulee. Assurez-vous que tout est correct "
        "avant de cliquer. En cas de doute, verifiez les operations une derniere fois."
    ))

    story.append(h2("5.8 Recapitulatif de toutes les operations d'epargne"))
    story.append(make_table(
        ['Operation', 'Menu', 'Qui ?', 'Quand ?'],
        [
            ['Ouvrir caisse', 'Operations > Gestion Caisse', 'Caissier', 'Chaque matin'],
            ['Versement', 'Operations > Versement', 'Caissier', 'Quand un client depose'],
            ['Retrait', 'Operations > Retrait', 'Caissier + Superviseur', 'Quand un client retire'],
            ['Virement', 'Epargne Libre > Virements', 'Caissier', 'Sur demande client'],
            ['Ouverture compte', 'Epargne Libre > Ouverture', 'Agent / Caissier', 'Nouveau client'],
            ['Situation compte', 'Demande de Situation', 'Caissier', 'Sur demande client'],
            ['Historique', 'Demande d\'Historique', 'Caissier', 'Sur demande client'],
            ['Attestation', 'Attestation Non Redevabilite', 'Caissier', 'Sur demande client'],
            ['Frais tenue', 'Frais de Tenue de Compte', 'Administrateur', 'Periodiquement'],
            ['Cloturer caisse', 'Operations > Gestion Caisse', 'Caissier', 'Chaque soir'],
            ['Cloture journaliere', 'Operations > Cloture', 'Responsable agence', 'Chaque soir'],
        ],
        col_widths=[3.5*cm, 5.5*cm, 4*cm, 4*cm]
    ))
    story.append(PageBreak())

    # ==================== SECTION 6: CRÉDIT ====================
    story.append(section(6, "Module Credit"))
    story.append(spacer(0.3))
    story.append(p(
        "Ce module gere le <b>cycle complet d'une demande de credit</b>, depuis la reception de la demande du "
        "client jusqu'au decaissement des fonds. C'est un processus en <b>6 etapes principales</b> qui implique "
        "differents acteurs de l'institution : l'agent de credit, l'analyste financier, le comite de credit, "
        "et le caissier pour le decaissement."
    ))

    story.append(h2("6.1 Vue d'ensemble du cycle de credit"))
    story.append(make_table(
        ['Etape', 'Qui intervient ?', 'Que fait-on a cette etape ?', 'Resultat'],
        [
            ['1. Initialisation', 'Agent de credit', "Cree la demande dans le systeme\navec les informations du client,\nle produit choisi, le montant\net la duree souhaitee.", 'Demande\nenregistree\n(statut: INITIALISEE)'],
            ['2. Documents', 'Agent de credit', "Collecte et numerise toutes les\npieces justificatives du client :\nCNI, justificatif de revenus,\nfactures, titre foncier...", 'Dossier\ncomplet\n(statut: DOCS RECUS)'],
            ['3. Analyse\nfinanciere', 'Analyste\nfinancier', "Saisit les revenus et depenses du\nclient. Le systeme calcule la\ncapacite de remboursement et\nle ratio dette/revenu (DTI).", 'Analyse\nterminee\n(DTI calcule)'],
            ['4. Visite\nde terrain', 'Agent de credit', "Se rend chez le client pour verifier\nles informations declarees. Prend\ndes photos, capture le GPS, redige\nson rapport et sa recommandation.", 'Rapport\nde visite\n(avec photos)'],
            ['5. Comite\nde credit', 'Membres du\ncomite', "Examine le dossier complet en\nreunion. Etudie l\'analyse, le rapport\nde visite, les garanties. Prend\nune decision collective.", 'Decision :\nAPPROUVE ou\nREJETE'],
            ['6. Decaissement', 'Caissier ou\ncomptable', "Met les fonds a disposition du\nclient par virement sur son compte\nd\'epargne, en especes au guichet,\nou par cheque.", 'Pret ACTIF\n(echeancier\ngenere)'],
        ],
        col_widths=[2.5*cm, 2.5*cm, 7*cm, 5*cm]
    ))

    story.append(h2("6.2 Comment creer une demande de credit ?"))
    story.append(menu_path("Credit > Gestion des Demandes > Nouvelle Demande"))
    story.append(step_box_table("Creation d'une demande de credit - etape par etape", [
        "<b>Selectionnez le compte d'epargne du client :</b> Dans le champ 'Compte d'Epargne', recherchez le client par son numero de compte ou son nom. IMPORTANT : le client doit avoir un compte d'epargne actif. Le nom du client et ses informations se remplissent automatiquement.",
        "<b>Selectionnez l'agence de traitement :</b> C'est l'agence qui va traiter la demande. Par defaut, c'est votre agence.",
        "<b>Selectionnez le produit de credit :</b> Choisissez le produit adapte a la demande du client (ex: Credit Agriculture, Credit Commerce, Credit Habitat...). Les conditions du produit (taux, duree min/max, montant min/max) se remplissent automatiquement.",
        "<b>Saisissez le montant demande :</b> Entrez le montant que le client souhaite emprunter. Le systeme verifie automatiquement que le montant est dans la fourchette autorisee par le produit.",
        "<b>Selectionnez l'objet du credit :</b> Pourquoi le client emprunte-t-il ? Agriculture, Commerce, Construction, Scolarite, Sante, Habitat... Choisissez dans la liste.",
        "<b>Choisissez la duree souhaitee :</b> Indiquez la duree du pret en mois (ex: 12 mois = 1 an). La duree doit etre dans la fourchette autorisee par le produit.",
        "<b>Verifiez toutes les informations :</b> Client, agence, produit, montant, objet, duree.",
        "<b>Cliquez sur 'Enregistrer' :</b> La demande est creee avec un numero unique (ex: DEM-2026-0045) et le statut 'INITIALISEE'.",
    ]))

    story.append(h2("6.3 L'analyse financiere du client"))
    story.append(p(
        "L'analyse financiere est une etape cruciale qui determine si le client a les moyens de rembourser "
        "le pret. Elle se fait en 3 volets :"
    ))
    story.append(h3("Volet 1 : Saisie des revenus du client"))
    story.append(p("Listez TOUTES les sources de revenus du client avec le montant mensuel de chacune :"))
    story.append(bullet("<b>Salaire :</b> Si le client est employe, saisissez son salaire mensuel net"))
    story.append(bullet("<b>Commerce :</b> Benefice mensuel moyen de son activite commerciale"))
    story.append(bullet("<b>Agriculture :</b> Revenu agricole mensualise (revenu annuel divise par 12)"))
    story.append(bullet("<b>Loyers :</b> Si le client a des biens immobiliers en location"))
    story.append(bullet("<b>Pension :</b> Pension de retraite ou autre pension reguliere"))
    story.append(bullet("<b>Autres :</b> Toute autre source de revenu reguliere"))

    story.append(h3("Volet 2 : Saisie des depenses du client"))
    story.append(p("Listez TOUTES les charges mensuelles du client :"))
    story.append(bullet("<b>Loyer :</b> Si le client est locataire"))
    story.append(bullet("<b>Nourriture :</b> Depenses alimentaires mensuelles du menage"))
    story.append(bullet("<b>Scolarite :</b> Frais scolaires des enfants (mensualisee)"))
    story.append(bullet("<b>Sante :</b> Depenses medicales habituelles"))
    story.append(bullet("<b>Transport :</b> Frais de deplacement"))
    story.append(bullet("<b>Autres credits :</b> Echeances d'autres prets en cours (TRES IMPORTANT)"))
    story.append(bullet("<b>Autres charges :</b> Eau, electricite, telephone, habits, etc."))

    story.append(h3("Volet 3 : Calcul de la capacite de remboursement"))
    story.append(p("Le systeme calcule automatiquement :"))
    story.append(info_box(
        "<b>Formules utilisees :</b><br/>"
        "- <b>Revenu net mensuel</b> = Total des revenus - Total des depenses<br/>"
        "- <b>Echeance mensuelle du pret</b> = Montant a payer chaque mois (principal + interets)<br/>"
        "- <b>Ratio DTI (Debt-to-Income)</b> = Echeance mensuelle / Revenu net x 100<br/><br/>"
        "<b>Interpretation du DTI :</b><br/>"
        "- DTI inferieur a 30% : Excellent - le client peut facilement rembourser<br/>"
        "- DTI entre 30% et 40% : Acceptable - le client peut rembourser mais avec peu de marge<br/>"
        "- DTI superieur a 40% : Risque - le client aura du mal a rembourser<br/>"
        "- DTI superieur a 50% : Tres risque - la demande devrait etre refusee ou le montant reduit"
    ))
    story.append(spacer())
    story.append(example_box(
        "<b>Exemple concret :</b> Jean gagne 500 000 FBu/mois (salaire : 300 000 + commerce : 200 000). "
        "Ses depenses sont de 280 000 FBu/mois (loyer : 80 000, nourriture : 100 000, scolarite : 50 000, "
        "transport : 30 000, autres : 20 000). Son revenu net = 500 000 - 280 000 = 220 000 FBu. "
        "Il demande un pret avec une echeance de 80 000 FBu/mois. Son DTI = 80 000 / 220 000 = 36%. "
        "C'est acceptable : la demande peut etre transmise au comite."
    ))

    story.append(h2("6.4 La visite de terrain"))
    story.append(menu_path("Credit > Gestion des Demandes > (selectionner demande) > onglet Visite"))
    story.append(step_box_table("Visite chez le client", [
        "<b>Preparez votre visite :</b> Relisez le dossier du client et l'analyse financiere avant de partir. Preparez votre telephone pour prendre des photos.",
        "<b>Rendez-vous sur place :</b> Allez au domicile et/ou au lieu d'activite du client.",
        "<b>Prenez des PHOTOS :</b> Photographiez le domicile du client, son activite commerciale ou agricole, les garanties proposees (maison, terrain, stock, materiel...). Ces photos seront jointes au dossier.",
        "<b>Capturez les coordonnees GPS :</b> Le systeme peut utiliser la geolocalisation de votre telephone pour enregistrer la position exacte du lieu visite.",
        "<b>Verifiez les informations declarees :</b> Comparez ce que vous voyez sur place avec ce que le client a declare (revenus, activite, garanties). Notez les coherences et les incoherences.",
        "<b>Redigez vos observations :</b> Decrivez en detail ce que vous avez constate : etat du domicile, taille de l'activite, qualite du stock, etat des garanties.",
        "<b>Formulez votre recommandation :</b> En tant qu'agent de terrain, donnez votre avis professionnel :<br/>"
        "- <b>FAVORABLE :</b> Vous recommandez l'approbation du credit<br/>"
        "- <b>DEFAVORABLE :</b> Vous recommandez le rejet, avec les raisons<br/>"
        "- <b>FAVORABLE AVEC RESERVES :</b> Vous recommandez l'approbation mais avec des conditions (ex: reduire le montant, exiger une garantie supplementaire)",
        "<b>Enregistrez le rapport de visite</b> dans le systeme avec toutes les photos et observations.",
    ]))

    story.append(h2("6.5 Le comite de credit"))
    story.append(step_box_table("Reunion du comite de credit", [
        "<b>Le secretaire du comite cree une SESSION de comite</b> dans le systeme avec la date de la reunion et la liste des participants.",
        "<b>Les demandes eligibles sont ajoutees a l'ordre du jour</b> de la session. Seules les demandes ayant complete toutes les etapes precedentes (analyse + visite) sont presentees au comite.",
        "<b>Pour CHAQUE demande, le comite examine :</b><br/>"
        "- Les informations du client et son historique avec l'institution<br/>"
        "- L'analyse financiere complete (revenus, depenses, ratio DTI)<br/>"
        "- Le rapport de visite de terrain avec les photos<br/>"
        "- Les garanties proposees et leur valeur estimee<br/>"
        "- La recommandation de l'agent de terrain",
        "<b>Le comite delibere et prend une DECISION :</b><br/>"
        "- <b>APPROUVEE :</b> Le credit est accorde aux conditions demandees<br/>"
        "- <b>APPROUVEE AVEC CONDITIONS :</b> Le credit est accorde mais avec des modifications (montant reduit, duree modifiee, garantie supplementaire exigee)<br/>"
        "- <b>REJETEE :</b> Le credit est refuse. Le motif du rejet doit etre clairement indique<br/>"
        "- <b>REPORTEE :</b> Le dossier est reporte a une prochaine session car des informations complementaires sont necessaires",
        "<b>Le secretaire enregistre la decision</b> dans le systeme avec les observations du comite.",
        "<b>La session est cloturee.</b> Les clients sont informes de la decision.",
    ]))

    story.append(h2("6.6 Le decaissement"))
    story.append(menu_path("Credit > Decaissements > Demandes Approuvees"))
    story.append(step_box_table("Mise a disposition des fonds au client", [
        "<b>Accedez a la liste des demandes approuvees :</b> Seules les demandes ayant recu une decision favorable du comite apparaissent ici.",
        "<b>Selectionnez la demande a decaisser :</b> Verifiez le nom du client, le montant approuve, et les conditions.",
        "<b>Choisissez le MODE de decaissement :</b><br/>"
        "- <b>Virement sur compte d'epargne :</b> L'argent est directement credite sur le compte d'epargne du client. C'est le mode le plus courant et le plus sur.<br/>"
        "- <b>Especes :</b> Le client recoit l'argent en main propre au guichet. Necessite que la caisse ait suffisamment de liquidites.<br/>"
        "- <b>Cheque :</b> Un cheque est emis au nom du client. Utilise pour les montants importants.",
        "<b>Verifiez une DERNIERE fois :</b> Nom du client, montant, mode de decaissement. C'est la derniere chance de detecter une erreur.",
        "<b>Cliquez sur 'Confirmer le Decaissement' :</b> Les fonds sont mis a disposition du client.",
        "<b>Le systeme genere automatiquement l'ECHEANCIER :</b> Un tableau detaillant mois par mois les montants a rembourser (principal + interets) est cree automatiquement. La premiere echeance est generalement fixee a 30 jours apres le decaissement.",
        "<b>Imprimez le CONTRAT DE PRET et l'ECHEANCIER :</b> Le client doit signer le contrat et recevoir un exemplaire de l'echeancier. Le contrat doit etre signe en double exemplaire : un pour le client, un pour l'institution.",
    ]))
    story.append(spacer())
    story.append(info_box(
        "<b>RESUME VISUEL DU CYCLE COMPLET :</b><br/><br/>"
        "Nouvelle demande --> Collecte documents --> Analyse financiere (revenus + depenses + capacite) "
        "--> Visite terrain (photos + GPS + recommandation) --> Comite credit (decision) "
        "--> Decaissement (fonds verses) --> Remboursement (echeancier mensuel)"
    ))
    story.append(PageBreak())

    # ==================== SECTION 7: REMBOURSEMENT ====================
    story.append(section(7, "Module Remboursement"))
    story.append(spacer(0.3))
    story.append(p(
        "Une fois un credit decaisse, le client doit le rembourser selon l'echeancier etabli automatiquement "
        "par le systeme. Ce module permet de <b>suivre les paiements</b> de chaque client, <b>detecter les retards</b> "
        "de paiement, <b>calculer les penalites</b>, <b>gerer le recouvrement</b> des impayes et, si necessaire, "
        "<b>restructurer</b> un pret en difficulte pour aider le client a s'en sortir."
    ))

    story.append(h2("7.1 Comprendre l'echeancier"))
    story.append(menu_path("Remboursement > Gestion des Echeanciers"))
    story.append(p("L'echeancier est le tableau de remboursement du pret. Pour chaque mois, il indique :"))
    story.append(make_table(
        ['Colonne', 'Signification', 'Exemple'],
        [
            ['N. Echeance', "Numero de l'echeance (1, 2, 3...)", '3 (= 3eme mois)'],
            ['Date echeance', 'Date limite de paiement', '15/03/2026'],
            ['Principal', "Part du capital a rembourser ce mois", '166 667 FBu'],
            ['Interets', "Montant des interets de ce mois", '25 000 FBu'],
            ['Total a payer', "Principal + Interets", '191 667 FBu'],
            ['Solde restant', "Capital restant apres ce paiement", '1 333 333 FBu'],
            ['Statut', "Etat de cette echeance", 'Paye / En cours / En retard'],
        ],
        col_widths=[3*cm, 6*cm, 8*cm]
    ))

    story.append(h2("7.2 Comment enregistrer un paiement ?"))
    story.append(menu_path("Remboursement > Saisie des Paiements"))
    story.append(step_box_table("Enregistrement d'un paiement de credit", [
        "<b>Selectionnez le pret du client :</b> Recherchez par numero de pret, nom du client ou numero de compte. L'echeancier s'affiche avec les montants dus et les statuts.",
        "<b>Verifiez les echeances en cours :</b> Le systeme surligne les echeances en retard (en rouge) et l'echeance du mois en cours (en orange).",
        "<b>Saisissez le montant paye par le client :</b> Tapez le montant exact que le client remet. Le client peut payer une echeance complete, ou un montant partiel, ou meme plusieurs echeances d'avance.",
        "<b>Le systeme repartit automatiquement le paiement :</b> L'ordre de priorite est :<br/>"
        "1. D'abord les <b>PENALITES</b> de retard (s'il y en a)<br/>"
        "2. Ensuite les <b>INTERETS</b> dus<br/>"
        "3. Enfin le <b>PRINCIPAL</b> (capital)<br/>"
        "Cet ordre est obligatoire et ne peut pas etre modifie.",
        "<b>Verifiez la repartition affichee</b> par le systeme : combien va aux penalites, combien aux interets, combien au principal.",
        "<b>Cliquez sur 'Valider' :</b> Le paiement est enregistre et l'echeancier est mis a jour.",
        "<b>Imprimez le RECU DE PAIEMENT</b> et remettez-le au client comme preuve de paiement.",
    ]))

    story.append(h2("7.3 Classification des retards"))
    story.append(p("Le systeme detecte automatiquement les retards de paiement et classe les prets selon le nombre de jours de retard :"))
    story.append(make_table(
        ['Classification', 'Jours de\nretard', 'Niveau de\nrisque', 'Actions a entreprendre par l\'agent'],
        [
            ['Normal', '0 jour', 'AUCUN', "Aucune action necessaire.\nLe client paie a temps."],
            ['Sous\nsurveillance', '1 a 30\njours', 'FAIBLE', "- Appeler le client par telephone\n- Envoyer un SMS de rappel\n- Noter la raison du retard"],
            ['Substandard', '31 a 90\njours', 'MOYEN', "- Envoyer une lettre de relance\n- Rendre visite au client\n- Proposer un plan de regularisation"],
            ['Douteux', '91 a 180\njours', 'ELEVE', "- Envoyer une mise en demeure formelle\n- Evaluer les garanties\n- Envisager la restructuration"],
            ['Contentieux', 'Plus de\n180 jours', 'CRITIQUE', "- Transferer au service juridique\n- Engager la procedure de saisie\n- Provisionner la perte potentielle"],
        ],
        col_widths=[2.5*cm, 2*cm, 2*cm, 10.5*cm]
    ))

    story.append(h2("7.4 Le recouvrement des impayes"))
    story.append(menu_path("Remboursement > Recouvrement > Dossiers de Recouvrement"))
    story.append(step_box_table("Processus complet de recouvrement", [
        "<b>Detection automatique :</b> Le systeme detecte automatiquement tous les prets ayant au moins une echeance en retard et genere des alertes pour les agents de recouvrement.",
        "<b>Ouverture d'un dossier de recouvrement :</b> L'agent de recouvrement ouvre un dossier pour chaque pret en souffrance. Le dossier contient tout l'historique du client et du pret.",
        "<b>Etape 1 - RAPPEL (jours 1-7) :</b> Appelez le client par telephone. Rappelez-lui le montant du et la date d'echeance. Demandez-lui quand il compte payer. Notez la reponse dans le dossier.",
        "<b>Etape 2 - RELANCE (jours 8-30) :</b> Envoyez une lettre de relance formelle au client par courrier. La lettre doit mentionner le montant du, les penalites accumulees, et un delai de paiement.",
        "<b>Etape 3 - MISE EN DEMEURE (jours 31-60) :</b> Envoyez une mise en demeure officielle avec un delai de 15 jours pour payer. Ce document a une valeur juridique.",
        "<b>Etape 4 - VISITE (jours 61-90) :</b> Rendez visite au client a son domicile ou lieu de travail. Evaluez sa situation reelle. Proposez une solution : plan de remboursement, restructuration.",
        "<b>Etape 5 - CONTENTIEUX (apres 90 jours) :</b> Si toutes les tentatives ont echoue, transferez le dossier au service juridique pour action en justice, saisie des garanties, ou passage en perte.",
        "<b>Cloture du dossier :</b> Le dossier est cloture lorsque le client a rembourse integralement, ou lorsque la decision juridique est rendue, ou lorsque la creance est passee en perte.",
    ]))

    story.append(h2("7.5 La restructuration d'un pret"))
    story.append(menu_path("Remboursement > Restructuration > Demandes de Restructuration"))
    story.append(p("Quand un client est en difficulte mais de bonne foi (il veut payer mais ne peut pas aux conditions actuelles), on peut restructurer son pret :"))
    story.append(step_box_table("Restructuration d'un pret en difficulte", [
        "<b>Creez une demande de restructuration</b> pour le pret concerne. Justifiez pourquoi la restructuration est necessaire (perte d'emploi, maladie, catastrophe naturelle...).",
        "<b>Definissez les NOUVELLES CONDITIONS :</b><br/>"
        "- <b>Allonger la duree :</b> Passer de 12 a 18 mois pour reduire les echeances mensuelles<br/>"
        "- <b>Reduire les echeances :</b> Diminuer le montant mensuel a payer<br/>"
        "- <b>Accorder une periode de grace :</b> Le client ne paie rien pendant 1 a 3 mois pour se retablir<br/>"
        "- <b>Ajuster le taux d'interet :</b> Dans certains cas exceptionnels",
        "<b>Soumettez la demande pour APPROBATION :</b> La restructuration doit etre approuvee par un responsable habilite (chef d'agence ou direction).",
        "<b>Apres approbation :</b> Le systeme genere un <b>NOUVEL ECHEANCIER</b> avec les nouvelles conditions. L'ancien echeancier est archive.",
        "<b>Le client signe un AVENANT au contrat :</b> Un nouveau document est imprime avec les conditions modifiees. Le client doit signer en double exemplaire.",
    ]))
    story.append(spacer())
    story.append(warn_box(
        "<b>ATTENTION :</b> La restructuration est une mesure EXCEPTIONNELLE. Elle ne doit pas devenir la norme. "
        "Elle doit etre justifiee par des circonstances reelles et approuvee par la hierarchie. "
        "Un pret ne devrait pas etre restructure plus d'une fois."
    ))

    story.append(h2("7.6 Autres fonctionnalites du remboursement"))
    story.append(make_table(
        ['Fonctionnalite', 'Chemin du menu', 'Description detaillee'],
        [
            ['Remboursement\nanticipe', 'Remboursement >\nRemboursement Anticipe', "Le client souhaite rembourser tout ou partie\nde son pret avant la fin de l'echeancier.\nLe systeme recalcule les interets en consequence."],
            ['Prelevement\nautomatique', 'Remboursement >\nPrelevement Automatique', "Le systeme preleve automatiquement le montant\nde l'echeance depuis le compte d'epargne du\nclient a chaque date d'echeance. Evite les retards."],
            ['Calcul auto.\npenalites', 'Remboursement >\nCalcul Auto. Penalites', "Le systeme calcule et applique automatiquement\nles penalites de retard pour tous les prets\nen retard, selon le taux configure dans le produit."],
            ['Cloture\njournaliere', 'Remboursement >\nCloture Journaliere', "Verrouille toutes les operations de remboursement\ndu jour. A effectuer chaque soir."],
        ],
        col_widths=[3*cm, 4*cm, 10*cm]
    ))
    story.append(PageBreak())

    # ==================== SECTION 8: COMPTABILITÉ ====================
    story.append(section(8, "Module Comptabilite"))
    story.append(spacer(0.3))
    story.append(p(
        "Le module comptabilite gere l'ensemble des operations comptables de l'institution selon les normes "
        "<b>SYSCOHADA</b> (Systeme Comptable Harmonise des pays de la zone OHADA). Il comprend : le plan de comptes, "
        "la saisie des ecritures comptables, les journaux, les exercices et periodes comptables, les clotures "
        "(journaliere, mensuelle, annuelle), et la production de tous les rapports financiers reglementaires."
    ))

    story.append(h2("8.1 Configuration initiale de la comptabilite"))
    story.append(p("Avant de commencer a saisir des ecritures, l'administrateur comptable doit configurer les elements suivants, dans cet ordre precis :"))
    story.append(step_box_table("Configuration comptable - dans l'ordre", [
        "<b>Plan comptable SYSCOHADA</b> (Comptabilite > Plan comptable) : Verifiez et completez la liste des comptes comptables. Le plan SYSCOHADA est pre-charge mais vous pouvez ajouter des sous-comptes specifiques a votre institution (ex: 521100 pour Banque Commerciale du Burundi).",
        "<b>Types de journal</b> (Comptabilite > Types de Journal) : Verifiez les types de journaux disponibles : Achat (HA), Vente (VE), Banque (BQ), Caisse (CA), Operations Diverses (OD). Ajoutez des types specifiques si necessaire.",
        "<b>Journaux</b> (Comptabilite > Journaux) : Creez au moins un journal par type. Exemple : Journal Caisse Principale, Journal Banque BCB, Journal Operations Diverses. Chaque journal est lie a un type de journal.",
        "<b>Exercice comptable</b> (Comptabilite > Exercice) : Definissez l'exercice en cours. Un exercice correspond generalement a une annee civile (du 01/01/2026 au 31/12/2026). Le systeme ne permet de saisir des ecritures que sur un exercice ouvert.",
        "<b>Periodes comptables</b> (Comptabilite > Periodes Comptables) : Les 12 periodes mensuelles sont automatiquement creees a partir de l'exercice. Chaque periode peut etre ouverte ou fermee independamment.",
        "<b>Taux de change</b> (Comptabilite > Taux de change) : Si vous travaillez avec plusieurs devises, configurez les taux de change en vigueur.",
    ]))

    story.append(h2("8.2 Comment saisir une ecriture comptable ?"))
    story.append(p("La saisie comptable se fait en DEUX etapes : d'abord on cree un brouillard (ecriture provisoire), puis on le valide pour le rendre definitif."))

    story.append(h3("Etape 1 : Creer un brouillard"))
    story.append(menu_path("Comptabilite > Saisie > Brouillard"))
    story.append(step_box_table("Creation d'un brouillard comptable", [
        "Cliquez sur le bouton <b>'Nouveau'</b> pour creer un nouveau brouillard.",
        "Selectionnez le <b>JOURNAL</b> concerne dans la liste deroulante (ex: Journal Caisse, Journal Banque, Journal OD).",
        "Indiquez la <b>DATE</b> de l'operation. La date doit etre dans une periode comptable ouverte.",
        "Saisissez un <b>LIBELLE</b> clair et descriptif de l'operation (ex: 'Depot client Jean NDAYISABA', 'Paiement facture electricite mars 2026', 'Encaissement remboursement credit DEM-2026-0045').",
        "Cliquez sur <b>'Enregistrer'</b> pour creer le brouillard. Il apparait maintenant dans la liste des brouillards avec le statut 'Brouillard'.",
    ]))

    story.append(h3("Etape 2 : Ajouter les lignes d'ecriture"))
    story.append(step_box_table("Saisie des lignes debit/credit", [
        "<b>Ouvrez le brouillard</b> que vous venez de creer en cliquant dessus.",
        "Pour chaque ligne de l'ecriture, saisissez :<br/>"
        "- Le <b>COMPTE COMPTABLE</b> : tapez le numero ou le nom du compte dans le champ de recherche (ex: 571000 Caisse, 371000 Depots de la clientele, 701000 Interets sur prets)<br/>"
        "- Le <b>MONTANT AU DEBIT</b> ou le <b>MONTANT AU CREDIT</b> (jamais les deux sur la meme ligne)<br/>"
        "- Un <b>LIBELLE</b> pour cette ligne (optionnel mais recommande)",
        "Ajoutez autant de lignes que necessaire pour l'ecriture.",
        "<b>REGLE FONDAMENTALE :</b> Le TOTAL DEBIT doit etre EXACTEMENT EGAL au TOTAL CREDIT. C'est le principe de la partie double. Le systeme affiche en permanence les totaux et vous alerte si l'ecriture n'est pas equilibree.",
        "Lorsque l'ecriture est correcte et equilibree, cliquez sur <b>'Valider'</b> pour la transformer en ecriture definitive.",
    ]))
    story.append(spacer())
    story.append(warn_box(
        "<b>TRES IMPORTANT :</b> Une ecriture VALIDEE ne peut PLUS etre modifiee ou supprimee. C'est le principe "
        "fondamental de la comptabilite. Si vous decouvrez une erreur apres validation, vous devez passer "
        "une ecriture de CONTREPASSATION (ecriture inverse : ce qui etait au debit passe au credit et vice versa)."
    ))
    story.append(spacer())
    story.append(example_box(
        "<b>Exemple d'ecriture - Versement client :</b><br/>"
        "Le client Jean NDAYISABA depose 500 000 FBu en especes.<br/>"
        "Ligne 1 : Compte 571000 (Caisse) - DEBIT 500 000 FBu (l'argent entre dans la caisse)<br/>"
        "Ligne 2 : Compte 371000 (Depots clientele) - CREDIT 500 000 FBu (la dette de l'institution envers le client augmente)<br/>"
        "Total debit = 500 000 = Total credit = 500 000 --> L'ecriture est equilibree."
    ))

    story.append(h2("8.3 Les clotures comptables"))
    story.append(make_table(
        ['Type de\ncloture', 'Quand ?', 'Que fait-elle exactement ?', 'Chemin du menu'],
        [
            ['Cloture\nJournaliere', 'Chaque\nsoir', "Verrouille TOUTES les ecritures du jour.\nAucune modification ou suppression n'est\npossible apres la cloture. C'est un\nmecanisme de securite.", 'Comptabilite >\nClotures >\nCloture Journaliere'],
            ['Cloture\nMensuelle', 'Fin de\nchaque\nmois', "Verrouille toutes les ecritures du mois.\nLa periode comptable passe au statut\n'Fermee'. Plus aucune ecriture ne peut\netre ajoutee dans ce mois.", 'Comptabilite >\nClotures >\nCloture Mensuelle'],
            ['Cloture\nAnnuelle', 'Fin\nd\'exercice\n(31/12)', "Cloture l'exercice comptable complet.\nCalcule le resultat de l'exercice\n(benefice ou perte). Genere les ecritures\nde report a nouveau pour le nouvel exercice.", 'Comptabilite >\nClotures >\nCloture Annuelle'],
        ],
        col_widths=[2.5*cm, 2*cm, 8*cm, 4.5*cm]
    ))

    story.append(h2("8.4 Comment generer un rapport comptable ?"))
    story.append(menu_path("Comptabilite > Rapports > (choisir le rapport)"))
    story.append(step_box_table("Generation d'un rapport - procedure universelle", [
        "Dans le menu Comptabilite > Rapports, <b>cliquez sur le rapport souhaite</b> (Balance, Bilan, Grand Livre, etc.).",
        "Selectionnez la <b>DATE DEBUT</b> en cliquant sur l'icone calendrier. Choisissez le premier jour de la periode souhaitee.",
        "Selectionnez la <b>DATE FIN</b> de la meme maniere. Choisissez le dernier jour de la periode.",
        "<b>Options supplementaires</b> selon le rapport :<br/>"
        "- <b>Balance :</b> Type (Generale, Auxiliaire, Agee) + Compte debut/fin optionnels<br/>"
        "- <b>Consultation Compte :</b> Selectionnez le compte specifique a consulter<br/>"
        "- <b>Bilan / Compte de Resultat :</b> Type (Detaille ou Synthetique)<br/>"
        "- <b>Edition Journal :</b> Selectionnez le journal specifique",
        "Cliquez sur le bouton vert <b>'Generer'</b>.",
        "Le rapport se <b>telecharge automatiquement en format PDF</b>. Ouvrez le fichier pour consulter, imprimer ou envoyer par e-mail.",
    ]))
    story.append(spacer())
    story.append(h3("Liste des rapports comptables disponibles"))
    story.append(make_table(
        ['Rapport', 'A quoi sert-il ?', 'Qui l\'utilise ?'],
        [
            ['Consultation\nCompte', "Montre TOUS les mouvements d'un seul\ncompte sur une periode choisie.\nDebit, credit, solde progressif.", 'Comptable\n(verification\nquotidienne)'],
            ['Edition\nJournal', "Liste toutes les ecritures enregistrees\ndans un journal specifique\n(ex: Journal Caisse du mois de mars).", 'Comptable\n(verification\nquotidienne)'],
            ['Grand Livre', "Recapitulatif de TOUTES les ecritures,\norganisees par compte comptable.\nC'est le document le plus complet.", 'Comptable,\nAuditeur'],
            ['Balance', "Tableau de tous les comptes avec leur\nsolde debiteur ou crediteur.\nPermet de verifier l'equilibre global.", 'Comptable,\nDirection'],
            ['Bilan', "Situation patrimoniale de l'institution :\nce qu'elle possede (ACTIF) vs ce\nqu'elle doit (PASSIF).", 'Direction,\nBanque centrale'],
            ['Compte de\nResultat', "Resume des produits (revenus) et\ncharges (depenses) de la periode.\nMontre si l'institution est beneficiaire\nou deficitaire.", 'Direction,\nBanque centrale'],
            ['Flux de\nTresorerie', "Mouvements d'entree et sortie de\nliquidites (cash). Montre comment\nl'argent circule dans l'institution.", 'Direction,\nTresorier'],
            ['Variation\ndes Capitaux', "Comment les fonds propres de\nl'institution ont evolue sur la\nperiode (apports, reserves, resultat).", 'Direction,\nAuditeur'],
        ],
        col_widths=[3*cm, 8*cm, 6*cm]
    ))
    story.append(PageBreak())

    # ==================== SECTION 9: RAPPROCHEMENT ====================
    story.append(section(9, "Rapprochement Bancaire"))
    story.append(spacer(0.3))
    story.append(p(
        "Le rapprochement consiste a <b>comparer les soldes enregistres dans le systeme avec la realite</b>. "
        "C'est un controle essentiel pour s'assurer que les donnees du systeme sont fiables et qu'il n'y a "
        "pas d'erreurs, d'omissions ou de fraudes. Il existe 4 types de rapprochement :"
    ))
    story.append(make_table(
        ['Type', 'On compare quoi ?', 'Chemin du menu', 'Frequence\nrecommandee'],
        [
            ['Rapprochement\nBancaire', "Le releve envoye par la\nbanque avec les ecritures\ncomptables du journal\nbanque dans PrFin MIS.", 'Rapprochement >\nRapprochement\nBancaire', 'Mensuel\n(a chaque\nreleve)'],
            ['Rapprochement\nCaisse', "Le comptage physique des\nbillets et pieces dans la\ncaisse avec le solde\naffiche par le systeme.", 'Rapprochement >\nRapprochement\nCaisse', 'Quotidien\n(a chaque\ncloture)'],
            ['Portefeuille\nCredits', "Le total de tous les prets\nen cours (capital restant\ndu) avec le solde du\ncompte comptable des credits.", 'Rapprochement >\nPortefeuille\nCredits', 'Mensuel'],
            ['Depots\nEpargne', "Le total de tous les soldes\ndes comptes d'epargne\ndes clients avec le solde\ndu compte comptable depots.", 'Rapprochement >\nDepots Epargne', 'Mensuel'],
        ],
        col_widths=[3*cm, 5*cm, 4*cm, 5*cm]
    ))

    story.append(h2("9.1 Comment faire un rapprochement bancaire ?"))
    story.append(menu_path("Rapprochement > Rapprochement Bancaire"))
    story.append(step_box_table("Rapprochement bancaire complet", [
        "<b>Recevez le releve bancaire :</b> Obtenez le releve de votre banque pour la periode a rapprocher (generalement le mois precedent). Le releve peut etre en format papier, PDF, CSV ou Excel.",
        "<b>Importez le releve dans le systeme :</b> Allez dans Rapprochement > Releves Bancaires et importez le fichier du releve. Le systeme lit automatiquement les lignes du releve (date, reference, montant, libelle).",
        "<b>Lancez le rapprochement AUTOMATIQUE :</b> Cliquez sur 'Rapprochement Automatique'. Le systeme compare chaque ligne du releve bancaire avec les ecritures du journal banque dans PrFin MIS. Il cherche des correspondances par montant, date et reference.",
        "<b>Examinez les resultats :</b> Le systeme classe les lignes en 3 categories :<br/>"
        "- <b>Rapprochees :</b> Une correspondance exacte a ete trouvee entre le releve et le systeme<br/>"
        "- <b>Non rapprochees (releve) :</b> Lignes du releve qui n'ont pas de correspondance dans le systeme<br/>"
        "- <b>Non rapprochees (systeme) :</b> Ecritures du systeme qui n'apparaissent pas sur le releve",
        "<b>Traitez les ecarts MANUELLEMENT :</b> Pour chaque ligne non rapprochee, recherchez la correspondance manuellement. Les ecarts peuvent etre dus a des decalages de date, des frais bancaires non comptabilises, ou des erreurs de saisie.",
        "<b>Validez le rapprochement :</b> Une fois toutes les lignes traitees (rapprochees ou expliquees), validez le rapprochement.",
    ]))
    story.append(PageBreak())

    # ==================== SECTION 10: DÉPENSES ====================
    story.append(section(10, "Module Depenses"))
    story.append(spacer(0.3))
    story.append(p(
        "Ce module gere les <b>depenses de fonctionnement</b> de l'institution : fournitures de bureau, "
        "deplacements, maintenance des locaux, loyers, factures d'electricite et d'eau, etc. "
        "Chaque depense suit un processus d'approbation a <b>plusieurs niveaux</b> avant d'etre payee, "
        "ce qui garantit un controle rigoureux des sorties d'argent."
    ))

    story.append(h2("10.1 Comment creer une demande de depense ?"))
    story.append(menu_path("Depenses > Gestion des Depenses > Demandes de Depenses"))
    story.append(step_box_table("Creation d'une demande de depense", [
        "<b>Cliquez sur 'Nouvelle Demande' :</b> Un formulaire vierge s'affiche.",
        "<b>Decrivez la depense :</b> Redigez une description claire et precise de ce que vous souhaitez acheter ou payer. Exemple : 'Achat de 10 rames de papier A4 et 5 cartouches d'encre pour imprimante HP LaserJet Pro M404'.",
        "<b>Selectionnez la CATEGORIE :</b> Choisissez dans la liste : Fournitures de bureau, Transport/Deplacement, Maintenance/Reparation, Loyer, Electricite/Eau, Communication, Formation, Autre.",
        "<b>Saisissez le MONTANT estime :</b> Indiquez le cout previsionnel de la depense. Si vous avez un devis du fournisseur, utilisez ce montant.",
        "<b>Indiquez le niveau de PRIORITE :</b><br/>"
        "- <b>Faible :</b> La depense peut attendre (ex: renouvellement de mobilier)<br/>"
        "- <b>Moyen :</b> La depense est necessaire dans les prochains jours<br/>"
        "- <b>Eleve :</b> La depense est urgente (ex: reparation d'une fuite d'eau)<br/>"
        "- <b>Urgent :</b> La depense est immediate et critique (ex: panne du generateur)",
        "<b>Selectionnez le FOURNISSEUR</b> si applicable. Si le fournisseur n'est pas dans la liste, demandez a l'administrateur de l'ajouter dans les donnees de reference.",
        "<b>Redigez la JUSTIFICATION :</b> Expliquez pourquoi cette depense est necessaire. C'est important pour les approbateurs qui doivent comprendre le besoin.",
        "<b>Cliquez sur 'Enregistrer' :</b> La demande est creee et envoyee automatiquement au premier niveau d'approbation.",
    ]))

    story.append(h2("10.2 Le processus d'approbation"))
    story.append(p("Selon le montant de la depense, elle doit etre approuvee par un ou plusieurs niveaux hierarchiques :"))
    story.append(make_table(
        ['Niveau', 'Qui approuve ?', 'Quand est-ce\nnecessaire ?', 'Ce qu\'il peut faire'],
        [
            ['NIVEAU 1', 'Responsable direct\n/ Chef de service', 'Pour TOUTE\ndemande de\ndepense', "- Approuver : la demande passe au\n  niveau 2 si le montant le requiert\n- Rejeter : avec motif obligatoire\n- Demander des precisions"],
            ['NIVEAU 2', 'Directeur de\ndepartement', 'Quand le montant\ndepasse le seuil\ndu Niveau 1', "- Approuver : la demande passe au\n  niveau 3 si le montant le requiert\n- Rejeter : avec motif obligatoire\n- Renvoyer au niveau 1"],
            ['NIVEAU 3', 'Direction\nGenerale', 'Quand le montant\ndepasse le seuil\ndu Niveau 2', "- Approuver : la depense peut etre payee\n- Rejeter : avec motif obligatoire\n- Demander une revision du montant"],
        ],
        col_widths=[2.5*cm, 3.5*cm, 3.5*cm, 7.5*cm]
    ))
    story.append(spacer())
    story.append(note_box(
        "<b>Astuce :</b> Les seuils d'approbation sont configurables dans Depenses > Donnees de Reference > Seuils "
        "d'Approbation. Exemple : Niveau 1 jusqu'a 500 000 FBu, Niveau 2 jusqu'a 5 000 000 FBu, Niveau 3 au-dela."
    ))

    story.append(h2("10.3 Budgets et Petite Caisse"))
    story.append(bullet("<b>Budgets :</b> Definissez des budgets par categorie de depense et par periode (mois, trimestre, annee). Le systeme vous alerte quand vous approchez ou depassez le budget alloue."))
    story.append(bullet("<b>Petite Caisse :</b> Un fonds dedie aux petites depenses quotidiennes (ex: taxi, photocopies, eau minerale). Le responsable enregistre chaque sortie et demande un reapprovisionnement quand le fonds est epuise."))
    story.append(PageBreak())

    # ==================== SECTION 11: TABLEAUX DE BORD ====================
    story.append(section(11, "Tableaux de Bord"))
    story.append(spacer(0.3))
    story.append(p(
        "Les tableaux de bord offrent une <b>vision instantanee de la performance</b> de l'institution. "
        "Chaque role dispose de son propre tableau de bord avec les indicateurs (KPIs) qui le concernent."
    ))
    story.append(make_table(
        ['Tableau\nde Bord', 'Pour qui ?', 'Indicateurs cles (KPIs)', 'Chemin du menu'],
        [
            ['Direction\nGenerale', 'DG,\nDirecteurs', "- Portefeuille total des prets\n- Taux de rentabilite\n- Croissance du nombre de clients\n- PAR (Portefeuille a Risque)\n- Ratio d'autosuffisance", 'Tableaux de Bord\n> Direction\nGenerale'],
            ['Chef\nd\'Agence', 'Responsable\nd\'agence', "- Performance agence vs objectifs\n- Nombre nouvelles demandes\n- Decaissements du mois\n- Retards de paiement\n- Nombre de clients actifs", 'Tableaux de Bord\n> Chef d\'Agence'],
            ['Operations\nCredit', 'Agents de\ncredit', "- Demandes en attente d'analyse\n- Demandes en comite\n- Decaissements effectues\n- Portefeuille sous gestion\n- Taux de recouvrement", 'Tableaux de Bord\n> Operations\nCredit'],
            ['Compta-\nbilite', 'Comptables', "- Soldes des comptes principaux\n- Ecritures non validees\n- Clotures en attente\n- Etat des rapprochements\n- Ecarts non resolus", 'Tableaux de Bord\n> Comptabilite'],
        ],
        col_widths=[2.5*cm, 2.5*cm, 7*cm, 5*cm]
    ))
    story.append(spacer())
    story.append(note_box("<b>Astuce :</b> Les donnees sont en temps reel. Utilisez les filtres de periode et cliquez sur 'Appliquer' pour actualiser les indicateurs."))
    story.append(PageBreak())

    # ==================== SECTION 12: ADMINISTRATION ====================
    story.append(section(12, "Administration et Utilisateurs"))
    story.append(spacer(0.3))
    story.append(p("Ce module est reserve aux <b>administrateurs systeme</b>. Il permet de creer et gerer les comptes utilisateurs."))

    story.append(h2("12.1 Comment creer un utilisateur ?"))
    story.append(menu_path("Administration > Creer un Utilisateur"))
    story.append(step_box_table("Creation d'un compte utilisateur", [
        "<b>Nom complet :</b> Saisissez le nom et prenom de l'employe tel qu'il apparaitra dans le systeme.",
        "<b>Adresse e-mail :</b> Sera utilisee comme nom d'utilisateur pour la connexion. Utilisez une adresse professionnelle (ex: jean.ndayisaba@institution.bi).",
        "<b>Mot de passe temporaire :</b> Definissez un mot de passe que l'employe devra changer a sa premiere connexion. Utilisez un mot de passe complexe (min. 8 caracteres, majuscule, minuscule, chiffre).",
        "<b>Agence de rattachement :</b> Selectionnez l'agence ou l'employe travaille.",
        "<b>Role principal :</b> Definissez le role de l'employe : Agent de credit, Caissier, Comptable, Chef d'agence, Directeur, Administrateur...",
        "<b>Permissions detaillees :</b> Cochez les permissions specifiques pour chaque module. N'accordez que les permissions STRICTEMENT NECESSAIRES au poste de l'employe.",
        "Cliquez sur <b>'Enregistrer'</b>. Le compte est cree et l'employe peut se connecter.",
    ]))

    story.append(h2("12.2 Permissions par module"))
    story.append(make_table(
        ['Module', 'Permissions courantes', 'Role typique'],
        [
            ['Clients', 'CUSTOMER_GROUP_VIEW,\nCUSTOMER_GROUP_CREATE,\nCUSTOMER_GROUP_UPDATE', 'Agent de terrain'],
            ['Epargne', 'EPARGNE_DEPOSIT_CREATE,\nEPARGNE_WITHDRAWAL_CREATE,\nGUICHET_CAISSE', 'Caissier'],
            ['Credit', 'CREDIT_VIEW, CREDIT_CREATE,\nCREDIT_ANALYZE,\nCREDIT_APPLICATION_CHANGE_STATUS', 'Agent de credit'],
            ['Comptabilite', 'ACCOUNTING_VIEW,\nACCOUNTING_ENTRY_CREATE,\nACCOUNTING_REPORT_VIEW', 'Comptable'],
            ['Depenses', 'DEPENSE_VIEW, DEPENSE_CREATE,\nDEPENSE_APPROVE_N1,\nDEPENSE_PAY', 'Manager'],
            ['Administration', 'ADMIN, USER_CREATE,\nTRACKING_VIEW', 'Administrateur IT'],
        ],
        col_widths=[3*cm, 6*cm, 8*cm]
    ))
    story.append(spacer())
    story.append(warn_box(
        "<b>PRINCIPE DU MOINDRE PRIVILEGE :</b> N'accordez que les permissions strictement necessaires a chaque "
        "utilisateur. Un caissier n'a pas besoin d'acceder a la comptabilite. Un comptable n'a pas besoin de "
        "creer des demandes de credit. Un agent de credit n'a pas besoin de modifier les utilisateurs."
    ))
    story.append(PageBreak())

    # ==================== SECTION 13: AUDIT ====================
    story.append(section(13, "Journal d'Audit (Tracabilite)"))
    story.append(spacer(0.3))
    story.append(p(
        "Le journal d'audit est un <b>enregistrement automatique et inalterable</b> de chaque action effectuee "
        "dans le systeme. Personne ne peut modifier ou supprimer les entrees du journal d'audit. "
        "C'est un outil essentiel pour la securite, la conformite reglementaire et la resolution des litiges."
    ))
    story.append(menu_path("Administration > Journal d'Audit"))
    story.append(make_table(
        ['Information\nenregistree', 'Description', 'Exemple concret'],
        [
            ['Utilisateur', "Nom et identifiant de la personne\nqui a effectue l'action", 'jean.ndayisaba@institution.bi'],
            ['Role', "Le role de l'utilisateur au moment\nde l'action", 'AGENT_CREDIT'],
            ['Action', "Type d'operation effectuee", 'Creation, Modification,\nSuppression, Validation, Rejet'],
            ['Module', 'Module du systeme concerne', 'Credit, Epargne, Comptabilite,\nDepenses...'],
            ['Entite', "L'objet modifie avec son identifiant", 'Demande de credit\nDEM-2026-0045'],
            ['Anciennes\nvaleurs', 'Valeurs AVANT la modification\n(uniquement pour les modifications)', 'Montant: 1 000 000 FBu'],
            ['Nouvelles\nvaleurs', 'Valeurs APRES la modification', 'Montant: 1 500 000 FBu'],
            ['Date et heure', "Horodatage exact de l'action\n(a la seconde pres)", '27/03/2026 a 14:35:22'],
        ],
        col_widths=[3*cm, 6*cm, 8*cm]
    ))
    story.append(PageBreak())

    # ==================== SECTION 14: CONSEILS & GLOSSAIRE ====================
    story.append(section(14, "Conseils et Glossaire"))
    story.append(spacer(0.3))

    story.append(h2("14.1 Bonnes pratiques essentielles"))
    story.append(bullet("<b>Enregistrez regulierement :</b> Ne saisissez pas de longues series de donnees sans enregistrer. Sauvegardez frequemment votre travail pour eviter de tout perdre."))
    story.append(bullet("<b>Verifiez AVANT de valider :</b> Une fois validee, une operation ne peut plus etre annulee facilement. Relisez toujours les informations une derniere fois."))
    story.append(bullet("<b>Utilisez les filtres :</b> Les tableaux ont des barres de recherche et des filtres. Utilisez-les pour retrouver rapidement ce que vous cherchez."))
    story.append(bullet("<b>Imprimez TOUJOURS les recus :</b> Remettez systematiquement un bordereau imprime au client apres chaque versement ou retrait. C'est sa preuve."))
    story.append(bullet("<b>Cloturez chaque jour :</b> Ne quittez JAMAIS l'agence sans avoir cloture votre caisse et verifie que la cloture journaliere est faite."))
    story.append(bullet("<b>Gardez vos identifiants secrets :</b> Ne communiquez JAMAIS votre mot de passe a personne. Chaque action est tracee a votre nom."))
    story.append(bullet("<b>Signalez les anomalies :</b> Si quelque chose ne fonctionne pas normalement ou semble suspect, contactez immediatement l'administrateur systeme."))
    story.append(bullet("<b>Deconnectez-vous :</b> Toujours vous deconnecter avant de quitter votre poste, surtout si l'ordinateur est partage."))

    story.append(h2("14.2 Glossaire complet"))
    story.append(make_table(
        ['Terme', 'Definition detaillee'],
        [
            ['Client Individuel', "Personne physique inscrite dans le systeme (agriculteur, commercant, salarie...)."],
            ['Client Entreprise', "Personne morale inscrite (societe, association, cooperative, ONG...)."],
            ['Groupe Solidaire', "Association de clients qui se portent garants mutuellement pour des credits."],
            ['RCCM', "Registre du Commerce et du Credit Mobilier - numero d'immatriculation d'une entreprise."],
            ['NIF', "Numero d'Identification Fiscale - identifiant fiscal d'une entreprise."],
            ['CNI', "Carte Nationale d'Identite - piece d'identite officielle."],
            ['Epargne libre', "Compte ou le client peut deposer et retirer librement, sans contrainte de duree."],
            ['DAT', "Depot a Terme - argent bloque pour une duree definie contre un taux d'interet plus eleve."],
            ['DTI', "Debt-to-Income - ratio dette/revenu. Mesure la capacite de remboursement. Plus c'est bas, mieux c'est."],
            ['PAR', "Portefeuille a Risque - pourcentage des prets ayant au moins 1 jour de retard. Indicateur de qualite."],
            ['Brouillard', "Ecriture comptable provisoire, non encore validee et donc encore modifiable."],
            ['Ecriture', "Enregistrement comptable definitif (debit + credit). Immuable apres validation."],
            ['Exercice', "Periode comptable d'un an (generalement du 1er janvier au 31 decembre)."],
            ['Grand Livre', "Document recapitulant TOUTES les ecritures, organisees par compte comptable."],
            ['Balance', "Tableau listant tous les comptes avec leurs soldes debiteurs et crediteurs."],
            ['Bilan', "Etat financier : ce que l'institution possede (actif) vs ce qu'elle doit (passif)."],
            ['Compte de Resultat', "Etat financier : revenus vs depenses = benefice ou perte."],
            ['Rapprochement', "Processus de comparaison entre deux sources de donnees pour verifier leur coherence."],
            ['SYSCOHADA', "Systeme Comptable Harmonise utilise dans les pays de la zone OHADA."],
            ['Contrepassation', "Ecriture comptable inverse pour annuler une ecriture erronee deja validee."],
        ],
        col_widths=[3.5*cm, 13.5*cm]
    ))

    # ==================== FOOTER ====================
    story.append(Spacer(1, 2*cm))
    story.append(hr())
    story.append(Spacer(1, 0.5*cm))
    if os.path.exists(LOGO_PATH):
        story.append(Image(LOGO_PATH, width=5*cm, height=5*cm, kind='proportional'))
    story.append(Paragraph("<b>PrFin MIS</b>", styles['ManualTitle']))
    story.append(Paragraph("Professional Financial Management Information System", styles['ManualSubtitle']))
    story.append(GoldDivider())
    story.append(Paragraph("<i>Good Finance. Real Impact.</i>", styles['CoverSlogan']))
    story.append(Spacer(1, 1*cm))
    story.append(Paragraph("Version 10.0 - 2026", styles['ManualSubtitle']))
    story.append(Paragraph("Pour toute assistance, contactez l'administrateur systeme.", styles['ManualSubtitle']))
    story.append(Spacer(1, 0.5*cm))
    story.append(Paragraph("INFOSTEAM - Tous droits reserves.", styles['Footer']))

    # Build PDF
    doc.build(story, onFirstPage=first_page, onLaterPages=page_header_footer)
    size_kb = os.path.getsize(OUTPUT_PATH) / 1024
    print(f"Manuel genere : {OUTPUT_PATH}")
    print(f"Taille : {size_kb:.0f} KB")


if __name__ == '__main__':
    build_manual()
