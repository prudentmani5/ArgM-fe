'use client';

import { useEffect, useRef, useState } from 'react';
import { TabPanel, TabView } from 'primereact/tabview';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { InputNumber } from 'primereact/inputnumber';
import { Dropdown } from 'primereact/dropdown';
import { Toast } from 'primereact/toast';
import { ProgressSpinner } from 'primereact/progressspinner';
import { useReactToPrint } from 'react-to-print';
import useConsumApi from '../../../../../../hooks/fetchData/useConsumApi';
import { SaisiePaie } from '../SaisiePaie';
import PrintableBulletinPaie from './PrintableBulletinPaie';
import { API_BASE_URL } from '@/utils/apiConfig';
import { PeriodePaie } from '../../periodePaie/PeriodePaie';
import { SaisieRetenue } from '../../saisie/retenue/SaisieRetenue';
import { RetenueParametre } from '../../retenueParametre/RetenueParametre';

const BulletinPaieComponent = () => {
    const baseUrl = `${API_BASE_URL}`;
    const toast = useRef<Toast>(null);
    const printRef = useRef<HTMLDivElement>(null);

    // Form state
    const [matriculeId, setMatriculeId] = useState<string>('');
    const [employeeName, setEmployeeName] = useState<string>('');
    const [employeePrenom, setEmployeePrenom] = useState<string>('');
    const [fonctionLibelle, setFonctionLibelle] = useState<string>('');
    const [selectedPeriodeId, setSelectedPeriodeId] = useState<string>('');
    const [filterYear, setFilterYear] = useState<number>(new Date().getFullYear());

    // Payroll data
    const [saisiePaie, setSaisiePaie] = useState<SaisiePaie | null>(null);
    const [showBulletin, setShowBulletin] = useState<boolean>(false);
    const [searchLoading, setSearchLoading] = useState<boolean>(false);
    const [loadingBulletin, setLoadingBulletin] = useState<boolean>(false);

    // SaisieRetenue data for bulletin
    const [saisieRetenues, setSaisieRetenues] = useState<SaisieRetenue[]>([]);
    const [retenueParametres, setRetenueParametres] = useState<RetenueParametre[]>([]);

    // All employees tab state
    const [allFilterYear, setAllFilterYear] = useState<number>(new Date().getFullYear());
    const [allSelectedPeriodeId, setAllSelectedPeriodeId] = useState<string>('');
    const [allPeriodePaiesByYear, setAllPeriodePaiesByYear] = useState<PeriodePaie[]>([]);
    const [downloadingAll, setDownloadingAll] = useState<boolean>(false);

    // API hooks
    const { data: employeeData, error: employeeError, fetchData: fetchEmployeeData, callType: employeeCallType } = useConsumApi('');
    const { data: paieData, error: paieError, fetchData: fetchPaieData, callType: paieCallType } = useConsumApi('');
    const { data: careerData, error: careerError, fetchData: fetchCareerData, callType: careerCallType } = useConsumApi('');
    const { data: fonctionData, fetchData: fetchFonctions } = useConsumApi('');
    const { data: periodePaieByYearData, fetchData: fetchPeriodePaiesByYear, callType: periodePaieByYearCallType } = useConsumApi('');
    const { data: allPeriodePaieByYearData, fetchData: fetchAllPeriodePaiesByYear, callType: allPeriodePaieByYearCallType } = useConsumApi('');
    const { data: retenuesData, fetchData: fetchRetenues, callType: retenuesCallType } = useConsumApi('');
    const { data: retenueParametresData, fetchData: fetchRetenueParametres, callType: retenueParametresCallType } = useConsumApi('');

    // Fonctions dropdown data
    const [fonctions, setFonctions] = useState<any[]>([]);
    // PeriodePaie dropdown data
    const [periodePaiesByYear, setPeriodePaiesByYear] = useState<PeriodePaie[]>([]);

    // Load fonctions, periods, and retenue parameters on mount
    useEffect(() => {
        fetchFonctions(null, 'Get', `${baseUrl}/rhfonctions/findall`, 'loadFonctions');
        fetchRetenueParametres(null, 'Get', `${baseUrl}/api/grh/paie/retenues/findall`, 'loadRetenueParametres');
        loadPeriodePaiesByYear(filterYear);
        loadAllPeriodePaiesByYear(allFilterYear);
    }, []);

    // Handle fonctions data
    useEffect(() => {
        if (fonctionData) {
            setFonctions(Array.isArray(fonctionData) ? fonctionData : [fonctionData]);
        }
    }, [fonctionData]);

    // Handle retenue parameters data
    useEffect(() => {
        if (retenueParametresData && retenueParametresCallType === 'loadRetenueParametres') {
            setRetenueParametres(Array.isArray(retenueParametresData) ? retenueParametresData : [retenueParametresData]);
        }
    }, [retenueParametresData, retenueParametresCallType]);

    // Handle retenues data for bulletin
    useEffect(() => {
        if (retenuesData && retenuesCallType === 'loadBulletinRetenues') {
            const retenues = Array.isArray(retenuesData) ? retenuesData : [retenuesData];
            // Convert plain objects to SaisieRetenue instances
            const retenueInstances = retenues.map((r: any) => Object.assign(new SaisieRetenue(), r));
            setSaisieRetenues(retenueInstances);
        }
    }, [retenuesData, retenuesCallType]);

    // Handle periods by year data
    useEffect(() => {
        if (periodePaieByYearData && periodePaieByYearCallType === 'loadPeriodePaiesByYear') {
            const periods = Array.isArray(periodePaieByYearData) ? periodePaieByYearData : [periodePaieByYearData];
            setPeriodePaiesByYear(periods);
        }
    }, [periodePaieByYearData, periodePaieByYearCallType]);

    // Handle periods by year data for all employees tab
    useEffect(() => {
        if (allPeriodePaieByYearData && allPeriodePaieByYearCallType === 'loadAllPeriodePaiesByYear') {
            const periods = Array.isArray(allPeriodePaieByYearData) ? allPeriodePaieByYearData : [allPeriodePaieByYearData];
            setAllPeriodePaiesByYear(periods);
        }
    }, [allPeriodePaieByYearData, allPeriodePaieByYearCallType]);

    // Helper to get fonction label
    const getFonctionLabel = (fonctionId: string): string => {
        const fonction = fonctions.find(f => f.fonctionid === fonctionId);
        return fonction ? fonction.libelle : '';
    };

    // Load periods by year
    const loadPeriodePaiesByYear = (year: number) => {
        fetchPeriodePaiesByYear(null, 'Get', `${baseUrl}/api/grh/paie/periods/year/${year}`, 'loadPeriodePaiesByYear');
    };

    // Load periods by year for all employees tab
    const loadAllPeriodePaiesByYear = (year: number) => {
        fetchAllPeriodePaiesByYear(null, 'Get', `${baseUrl}/api/grh/paie/periods/year/${year}`, 'loadAllPeriodePaiesByYear');
    };

    // Handle year change
    const handleYearChange = (year: number | null) => {
        if (year && year >= 2000 && year <= 2100) {
            setFilterYear(year);
            setSelectedPeriodeId(''); // Clear selected period when year changes
            loadPeriodePaiesByYear(year);
        }
    };

    // Handle year change for all employees tab
    const handleAllYearChange = (year: number | null) => {
        if (year && year >= 2000 && year <= 2100) {
            setAllFilterYear(year);
            setAllSelectedPeriodeId(''); // Clear selected period when year changes
            loadAllPeriodePaiesByYear(year);
        }
    };

    // Download all bulletins as PDF
    const handleDownloadAllBulletins = async () => {
        if (!allSelectedPeriodeId) {
            accept('warn', 'Validation', 'Veuillez sélectionner une période.');
            return;
        }

        setDownloadingAll(true);
        try {
            const url = `${baseUrl}/api/grh/paie/saisie-paie/bulletin/pdf/all/${allSelectedPeriodeId}`;

            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${document.cookie.split('token=')[1]?.split(';')[0] || ''}`
                }
            });

            if (!response.ok) {
                if (response.status === 404) {
                    accept('warn', 'Aucune donnée', 'Aucun bulletin de paie trouvé pour cette période.');
                } else {
                    throw new Error('Failed to download');
                }
                return;
            }

            const blob = await response.blob();
            const downloadUrl = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = downloadUrl;
            link.download = `BulletinsPaie_${allSelectedPeriodeId}.pdf`;
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(downloadUrl);

            accept('success', 'Succès', 'Téléchargement terminé.');
        } catch (error) {
            accept('error', 'Erreur', 'Impossible de télécharger le fichier.');
        } finally {
            setDownloadingAll(false);
        }
    };

    // Format period label for dropdown (just month name since year is already known)
    const getPeriodeLabelForYear = (periode: PeriodePaie) => {
        const monthNames = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
                           'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
        return monthNames[periode.mois - 1];
    };

    // Get selected period object
    const getSelectedPeriode = (): PeriodePaie | null => {
        return periodePaiesByYear.find(p => p.periodeId === selectedPeriodeId) || null;
    };

    const accept = (severity: 'success' | 'info' | 'warn' | 'error', summary: string, detail: string) => {
        toast.current?.show({
            severity: severity,
            summary: summary,
            detail: detail,
            life: 3000
        });
    };

    // Handle employee lookup on matricule blur
    const handleMatriculeBlur = (matricule: string) => {
        if (matricule.trim() === '') return;

        setSearchLoading(true);
        fetchEmployeeData(
            null,
            'Get',
            `${baseUrl}/api/grh/employees/matricule/${matricule}`,
            'searchByMatricule'
        );
        // Also fetch career info for fonction (endpoint: /api/grh/carriere/{matriculeId})
        fetchCareerData(
            null,
            'Get',
            `${baseUrl}/api/grh/carriere/${matricule}`,
            'loadCareer'
        );
    };

    // Handle employee data response
    useEffect(() => {
        if (employeeData && employeeCallType === 'searchByMatricule') {
            const foundEmployee = employeeData as any;
            setEmployeeName(foundEmployee.nom || '');
            setEmployeePrenom(foundEmployee.prenom || '');
            accept('info', 'Employé trouvé', 'Les données de l\'employé ont été chargées.');
            setSearchLoading(false);
        }

        if (employeeError && employeeCallType === 'searchByMatricule') {
            accept('warn', 'Employé non trouvé', 'Aucun employé trouvé avec ce matricule.');
            setEmployeeName('');
            setEmployeePrenom('');
            setSearchLoading(false);
        }
    }, [employeeData, employeeError, employeeCallType]);

    // Handle career data response
    useEffect(() => {
        if (careerData && careerCallType === 'loadCareer') {
            const career = careerData as any;
            // Use fonctionId to get the label from fonctions list
            const label = getFonctionLabel(career.fonctionId || '');
            setFonctionLibelle(label);
        }

        if (careerError && careerCallType === 'loadCareer') {
            setFonctionLibelle('');
        }
    }, [careerData, careerError, careerCallType, fonctions]);

    // Handle payroll data response
    useEffect(() => {
        if (paieData && paieCallType === 'loadBulletin') {
            const paie = Object.assign(new SaisiePaie(), paieData);
            paie.nom = employeeName;
            paie.prenom = employeePrenom;
            paie.fonctionLibelle = fonctionLibelle;
            setSaisiePaie(paie);
            setShowBulletin(true);
            setLoadingBulletin(false);
            accept('success', 'Bulletin chargé', 'Le bulletin de paie a été chargé avec succès.');

            // Also fetch the employee's retenues for this period
            fetchRetenues(
                null,
                'Get',
                `${baseUrl}/api/grh/paie/saisie-retenues/employee/${matriculeId}/period/${selectedPeriodeId}`,
                'loadBulletinRetenues'
            );
        }

        if (paieError && paieCallType === 'loadBulletin') {
            accept('warn', 'Bulletin non trouvé', 'Aucun bulletin de paie trouvé pour cette période.');
            setSaisiePaie(null);
            setSaisieRetenues([]);
            setShowBulletin(false);
            setLoadingBulletin(false);
        }
    }, [paieData, paieError, paieCallType]);

    // Load bulletin
    const handleLoadBulletin = () => {
        if (!matriculeId.trim()) {
            accept('warn', 'Validation', 'Veuillez saisir un matricule.');
            return;
        }

        if (!selectedPeriodeId) {
            accept('warn', 'Validation', 'Veuillez sélectionner une période.');
            return;
        }

        setLoadingBulletin(true);
        fetchPaieData(
            null,
            'Get',
            `${baseUrl}/api/grh/paie/saisie-paie/bulletin/${matriculeId}/${selectedPeriodeId}`,
            'loadBulletin'
        );
    };

    // Print handler
    const selectedPeriode = getSelectedPeriode();
    const handlePrint = useReactToPrint({
        contentRef: printRef,
        documentTitle: `Bulletin_Paie_${matriculeId}_${selectedPeriode ? `${selectedPeriode.mois}_${selectedPeriode.annee}` : ''}`,
    });

    // Reset form
    const handleReset = () => {
        setMatriculeId('');
        setEmployeeName('');
        setEmployeePrenom('');
        setFonctionLibelle('');
        setSaisiePaie(null);
        setSaisieRetenues([]);
        setShowBulletin(false);
        setSelectedPeriodeId('');
        setFilterYear(new Date().getFullYear());
        loadPeriodePaiesByYear(new Date().getFullYear());
    };

    // Get retenue label from code
    const getRetenueLabel = (codeRet: string): string => {
        const retenueParam = retenueParametres.find(rp => rp.codeRet === codeRet);
        return retenueParam ? retenueParam.libelleRet : codeRet;
    };

    const formatAmount = (amount: number): string => {
        return SaisiePaie.formatCurrency(amount);
    };

    return (
        <>
            <Toast ref={toast} />

            <TabView>
                <TabPanel header="Pour un employé">
                    <div className="card p-fluid">
                        {/* Search Form */}
                        <div className="formgrid grid">
                            <div className="field col-12 md:col-3">
                                <label htmlFor="matriculeId">Matricule</label>
                                <InputText
                                    id="matriculeId"
                                    value={matriculeId}
                                    onChange={(e) => setMatriculeId(e.target.value)}
                                    onBlur={(e) => handleMatriculeBlur(e.target.value)}
                                    placeholder="Entrer le matricule"
                                />
                            </div>
                            <div className="field col-12 md:col-3">
                                <label>Nom</label>
                                <InputText
                                    value={employeeName}
                                    disabled
                                    placeholder="Auto-rempli"
                                />
                            </div>
                            <div className="field col-12 md:col-3">
                                <label>Prénom</label>
                                <InputText
                                    value={employeePrenom}
                                    disabled
                                    placeholder="Auto-rempli"
                                />
                            </div>
                            <div className="field col-12 md:col-3">
                                <label>Fonction</label>
                                <InputText
                                    value={fonctionLibelle}
                                    disabled
                                    placeholder="Auto-rempli"
                                />
                            </div>
                        </div>

                        <div className="formgrid grid">
                            <div className="field col-12 md:col-2">
                                <label htmlFor="year">Année</label>
                                <InputNumber
                                    id="year"
                                    value={filterYear}
                                    onValueChange={(e) => handleYearChange(e.value ?? null)}
                                    useGrouping={false}
                                    min={2000}
                                    max={2100}
                                />
                            </div>
                            <div className="field col-12 md:col-4">
                                <label htmlFor="periode">Période *</label>
                                <Dropdown
                                    id="periode"
                                    value={selectedPeriodeId}
                                    options={periodePaiesByYear.map(p => ({
                                        label: getPeriodeLabelForYear(p),
                                        value: p.periodeId
                                    }))}
                                    onChange={(e) => setSelectedPeriodeId(e.value || '')}
                                    placeholder={periodePaiesByYear.length === 0 ? "Aucune période" : "Sélectionner la période"}
                                    showClear
                                    filter
                                    emptyMessage="Aucune période pour cette année"
                                />
                            </div>
                            <div className="field col-12 md:col-3 flex align-items-end">
                                <Button
                                    icon="pi pi-search"
                                    label="Charger Bulletin"
                                    onClick={handleLoadBulletin}
                                    loading={loadingBulletin || searchLoading}
                                    className="w-full"
                                />
                            </div>
                            <div className="field col-12 md:col-3 flex align-items-end">
                                <Button
                                    icon="pi pi-refresh"
                                    label="Réinitialiser"
                                    onClick={handleReset}
                                    outlined
                                    className="w-full"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Bulletin Display */}
                    {showBulletin && saisiePaie && (
                        <div className="card mt-4">
                            {/* Header */}
                            <div className="text-center mb-4">
                                <h2 className="text-primary m-0">
                                    Bulletin de paie --- Période {selectedPeriode ? getPeriodeLabelForYear(selectedPeriode) : ''} / {selectedPeriode?.annee || ''}
                                </h2>
                            </div>

                            {/* Employee Info */}
                            <div className="grid border-1 border-300 p-3 mb-3">
                                <div className="col-6">
                                    <div className="mb-2">
                                        <strong>Matricule :</strong> {saisiePaie.matriculeId}
                                    </div>
                                    <div>
                                        <strong>Fonction :</strong> {saisiePaie.fonctionLibelle || 'N/A'}
                                    </div>
                                </div>
                                <div className="col-6 text-right">
                                    <div>
                                        <strong>Nom et prénom:</strong> {saisiePaie.getFullName()}
                                    </div>
                                </div>
                            </div>

                            {/* Main Content - Two Columns */}
                            <div className="grid">
                                {/* Left Column - Credits */}
                                <div className="col-12 md:col-6">
                                    <div className="border-1 border-300 p-3 h-full">
                                        <table className="w-full">
                                            <tbody>
                                                <tr>
                                                    <td className="py-1 text-left">Base:</td>
                                                    <td className="py-1 text-right">{formatAmount(saisiePaie.base)}</td>
                                                </tr>
                                                <tr>
                                                    <td className="py-1 text-left">Jours Prestés:</td>
                                                    <td className="py-1 text-right">{formatAmount(saisiePaie.preste)}</td>
                                                </tr>
                                                <tr>
                                                    <td className="py-1 text-left">Allocation familiale:</td>
                                                    <td className="py-1 text-right">{formatAmount(saisiePaie.allocFam)}</td>
                                                </tr>
                                                <tr>
                                                    <td className="py-1 text-left">Logement:</td>
                                                    <td className="py-1 text-right">{formatAmount(saisiePaie.logement)}</td>
                                                </tr>
                                                <tr>
                                                    <td className="py-1 text-left">Déplacement:</td>
                                                    <td className="py-1 text-right">{formatAmount(saisiePaie.deplacement)}</td>
                                                </tr>
                                                <tr>
                                                    <td className="py-1 text-left">HS:</td>
                                                    <td className="py-1 text-right">{formatAmount(saisiePaie.getTotalHS())}</td>
                                                </tr>
                                                <tr>
                                                    <td className="py-1 text-left">INDEMNITES DE CHARGE</td>
                                                    <td className="py-1 text-right">{formatAmount(saisiePaie.getTotalIndemnites())}</td>
                                                </tr>
                                                <tr className="border-top-1 border-300 font-bold">
                                                    <td className="py-2 text-left">Brut:</td>
                                                    <td className="py-2 text-right">{formatAmount(saisiePaie.brut)}</td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                </div>

                                {/* Right Column - Deductions */}
                                <div className="col-12 md:col-6">
                                    <div className="border-1 border-300 p-3 h-full">
                                        <table className="w-full">
                                            <tbody>
                                                <tr>
                                                    <td className="py-1 text-left">Rappel positif:</td>
                                                    <td className="py-1 text-right">{formatAmount(saisiePaie.getTotalRappelPositif())}</td>
                                                </tr>
                                                <tr>
                                                    <td className="py-1 text-left">Rappel négatif:</td>
                                                    <td className="py-1 text-right">{formatAmount(saisiePaie.getTotalRappelNegatif())}</td>
                                                </tr>
                                                <tr>
                                                    <td className="py-1 text-left">Inss Pers:</td>
                                                    <td className="py-1 text-right">{formatAmount(saisiePaie.getTotalInssPers())}</td>
                                                </tr>
                                                <tr>
                                                    <td className="py-1 text-left">IRE:</td>
                                                    <td className="py-1 text-right">{formatAmount(saisiePaie.ipr)}</td>
                                                </tr>
                                                <tr>
                                                    <td className="py-1 text-left">Jubilee:</td>
                                                    <td className="py-1 text-right">{formatAmount(saisiePaie.jubile)}</td>
                                                </tr>
                                                <tr>
                                                    <td className="py-1 text-left">Pension Compl:</td>
                                                    <td className="py-1 text-right">{formatAmount(saisiePaie.pensionComplPers)}</td>
                                                </tr>
                                                {/* Display all SaisieRetenue items for this employee */}
                                                {saisieRetenues.map((retenue, index) => (
                                                    <tr key={retenue.id || index}>
                                                        <td className="py-1 text-left">{getRetenueLabel(retenue.codeRet)}:</td>
                                                        <td className="py-1 text-right">{formatAmount(retenue.montant)}</td>
                                                    </tr>
                                                ))}
                                                <tr className="border-top-1 border-300">
                                                    <td className="py-2 text-left">Tot retenues:</td>
                                                    <td className="py-2 text-right">{formatAmount(saisiePaie.totalRetenue)}</td>
                                                </tr>
                                                <tr className="font-bold text-lg">
                                                    <td className="py-2 text-left text-primary">Net</td>
                                                    <td className="py-2 text-right border-2 border-primary font-bold">
                                                        {formatAmount(saisiePaie.net)}
                                                    </td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>

                            {/* Print Button */}
                            <div className="flex justify-content-end mt-4">
                                <Button
                                    icon="pi pi-print"
                                    label="Imprimer"
                                    onClick={() => handlePrint()}
                                    severity="success"
                                />
                            </div>
                        </div>
                    )}

                    {/* Hidden Printable Component */}
                    {saisiePaie && (
                        <div style={{ display: 'none' }}>
                            <PrintableBulletinPaie
                                ref={printRef}
                                saisiePaie={saisiePaie}
                                saisieRetenues={saisieRetenues}
                                retenueParametres={retenueParametres}
                                selectedPeriode={selectedPeriode}
                            />
                        </div>
                    )}
                </TabPanel>

                <TabPanel header="Pour tous les employés">
                    <div className="card p-fluid">
                        <h5>Générer les bulletins de paie pour tous les employés</h5>
                        <p className="text-500 mb-4">
                            Sélectionnez une période pour générer un document PDF contenant les bulletins de paie
                            de tous les employés actifs. Chaque employé sera sur une page séparée.
                        </p>

                        <div className="formgrid grid">
                            <div className="field col-12 md:col-3">
                                <label htmlFor="allYear">Année</label>
                                <InputNumber
                                    id="allYear"
                                    value={allFilterYear}
                                    onValueChange={(e) => handleAllYearChange(e.value ?? null)}
                                    useGrouping={false}
                                    min={2000}
                                    max={2100}
                                />
                            </div>
                            <div className="field col-12 md:col-4">
                                <label htmlFor="allPeriode">Période *</label>
                                <Dropdown
                                    id="allPeriode"
                                    value={allSelectedPeriodeId}
                                    options={allPeriodePaiesByYear.map(p => ({
                                        label: getPeriodeLabelForYear(p),
                                        value: p.periodeId
                                    }))}
                                    onChange={(e) => setAllSelectedPeriodeId(e.value || '')}
                                    placeholder={allPeriodePaiesByYear.length === 0 ? "Aucune période" : "Sélectionner la période"}
                                    showClear
                                    filter
                                    emptyMessage="Aucune période pour cette année"
                                />
                            </div>
                            <div className="field col-12 md:col-5 flex align-items-end">
                                <Button
                                    icon="pi pi-download"
                                    label="Générer pour tous les employés"
                                    onClick={handleDownloadAllBulletins}
                                    loading={downloadingAll}
                                    severity="success"
                                    className="w-full"
                                    disabled={!allSelectedPeriodeId}
                                />
                            </div>
                        </div>

                        {/* Loading Spinner */}
                        {downloadingAll && (
                            <div className="flex justify-content-center align-items-center p-5">
                                <ProgressSpinner />
                                <span className="ml-3">Génération du PDF en cours...</span>
                            </div>
                        )}
                    </div>
                </TabPanel>
            </TabView>
        </>
    );
};

export default BulletinPaieComponent;
