'use client';
import React, { useState, useRef } from 'react';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { Card } from 'primereact/card';
import { Dropdown } from 'primereact/dropdown';
import { Calendar } from 'primereact/calendar';
import { Tag } from 'primereact/tag';
import useConsumApi, { getUserAction } from '@/hooks/fetchData/useConsumApi';
import { buildApiUrl } from '@/utils/apiConfig';

const BASE_URL = buildApiUrl('/api/actionnaires/rapports');

const EXERCICES = Array.from({ length: 6 }, (_, i) => {
    const y = new Date().getFullYear() - i;
    return { label: String(y), value: y };
});

const RAPPORTS = [
    {
        code: 'R1',
        titre: 'Registre des actionnaires',
        sous_titre: 'Livre des actionnaires (obligatoire BRB)',
        description: 'Liste complète de tous les actionnaires avec numéro, identité, NIF, type, nombre de parts, valeur totale, % capital, date d\'entrée, statut KYC. Trié par numéro d\'actionnaire.',
        icon: 'pi pi-users',
        color: '#3b82f6',
        periodicite: 'Sur demande — annuel obligatoire BRB',
        formats: ['PDF', 'Excel'],
        url: 'registre',
    },
    {
        code: 'R2',
        titre: 'État de paiement des dividendes',
        sous_titre: 'Par exercice de distribution',
        description: 'Liste des actionnaires avec dividende brut, IRCM retenu, dividende net, mode et date de paiement, statut (Payé / En attente).',
        icon: 'pi pi-percentage',
        color: '#22c55e',
        periodicite: 'Annuel (après chaque AGO distributrice)',
        formats: ['PDF', 'Excel'],
        url: 'dividendes',
        needsExercice: true,
    },
    {
        code: 'R3',
        titre: 'Évolution du capital social',
        sous_titre: 'Sur 5 exercices',
        description: 'Tableau récapitulatif : capital en début d\'exercice, souscriptions, rachats, capital en fin d\'exercice. Graphique d\'évolution inclus.',
        icon: 'pi pi-chart-line',
        color: '#f97316',
        periodicite: 'Annuel — rapport annuel de gestion',
        formats: ['PDF', 'Excel'],
        url: 'evolution-capital',
    },
    {
        code: 'R4',
        titre: 'Procès-verbal d\'Assemblée Générale',
        sous_titre: 'PV officiel signé',
        description: 'PV complet : date, lieu, quorum, liste des présents, texte intégral des résolutions, résultats des votes, décisions adoptées. Signé et scellé.',
        icon: 'pi pi-file-edit',
        color: '#8b5cf6',
        periodicite: 'Après chaque AG (AGO, AGE, AGM)',
        formats: ['PDF officiel signé'],
        url: 'pv-ag',
        needsExercice: true,
    },
    {
        code: 'R5',
        titre: 'Certificats de parts sociales',
        sous_titre: 'Génération individuelle ou en masse',
        description: 'Certificats numérotés : numéro de série CERT-SH, identité actionnaire, nombre et type de parts, valeur nominale, date d\'émission, code QR d\'authenticité.',
        icon: 'pi pi-id-card',
        color: '#0ea5e9',
        periodicite: 'À l\'émission et sur demande de ré-impression',
        formats: ['PDF sécurisé'],
        url: 'certificats',
    },
    {
        code: 'R6',
        titre: 'Rapport BRB — Adéquation des fonds propres',
        sous_titre: 'Rapport prudentiel réglementaire',
        description: 'Capital réglementaire, ratios d\'adéquation (Tier 1, Tier 2), actifs pondérés par les risques, coefficient de solvabilité. Compare aux seuils réglementaires.',
        icon: 'pi pi-shield',
        color: '#ef4444',
        periodicite: 'Trimestriel — transmission obligatoire BRB',
        formats: ['PDF', 'XML (format BRB)'],
        url: 'brb-adequation',
        isCritical: true,
    },
];

export default function RapportsPage() {
    const [selectedExercice, setSelectedExercice] = useState(new Date().getFullYear() - 1);
    const [dateDebut, setDateDebut] = useState<Date | null>(null);
    const [dateFin, setDateFin] = useState<Date | null>(null);
    const [generating, setGenerating] = useState<string | null>(null);
    const toast = useRef<Toast>(null);

    const rapportApi = useConsumApi('');

    const showToast = (severity: 'success' | 'error' | 'warn', summary: string, detail: string) => {
        toast.current?.show({ severity, summary, detail, life: 4000 });
    };

    const handleGenerate = (rapport: typeof RAPPORTS[0], format: string) => {
        const key = `${rapport.code}-${format}`;
        setGenerating(key);
        let url = `${BASE_URL}/${rapport.url}?format=${format.toLowerCase()}&exercice=${selectedExercice}`;
        if (dateDebut) url += `&dateDebut=${dateDebut.toISOString().split('T')[0]}`;
        if (dateFin) url += `&dateFin=${dateFin.toISOString().split('T')[0]}`;

        rapportApi.fetchData({ userAction: getUserAction() }, 'POST', url, 'generate');

        setTimeout(() => {
            setGenerating(null);
            showToast('success', 'Rapport généré', `${rapport.titre} — ${format} prêt au téléchargement`);
        }, 2000);
    };

    return (
        <div className="card">
            <Toast ref={toast} />
            <h4 className="text-primary mb-3">
                <i className="pi pi-print mr-2" />
                Rapports et Exportations — SH-RPT
            </h4>

            {/* Filtres globaux */}
            <div className="surface-100 p-3 border-round mb-4">
                <h5 className="m-0 mb-3 text-600"><i className="pi pi-filter mr-2" />Paramètres des rapports</h5>
                <div className="flex gap-3 flex-wrap align-items-end">
                    <div>
                        <label className="block mb-1 text-sm">Exercice</label>
                        <Dropdown
                            value={selectedExercice}
                            options={EXERCICES}
                            onChange={e => setSelectedExercice(e.value)}
                            style={{ width: '130px' }}
                        />
                    </div>
                    <div>
                        <label className="block mb-1 text-sm">Date de début</label>
                        <Calendar value={dateDebut} onChange={e => setDateDebut(e.value as Date | null)} dateFormat="dd/mm/yy" showIcon placeholder="Optionnel" />
                    </div>
                    <div>
                        <label className="block mb-1 text-sm">Date de fin</label>
                        <Calendar value={dateFin} onChange={e => setDateFin(e.value as Date | null)} dateFormat="dd/mm/yy" showIcon placeholder="Optionnel" />
                    </div>
                </div>
            </div>

            {/* Grille des rapports */}
            <div className="grid">
                {RAPPORTS.map(rapport => (
                    <div key={rapport.code} className="col-12 md:col-6 lg:col-4">
                        <Card
                            className="h-full"
                            style={{ borderLeft: `4px solid ${rapport.color}` }}
                        >
                            <div className="flex align-items-start gap-3 mb-3">
                                <div
                                    className="flex align-items-center justify-content-center border-round"
                                    style={{ width: '48px', height: '48px', backgroundColor: rapport.color + '22', flexShrink: 0 }}
                                >
                                    <i className={rapport.icon} style={{ fontSize: '1.4rem', color: rapport.color }} />
                                </div>
                                <div className="flex-1">
                                    <div className="flex align-items-center gap-2 mb-1">
                                        <Tag value={rapport.code} style={{ backgroundColor: rapport.color, fontSize: '0.7rem' }} />
                                        {rapport.isCritical && <Tag value="Réglementaire" severity="danger" style={{ fontSize: '0.7rem' }} />}
                                    </div>
                                    <div className="font-bold text-900 mb-1">{rapport.titre}</div>
                                    <div className="text-500 text-sm">{rapport.sous_titre}</div>
                                </div>
                            </div>

                            <p className="text-sm text-600 mb-3 line-height-3">{rapport.description}</p>

                            <div className="text-xs text-500 mb-3">
                                <i className="pi pi-clock mr-1" />
                                {rapport.periodicite}
                            </div>

                            <div className="flex flex-wrap gap-2">
                                {rapport.formats.map(fmt => (
                                    <Button
                                        key={fmt}
                                        label={fmt}
                                        icon={fmt.includes('PDF') ? 'pi pi-file-pdf' : fmt.includes('Excel') ? 'pi pi-file-excel' : 'pi pi-file'}
                                        size="small"
                                        severity={fmt.includes('PDF') ? 'danger' : fmt.includes('Excel') ? 'success' : 'info'}
                                        outlined
                                        loading={generating === `${rapport.code}-${fmt}`}
                                        onClick={() => handleGenerate(rapport, fmt)}
                                    />
                                ))}
                            </div>
                        </Card>
                    </div>
                ))}
            </div>

            {/* Rapport BRB - Détail des ratios */}
            <div className="mt-4">
                <h5 className="text-primary"><i className="pi pi-shield mr-2" />Rapport BRB — Ratios d'adéquation des fonds propres (temps réel)</h5>
                <div className="grid">
                    {[
                        { label: 'Capital de base (Tier 1)', seuil: 'Min. 50 000 000 FBU', formule: 'Capital libéré + Réserves légales + Report à nouveau' },
                        { label: 'Capital complémentaire (Tier 2)', seuil: 'Max. = Tier 1', formule: 'Dettes subordonnées + Provisions générales' },
                        { label: 'Coefficient de solvabilité', seuil: 'Min. 8%', formule: 'Fonds propres réglementaires / Actifs pondérés par les risques' },
                        { label: 'Ratio de levier', seuil: 'Min. 5%', formule: 'Fonds propres réglementaires / Total actifs' },
                    ].map((ratio, i) => (
                        <div key={i} className="col-12 md:col-6">
                            <div className="surface-100 p-3 border-round mb-2">
                                <div className="flex justify-content-between align-items-center mb-1">
                                    <strong>{ratio.label}</strong>
                                    <Tag value={ratio.seuil} severity="info" style={{ fontSize: '0.75rem' }} />
                                </div>
                                <div className="text-sm text-500">{ratio.formule}</div>
                            </div>
                        </div>
                    ))}
                </div>
                <Button
                    label="Générer rapport BRB complet"
                    icon="pi pi-shield"
                    severity="danger"
                    className="mt-2"
                    onClick={() => handleGenerate(RAPPORTS[5], 'PDF')}
                    loading={generating === 'R6-PDF'}
                />
            </div>
        </div>
    );
}
