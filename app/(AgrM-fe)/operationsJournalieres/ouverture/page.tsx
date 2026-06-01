'use client';

import React, { useState, useEffect, useRef } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { Toast } from 'primereact/toast';
import { Tag } from 'primereact/tag';
import { Card } from 'primereact/card';
import { Divider } from 'primereact/divider';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import { Calendar } from 'primereact/calendar';
import { InputTextarea } from 'primereact/inputtextarea';
import { ProgressSpinner } from 'primereact/progressspinner';
import { Message } from 'primereact/message';

import useConsumApi, { getUserAction } from '@/hooks/fetchData/useConsumApi';
import { buildApiUrl } from '@/utils/apiConfig';
import { ProtectedPage } from '@/components/ProtectedPage';

const OJ_URL = buildApiUrl('/api/operations-journalieres');

// Burundi uses Central Africa Time = UTC+2 (Africa/Bujumbura, no DST)
const TZ = 'Africa/Bujumbura';
const TZ_OFFSET = '+02:00';

const fmtTime = (date: Date) =>
    date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', timeZone: TZ });

const fmtDateTime = (date: Date) =>
    date.toLocaleString('fr-FR', { timeZone: TZ });

interface StatutJour {
    statutId?: number;
    dateJour: string;
    statut: 'OUVERT' | 'FERME' | 'EOD_EN_COURS' | 'EOD_TERMINE';
    heureOuverture?: string;
    heureFermeture?: string;
    ouvertPar?: string;
    fermerPar?: string;
    nombreTransactions?: number;
    montantTotal?: number;
    agenceCode?: string;
    agenceNom?: string;
    observationsOuverture?: string;
}

interface JournalEntry {
    journalId: number;
    dateJour: string;
    horodatage?: string;
    heureOuverture?: string;
    utilisateurNom?: string;
    ouvertPar?: string;
    agenceNom: string;
    nombreTransactions: number;
    montantTotal: number;
    statut: string;
}

interface Parametre {
    parametreId: number;
    codeParam: string;
    libelleParam: string;
    valeurParam: string;
    typeValeur: string;
    unite: string;
}

const toApiDate = (date: Date): string => {
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
};

const formatDateTime = (value: string | undefined) => {
    if (!value) return '-';
    try { return fmtDateTime(new Date(value)); } catch { return value; }
};

const formatNumber = (value: number | undefined | null): string => {
    if (value === undefined || value === null) return '0';
    return value.toLocaleString('fr-FR');
};

const parseTime = (timeStr: string): { hour: number; min: number } => {
    const parts = (timeStr || '08:00').split(':');
    return { hour: parseInt(parts[0]) || 8, min: parseInt(parts[1]) || 0 };
};

const OuverturePage = () => {
    const [statutJour, setStatutJour] = useState<StatutJour | null>(null);
    const [historique, setHistorique] = useState<JournalEntry[]>([]);
    const [parametres, setParametres] = useState<Parametre[]>([]);
    const [ouvertureDialogVisible, setOuvertureDialogVisible] = useState(false);
    const [observations, setObservations] = useState('');
    const [loading, setLoading] = useState(false);
    const [filterDate, setFilterDate] = useState<Date | null>(null);
    const [currentTime, setCurrentTime] = useState(new Date());

    const toast = useRef<Toast>(null);
    const statutApi = useConsumApi('');
    const ouvertureApi = useConsumApi('');
    const historiqueApi = useConsumApi('');
    const parametresApi = useConsumApi('');

    const showToast = (severity: 'success' | 'error' | 'warn' | 'info', summary: string, detail: string) => {
        toast.current?.show({ severity, summary, detail, life: 6000 });
    };

    // Update clock every minute
    useEffect(() => {
        const interval = setInterval(() => setCurrentTime(new Date()), 60000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        loadStatut();
        loadHistorique();
        loadParametres();
    }, []);

    const loadStatut = () => {
        setLoading(true);
        statutApi.fetchData(null, 'GET', `${OJ_URL}/statut-jour`, 'loadStatut');
    };

    const loadHistorique = (date?: Date) => {
        let url = `${OJ_URL}/journal?type=OUVERTURE`;
        if (date) url += `&date=${toApiDate(date)}`;
        historiqueApi.fetchData(null, 'GET', url, 'loadHistorique');
    };

    const loadParametres = () => {
        parametresApi.fetchData(null, 'GET', `${OJ_URL}/parametres`, 'loadParametres');
    };

    useEffect(() => {
        if (statutApi.data && statutApi.callType === 'loadStatut') {
            setStatutJour(statutApi.data as StatutJour);
            setLoading(false);
        }
        if (statutApi.error && statutApi.callType === 'loadStatut') setLoading(false);
    }, [statutApi.data, statutApi.error, statutApi.callType]);

    useEffect(() => {
        if (historiqueApi.data && historiqueApi.callType === 'loadHistorique') {
            setHistorique(Array.isArray(historiqueApi.data) ? historiqueApi.data : []);
        }
    }, [historiqueApi.data, historiqueApi.callType]);

    useEffect(() => {
        if (parametresApi.data && parametresApi.callType === 'loadParametres') {
            setParametres(Array.isArray(parametresApi.data) ? parametresApi.data : []);
        }
    }, [parametresApi.data, parametresApi.callType]);

    useEffect(() => {
        if (ouvertureApi.data && ouvertureApi.callType === 'ouvrirSysteme') {
            showToast('success', 'Système Ouvert',
                'Ouverture enregistrée. Journal d\'ouverture créé. Soldes vérifiés. Les utilisateurs autorisés peuvent initier des transactions.');
            setOuvertureDialogVisible(false);
            setObservations('');
            loadStatut();
            loadHistorique();
        }
        if (ouvertureApi.error && ouvertureApi.callType === 'ouvrirSysteme') {
            showToast('error', 'Erreur', ouvertureApi.error.message || "Impossible d'ouvrir le système");
        }
    }, [ouvertureApi.data, ouvertureApi.error, ouvertureApi.callType]);

    const confirmerOuverture = () => {
        ouvertureApi.fetchData(
            { observations: observations.trim(), userAction: getUserAction() },
            'POST', `${OJ_URL}/ouverture`, 'ouvrirSysteme'
        );
    };

    const handleOuvrirClick = () => {
        confirmDialog({
            message: 'Confirmer l\'ouverture du système ? Le système sera déverrouillé, les soldes de comptes seront vérifiés par rapport à l\'état de fermeture du jour précédent, et une entrée de journal sera automatiquement créée.',
            header: "Confirmation d'Ouverture",
            icon: 'pi pi-info-circle',
            acceptClassName: 'p-button-success',
            acceptLabel: 'Oui, Ouvrir',
            rejectLabel: 'Annuler',
            accept: () => setOuvertureDialogVisible(true),
        });
    };

    const getParamValue = (code: string, fallback: string) =>
        parametres.find(p => p.codeParam === code)?.valeurParam || fallback;

    const openingTime = getParamValue('OPENING_TIME', '08:00');
    // Compare opening time against current Burundi time (UTC+2), not browser-local
    const todayBurundi = new Intl.DateTimeFormat('en-CA', { timeZone: TZ }).format(currentTime);
    const openingDateTime = new Date(`${todayBurundi}T${openingTime}:00${TZ_OFFSET}`);
    const isAfterOpeningTime = currentTime.getTime() >= openingDateTime.getTime();

    const estOuvert = statutJour?.statut === 'OUVERT';
    const eodEnCours = statutJour?.statut === 'EOD_EN_COURS';
    const eodCompatible = !statutJour || statutJour.statut === 'FERME' || statutJour.statut === 'EOD_TERMINE';
    const peutOuvrir = eodCompatible && !estOuvert && !eodEnCours;

    // §3.1 pre-opening checks
    const checks = [
        {
            label: 'Heure d\'ouverture atteinte',
            description: `Configurée à ${openingTime} — Heure actuelle : ${fmtTime(currentTime)}`,
            ok: isAfterOpeningTime,
            pending: false,
            icon: 'pi-clock',
        },
        {
            label: 'État du système compatible',
            description: estOuvert
                ? 'Le système est déjà ouvert aujourd\'hui'
                : eodEnCours
                    ? 'EOD en cours — attendre la fin avant d\'ouvrir'
                    : !statutJour
                        ? 'Première ouverture — aucun état précédent'
                        : 'EOD du jour précédent complété ✓',
            ok: eodCompatible && !eodEnCours,
            pending: false,
            icon: 'pi-check-circle',
        },
        {
            label: 'Vérification des soldes de comptes',
            description: estOuvert
                ? 'Soldes vérifiés par rapport à l\'état de fermeture du jour précédent lors de l\'ouverture'
                : 'Sera effectuée automatiquement à l\'ouverture (comparaison avec l\'état de clôture J-1)',
            ok: estOuvert,
            pending: !estOuvert,
            icon: 'pi-wallet',
        },
        {
            label: 'Accès utilisateurs autorisés',
            description: 'Caissiers, agents de crédit et directeurs pourront initier des transactions après ouverture',
            ok: true,
            pending: false,
            icon: 'pi-users',
        },
    ];

    const getStatutTag = (statut: string | undefined) => {
        const map: Record<string, { label: string; severity: 'success' | 'danger' | 'warning' | 'info' }> = {
            OUVERT: { label: 'OUVERT', severity: 'success' },
            FERME: { label: 'FERMÉ', severity: 'danger' },
            EOD_EN_COURS: { label: 'EOD EN COURS', severity: 'warning' },
            EOD_TERMINE: { label: 'EOD TERMINÉ', severity: 'info' },
        };
        const s = map[statut || ''] || { label: statut || '-', severity: 'info' as const };
        return <Tag value={s.label} severity={s.severity} />;
    };

    const ouvertureFooter = (
        <div className="flex gap-2 justify-content-end">
            <Button label="Annuler" icon="pi pi-times" outlined onClick={() => setOuvertureDialogVisible(false)} />
            <Button
                label="Confirmer l'Ouverture"
                icon="pi pi-unlock"
                severity="success"
                onClick={confirmerOuverture}
                loading={ouvertureApi.loading}
            />
        </div>
    );

    return (
        <ProtectedPage requiredAuthorities={['OJ_OUVERTURE_VIEW', 'OJ_OUVERTURE_EXECUTE', 'ADMIN']}>
            <Toast ref={toast} />
            <ConfirmDialog />

            <div className="card">
                {/* Header */}
                <div className="flex align-items-center gap-3 mb-4">
                    <i className="pi pi-sun text-4xl" style={{ color: '#4CAF50' }} />
                    <div>
                        <h2 className="m-0 text-900">Ouverture du Système</h2>
                        <p className="m-0 text-500 text-sm">
                            Contrôle d'accès au Système Bancaire Central (CBS) — déverrouillage quotidien
                        </p>
                    </div>
                    <div className="ml-auto text-right">
                        <div className="text-xl font-bold text-900">
                            {fmtTime(currentTime)}
                        </div>
                        <div className="text-500 text-sm">
                            {currentTime.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: TZ })}
                        </div>
                    </div>
                </div>

                {loading ? (
                    <div className="flex justify-content-center p-5"><ProgressSpinner /></div>
                ) : (
                    <>
                        <div className="grid mb-4">
                            {/* Main status card */}
                            <div className="col-12 md:col-8">
                                <Card className="shadow-2 h-full">
                                    <div className="flex align-items-center justify-content-between mb-3">
                                        <div>
                                            <p className="text-500 text-sm m-0 mb-2">Statut du Système</p>
                                            {getStatutTag(statutJour?.statut)}
                                        </div>
                                        <i
                                            className={`pi text-7xl ${estOuvert ? 'pi-unlock' : 'pi-lock'}`}
                                            style={{ color: estOuvert ? '#4CAF50' : '#F44336' }}
                                        />
                                    </div>

                                    {statutJour && (
                                        <div className="grid text-sm mb-3">
                                            <div className="col-6">
                                                <p className="m-0 text-500">Date</p>
                                                <p className="m-0 font-bold">{statutJour.dateJour}</p>
                                            </div>
                                            {statutJour.heureOuverture && (
                                                <div className="col-6">
                                                    <p className="m-0 text-500">Ouvert à</p>
                                                    <p className="m-0 font-bold">{formatDateTime(statutJour.heureOuverture)}</p>
                                                </div>
                                            )}
                                            {statutJour.ouvertPar && (
                                                <div className="col-6">
                                                    <p className="m-0 text-500">Administrateur initiateur</p>
                                                    <p className="m-0 font-bold">{statutJour.ouvertPar}</p>
                                                </div>
                                            )}
                                            {statutJour.agenceNom && (
                                                <div className="col-6">
                                                    <p className="m-0 text-500">Agence</p>
                                                    <p className="m-0 font-bold">{statutJour.agenceNom}</p>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    <Divider className="my-2" />

                                    {estOuvert && (
                                        <div>
                                            <Message
                                                severity="success"
                                                className="w-full mb-2"
                                                text="Système ouvert. Les utilisateurs autorisés peuvent initier des transactions."
                                            />
                                            <div className="flex justify-content-end">
                                                <Button label="Actualiser" icon="pi pi-refresh" outlined size="small" onClick={loadStatut} />
                                            </div>
                                        </div>
                                    )}
                                    {eodEnCours && (
                                        <Message severity="warn" className="w-full"
                                            text="EOD en cours de traitement. Attendez la fin du traitement avant d'ouvrir le système." />
                                    )}
                                    {!estOuvert && !eodEnCours && peutOuvrir && (
                                        <div className="flex gap-2">
                                            <Button
                                                label="Ouvrir le Système"
                                                icon="pi pi-unlock"
                                                severity="success"
                                                onClick={handleOuvrirClick}
                                                className="flex-1"
                                            />
                                            <Button label="Actualiser" icon="pi pi-refresh" outlined onClick={loadStatut} />
                                        </div>
                                    )}
                                    {!estOuvert && !eodEnCours && !peutOuvrir && (
                                        <Message severity="info" className="w-full"
                                            text="Le système a déjà été ouvert et clôturé aujourd'hui. Attendez la fin de l'EOD ou le lendemain." />
                                    )}
                                </Card>
                            </div>

                            {/* Info panels */}
                            <div className="col-12 md:col-4">
                                <div className="grid">
                                    <div className="col-12">
                                        <Card className="text-center bg-blue-50 mb-2">
                                            <div className="text-2xl font-bold text-blue-700">{openingTime}</div>
                                            <div className="text-500 text-sm mb-1">Heure d'Ouverture Configurée</div>
                                            <Tag
                                                value={isAfterOpeningTime ? 'Heure atteinte' : 'En attente'}
                                                severity={isAfterOpeningTime ? 'success' : 'warning'}
                                            />
                                        </Card>
                                    </div>
                                    <div className="col-12">
                                        <Card className="text-center bg-green-50 mb-2">
                                            <div className="text-2xl font-bold text-green-600">{formatNumber(statutJour?.nombreTransactions)}</div>
                                            <div className="text-500 text-sm">Transactions Aujourd'hui</div>
                                        </Card>
                                    </div>
                                    <div className="col-12">
                                        <Card className="text-center bg-purple-50">
                                            <div className="text-xl font-bold text-purple-600">{formatNumber(statutJour?.montantTotal)}</div>
                                            <div className="text-500 text-sm">Montant Total (BIF)</div>
                                        </Card>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* §3.1 Pre-opening controls checklist */}
                        <Card className="mb-4 shadow-1">
                            <div className="flex align-items-center gap-2 mb-3">
                                <i className="pi pi-list text-xl text-blue-600" />
                                <h3 className="m-0 text-900">Contrôles à l'Ouverture (§3.1)</h3>
                            </div>
                            <div className="grid">
                                {checks.map((check, idx) => (
                                    <div key={idx} className="col-12 md:col-6 mb-2">
                                        <div className={`flex align-items-start gap-3 p-3 border-round border-1 ${
                                            check.ok
                                                ? 'border-green-300 surface-50'
                                                : check.pending
                                                    ? 'border-blue-200 surface-50'
                                                    : 'border-red-300 surface-50'
                                        }`}>
                                            <i className={`pi ${check.icon} text-xl mt-1 ${
                                                check.ok ? 'text-green-600' :
                                                check.pending ? 'text-blue-400' :
                                                'text-red-500'
                                            }`} />
                                            <div className="flex-1">
                                                <div className="flex align-items-center gap-2 mb-1">
                                                    <span className="font-semibold text-sm">{check.label}</span>
                                                    <i className={`pi text-sm ${
                                                        check.ok
                                                            ? 'pi-check-circle text-green-600'
                                                            : check.pending
                                                                ? 'pi-info-circle text-blue-400'
                                                                : 'pi-times-circle text-red-500'
                                                    }`} />
                                                </div>
                                                <div className="text-500 text-xs">{check.description}</div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </Card>

                        {/* Opening journal entry display (§3.1 point 3) */}
                        {estOuvert && statutJour && (
                            <Card className="mb-4 shadow-1" style={{ borderLeft: '4px solid #4CAF50' }}>
                                <div className="flex align-items-center gap-2 mb-3">
                                    <i className="pi pi-file text-green-600 text-xl" />
                                    <h4 className="m-0 text-900">Entrée de Journal d'Ouverture Créée Automatiquement</h4>
                                </div>
                                <div className="grid text-sm">
                                    <div className="col-6 md:col-3">
                                        <p className="m-0 text-500">Date</p>
                                        <p className="m-0 font-bold">{statutJour.dateJour}</p>
                                    </div>
                                    <div className="col-6 md:col-3">
                                        <p className="m-0 text-500">Heure d'Ouverture</p>
                                        <p className="m-0 font-bold">{formatDateTime(statutJour.heureOuverture)}</p>
                                    </div>
                                    <div className="col-6 md:col-3">
                                        <p className="m-0 text-500">Administrateur Initiateur</p>
                                        <p className="m-0 font-bold">{statutJour.ouvertPar || '-'}</p>
                                    </div>
                                    <div className="col-6 md:col-3">
                                        <p className="m-0 text-500">Agence</p>
                                        <p className="m-0 font-bold">{statutJour.agenceNom || '-'}</p>
                                    </div>
                                    {statutJour.observationsOuverture && (
                                        <div className="col-12 mt-2">
                                            <p className="m-0 text-500">Observations</p>
                                            <p className="m-0 font-bold">{statutJour.observationsOuverture}</p>
                                        </div>
                                    )}
                                </div>
                                <Divider className="my-2" />
                                <div className="flex align-items-center gap-2 text-sm text-green-700">
                                    <i className="pi pi-check-circle" />
                                    <span>Soldes de comptes vérifiés par rapport à l'état de fermeture du jour précédent</span>
                                </div>
                            </Card>
                        )}

                        {/* History */}
                        <div className="flex align-items-center justify-content-between mb-3">
                            <h3 className="m-0">Historique des Ouvertures</h3>
                            <div className="flex gap-2 align-items-center">
                                <Calendar
                                    value={filterDate}
                                    onChange={e => {
                                        setFilterDate(e.value as Date);
                                        loadHistorique(e.value as Date);
                                    }}
                                    placeholder="Filtrer par date"
                                    dateFormat="dd/mm/yy"
                                    showButtonBar
                                    style={{ width: '180px' }}
                                />
                                <Button icon="pi pi-refresh" outlined onClick={() => loadHistorique()} tooltip="Actualiser" />
                            </div>
                        </div>

                        <DataTable
                            value={historique}
                            loading={historiqueApi.loading}
                            stripedRows showGridlines paginator rows={10}
                            emptyMessage="Aucun enregistrement trouvé"
                        >
                            <Column field="dateJour" header="Date" sortable style={{ minWidth: '110px' }} />
                            <Column
                                header="Heure d'Ouverture" sortable style={{ minWidth: '160px' }}
                                body={(r) => formatDateTime(r.horodatage || r.heureOuverture)}
                            />
                            <Column
                                header="Ouvert Par" sortable style={{ minWidth: '160px' }}
                                body={(r) => r.utilisateurNom || r.ouvertPar || '-'}
                            />
                            <Column field="agenceNom" header="Agence" sortable style={{ minWidth: '150px' }} />
                            <Column field="nombreTransactions" header="Nb. Transactions" sortable body={(r) => formatNumber(r.nombreTransactions)} style={{ minWidth: '130px' }} />
                            <Column field="montantTotal" header="Montant Total" sortable body={(r) => formatNumber(r.montantTotal)} style={{ minWidth: '130px' }} />
                            <Column field="statut" header="Statut" body={(r) => getStatutTag(r.statut)} style={{ minWidth: '120px' }} />
                        </DataTable>
                    </>
                )}
            </div>

            {/* Confirmation Dialog */}
            <Dialog
                header="Confirmer l'Ouverture du Système"
                visible={ouvertureDialogVisible}
                style={{ width: '500px' }}
                onHide={() => setOuvertureDialogVisible(false)}
                footer={ouvertureFooter}
            >
                <div className="p-fluid">
                    <Message
                        severity="info"
                        className="mb-3 w-full"
                        text="À l'ouverture, le système va : (1) créer automatiquement une entrée de journal (date, heure, identifiant de l'administrateur) ; (2) vérifier tous les soldes de comptes par rapport à l'état de fermeture du jour précédent avant la première transaction."
                    />

                    <div className="border-1 border-round p-3 mb-3 bg-blue-50 text-sm">
                        <div className="flex align-items-center gap-2 mb-2">
                            <i className="pi pi-clock text-blue-600" />
                            <span>Heure d'ouverture configurée : <strong>{openingTime}</strong></span>
                            {!isAfterOpeningTime && (
                                <Tag value="Avant l'heure" severity="warning" />
                            )}
                        </div>
                        <div className="flex align-items-center gap-2">
                            <i className="pi pi-calendar text-blue-600" />
                            <span>
                                Heure actuelle : <strong>{fmtTime(currentTime)}</strong>
                            </span>
                        </div>
                    </div>

                    <div className="field">
                        <label className="font-bold">Observations (optionnel)</label>
                        <InputTextarea
                            value={observations}
                            onChange={e => setObservations(e.target.value)}
                            rows={3}
                            placeholder="Remarques ou observations pour cette ouverture..."
                            className="mt-1"
                        />
                    </div>
                </div>
            </Dialog>
        </ProtectedPage>
    );
};

export default OuverturePage;
