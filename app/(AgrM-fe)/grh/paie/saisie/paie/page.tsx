'use client';

import { useEffect, useRef, useState } from "react";
import { SaisiePaie } from "./SaisiePaie";
import { PeriodePaie } from "../../periodePaie/PeriodePaie";
import useConsumApi from "../../../../../../hooks/fetchData/useConsumApi";
import { TabPanel, TabView, TabViewTabChangeEvent } from "primereact/tabview";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { InputNumber } from "primereact/inputnumber";
import { Column } from "primereact/column";
import { DataTable } from "primereact/datatable";
import SaisiePaieForm from "./SaisiePaieForm";
import { Toast } from 'primereact/toast';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import { SaisieRetenue } from "../retenue/SaisieRetenue";
import { SaisieIndemnite } from "../indemnite/SaisieIndemnite";
import { SaisiePrime } from "../prime/SaisiePrime";
import { RetenueParametre } from "../../retenueParametre/RetenueParametre";
import { IndemniteParametre } from "../../indemniteParametre/IndemniteParametre";
import { PrimeParametre } from "../../primeParametre/PrimeParametre";
import { API_BASE_URL } from '@/utils/apiConfig';

const SaisiePaieComponent = () => {
    const baseUrl = `${API_BASE_URL}`;

    const [saisiePaie, setSaisiePaie] = useState<SaisiePaie>(new SaisiePaie());
    const [periodePaies, setPeriodePaies] = useState<PeriodePaie[]>([]);
    const [activeIndex, setActiveIndex] = useState(0);
    const [btnLoading, setBtnLoading] = useState<boolean>(false);
    const [searchLoading, setSearchLoading] = useState<boolean>(false);
    const [periodCloture, setPeriodCloture] = useState<boolean>(false);
    const [calculateLoading, setCalculateLoading] = useState<boolean>(false);
    const [calculateAllLoading, setCalculateAllLoading] = useState<boolean>(false);
    const [selectedYear, setSelectedYear] = useState<number>(2025);

    // Employee-related data for second tab
    const [employeeRetenues, setEmployeeRetenues] = useState<SaisieRetenue[]>([]);
    const [employeeIndemnites, setEmployeeIndemnites] = useState<SaisieIndemnite[]>([]);
    const [employeePrimes, setEmployeePrimes] = useState<SaisiePrime[]>([]);

    // Parameter lists for labels
    const [retenueParametres, setRetenueParametres] = useState<RetenueParametre[]>([]);
    const [indemniteParametres, setIndemniteParametres] = useState<IndemniteParametre[]>([]);
    const [primeParametres, setPrimeParametres] = useState<PrimeParametre[]>([]);

    // API hooks
    const { data, loading, error, fetchData, callType } = useConsumApi('');
    const { data: employeeData, loading: employeeLoading, error: employeeError, fetchData: fetchEmployeeData, callType: employeeCallType } = useConsumApi('');
    const { data: retenueData, loading: retenueLoading, error: retenueError, fetchData: fetchRetenues, callType: retenueCallType } = useConsumApi('');
    const { data: indemniteData, loading: indemniteLoading, error: indemniteError, fetchData: fetchIndemnites, callType: indemniteCallType } = useConsumApi('');
    const { data: primeData, loading: primeLoading, error: primeError, fetchData: fetchPrimes, callType: primeCallType } = useConsumApi('');
    const { data: payrollCheckData, fetchData: fetchPayrollCheck, callType: payrollCheckCallType } = useConsumApi('');
    const { data: calculateData, error: calculateError, fetchData: fetchCalculate, callType: calculateCallType } = useConsumApi('');
    const { data: calculateAllData, error: calculateAllError, fetchData: fetchCalculateAll, callType: calculateAllCallType } = useConsumApi('');
    const { data: periodeData, fetchData: fetchPeriodes, callType: periodeCallType } = useConsumApi('');
    const { data: retenueParamData, fetchData: fetchRetenueParams, callType: retenueParamCallType } = useConsumApi('');
    const { data: indemniteParamData, fetchData: fetchIndemniteParams, callType: indemniteParamCallType } = useConsumApi('');
    const { data: primeParamData, fetchData: fetchPrimeParams, callType: primeParamCallType } = useConsumApi('');

    const toast = useRef<Toast>(null);

    const accept = (severity: 'success' | 'info' | 'warn' | 'error', summary: string, detail: string) => {
        toast.current?.show({
            severity: severity,
            summary: summary,
            detail: detail,
            life: 3000
        });
    };

    // Load PeriodePaies by year
    useEffect(() => {
        fetchPeriodes(null, 'Get', `${baseUrl}/api/grh/paie/periods/year/${selectedYear}`, 'loadPeriodes');
    }, [selectedYear]);

    // Load parameter lists for labels
    useEffect(() => {
        fetchRetenueParams(null, 'Get', `${baseUrl}/api/grh/paie/retenues/findall`, 'loadRetenueParams');
        fetchIndemniteParams(null, 'Get', `${baseUrl}/api/grh/paie/indemnites/findall`, 'loadIndemniteParams');
        fetchPrimeParams(null, 'Get', `${baseUrl}/api/grh/paie/primes/findall`, 'loadPrimeParams');
    }, []);

    // Handle parameter data responses
    useEffect(() => {
        if (retenueParamData && retenueParamCallType === 'loadRetenueParams') {
            setRetenueParametres(Array.isArray(retenueParamData) ? retenueParamData : [retenueParamData]);
        }
    }, [retenueParamData, retenueParamCallType]);

    useEffect(() => {
        if (indemniteParamData && indemniteParamCallType === 'loadIndemniteParams') {
            setIndemniteParametres(Array.isArray(indemniteParamData) ? indemniteParamData : [indemniteParamData]);
        }
    }, [indemniteParamData, indemniteParamCallType]);

    useEffect(() => {
        if (primeParamData && primeParamCallType === 'loadPrimeParams') {
            setPrimeParametres(Array.isArray(primeParamData) ? primeParamData : [primeParamData]);
        }
    }, [primeParamData, primeParamCallType]);

    // Handle periodeData response
    useEffect(() => {
        if (periodeData && periodeCallType === 'loadPeriodes') {
            const periodes = Array.isArray(periodeData) ? periodeData : [periodeData];
            setPeriodePaies(periodes);
        }
    }, [periodeData, periodeCallType]);

    useEffect(() => {
        if (employeeData && employeeCallType === 'searchByMatricule') {
            if (employeeData) {
                const foundEmployee = employeeData as any;
                setSaisiePaie((prev) => Object.assign(new SaisiePaie(), prev, {
                    employeeFirstName: foundEmployee.prenom,
                    employeeLastName: foundEmployee.nom
                }));

                accept('info', 'Employé trouvé', 'Les données de l\'employé ont été chargées.');

                // After loading employee, check if payroll exists for current period
                if (saisiePaie.periodeId) {
                    checkPayrollExists(saisiePaie.matriculeId, saisiePaie.periodeId);
                }
            }
            setSearchLoading(false);
        }

        if (employeeError && employeeCallType === 'searchByMatricule') {
            accept('warn', 'Employé non trouvé', 'Aucun employé trouvé avec ce matricule.');
            setSearchLoading(false);
        }

        if (retenueData && retenueCallType === 'loadEmployeeRetenues') {
            setEmployeeRetenues(Array.isArray(retenueData) ? retenueData : [retenueData]);
        }

        if (indemniteData && indemniteCallType === 'loadEmployeeIndemnites') {
            setEmployeeIndemnites(Array.isArray(indemniteData) ? indemniteData : [indemniteData]);
        }

        if (primeData && primeCallType === 'loadEmployeePrimes') {
            setEmployeePrimes(Array.isArray(primeData) ? primeData : [primeData]);
        }
    }, [employeeData, employeeError, retenueData, indemniteData, primeData, employeeCallType, retenueCallType, indemniteCallType, primeCallType]);

    // Handle save/update API responses separately
    useEffect(() => {
        if (data !== null && (callType === 'createSaisiePaie' || callType === 'updateSaisiePaie')) {
            if (error !== null) {
                if (callType === 'createSaisiePaie')
                    accept('warn', 'A votre attention', 'L\'enregistrement n\'a pas été effectué.');
                else if (callType === 'updateSaisiePaie')
                    accept('warn', 'A votre attention', 'La mise à jour n\'a pas été effectuée.');
            } else {
                if (callType === 'createSaisiePaie') {
                    // Reset form and clear employee data tables
                    setSaisiePaie(new SaisiePaie());
                    setEmployeeRetenues([]);
                    setEmployeeIndemnites([]);
                    setEmployeePrimes([]);
                    setPeriodCloture(false);
                    accept('info', 'OK', 'L\'enregistrement a été effectué avec succès.');
                } else if (callType === 'updateSaisiePaie') {
                    accept('info', 'OK', 'La modification a été effectuée avec succès.');
                }
            }
            setBtnLoading(false);
        }
    }, [data, error, callType]);

    // Handle payroll check response
    useEffect(() => {
        if (payrollCheckData && payrollCheckCallType === 'checkPayrollExists') {
            const response = payrollCheckData as any;
            // Set periodCloture from response - if true, calculation is blocked
            setPeriodCloture(response.periodCloture || false);
            if (response.exists) {
                // Payroll exists - load existing data
                const existingData = response.data;
                setSaisiePaie((prev) => Object.assign(new SaisiePaie(), prev, existingData, {
                    employeeFirstName: prev.employeeFirstName,
                    employeeLastName: prev.employeeLastName
                }));
                accept('info', 'Paie existante', 'Les données de paie pour ce mois existent déjà.');
            }
            setSearchLoading(false);
        }
    }, [payrollCheckData, payrollCheckCallType]);

    // Handle calculate response
    useEffect(() => {
        if (calculateData && calculateCallType === 'calculatePayroll') {
            const calculatedPayroll = calculateData as any;
            setSaisiePaie((prev) => Object.assign(new SaisiePaie(), prev, calculatedPayroll, {
                employeeFirstName: prev.employeeFirstName,
                employeeLastName: prev.employeeLastName
            }));
            accept('success', 'Calcul effectué', 'La paie a été calculée avec succès.');
            setCalculateLoading(false);
        }
        if (calculateError && calculateCallType === 'calculatePayroll') {
            accept('error', 'Erreur', 'Erreur lors du calcul de la paie.');
            setCalculateLoading(false);
        }
    }, [calculateData, calculateError, calculateCallType]);

    // Handle calculate all response
    useEffect(() => {
        if (calculateAllData && calculateAllCallType === 'calculateAllPayroll') {
            const result = calculateAllData as any;
            setCalculateAllLoading(false);

            const deletedMsg = result.deletedCount > 0 ? `, ${result.deletedCount} supprimée(s)` : '';

            if (result.errorCount === 0 && result.successCount > 0) {
                accept('success', 'Calcul terminé', `${result.successCount} paie(s) calculée(s) avec succès${deletedMsg}.`);
            } else if (result.errorCount > 0) {
                accept('warn', 'Calcul terminé avec erreurs', `${result.successCount} réussie(s), ${result.errorCount} erreur(s), ${result.skippedCount} ignorée(s)${deletedMsg}.`);
            } else if (result.skippedCount > 0 && result.successCount === 0) {
                accept('info', 'Aucun calcul effectué', `Toutes les paies existantes ont été ignorées (${result.skippedCount})${deletedMsg}.`);
            } else if (result.deletedCount > 0 && result.successCount === 0) {
                accept('info', 'Nettoyage effectué', `${result.deletedCount} paie(s) d'employés inactifs supprimée(s).`);
            }
        }
        if (calculateAllError && calculateAllCallType === 'calculateAllPayroll') {
            accept('error', 'Erreur', 'Erreur lors du calcul des paies.');
            setCalculateAllLoading(false);
        }
    }, [calculateAllData, calculateAllError, calculateAllCallType]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSaisiePaie((prev) => Object.assign(new SaisiePaie(), prev, { [e.target.name]: e.target.value }));
    };

    // Helper function to calculate IPR based on progressive tax brackets
    const calculateIpr = (baseIpr: number): number => {
        if (baseIpr <= 0) return 0;

        let ipr = 0;
        const bracket1Limit = 150000;
        const bracket2Limit = 300000;

        // First bracket: 0 - 150,000 BIF at 0%
        // No tax for this bracket

        // Second bracket: 150,001 - 300,000 BIF at 20%
        if (baseIpr > bracket1Limit) {
            const taxableInBracket2 = baseIpr > bracket2Limit
                ? bracket2Limit - bracket1Limit  // Full second bracket
                : baseIpr - bracket1Limit;        // Partial second bracket
            ipr += taxableInBracket2 * 0.20;
        }

        // Third bracket: Above 300,000 BIF at 30%
        if (baseIpr > bracket2Limit) {
            const taxableInBracket3 = baseIpr - bracket2Limit;
            ipr += taxableInBracket3 * 0.30;
        }

        return Math.round(ipr);
    };

    // Helper function to recalculate overtime amounts and derived fields
    const recalculateOvertimeAndTotals = (paie: SaisiePaie): SaisiePaie => {
        // h100 = base / 240 (hourly base: 8 hours/day × 30 days/month)
        const hourlyBase = paie.base / 240;

        // Calculate overtime amounts
        paie.montant135 = Math.round(paie.hs135 * hourlyBase * 1.35);
        paie.montant160 = Math.round(paie.hs160 * hourlyBase * 1.60);
        paie.montant200 = Math.round(paie.hs200 * hourlyBase * 2.00);

        // Recalculate brut
        // rappPositifNonImp is added to brut (positive adjustment not subject to tax)
        paie.brut = paie.montantPreste + paie.logement + paie.allocFam + paie.indImp + paie.indNonImp
            + paie.primeImp + paie.primeNonImp + paie.deplacement
            + paie.montant135 + paie.montant160 + paie.montant200
            + (paie.rappPositifNonImp || 0);

        // Recalculate baseIpr (subtract inssPensionScPers and pensionComplPers as they are not taxable)
        // rappPositifImp is added to baseIpr (positive adjustment subject to tax)
        // rappNegatifImp is subtracted from baseIpr (negative adjustment subject to tax)
        paie.baseIpr = paie.montantPreste + paie.allocFam + paie.primeImp + paie.indImp
            + paie.montant135 + paie.montant160 + paie.montant200
            - paie.inssPensionScPers - paie.pensionComplPers
            + (paie.rappPositifImp || 0) - (paie.rappNegatifImp || 0);

        // Recalculate IPR
        paie.ipr = calculateIpr(paie.baseIpr);

        // Recalculate totalRetenue: retImp + retNonImp + inssPensionScPers + ipr + pensionComplPers
        // rappNegatifNonImp is added to retNonImp (negative adjustment not subject to tax, impacts net negatively)
        paie.totalRetenue = paie.retImp + paie.retNonImp + paie.inssPensionScPers + paie.ipr + paie.pensionComplPers
            + (paie.rappNegatifNonImp || 0);

        // Recalculate net: brut - totalRetenue
        paie.net = paie.brut - paie.totalRetenue;

        return paie;
    };

    const handleNumberChange = (field: string, value: number | null) => {
        setSaisiePaie((prev) => {
            const updated = Object.assign(new SaisiePaie(), prev, { [field]: value || 0 });

            // If hs135, hs160, hs200, or rappel fields changed, recalculate totals
            if (field === 'hs135' || field === 'hs160' || field === 'hs200' ||
                field === 'rappPositifNonImp' || field === 'rappPositifImp' ||
                field === 'rappNegatifNonImp' || field === 'rappNegatifImp') {
                return recalculateOvertimeAndTotals(updated);
            }

            return updated;
        });
    };

    const handlePeriodeChange = (periodeId: string) => {
        setSaisiePaie((prev) => Object.assign(new SaisiePaie(), prev, { periodeId }));

        // If matriculeId is set, check for existing payroll for this period
        if (saisiePaie.matriculeId && periodeId) {
            setTimeout(() => checkPayrollExists(saisiePaie.matriculeId, periodeId), 100);
        }
    };

    const handleCheckboxChange = (field: string, checked: boolean) => {
        setSaisiePaie((prev) => Object.assign(new SaisiePaie(), prev, { [field]: checked }));
    };

    const handleMatriculeBlur = (matriculeId: string) => {
        if (matriculeId.trim() === '') return;

        setSearchLoading(true);
        console.log('Searching for employee with matricule:', matriculeId);
        fetchEmployeeData(null, 'Get', baseUrl + '/api/grh/employees/matricule/' + matriculeId, 'searchByMatricule');
    };

    const checkPayrollExists = (matriculeId: string, periodeId: string) => {
        if (!matriculeId || !periodeId) return;

        console.log('Checking if payroll exists for:', matriculeId, periodeId);
        fetchPayrollCheck(null, 'Get', `${baseUrl}/api/grh/paie/saisie-paie/exists/${matriculeId}/${periodeId}`, 'checkPayrollExists');
    };

    const handleSubmit = () => {
        if (!saisiePaie.isValid()) {
            accept('warn', 'Validation', 'Veuillez remplir le matricule.');
            return;
        }

        setBtnLoading(true);
        console.log('Data sent to the backend:', saisiePaie);
        fetchData(saisiePaie, 'Post', `${baseUrl}/api/grh/paie/saisie-paie/new`, 'createSaisiePaie');
    };

    const loadEmployeePayrollData = (matriculeId: string, periodeId: string) => {
        if (matriculeId.trim() === '' || periodeId.trim() === '') return;

        // Load retenues, indemnites, and primes for the employee and period
        fetchRetenues(null, 'Get', `${baseUrl}/api/grh/paie/saisie-retenues/employee/${matriculeId}/period/${periodeId}`, 'loadEmployeeRetenues');
        fetchIndemnites(null, 'Get', `${baseUrl}/api/grh/ficheEmploye/saisie-indemnites/employee/${matriculeId}/period/${periodeId}`, 'loadEmployeeIndemnites');
        fetchPrimes(null, 'Get', `${baseUrl}/api/grh/paie/saisie-primes/employee/${matriculeId}/period/${periodeId}`, 'loadEmployeePrimes');
    };

    const tableChangeHandle = (e: TabViewTabChangeEvent) => {
        if (e.index === 1 && saisiePaie.matriculeId && saisiePaie.periodeId) {
            loadEmployeePayrollData(saisiePaie.matriculeId, saisiePaie.periodeId);
        }
        // Don't reset data when switching back to Fiche Paie tab
        setActiveIndex(e.index);
    };

    // Payroll calculation functions
    const handleCalculer = () => {
        if (!saisiePaie.matriculeId) {
            accept('warn', 'Attention', 'Veuillez d\'abord saisir un matricule.');
            return;
        }
        if (!saisiePaie.periodeId) {
            accept('warn', 'Attention', 'Veuillez d\'abord sélectionner une période de paie.');
            return;
        }
        if (periodCloture) {
            accept('warn', 'Attention', 'La période est clôturée. Vous ne pouvez pas recalculer.');
            return;
        }

        setCalculateLoading(true);
        console.log('Calculating payroll for:', saisiePaie.matriculeId, saisiePaie.periodeId);
        // Send rappel values to backend for calculation
        const rappelData = {
            rappPositifNonImp: saisiePaie.rappPositifNonImp,
            rappPositifImp: saisiePaie.rappPositifImp,
            rappNegatifNonImp: saisiePaie.rappNegatifNonImp,
            rappNegatifImp: saisiePaie.rappNegatifImp
        };
        fetchCalculate(rappelData, 'Post', `${baseUrl}/api/grh/paie/saisie-paie/calculate/${saisiePaie.matriculeId}/${saisiePaie.periodeId}`, 'calculatePayroll');
    };

    const handleCalculerTout = () => {
        if (!saisiePaie.periodeId) {
            accept('warn', 'Attention', 'Veuillez d\'abord sélectionner une période de paie.');
            return;
        }
        if (periodCloture) {
            accept('warn', 'Attention', 'La période est clôturée.');
            return;
        }

        // Get the selected period for display
        const selectedPeriode = periodePaies.find(p => p.periodeId === saisiePaie.periodeId);
        const periodeDisplay = selectedPeriode ? `${selectedPeriode.mois}/${selectedPeriode.annee}` : saisiePaie.periodeId;

        // Show confirmation dialog
        confirmDialog({
            message: `Voulez-vous calculer et enregistrer la paie pour tous les employés actifs pour ${periodeDisplay} ?`,
            header: 'Confirmation',
            icon: 'pi pi-exclamation-triangle',
            acceptLabel: 'Oui, calculer',
            rejectLabel: 'Annuler',
            accept: () => {
                setCalculateAllLoading(true);
                console.log('Calculating payroll for all active employees:', saisiePaie.periodeId);
                fetchCalculateAll(null, 'Post', `${baseUrl}/api/grh/paie/saisie-paie/calculate-all/${saisiePaie.periodeId}`, 'calculateAllPayroll');
            }
        });
    };

    const handleRemplirAbsences = () => {
        // TODO: Implement fill absences
        accept('info', 'Information', 'Fonction Remplir Absences à implémenter.');
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('fr-FR', {
            style: 'currency',
            currency: 'BIF'
        }).format(amount);
    };

    // Helper functions to get labels from parameter lists
    const getRetenueLabel = (codeRet: string): string => {
        const param = retenueParametres.find(p => p.codeRet === codeRet);
        return param?.libelleRet || codeRet;
    };

    const getIndemniteLabel = (codeInd: string): string => {
        const param = indemniteParametres.find(p => p.codeInd === codeInd);
        return param?.libelleInd || codeInd;
    };

    const getPrimeLabel = (codePrime: string): string => {
        const param = primeParametres.find(p => p.codePrime === codePrime);
        return param?.libellePrime || codePrime;
    };

    // Check if selected period is closed
    const isSelectedPeriodClosed = (): boolean => {
        if (!saisiePaie.periodeId) return true; // No period selected = disabled
        const selectedPeriode = periodePaies.find(p => p.periodeId === saisiePaie.periodeId);
        if (!selectedPeriode) return true;
        return !!(selectedPeriode.dateCloture && selectedPeriode.userIdCloture);
    };

    const statusBodyTemplate = (rowData: any) => {
        let statusLabel = '';
        let badgeClass = '';
        
        if (rowData.cloture || rowData.dateFin) {
            statusLabel = 'Clôturé';
            badgeClass = 'p-badge-secondary';
        } else if (rowData.actif || !rowData.dateFin) {
            statusLabel = 'Actif';
            badgeClass = 'p-badge-success';
        } else {
            statusLabel = 'Inactif';
            badgeClass = 'p-badge-warning';
        }
        
        return (
            <span className={`p-badge ${badgeClass}`}>
                {statusLabel}
            </span>
        );
    };

    return (
        <>
            <Toast ref={toast} />
            <ConfirmDialog />

            <TabView onTabChange={tableChangeHandle} activeIndex={activeIndex}>
                <TabPanel header="Fiche Paie">
                    <div className="card p-fluid mb-3">
                        <div className="formgrid grid">
                            <div className="field col-12 md:col-2">
                                <label htmlFor="selectedYear">Année</label>
                                <InputNumber
                                    id="selectedYear"
                                    value={selectedYear}
                                    onValueChange={(e) => setSelectedYear(e.value || 2025)}
                                    useGrouping={false}
                                    min={2020}
                                    max={2100}
                                />
                            </div>
                        </div>
                    </div>
                    <SaisiePaieForm
                        saisiePaie={saisiePaie}
                        periodePaies={periodePaies}
                        handleChange={handleChange}
                        handleNumberChange={handleNumberChange}
                        handleCheckboxChange={handleCheckboxChange}
                        handlePeriodeChange={handlePeriodeChange}
                        handleMatriculeBlur={handleMatriculeBlur}
                        searchLoading={searchLoading}
                    />
                    <div className="card p-fluid">
                        <div className="formgrid grid">
                            <div className="md:col-offset-1 md:field md:col-2">
                                <Button
                                    icon="pi pi-refresh"
                                    outlined
                                    label="Réinitialiser"
                                    onClick={() => {
                                        setSaisiePaie(new SaisiePaie());
                                        setPeriodCloture(false);
                                    }}
                                />
                            </div>
                            <div className="md:field md:col-2">
                                <Button
                                    icon="pi pi-check"
                                    label="Enregistrer"
                                    loading={btnLoading || searchLoading}
                                    onClick={handleSubmit}
                                />
                            </div>
                            <div className="md:field md:col-2">
                                <Button
                                    icon="pi pi-calculator"
                                    label="Calculer"
                                    severity="info"
                                    onClick={handleCalculer}
                                    loading={calculateLoading}
                                    disabled={periodCloture || !saisiePaie.matriculeId}
                                />
                            </div>
                            <div className="md:field md:col-2">
                                <Button
                                    icon="pi pi-calculator"
                                    label="Calculer tout"
                                    severity="info"
                                    onClick={handleCalculerTout}
                                    loading={calculateAllLoading}
                                    disabled={isSelectedPeriodClosed()}
                                />
                            </div>
                            <div className="md:field md:col-2">
                                <Button
                                    icon="pi pi-calendar"
                                    label="Remplir absences"
                                    severity="warning"
                                    onClick={handleRemplirAbsences}
                                />
                            </div>
                        </div>
                    </div>
                </TabPanel>
                
                <TabPanel header="Affichage des autres données de la paie">
                    {saisiePaie.matriculeId && (saisiePaie.employeeFirstName || saisiePaie.employeeLastName) && (
                        <div className="mb-4">
                            <h3>Données pour: {saisiePaie.employeeFirstName} {saisiePaie.employeeLastName} ({saisiePaie.matriculeId})</h3>
                        </div>
                    )}
                    
                    {/* Retenues Section */}
                    <div className="grid">
                        <div className="col-12">
                            <div className="card">
                                <h4>Retenues</h4>
                                <DataTable
                                    value={employeeRetenues}
                                    emptyMessage="Aucune retenue trouvée pour cet employé"
                                    size="small"
                                >
                                    <Column
                                        header="Retenue"
                                        body={(rowData) => getRetenueLabel(rowData.codeRet)}
                                    />
                                    <Column
                                        field="montant"
                                        header="Montant"
                                        body={(rowData) => formatCurrency(rowData.montant)}
                                    />
                                    <Column
                                        header="Statut"
                                        body={statusBodyTemplate}
                                    />
                                </DataTable>
                            </div>
                        </div>
                    </div>

                    {/* Indemnites Section */}
                    <div className="grid mt-3">
                        <div className="col-12">
                            <div className="card">
                                <h4>Indemnités</h4>
                                <DataTable
                                    value={employeeIndemnites}
                                    emptyMessage="Aucune indemnité trouvée pour cet employé"
                                    size="small"
                                >
                                    <Column
                                        header="Indemnité"
                                        body={(rowData) => getIndemniteLabel(rowData.codeInd)}
                                    />
                                    <Column 
                                        field="taux" 
                                        header="Taux" 
                                        body={(rowData) => `${rowData.taux}%`}
                                    />
                                    <Column 
                                        field="montant" 
                                        header="Montant"
                                        body={(rowData) => formatCurrency(rowData.montant)}
                                    />
                                    <Column 
                                        header="Statut" 
                                        body={statusBodyTemplate}
                                    />
                                </DataTable>
                            </div>
                        </div>
                    </div>

                    {/* Primes Section */}
                    <div className="grid mt-3">
                        <div className="col-12">
                            <div className="card">
                                <h4>Primes</h4>
                                <DataTable
                                    value={employeePrimes}
                                    emptyMessage="Aucune prime trouvée pour cet employé"
                                    size="small"
                                >
                                    <Column
                                        header="Prime"
                                        body={(rowData) => getPrimeLabel(rowData.codePrime)}
                                    />
                                    <Column 
                                        field="taux" 
                                        header="Taux" 
                                        body={(rowData) => `${rowData.taux}%`}
                                    />
                                    <Column 
                                        field="montant" 
                                        header="Montant"
                                        body={(rowData) => formatCurrency(rowData.montant)}
                                    />
                                    <Column 
                                        header="Statut" 
                                        body={statusBodyTemplate}
                                    />
                                </DataTable>
                            </div>
                        </div>
                    </div>

                    {!saisiePaie.matriculeId && (
                        <div className="grid">
                            <div className="col-12">
                                <div className="p-message p-message-info">
                                    <div className="p-message-wrapper">
                                        <span className="p-message-icon pi pi-info-circle"></span>
                                        <div className="p-message-text">
                                            Veuillez saisir un matricule dans l'onglet "Fiche Paie" pour afficher les données de paie de l'employé.
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </TabPanel>
            </TabView>
        </>
    );
};

export default SaisiePaieComponent;