'use client';

import { TabPanel, TabView, TabViewTabChangeEvent } from 'primereact/tabview';
import { useEffect, useRef, useState } from 'react';
import useConsumApi from '../../../../../hooks/fetchData/useConsumApi';
import { PeriodePaie } from './PeriodePaie';
import PeriodePaieForm from './PeriodePaieForm';
import { Button } from 'primereact/button';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { InputText } from 'primereact/inputtext';
import { InputNumber } from 'primereact/inputnumber';
import { Toast } from 'primereact/toast';
import { Dialog } from 'primereact/dialog';
import { Dropdown, DropdownChangeEvent } from 'primereact/dropdown';
import { CalendarChangeEvent } from 'primereact/calendar';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import { Card } from 'primereact/card';
import { API_BASE_URL } from '@/utils/apiConfig';
import { formatLocalDateFR } from '@/utils/dateUtils';

interface DataMigrationResponse {
    success: boolean;
    message: string;
    retenuesClosedCount: number;
    retenuesMigratedCount: number;
    indemnitesMigratedCount: number;
    primesMigratedCount: number;
}

function PeriodePaieComponent() {
    const baseUrl = `${API_BASE_URL}`;
    
    const [periodePaie, setPeriodePaie] = useState<PeriodePaie>(new PeriodePaie());
    const [periodePaieEdit, setPeriodePaieEdit] = useState<PeriodePaie>(new PeriodePaie());
    const [editPeriodePaieDialog, setEditPeriodePaieDialog] = useState(false);
    const [periodePaies, setPeriodePaies] = useState<PeriodePaie[]>([]);
    const [activeIndex, setActiveIndex] = useState(0);
    const { data, loading, error, fetchData, callType } = useConsumApi('');
    // Separate hooks for migration tab to avoid race conditions
    const { data: closedPeriodsData, fetchData: fetchClosedPeriods } = useConsumApi('');
    const { data: openPeriodsData, fetchData: fetchOpenPeriods } = useConsumApi('');
    const [btnLoading, setBtnLoading] = useState<boolean>(false);
    const [globalFilter, setGlobalFilter] = useState<string>('');
    const [filterYear, setFilterYear] = useState<number>(new Date().getFullYear());
    const toast = useRef<Toast>(null);
    const [dateDebut, setDateDebut] = useState<Date | null>(null);
    const [dateFin, setDateFin] = useState<Date | null>(null);
    const [dateDebutEdit, setDateDebutEdit] = useState<Date | null>(null);
    const [dateFinEdit, setDateFinEdit] = useState<Date | null>(null);

    // States for data migration tab
    const [closedPeriods, setClosedPeriods] = useState<PeriodePaie[]>([]);
    const [openPeriods, setOpenPeriods] = useState<PeriodePaie[]>([]);
    const [selectedClosedPeriod, setSelectedClosedPeriod] = useState<PeriodePaie | null>(null);
    const [selectedOpenPeriod, setSelectedOpenPeriod] = useState<PeriodePaie | null>(null);
    const [migrationResult, setMigrationResult] = useState<DataMigrationResponse | null>(null);

    const monthNames = [
        '', 'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
        'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
    ];

    const accept = (sever: 'success' | 'info' | 'warn' | 'error', summa: string, det: string) => {
        toast.current?.show({
            severity: sever,
            summary: summa,
            detail: det,
            life: 3000
        });
    };

    useEffect(() => {
        if (data) {
            if (callType === 'loadPeriodePaies') {
                const periods = Array.isArray(data) ? data : [data];
                // Sort from newer to older (by year desc, then by month desc)
                const sortedPeriods = periods.sort((a: PeriodePaie, b: PeriodePaie) => {
                    if (b.annee !== a.annee) return b.annee - a.annee;
                    return b.mois - a.mois;
                });
                setPeriodePaies(sortedPeriods);
            } else if (callType === 'migrateData') {
                setMigrationResult(data as DataMigrationResponse);
            }
            handleAfterApiCall(activeIndex);
        }
    }, [data]);

    useEffect(() => {
        if (error) {
            handleAfterApiCall(activeIndex);
        }
    }, [error]);

    // Handle closed periods data from separate hook
    useEffect(() => {
        if (closedPeriodsData) {
            const periods = Array.isArray(closedPeriodsData) ? closedPeriodsData : [closedPeriodsData];
            const sortedPeriods = periods.sort((a: PeriodePaie, b: PeriodePaie) => {
                if (b.annee !== a.annee) return b.annee - a.annee;
                return b.mois - a.mois;
            });
            console.log('Closed periods loaded:', sortedPeriods.length);
            setClosedPeriods(sortedPeriods);
        }
    }, [closedPeriodsData]);

    // Handle open periods data from separate hook
    useEffect(() => {
        if (openPeriodsData) {
            const periods = Array.isArray(openPeriodsData) ? openPeriodsData : [openPeriodsData];
            const sortedPeriods = periods.sort((a: PeriodePaie, b: PeriodePaie) => {
                if (b.annee !== a.annee) return b.annee - a.annee;
                return b.mois - a.mois;
            });
            console.log('Open periods loaded:', sortedPeriods.length);
            setOpenPeriods(sortedPeriods);
        }
    }, [openPeriodsData]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        if (name === 'annee') {
            setPeriodePaie((prev) => ({ ...prev, [name]: parseInt(value) || new Date().getFullYear() }));
        } else {
            setPeriodePaie((prev) => ({ ...prev, [name]: value }));
        }
    };

    const handleChangeEdit = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        if (name === 'annee') {
            setPeriodePaieEdit((prev) => ({ ...prev, [name]: parseInt(value) || new Date().getFullYear() }));
        } else {
            setPeriodePaieEdit((prev) => ({ ...prev, [name]: value }));
        }
    };

    const handleDropDownSelect = (e: DropdownChangeEvent) => {
        setPeriodePaie((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleDropDownSelectEdit = (e: DropdownChangeEvent) => {
        setPeriodePaieEdit((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleDateChange = (e: CalendarChangeEvent) => {
        const fieldName = e.target.name as string;
        const dateValue = e.value as Date | null;

        if (fieldName === 'dateDebut') {
            setDateDebut(dateValue);
            setPeriodePaie((prev) => ({
                ...prev,
                dateDebut: dateValue ? formatLocalDateFR(dateValue) : ''
            }));
        } else if (fieldName === 'dateFin') {
            setDateFin(dateValue);
            setPeriodePaie((prev) => ({
                ...prev,
                dateFin: dateValue ? formatLocalDateFR(dateValue) : ''
            }));
        }
    };

    const handleDateChangeEdit = (e: CalendarChangeEvent) => {
        const fieldName = e.target.name as string;
        const dateValue = e.value as Date | null;

        if (fieldName === 'dateDebut') {
            setDateDebutEdit(dateValue);
            setPeriodePaieEdit((prev) => ({
                ...prev,
                dateDebut: dateValue ? formatLocalDateFR(dateValue) : ''
            }));
        } else if (fieldName === 'dateFin') {
            setDateFinEdit(dateValue);
            setPeriodePaieEdit((prev) => ({
                ...prev,
                dateFin: dateValue ? formatLocalDateFR(dateValue) : ''
            }));
        }
    };

    const handleSubmit = () => {
        if (!periodePaie.mois || !periodePaie.annee) {
            accept('warn', 'Validation', 'Veuillez sélectionner le mois et l\'année.');
            return;
        }

        setBtnLoading(true);
        console.log('Data sent to the backend:', periodePaie);
        fetchData(periodePaie, 'Post', `${baseUrl}/api/grh/paie/periods/new`, 'createPeriodePaie');
    };

    const handleSubmitEdit = () => {
        if (!periodePaieEdit.mois || !periodePaieEdit.annee) {
            accept('warn', 'Validation', 'Veuillez sélectionner le mois et l\'année.');
            return;
        }

        setBtnLoading(true);
        console.log('Data sent to the backend:', periodePaieEdit);
        fetchData(periodePaieEdit, 'Put', `${baseUrl}/api/grh/paie/periods/update/${periodePaieEdit.periodeId}`, 'updatePeriodePaie');
    };

    const handleClosePeriod = (periodePaieData: PeriodePaie) => {
        confirmDialog({
            message: `Voulez-vous clôturer la période ${monthNames[periodePaieData.mois]} ${periodePaieData.annee} ?`,
            header: 'Confirmation de clôture',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                setBtnLoading(true);
                fetchData(null, 'Put', `${baseUrl}/api/grh/paie/periods/close/${periodePaieData.periodeId}`, 'closePeriodePaie');
            }
        });
    };

    const handleReopenPeriod = (periodePaieData: PeriodePaie) => {
        confirmDialog({
            message: `Voulez-vous rouvrir la période ${monthNames[periodePaieData.mois]} ${periodePaieData.annee} ?`,
            header: 'Confirmation de réouverture',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                setBtnLoading(true);
                fetchData(null, 'Put', `${baseUrl}/api/grh/paie/periods/reopen/${periodePaieData.periodeId}`, 'reopenPeriodePaie');
            }
        });
    };

    const handleAfterApiCall = (chosenTab: number) => {
        if (error !== null && chosenTab === 0) {
            if (callType === 'createPeriodePaie') {
                accept('warn', 'A votre attention', error.message || 'L\'enregistrement n\'a pas été effectué.');
            }
            else if (callType === 'updatePeriodePaie')
                accept('warn', 'A votre attention', error.message || 'La mise à jour n\'a pas été effectuée.');
        }
        else if (error !== null && chosenTab === 1)
            accept('warn', 'A votre attention', error.message || 'Impossible de charger la liste des périodes de paie.');
        else if (error !== null && (callType === 'closePeriodePaie' || callType === 'reopenPeriodePaie'))
            accept('warn', 'A votre attention', error.message || 'L\'opération n\'a pas pu être effectuée.');
        else if (data !== null && error === null) {
            if (callType === 'createPeriodePaie') {
                setPeriodePaie(new PeriodePaie());
                setDateDebut(null);
                setDateFin(null);
                accept('info', 'OK', 'L\'enregistrement a été effectué avec succès.');
            } else if (callType === 'updatePeriodePaie') {
                accept('info', 'OK', 'La modification a été effectuée avec succès.');
                setPeriodePaieEdit(new PeriodePaie());
                setDateDebutEdit(null);
                setDateFinEdit(null);
                setEditPeriodePaieDialog(false);
                loadAllData();
            } else if (callType === 'closePeriodePaie') {
                accept('info', 'OK', 'La période a été clôturée avec succès.');
                loadAllData();
            } else if (callType === 'reopenPeriodePaie') {
                accept('info', 'OK', 'La période a été rouverte avec succès.');
                loadAllData();
            } else if (callType === 'migrateData') {
                accept('success', 'Migration réussie', 'Les données ont été migrées avec succès.');
                // Reload periods for the migration tab
                loadMigrationPeriods();
            }
        }
        // Handle migration errors
        if (error !== null && callType === 'migrateData') {
            accept('error', 'Erreur de migration', error.message || 'La migration a échoué.');
        }
        setBtnLoading(false);
    };

    const clearFilterPeriodePaie = () => {
        setGlobalFilter('');
    };

    const parseDateFR = (dateStr: string): Date | null => {
        if (!dateStr) return null;
        const parts = dateStr.split('/');
        if (parts.length === 3) {
            const day = parseInt(parts[0], 10);
            const month = parseInt(parts[1], 10) - 1;
            const year = parseInt(parts[2], 10);
            return new Date(year, month, day);
        }
        return null;
    };

    const loadPeriodePaieToEdit = (data: PeriodePaie) => {
        if (data) {
            setEditPeriodePaieDialog(true);
            console.log("Editing period: " + data.periodeId);
            setPeriodePaieEdit(data);
            setDateDebutEdit(parseDateFR(data.dateDebut));
            setDateFinEdit(parseDateFR(data.dateFin));
        }
    };

    const optionButtons = (data: PeriodePaie, options: any): React.ReactNode => {
        const isClosable = !data.dateCloture;
        const isReopenable = !!data.dateCloture;

        return (
            <div className='flex flex-wrap gap-2'>
                {isClosable && (
                    <>
                        <Button 
                            icon="pi pi-pencil" 
                            onClick={() => loadPeriodePaieToEdit(data)} 
                            raised 
                            severity='warning' 
                            tooltip="Modifier"
                        />
                        <Button 
                            icon="pi pi-lock" 
                            onClick={() => handleClosePeriod(data)} 
                            raised 
                            severity='danger' 
                            tooltip="Clôturer"
                        />
                    </>
                )}
                {isReopenable && (
                    <Button 
                        icon="pi pi-unlock" 
                        onClick={() => handleReopenPeriod(data)} 
                        raised 
                        severity='success' 
                        tooltip="Rouvrir"
                    />
                )}
            </div>
        );
    };

    const loadAllData = (year?: number) => {
        const yearToLoad = year ?? filterYear;
        fetchData(null, 'Get', `${baseUrl}/api/grh/paie/periods/year/${yearToLoad}`, 'loadPeriodePaies');
    };

    const loadMigrationPeriods = () => {
        // Reset selections
        setSelectedClosedPeriod(null);
        setSelectedOpenPeriod(null);
        setMigrationResult(null);
        // Load closed and open periods using separate hooks (no race condition)
        fetchClosedPeriods(null, 'Get', `${baseUrl}/api/grh/paie/periods/closed`, 'loadClosedPeriods');
        fetchOpenPeriods(null, 'Get', `${baseUrl}/api/grh/paie/periods/open`, 'loadOpenPeriods');
    };

    const handleMigration = () => {
        if (!selectedClosedPeriod || !selectedOpenPeriod) {
            accept('warn', 'Validation', 'Veuillez sélectionner une période source et une période cible.');
            return;
        }

        confirmDialog({
            message: `Voulez-vous reporter les données de ${monthNames[selectedClosedPeriod.mois]} ${selectedClosedPeriod.annee} vers ${monthNames[selectedOpenPeriod.mois]} ${selectedOpenPeriod.annee} ?`,
            header: 'Confirmation de migration',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                setBtnLoading(true);
                const request = {
                    sourcePeriodeId: selectedClosedPeriod.periodeId,
                    targetPeriodeId: selectedOpenPeriod.periodeId
                };
                fetchData(request, 'Post', `${baseUrl}/api/grh/paie/periods/migrate`, 'migrateData');
            }
        });
    };

    const formatPeriodLabel = (period: PeriodePaie) => {
        return `${monthNames[period.mois]} ${period.annee} (${period.periodeId})`;
    };

    const tableChangeHandle = (e: TabViewTabChangeEvent) => {
        if (e.index === 1) {
            loadAllData();
        } else if (e.index === 2) {
            loadMigrationPeriods();
        }
        setActiveIndex(e.index);
    };

    const renderSearch = () => (
        <div className="flex justify-content-between align-items-center mb-3">
            <div className="flex align-items-center gap-2">
                <label htmlFor="filterYear" className="font-semibold">Année:</label>
                <InputNumber
                    id="filterYear"
                    value={filterYear}
                    onValueChange={(e) => {
                        const newYear = e.value ?? new Date().getFullYear();
                        setFilterYear(newYear);
                        loadAllData(newYear);
                    }}
                    useGrouping={false}
                    min={2000}
                    max={2100}
                    style={{ width: '100px' }}
                />
            </div>
            <span className="p-input-icon-left" style={{ width: '40%' }}>
                <i className="pi pi-search" />
                <InputText
                    value={globalFilter}
                    onChange={(e) => setGlobalFilter(e.target.value)}
                    placeholder="Rechercher"
                    className="w-full"
                />
            </span>
        </div>
    );

    const statusBodyTemplate = (rowData: PeriodePaie) => {
        return (
            <span className={`p-badge ${rowData.dateCloture ? 'p-badge-danger' : 'p-badge-success'}`}>
                {rowData.dateCloture ? 'Clôturée' : 'Ouverte'}
            </span>
        );
    };

    const monthBodyTemplate = (rowData: PeriodePaie) => {
        return monthNames[rowData.mois] || rowData.mois;
    };

    return (
        <>
            <Toast ref={toast} />
            <ConfirmDialog />
            <Dialog 
                header="Modifier Période de Paie" 
                visible={editPeriodePaieDialog} 
                style={{ width: '50vw' }} 
                modal 
                onHide={() => setEditPeriodePaieDialog(false)}
            >
                <PeriodePaieForm
                    periodePaie={periodePaieEdit as PeriodePaie}
                    handleChange={handleChangeEdit}
                    handleDropDownSelect={handleDropDownSelectEdit}
                    handleDateChange={handleDateChangeEdit}
                    dateDebut={dateDebutEdit}
                    dateFin={dateFinEdit}
                />
                <div className="flex justify-content-end mt-3">
                    <Button 
                        icon="pi pi-check" 
                        label="Modifier" 
                        loading={btnLoading} 
                        onClick={handleSubmitEdit} 
                    />
                </div>
            </Dialog>
            
            <TabView onTabChange={tableChangeHandle} activeIndex={activeIndex}>
                <TabPanel header="Nouvelle Période">
                    <PeriodePaieForm
                        periodePaie={periodePaie as PeriodePaie}
                        handleChange={handleChange}
                        handleDropDownSelect={handleDropDownSelect}
                        handleDateChange={handleDateChange}
                        dateDebut={dateDebut}
                        dateFin={dateFin}
                    />
                    <div className="card p-fluid">
                        <div className="formgrid grid">
                            <div className="md:col-offset-3 md:field md:col-3">
                                <Button
                                    icon="pi pi-refresh"
                                    outlined
                                    label="Réinitialiser"
                                    onClick={() => {
                                        setPeriodePaie(new PeriodePaie());
                                        setDateDebut(null);
                                        setDateFin(null);
                                    }}
                                />
                            </div>
                            <div className="md:field md:col-3">
                                <Button 
                                    icon="pi pi-check" 
                                    label="Ouvrir Période" 
                                    loading={btnLoading} 
                                    onClick={handleSubmit} 
                                />
                            </div>
                        </div>
                    </div>
                </TabPanel>
                <TabPanel header="Consultation">
                    <div className='grid'>
                        <div className='col-12'>
                            <div className='card'>
                                <DataTable
                                    value={periodePaies}
                                    header={renderSearch}
                                    emptyMessage={"Aucune période de paie à afficher"}
                                    globalFilter={globalFilter}
                                    paginator
                                    rows={10}
                                    rowsPerPageOptions={[10, 20, 30]}
                                >
                                    <Column field="periodeId" header="ID Période" sortable />
                                    <Column
                                        field="mois"
                                        header="Mois"
                                        body={monthBodyTemplate}
                                        sortable
                                    />
                                    <Column field="annee" header="Année" sortable />
                                    <Column field="dateDebut" header="Date Début" sortable />
                                    <Column field="dateFin" header="Date Fin" sortable />
                                    <Column field="dateOuverture" header="Date Ouverture" sortable />
                                    <Column field="dateCloture" header="Date Clôture" sortable />
                                    <Column
                                        header="Statut"
                                        body={statusBodyTemplate}
                                        sortable
                                    />
                                    <Column field="userIdOuverture" header="Ouvert par" sortable />
                                    <Column field="userIdCloture" header="Clôturé par" sortable />
                                    <Column header="Actions" body={optionButtons} />
                                </DataTable>
                            </div>
                        </div>
                    </div>
                </TabPanel>
                <TabPanel header="Report des données">
                    <div className='grid'>
                        <div className='col-12'>
                            <Card title="Migration des données de paie" subTitle="Reporter les données d'une période clôturée vers une période ouverte">
                                <div className="formgrid grid">
                                    <div className="field col-12 md:col-6">
                                        <label htmlFor="sourcePeriod" className="font-bold">Période source (clôturée) *</label>
                                        <Dropdown
                                            id="sourcePeriod"
                                            value={selectedClosedPeriod}
                                            options={closedPeriods}
                                            onChange={(e) => setSelectedClosedPeriod(e.value)}
                                            optionLabel={(period) => formatPeriodLabel(period)}
                                            placeholder="Sélectionner la période source"
                                            className="w-full"
                                            emptyMessage="Aucune période clôturée disponible"
                                        />
                                    </div>
                                    <div className="field col-12 md:col-6">
                                        <label htmlFor="targetPeriod" className="font-bold">Période cible (ouverte) *</label>
                                        <Dropdown
                                            id="targetPeriod"
                                            value={selectedOpenPeriod}
                                            options={openPeriods}
                                            onChange={(e) => setSelectedOpenPeriod(e.value)}
                                            optionLabel={(period) => formatPeriodLabel(period)}
                                            placeholder="Sélectionner la période cible"
                                            className="w-full"
                                            emptyMessage="Aucune période ouverte disponible"
                                        />
                                    </div>
                                </div>

                                <div className="mt-4">
                                    <h5>Ce que fait cette opération :</h5>
                                    <ul className="line-height-3">
                                        <li>Les retenues dont le paramètre "Afficher dans paiement" est <strong>désactivé</strong> seront clôturées</li>
                                        <li>Les retenues dont le paramètre "Afficher dans paiement" est <strong>activé</strong> seront copiées vers la nouvelle période</li>
                                        <li>Toutes les indemnités actives seront copiées vers la nouvelle période</li>
                                        <li>Toutes les primes actives seront copiées vers la nouvelle période</li>
                                    </ul>
                                    <p className="text-orange-500 font-semibold">
                                        <i className="pi pi-info-circle mr-2"></i>
                                        Cette opération est effectuée en une seule transaction. En cas d'erreur, aucune modification ne sera appliquée.
                                    </p>
                                </div>

                                <div className="flex justify-content-center mt-4">
                                    <Button
                                        icon="pi pi-sync"
                                        label="Reporter les données"
                                        loading={btnLoading}
                                        onClick={handleMigration}
                                        severity="warning"
                                        size="large"
                                        disabled={!selectedClosedPeriod || !selectedOpenPeriod}
                                    />
                                </div>

                                {migrationResult && migrationResult.success && (
                                    <div className="mt-4 p-3 surface-100 border-round">
                                        <h5 className="text-green-600">
                                            <i className="pi pi-check-circle mr-2"></i>
                                            Résultat de la migration
                                        </h5>
                                        <div className="grid">
                                            <div className="col-6 md:col-3">
                                                <div className="text-center p-3 border-round bg-blue-100">
                                                    <div className="text-2xl font-bold text-blue-700">{migrationResult.retenuesClosedCount}</div>
                                                    <div className="text-sm">Retenues clôturées</div>
                                                </div>
                                            </div>
                                            <div className="col-6 md:col-3">
                                                <div className="text-center p-3 border-round bg-green-100">
                                                    <div className="text-2xl font-bold text-green-700">{migrationResult.retenuesMigratedCount}</div>
                                                    <div className="text-sm">Retenues migrées</div>
                                                </div>
                                            </div>
                                            <div className="col-6 md:col-3">
                                                <div className="text-center p-3 border-round bg-yellow-100">
                                                    <div className="text-2xl font-bold text-yellow-700">{migrationResult.indemnitesMigratedCount}</div>
                                                    <div className="text-sm">Indemnités migrées</div>
                                                </div>
                                            </div>
                                            <div className="col-6 md:col-3">
                                                <div className="text-center p-3 border-round bg-purple-100">
                                                    <div className="text-2xl font-bold text-purple-700">{migrationResult.primesMigratedCount}</div>
                                                    <div className="text-sm">Primes migrées</div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </Card>
                        </div>
                    </div>
                </TabPanel>
            </TabView>
        </>
    );
}

export default PeriodePaieComponent;