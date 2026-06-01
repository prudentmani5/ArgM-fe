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
import { InputTextarea } from 'primereact/inputtextarea';
import { Message } from 'primereact/message';
import { ProgressSpinner } from 'primereact/progressspinner';
import { Checkbox } from 'primereact/checkbox';
import { Calendar } from 'primereact/calendar';

import useConsumApi, { getUserAction } from '@/hooks/fetchData/useConsumApi';
import { buildApiUrl } from '@/utils/apiConfig';
import { ProtectedPage } from '@/components/ProtectedPage';
import { Panel } from 'primereact/panel';

const OJ_URL = buildApiUrl('/api/operations-journalieres');

// Burundi uses Central Africa Time = UTC+2 (Africa/Bujumbura, no DST)
const TZ = 'Africa/Bujumbura';
const TZ_OFFSET = '+02:00';

const fmtTime = (date: Date) =>
    date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', timeZone: TZ });

const fmtDateTime = (date: Date) =>
    date.toLocaleString('fr-FR', { timeZone: TZ });

interface StatutJour {
    statut: 'OUVERT' | 'FERME' | 'EOD_EN_COURS' | 'EOD_TERMINE';
    dateJour: string;
    heureOuverture?: string;
    heureFermeture?: string;
    ouvertPar?: string;
    fermerPar?: string;
    nombreTransactions?: number;
    nombreSessionsActives?: number;
    transactionsEnAttente?: number;
    montantTotal?: number;
    agenceNom?: string;
}

interface JournalFermeture {
    journalId: number;
    dateJour: string;
    horodatage?: string;
    heureFermeture?: string;
    utilisateurNom?: string;
    fermerPar?: string;
    agenceNom: string;
    nombreTransactions: number;
    montantTotal: number;
    sessionsActives: number;
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

interface ActiveSession {
    sessionId: number;
    userEmail: string;
    userNom: string;
    loginTime: string;
    ipAddress: string;
    isActive: boolean;
}

interface ClosedAttempt {
    attemptId: number;
    userEmail: string;
    attemptTime: string;
    ipAddress: string;
}

const formatDateTime = (value: string | undefined) => {
    if (!value) return '-';
    try { return fmtDateTime(new Date(value)); } catch { return value; }
};

const formatNumber = (value: number | undefined | null): string => {
    if (value === undefined || value === null) return '0';
    return value.toLocaleString('fr-FR');
};

const toApiDate = (date: Date): string => {
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
};

const parseTime = (timeStr: string): { hour: number; min: number } => {
    const parts = (timeStr || '17:00').split(':');
    return { hour: parseInt(parts[0]) || 17, min: parseInt(parts[1]) || 0 };
};

const FermeturePage = () => {
    const [statutJour, setStatutJour] = useState<StatutJour | null>(null);
    const [historique, setHistorique] = useState<JournalFermeture[]>([]);
    const [parametres, setParametres] = useState<Parametre[]>([]);
    const [fermetureDialogVisible, setFermetureDialogVisible] = useState(false);
    const [observations, setObservations] = useState('');
    const [confirmed1, setConfirmed1] = useState(false);
    const [confirmed2, setConfirmed2] = useState(false);
    const [confirmed3, setConfirmed3] = useState(false);
    const [loading, setLoading] = useState(false);
    const [filterDate, setFilterDate] = useState<Date | null>(null);
    const [currentTime, setCurrentTime] = useState(new Date());
    const [preCloseWarningTime, setPreCloseWarningTime] = useState<Date | null>(null);
    const [activeSessions, setActiveSessions] = useState<ActiveSession[]>([]);
    const [expiredCount, setExpiredCount] = useState<number | null>(null);
    const [closedAttempts, setClosedAttempts] = useState<ClosedAttempt[]>([]);

    const toast = useRef<Toast>(null);
    const statutApi = useConsumApi('');
    const fermetureApi = useConsumApi('');
    const preCloseApi = useConsumApi('');
    const historiqueApi = useConsumApi('');
    const parametresApi = useConsumApi('');
    const sessionsApi = useConsumApi('');
    const expireApi = useConsumApi('');
    const closedAttemptsApi = useConsumApi('');

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
        loadActiveSessions();
        loadClosedAttempts();
    }, []);

    const loadStatut = () => {
        setLoading(true);
        statutApi.fetchData(null, 'GET', `${OJ_URL}/statut-jour`, 'loadStatut');
    };

    const loadHistorique = (date?: Date) => {
        let url = `${OJ_URL}/journal?type=FERMETURE`;
        if (date) url += `&date=${toApiDate(date)}`;
        historiqueApi.fetchData(null, 'GET', url, 'loadHistorique');
    };

    const loadParametres = () => {
        parametresApi.fetchData(null, 'GET', `${OJ_URL}/parametres`, 'loadParametres');
    };

    const loadActiveSessions = () => {
        sessionsApi.fetchData(null, 'GET', `${OJ_URL}/sessions/actives`, 'loadSessions');
    };

    const loadClosedAttempts = () => {
        closedAttemptsApi.fetchData(null, 'GET', `${OJ_URL}/sessions/closed-attempts`, 'loadClosedAttempts');
    };

    const handleExpireAll = () => {
        confirmDialog({
            message: 'Forcer l\'expiration de toutes les sessions actives ? Les utilisateurs connectés seront déconnectés immédiatement.',
            header: 'Expirer Toutes les Sessions',
            icon: 'pi pi-exclamation-triangle',
            acceptClassName: 'p-button-danger',
            acceptLabel: 'Oui, Expirer',
            rejectLabel: 'Annuler',
            accept: () => {
                expireApi.fetchData(
                    { reason: 'ADMIN_FORCED', userAction: getUserAction() },
                    'POST', `${OJ_URL}/sessions/expire-all`, 'expireAll'
                );
            },
        });
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
        if (sessionsApi.data && sessionsApi.callType === 'loadSessions') {
            setActiveSessions(Array.isArray(sessionsApi.data) ? sessionsApi.data : []);
        }
    }, [sessionsApi.data, sessionsApi.callType]);

    useEffect(() => {
        if (expireApi.data && expireApi.callType === 'expireAll') {
            const result = expireApi.data as { expiredCount: number; message: string };
            setExpiredCount(result.expiredCount);
            showToast('success', 'Sessions Expirées', result.message || `${result.expiredCount} session(s) expirée(s) avec succès`);
            loadActiveSessions();
            loadStatut();
        }
        if (expireApi.error && expireApi.callType === 'expireAll') {
            showToast('error', 'Erreur', expireApi.error.message || 'Impossible d\'expirer les sessions');
        }
    }, [expireApi.data, expireApi.error, expireApi.callType]);

    useEffect(() => {
        if (closedAttemptsApi.data && closedAttemptsApi.callType === 'loadClosedAttempts') {
            setClosedAttempts(Array.isArray(closedAttemptsApi.data) ? closedAttemptsApi.data : []);
        }
    }, [closedAttemptsApi.data, closedAttemptsApi.callType]);

    useEffect(() => {
        if (preCloseApi.data && preCloseApi.callType === 'sendPreClose') {
            const now = new Date();
            setPreCloseWarningTime(now);
            showToast('warn', 'Avertissement Envoyé',
                `Avertissement de pré-fermeture envoyé à tous les utilisateurs actifs à ${fmtTime(now)}.`);
        }
        if (preCloseApi.error && preCloseApi.callType === 'sendPreClose') {
            showToast('error', 'Erreur', preCloseApi.error.message || 'Impossible d\'envoyer la notification');
        }
    }, [preCloseApi.data, preCloseApi.error, preCloseApi.callType]);

    useEffect(() => {
        if (fermetureApi.data && fermetureApi.callType === 'fermerSysteme') {
            showToast('success', 'Système Fermé',
                'Fermeture enregistrée. Toute nouvelle initiation de transaction est bloquée. Journal de fermeture créé avec l\'état de toutes les sessions actives.');
            setFermetureDialogVisible(false);
            setObservations('');
            setConfirmed1(false);
            setConfirmed2(false);
            setConfirmed3(false);
            setPreCloseWarningTime(null);
            loadStatut();
            loadHistorique();
            loadClosedAttempts();
        }
        if (fermetureApi.error && fermetureApi.callType === 'fermerSysteme') {
            showToast('error', 'Erreur', fermetureApi.error.message || 'Impossible de fermer le système');
        }
    }, [fermetureApi.data, fermetureApi.error, fermetureApi.callType]);

    const sendPreCloseWarning = () => {
        preCloseApi.fetchData({ userAction: getUserAction() }, 'POST', `${OJ_URL}/fermeture/pre-close`, 'sendPreClose');
    };

    const confirmerFermeture = () => {
        if (!confirmed1 || !confirmed2 || !confirmed3) {
            showToast('warn', 'Confirmation requise', 'Vous devez cocher les trois confirmations obligatoires avant de fermer le système');
            return;
        }
        fermetureApi.fetchData(
            { observations: observations.trim(), userAction: getUserAction() },
            'POST', `${OJ_URL}/fermeture/confirmer`, 'fermerSysteme'
        );
    };

    const handleFermerClick = () => {
        const pending = statutJour?.transactionsEnAttente || 0;
        if (pending > 0) {
            confirmDialog({
                message: `${pending} transaction(s) en attente détectée(s). Selon les règles de fermeture (§3.2), ces transactions doivent être complétées ou annulées avant le démarrage de l'EOD. Souhaitez-vous continuer quand même ?`,
                header: 'Transactions en Attente',
                icon: 'pi pi-exclamation-triangle',
                acceptClassName: 'p-button-warning',
                acceptLabel: 'Oui, Continuer',
                rejectLabel: 'Annuler',
                accept: () => setFermetureDialogVisible(true),
            });
        } else {
            setFermetureDialogVisible(true);
        }
    };

    const getParamValue = (code: string, fallback: string) =>
        parametres.find(p => p.codeParam === code)?.valeurParam || fallback;

    const closingTime = getParamValue('CLOSING_TIME', '17:00');
    const preCloseMinutes = parseInt(getParamValue('PRE_CLOSE_WARNING', '15'));
    const interbankCutoff = getParamValue('INTERBANK_CUTOFF', '15:30');

    // Interpret closingTime ("17:00") as Burundi time (UTC+2), not browser-local
    const todayBurundi = new Intl.DateTimeFormat('en-CA', { timeZone: TZ }).format(currentTime);
    const closingDateTime = new Date(`${todayBurundi}T${closingTime}:00${TZ_OFFSET}`);
    const msToClose = closingDateTime.getTime() - currentTime.getTime();
    const minutesToClose = Math.floor(msToClose / 60000);
    const isPastClosingTime = msToClose <= 0;
    const isPreCloseWindow = minutesToClose > 0 && minutesToClose <= preCloseMinutes;

    // When the pre-close warning should have been sent
    const preCloseTargetMs = closingDateTime.getTime() - preCloseMinutes * 60000;
    const isPastPreCloseTime = currentTime.getTime() >= preCloseTargetMs;
    const preCloseElapsedMin = preCloseWarningTime
        ? Math.floor((currentTime.getTime() - preCloseWarningTime.getTime()) / 60000)
        : 0;

    const peutFermer = statutJour?.statut === 'OUVERT';
    const estFerme = statutJour?.statut === 'FERME' || statutJour?.statut === 'EOD_EN_COURS' || statutJour?.statut === 'EOD_TERMINE';
    const hasPendingTransactions = (statutJour?.transactionsEnAttente || 0) > 0;
    const hasActiveSessions = (statutJour?.nombreSessionsActives || 0) > 0;

    // §3.2 pre-closing checklist
    const preCloseChecks = [
        {
            label: 'Heure de fermeture atteinte',
            description: isPastClosingTime
                ? `Heure de fermeture ${closingTime} dépassée — procédez à la fermeture`
                : isPreCloseWindow
                    ? `Fermeture dans ${minutesToClose} min (configurée à ${closingTime})`
                    : `Fermeture prévue à ${closingTime} — dans ${minutesToClose > 0 ? minutesToClose + ' min' : '0 min'}`,
            ok: isPastClosingTime,
            warning: isPreCloseWindow,
            icon: 'pi-clock',
        },
        {
            label: `Avertissement pré-fermeture envoyé (${preCloseMinutes} min avant)`,
            description: preCloseWarningTime
                ? `Envoyé à ${fmtTime(preCloseWarningTime)} — il y a ${preCloseElapsedMin} min`
                : isPastPreCloseTime
                    ? 'Il est temps d\'envoyer l\'avertissement aux utilisateurs actifs'
                    : `À envoyer à ${fmtTime(new Date(preCloseTargetMs))}`,
            ok: !!preCloseWarningTime,
            warning: isPastPreCloseTime && !preCloseWarningTime,
            icon: 'pi-bell',
        },
        {
            label: 'Transactions en cours traitées',
            description: hasPendingTransactions
                ? `${statutJour?.transactionsEnAttente} transaction(s) en attente — doivent être complétées ou annulées avant l'EOD`
                : 'Aucune transaction en attente — prêt pour la fermeture',
            ok: !hasPendingTransactions,
            warning: false,
            icon: 'pi-list',
        },
        {
            label: `Délai interbancaire (INTERBANK_CUTOFF : ${interbankCutoff})`,
            description: `Les transferts interbancaires initiés après ${interbankCutoff} ne seront pas traités aujourd'hui`,
            ok: true,
            warning: false,
            icon: 'pi-arrow-right-arrow-left',
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

    const canConfirmFermeture = confirmed1 && confirmed2 && confirmed3;

    const fermetureFooter = (
        <div className="flex gap-2 justify-content-end">
            <Button
                label="Annuler"
                icon="pi pi-times"
                outlined
                onClick={() => {
                    setFermetureDialogVisible(false);
                    setConfirmed1(false); setConfirmed2(false); setConfirmed3(false);
                }}
            />
            <Button
                label="Confirmer la Fermeture"
                icon="pi pi-lock"
                severity="danger"
                onClick={confirmerFermeture}
                loading={fermetureApi.loading}
                disabled={!canConfirmFermeture}
            />
        </div>
    );

    return (
        <ProtectedPage requiredAuthorities={['OJ_FERMETURE_VIEW', 'OJ_FERMETURE_EXECUTE', 'ADMIN']}>
            <Toast ref={toast} />
            <ConfirmDialog />

            <div className="card">
                {/* Header */}
                <div className="flex align-items-center gap-3 mb-4">
                    <i className="pi pi-moon text-4xl" style={{ color: '#FF9800' }} />
                    <div>
                        <h2 className="m-0 text-900">Fermeture du Système</h2>
                        <p className="m-0 text-500 text-sm">
                            Blocage des transactions à l'échelle du système et déclenchement du traitement EOD
                        </p>
                    </div>
                    <div className="ml-auto text-right">
                        <div className="text-xl font-bold text-900">
                            {fmtTime(currentTime)}
                        </div>
                        {peutFermer && (
                            <div className={`text-sm font-bold ${
                                isPastClosingTime ? 'text-red-600' :
                                isPreCloseWindow ? 'text-orange-500' :
                                'text-500'
                            }`}>
                                {isPastClosingTime
                                    ? `Heure de fermeture ${closingTime} dépassée`
                                    : `Fermeture à ${closingTime} — dans ${minutesToClose} min`}
                            </div>
                        )}
                    </div>
                </div>

                {/* Closing time banners */}
                {peutFermer && isPastClosingTime && (
                    <Message severity="error" className="mb-3 w-full"
                        text={`L'heure de fermeture (${closingTime}) est dépassée. Procédez à la fermeture du système pour bloquer les nouvelles transactions.`} />
                )}
                {peutFermer && isPreCloseWindow && !isPastClosingTime && (
                    <Message severity="warn" className="mb-3 w-full"
                        text={`Fermeture dans ${minutesToClose} minute(s). Envoyez l'avertissement pré-fermeture aux utilisateurs actifs si ce n'est pas encore fait.`} />
                )}

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
                                            className={`pi text-7xl ${estFerme ? 'pi-lock' : 'pi-unlock'}`}
                                            style={{ color: estFerme ? '#F44336' : '#4CAF50' }}
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
                                            {statutJour.heureFermeture && (
                                                <div className="col-6">
                                                    <p className="m-0 text-500">Fermé à</p>
                                                    <p className="m-0 font-bold">{formatDateTime(statutJour.heureFermeture)}</p>
                                                </div>
                                            )}
                                            {statutJour.fermerPar && (
                                                <div className="col-6">
                                                    <p className="m-0 text-500">Fermé par</p>
                                                    <p className="m-0 font-bold">{statutJour.fermerPar}</p>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    <Divider className="my-2" />

                                    {peutFermer && (
                                        <div className="flex gap-2 flex-wrap">
                                            <Button
                                                label={preCloseWarningTime
                                                    ? `Avertissement Renvoyé (il y a ${preCloseElapsedMin} min)`
                                                    : `Envoyer Avertissement Pré-Fermeture (${preCloseMinutes} min avant)`}
                                                icon="pi pi-bell"
                                                severity="warning"
                                                outlined
                                                onClick={sendPreCloseWarning}
                                                loading={preCloseApi.loading}
                                            />
                                            <Button
                                                label="Fermer le Système"
                                                icon="pi pi-lock"
                                                severity="danger"
                                                onClick={handleFermerClick}
                                            />
                                            <Button label="Actualiser" icon="pi pi-refresh" outlined onClick={loadStatut} />
                                        </div>
                                    )}
                                    {estFerme && (
                                        <Message severity="warn" className="w-full"
                                            text="Système fermé. Toute nouvelle initiation de transaction est bloquée à l'échelle du système." />
                                    )}
                                </Card>
                            </div>

                            {/* Stats cards */}
                            <div className="col-12 md:col-4">
                                <div className="grid">
                                    <div className="col-12">
                                        <Card className="text-center bg-orange-50 mb-2">
                                            <div className="text-2xl font-bold text-orange-700">{closingTime}</div>
                                            <div className="text-500 text-sm mb-1">Heure de Fermeture Configurée</div>
                                            {peutFermer && (
                                                <Tag
                                                    value={isPastClosingTime ? 'Dépassée' : `Dans ${minutesToClose} min`}
                                                    severity={isPastClosingTime ? 'danger' : isPreCloseWindow ? 'warning' : 'info'}
                                                />
                                            )}
                                        </Card>
                                    </div>
                                    <div className="col-12">
                                        <Card className={`text-center mb-2 ${hasActiveSessions ? 'bg-orange-50' : 'bg-green-50'}`}>
                                            <div className={`text-2xl font-bold ${hasActiveSessions ? 'text-orange-600' : 'text-green-600'}`}>
                                                {formatNumber(statutJour?.nombreSessionsActives)}
                                            </div>
                                            <div className="text-500 text-sm">Sessions Actives</div>
                                        </Card>
                                    </div>
                                    <div className="col-12">
                                        <Card className={`text-center mb-2 ${hasPendingTransactions ? 'bg-red-50' : 'bg-green-50'}`}>
                                            <div className={`text-2xl font-bold ${hasPendingTransactions ? 'text-red-600' : 'text-green-600'}`}>
                                                {formatNumber(statutJour?.transactionsEnAttente)}
                                            </div>
                                            <div className="text-500 text-sm">Transactions en Attente</div>
                                            {hasPendingTransactions && (
                                                <div className="text-red-500 text-xs mt-1">À compléter ou annuler avant EOD</div>
                                            )}
                                        </Card>
                                    </div>
                                    <div className="col-12">
                                        <Card className="text-center bg-gray-50">
                                            <div className="text-2xl font-bold text-600">{formatNumber(statutJour?.nombreTransactions)}</div>
                                            <div className="text-500 text-sm">Total Transactions du Jour</div>
                                        </Card>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* §3.2 Pre-closing controls checklist */}
                        <Card className="mb-4 shadow-1">
                            <div className="flex align-items-center gap-2 mb-3">
                                <i className="pi pi-list text-xl text-orange-600" />
                                <h3 className="m-0 text-900">Contrôles à la Fermeture (§3.2)</h3>
                            </div>
                            <div className="grid">
                                {preCloseChecks.map((check, idx) => (
                                    <div key={idx} className="col-12 md:col-6 mb-2">
                                        <div className={`flex align-items-start gap-3 p-3 border-round border-1 ${
                                            check.ok
                                                ? 'border-green-300 surface-50'
                                                : check.warning
                                                    ? 'border-orange-300 surface-50'
                                                    : 'border-red-300 surface-50'
                                        }`}>
                                            <i className={`pi ${check.icon} text-xl mt-1 ${
                                                check.ok ? 'text-green-600' :
                                                check.warning ? 'text-orange-500' :
                                                'text-red-500'
                                            }`} />
                                            <div className="flex-1">
                                                <div className="flex align-items-center gap-2 mb-1">
                                                    <span className="font-semibold text-sm">{check.label}</span>
                                                    <i className={`pi text-sm ${
                                                        check.ok
                                                            ? 'pi-check-circle text-green-600'
                                                            : check.warning
                                                                ? 'pi-exclamation-circle text-orange-500'
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

                        {/* Closing journal entry display (§3.2 point 4) */}
                        {estFerme && statutJour?.heureFermeture && (
                            <Card className="mb-4 shadow-1" style={{ borderLeft: '4px solid #F44336' }}>
                                <div className="flex align-items-center gap-2 mb-3">
                                    <i className="pi pi-file text-red-500 text-xl" />
                                    <h4 className="m-0 text-900">Entrée de Journal de Fermeture Créée Automatiquement</h4>
                                </div>
                                <div className="grid text-sm">
                                    <div className="col-6 md:col-3">
                                        <p className="m-0 text-500">Date</p>
                                        <p className="m-0 font-bold">{statutJour.dateJour}</p>
                                    </div>
                                    <div className="col-6 md:col-3">
                                        <p className="m-0 text-500">Heure de Fermeture</p>
                                        <p className="m-0 font-bold">{formatDateTime(statutJour.heureFermeture)}</p>
                                    </div>
                                    <div className="col-6 md:col-3">
                                        <p className="m-0 text-500">Fermé par</p>
                                        <p className="m-0 font-bold">{statutJour.fermerPar || '-'}</p>
                                    </div>
                                    <div className="col-6 md:col-3">
                                        <p className="m-0 text-500">Sessions Enregistrées</p>
                                        <p className="m-0 font-bold">{statutJour.nombreSessionsActives ?? 0}</p>
                                    </div>
                                </div>
                                <Divider className="my-2" />
                                <div className="flex align-items-center gap-2 text-sm text-600">
                                    <i className="pi pi-check-circle text-orange-500" />
                                    <span>Journal créé avec : date, heure, état de toutes les sessions actives au moment de la fermeture</span>
                                </div>
                            </Card>
                        )}

                        {/* Active Sessions Panel */}
                        <Panel
                            header={
                                <div className="flex align-items-center gap-2">
                                    <i className="pi pi-users text-orange-600" />
                                    <span>Sessions Actives ({activeSessions.length})</span>
                                </div>
                            }
                            toggleable
                            collapsed={false}
                            className="mb-4 shadow-1"
                        >
                            {expiredCount !== null && (
                                <Message
                                    severity="success"
                                    className="mb-3 w-full"
                                    text={`${expiredCount} session(s) expirée(s) avec succès. Les utilisateurs concernés devront se reconnecter.`}
                                />
                            )}
                            <div className="flex align-items-center justify-content-between mb-3">
                                <span className="text-sm text-500">
                                    {activeSessions.length === 0
                                        ? 'Aucune session active en ce moment.'
                                        : `${activeSessions.length} utilisateur(s) actuellement connecté(s).`}
                                </span>
                                <div className="flex gap-2">
                                    <Button
                                        label="Actualiser"
                                        icon="pi pi-refresh"
                                        outlined
                                        size="small"
                                        onClick={loadActiveSessions}
                                        loading={sessionsApi.loading}
                                    />
                                    {activeSessions.length > 0 && (
                                        <Button
                                            label="Expirer Toutes les Sessions"
                                            icon="pi pi-power-off"
                                            severity="danger"
                                            size="small"
                                            onClick={handleExpireAll}
                                            loading={expireApi.loading}
                                        />
                                    )}
                                </div>
                            </div>
                            <DataTable
                                value={activeSessions}
                                loading={sessionsApi.loading}
                                stripedRows
                                showGridlines
                                emptyMessage="Aucune session active"
                                size="small"
                            >
                                <Column field="userEmail" header="Email" sortable style={{ minWidth: '200px' }} />
                                <Column field="userNom" header="Nom" sortable style={{ minWidth: '160px' }} />
                                <Column
                                    header="Connexion"
                                    sortable
                                    body={(r: ActiveSession) => formatDateTime(r.loginTime)}
                                    style={{ minWidth: '160px' }}
                                />
                                <Column field="ipAddress" header="Adresse IP" style={{ minWidth: '130px' }} body={(r: ActiveSession) => r.ipAddress || '-'} />
                            </DataTable>
                        </Panel>

                        {/* Closed System Login Attempts */}
                        <Panel
                            header={
                                <div className="flex align-items-center gap-2">
                                    <i className="pi pi-ban text-red-600" />
                                    <span>Tentatives de Connexion — Système Fermé</span>
                                    {closedAttempts.length > 0 && (
                                        <span className="ml-2 px-2 py-1 border-round text-xs font-bold"
                                            style={{ background: '#ffcdd2', color: '#c62828' }}>
                                            {closedAttempts.length}
                                        </span>
                                    )}
                                </div>
                            }
                            toggleable
                            collapsed={closedAttempts.length === 0}
                            className="mb-4 shadow-1"
                        >
                            <div className="flex align-items-center justify-content-between mb-3">
                                <span className="text-sm text-500">
                                    {closedAttempts.length === 0
                                        ? 'Aucune tentative de connexion pendant que le système était fermé.'
                                        : `${closedAttempts.length} tentative(s) de connexion enregistrée(s) pendant la fermeture du système.`}
                                </span>
                                <Button
                                    label="Actualiser"
                                    icon="pi pi-refresh"
                                    outlined
                                    size="small"
                                    onClick={loadClosedAttempts}
                                    loading={closedAttemptsApi.loading}
                                />
                            </div>
                            {closedAttempts.length > 0 && (
                                <Message
                                    severity="warn"
                                    className="mb-3 w-full"
                                    text="Ces utilisateurs ont essayé de se connecter pendant que le système était fermé. Ils ont reçu le message : «Système est fermé, s'il vous plaît il faut attendre»."
                                />
                            )}
                            <DataTable
                                value={closedAttempts}
                                loading={closedAttemptsApi.loading}
                                stripedRows
                                showGridlines
                                emptyMessage="Aucune tentative enregistrée"
                                size="small"
                                paginator
                                rows={10}
                            >
                                <Column field="userEmail" header="Email" sortable style={{ minWidth: '200px' }} />
                                <Column
                                    header="Heure de Tentative"
                                    sortable
                                    body={(r: ClosedAttempt) => formatDateTime(r.attemptTime)}
                                    style={{ minWidth: '180px' }}
                                />
                                <Column
                                    field="ipAddress"
                                    header="Adresse IP"
                                    style={{ minWidth: '130px' }}
                                    body={(r: ClosedAttempt) => r.ipAddress || '-'}
                                />
                            </DataTable>
                        </Panel>

                        {/* History */}
                        <div className="flex align-items-center justify-content-between mb-3">
                            <h3 className="m-0">Historique des Fermetures</h3>
                            <div className="flex gap-2 align-items-center">
                                <Calendar
                                    value={filterDate}
                                    onChange={e => { setFilterDate(e.value as Date); loadHistorique(e.value as Date); }}
                                    placeholder="Filtrer par date"
                                    dateFormat="dd/mm/yy"
                                    showButtonBar
                                    style={{ width: '180px' }}
                                />
                                <Button icon="pi pi-refresh" outlined onClick={() => loadHistorique()} />
                            </div>
                        </div>

                        <DataTable
                            value={historique}
                            loading={historiqueApi.loading}
                            stripedRows showGridlines paginator rows={10}
                            emptyMessage="Aucun enregistrement trouvé"
                        >
                            <Column field="dateJour" header="Date" sortable style={{ minWidth: '110px' }} />
                            <Column header="Heure de Fermeture" sortable body={(r) => formatDateTime(r.horodatage || r.heureFermeture)} style={{ minWidth: '160px' }} />
                            <Column header="Fermé Par" sortable body={(r) => r.utilisateurNom || r.fermerPar || '-'} style={{ minWidth: '160px' }} />
                            <Column field="agenceNom" header="Agence" sortable style={{ minWidth: '150px' }} />
                            <Column field="nombreTransactions" header="Nb. Transactions" sortable body={(r) => formatNumber(r.nombreTransactions)} style={{ minWidth: '130px' }} />
                            <Column field="sessionsActives" header="Sessions Actives" sortable body={(r) => formatNumber(r.sessionsActives)} style={{ minWidth: '130px' }} />
                            <Column field="statut" header="Statut" body={(r) => getStatutTag(r.statut)} style={{ minWidth: '120px' }} />
                        </DataTable>
                    </>
                )}
            </div>

            {/* Fermeture Confirmation Dialog */}
            <Dialog
                header="Confirmer la Fermeture du Système"
                visible={fermetureDialogVisible}
                style={{ width: '540px' }}
                onHide={() => {
                    setFermetureDialogVisible(false);
                    setConfirmed1(false); setConfirmed2(false); setConfirmed3(false);
                }}
                footer={fermetureFooter}
            >
                <div className="p-fluid">
                    <Message
                        severity="error"
                        className="mb-3 w-full"
                        text="À la fermeture : (1) toute nouvelle initiation de transaction sera bloquée à l'échelle du système ; (2) une entrée de journal sera créée avec la date, l'heure et l'état de toutes les sessions actives."
                    />

                    <div className="border-1 border-round p-3 mb-3 bg-gray-50 text-sm">
                        <div className="grid">
                            <div className="col-6">
                                <div className="flex align-items-center gap-2">
                                    <i className="pi pi-clock text-600" />
                                    <span>Heure configurée : <strong>{closingTime}</strong></span>
                                </div>
                            </div>
                            <div className="col-6">
                                <div className={`flex align-items-center gap-2 ${hasActiveSessions ? 'text-orange-600' : ''}`}>
                                    <i className={`pi ${hasActiveSessions ? 'pi-exclamation-triangle' : 'pi-users'}`} />
                                    <span>Sessions actives : <strong>{statutJour?.nombreSessionsActives || 0}</strong></span>
                                </div>
                            </div>
                            <div className="col-6 mt-2">
                                <div className="flex align-items-center gap-2">
                                    <i className="pi pi-money-bill text-600" />
                                    <span>Total transactions : <strong>{formatNumber(statutJour?.nombreTransactions)}</strong></span>
                                </div>
                            </div>
                            <div className="col-6 mt-2">
                                <div className={`flex align-items-center gap-2 ${hasPendingTransactions ? 'text-red-600 font-bold' : ''}`}>
                                    <i className={`pi ${hasPendingTransactions ? 'pi-times-circle text-red-500' : 'pi-check-circle text-green-500'}`} />
                                    <span>En attente : <strong>{statutJour?.transactionsEnAttente || 0}</strong></span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {hasPendingTransactions && (
                        <Message
                            severity="warn"
                            className="mb-3 w-full"
                            text={`${statutJour?.transactionsEnAttente} transaction(s) en attente. Selon §3.2, elles doivent être complétées ou annulées avant le démarrage de la routine EOD.`}
                        />
                    )}

                    <div className="field">
                        <label className="font-bold">Observations (optionnel)</label>
                        <InputTextarea
                            value={observations}
                            onChange={e => setObservations(e.target.value)}
                            rows={2}
                            placeholder="Remarques pour cette fermeture..."
                            className="mt-1"
                        />
                    </div>

                    <Divider />
                    <p className="font-bold text-red-600 mb-3">Confirmations obligatoires :</p>

                    <div className="flex align-items-start gap-2 mb-3">
                        <Checkbox inputId="conf1" checked={confirmed1} onChange={e => setConfirmed1(e.checked || false)} className="mt-1 flex-shrink-0" />
                        <label htmlFor="conf1" className="text-sm cursor-pointer">
                            Je confirme que les transactions importantes ont été traitées et que les caissiers ont équilibré leurs caisses
                        </label>
                    </div>

                    <div className="flex align-items-start gap-2 mb-3">
                        <Checkbox inputId="conf2" checked={confirmed2} onChange={e => setConfirmed2(e.checked || false)} className="mt-1 flex-shrink-0" />
                        <label htmlFor="conf2" className="text-sm cursor-pointer">
                            Je confirme avoir l'autorisation de fermer le système pour cette journée
                        </label>
                    </div>

                    <div className={`flex align-items-start gap-2 p-2 border-round ${hasPendingTransactions ? 'border-1 border-red-400 bg-red-50' : ''}`}>
                        <Checkbox inputId="conf3" checked={confirmed3} onChange={e => setConfirmed3(e.checked || false)} className="mt-1 flex-shrink-0" />
                        <label htmlFor="conf3" className={`text-sm cursor-pointer ${hasPendingTransactions ? 'text-red-700 font-bold' : ''}`}>
                            Je confirme que les transactions en cours ont été complétées ou annulées et que le système est prêt pour le traitement EOD
                            {hasPendingTransactions && ` — ${statutJour?.transactionsEnAttente} transaction(s) en attente détectée(s)`}
                        </label>
                    </div>
                </div>
            </Dialog>
        </ProtectedPage>
    );
};

export default FermeturePage;
