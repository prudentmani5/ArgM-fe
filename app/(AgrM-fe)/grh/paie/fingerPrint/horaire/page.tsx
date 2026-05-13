'use client';

import { TabPanel, TabView, TabViewTabChangeEvent } from 'primereact/tabview';
import { useEffect, useRef, useState } from 'react';
import { HoraireEmploye, HoraireDateRange, EmployeeWithHoraire, ShiftGroupe, GroupMapping } from './HoraireEmploye';
import HoraireDateForm from './HoraireDateForm';
import SingleEmployeeHoraireForm from './SingleEmployeeHoraireForm';
import ManualMappingForm from './ManualMappingForm';
import { Button } from 'primereact/button';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Toast } from 'primereact/toast';
import { CalendarChangeEvent } from 'primereact/calendar';
import { InputText } from 'primereact/inputtext';
import { Dropdown, DropdownChangeEvent } from 'primereact/dropdown';
import { RadioButton, RadioButtonChangeEvent } from 'primereact/radiobutton';
import { FilterMatchMode } from 'primereact/api';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import useConsumApi from '../../../../../../hooks/fetchData/useConsumApi';
import { API_BASE_URL } from '@/utils/apiConfig';
import { stringToDate, dateToStringDate } from '@/utils/dateUtils';

function HoraireEmployeComponent() {

    const [horaireDates, setHoraireDates] = useState<HoraireDateRange>(new HoraireDateRange());
    const [deleteDates, setDeleteDates] = useState<HoraireDateRange>(new HoraireDateRange());
    const [singleEmployeeDates, setSingleEmployeeDates] = useState<HoraireDateRange>(new HoraireDateRange());
    const [matricule, setMatricule] = useState<string>('');
    const [selectedGroupeId, setSelectedGroupeId] = useState<string>('');
    const [currentEmployeeData, setCurrentEmployeeData] = useState<EmployeeWithHoraire | null>(null);
    const [currentHoraires, setCurrentHoraires] = useState<HoraireEmploye[]>([]);
    const [filteredHoraires, setFilteredHoraires] = useState<HoraireEmploye[]>([]);
    const [shiftGroupes, setShiftGroupes] = useState<ShiftGroupe[]>([]);
    const [selectedFilterGroupe, setSelectedFilterGroupe] = useState<string | null>(null);
    const [switchMode, setSwitchMode] = useState<'automatic' | 'manual'>('automatic');
    const [manualMappings, setManualMappings] = useState<GroupMapping[]>([]);
    const [activeIndex, setActiveIndex] = useState(0);
    const [globalFilterValue, setGlobalFilterValue] = useState<string>('');
    const [displayedEmployeeCount, setDisplayedEmployeeCount] = useState<number>(0);
    const [filters, setFilters] = useState({
        global: { value: null, matchMode: FilterMatchMode.CONTAINS },
        matriculeId: { value: null, matchMode: FilterMatchMode.EQUALS },
        nom: { value: null, matchMode: FilterMatchMode.CONTAINS },
        prenom: { value: null, matchMode: FilterMatchMode.CONTAINS }
    });
    const [matriculeFilterValue, setMatriculeFilterValue] = useState<string>('');
    
    const { data, loading, error, fetchData, callType } = useConsumApi('');
    const { data: searchData, loading: searchLoading, error: searchError, fetchData: fetchSearchData, callType: searchCallType } = useConsumApi('');
    const { data: groupData, loading: groupLoading, error: groupError, fetchData: fetchGroupData, callType: groupCallType } = useConsumApi('');
    const { data: deleteData, loading: deleteLoading, error: deleteError, fetchData: fetchDeleteData, callType: deleteCallType } = useConsumApi('');
    const [btnLoading, setBtnLoading] = useState<boolean>(false);
    const [deleteBtnLoading, setDeleteBtnLoading] = useState<boolean>(false);
    
    const toast = useRef<Toast>(null);

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
            if (callType === 'loadCurrentHoraires') {
                const horaires = Array.isArray(data) ? data : [data];
                setCurrentHoraires(horaires);
                setFilteredHoraires(horaires);
                setDisplayedEmployeeCount(horaires.length);
            } else if (callType === 'changeGroupsAll') {
                accept('success', 'Succès', 'Les groupes ont été changés pour tous les employés avec succès.');
                loadCurrentHoraires(); // Reload data to show updated records
            } else if (callType === 'changeGroupSingle') {
                const wasCreation = currentEmployeeData && !currentEmployeeData.horaire;
                accept('success', 'Succès', wasCreation
                    ? `L'horaire a été créé pour l'employé ${matricule} avec succès.`
                    : `Le groupe a été changé pour l'employé ${matricule} avec succès.`);
                loadCurrentHoraires(); // Reload data to show updated records
                setCurrentEmployeeData(null); // Clear the current employee
                setMatricule(''); // Clear matricule
                setSelectedGroupeId(''); // Clear selected group
                setSingleEmployeeDates(new HoraireDateRange()); // Clear dates
            }
            handleAfterApiCall();
        }
    }, [data, error]);

    // Filter horaires by selected group
    useEffect(() => {
        if (selectedFilterGroupe) {
            const filtered = currentHoraires.filter(h => h.groupeId === selectedFilterGroupe);
            setFilteredHoraires(filtered);
            setDisplayedEmployeeCount(filtered.length);
        } else {
            setFilteredHoraires(currentHoraires);
            setDisplayedEmployeeCount(currentHoraires.length);
        }
    }, [selectedFilterGroupe, currentHoraires]);

    useEffect(() => {
        if (searchData && searchCallType === 'searchEmployee') {
            if (searchData) {
                setCurrentEmployeeData(searchData as EmployeeWithHoraire);
                if (searchData.horaire) {
                    accept('info', 'Employé trouvé', `${searchData.nom} ${searchData.prenom} - Horaire existant chargé.`);
                } else {
                    accept('info', 'Employé trouvé', `${searchData.nom} ${searchData.prenom} - Aucun horaire existant, vous pouvez en créer un.`);
                }
            }
        }

        if (searchError && searchCallType === 'searchEmployee') {
            accept('warn', 'Employé non trouvé', 'Aucun employé trouvé pour ce matricule.');
            setCurrentEmployeeData(null);
        }
    }, [searchData, searchError]);

    useEffect(() => {
        if (groupData && groupCallType === 'loadShiftGroups') {
            setShiftGroupes(Array.isArray(groupData) ? groupData : [groupData]);
        }
    }, [groupData, groupError]);

    useEffect(() => {
        if (deleteData && deleteCallType === 'deleteHoraires') {
            const response = deleteData as { deletedCount: number; message: string };
            accept('success', 'Succès', response.message || `${response.deletedCount} horaires ont été supprimés.`);
            loadCurrentHoraires();
            setDeleteDates(new HoraireDateRange());
        }
        if (deleteError && deleteCallType === 'deleteHoraires') {
            accept('error', 'Erreur', 'Erreur lors de la suppression des horaires.');
        }
        setDeleteBtnLoading(false);
    }, [deleteData, deleteError]);

    useEffect(() => {
        // Load shift groups and current horaires when component mounts
        loadShiftGroups();
        loadCurrentHoraires();
    }, []);

    const handleCalendarChange = (e: CalendarChangeEvent) => {
        const name = e.target.name as string;
        setHoraireDates((prev) => ({ ...prev, [name]: dateToStringDate(e.value as Date) }));
    };

    const handleDeleteCalendarChange = (e: CalendarChangeEvent) => {
        const name = e.target.name as string;
        setDeleteDates((prev) => ({ ...prev, [name]: dateToStringDate(e.value as Date) }));
    };

    const handleSingleCalendarChange = (e: CalendarChangeEvent) => {
        const name = e.target.name as string;
        setSingleEmployeeDates((prev) => ({ ...prev, [name]: dateToStringDate(e.value as Date) }));
    };

    const handleMatriculeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setMatricule(e.target.value);
        if (!e.target.value.trim()) {
            setCurrentEmployeeData(null);
            setSelectedGroupeId('');
        }
    };

    const handleGroupeChange = (e: DropdownChangeEvent) => {
        setSelectedGroupeId(e.value);
    };

    const handleMatriculeBlur = (matriculeValue: string) => {
        if (matriculeValue.trim() === '') return;
        
        console.log('Searching for employee with matricule:', matriculeValue);
        fetchSearchData(null, 'Get', `${API_BASE_URL}/horaire-employes/latest/${matriculeValue}`, 'searchEmployee');
    };

    const handleChangeGroupsForAll = () => {
        if (!horaireDates.dateDebutD || !horaireDates.dateFinD) {
            accept('warn', 'Attention', 'Veuillez sélectionner les dates de début et de fin.');
            return;
        }

        // String comparison works for yyyy-MM-dd format
        if (horaireDates.dateDebutD >= horaireDates.dateFinD) {
            accept('warn', 'Attention', 'La date de début doit être antérieure à la date de fin.');
            return;
        }

        // Validate manual mode mappings
        if (switchMode === 'manual') {
            if (manualMappings.length === 0) {
                accept('warn', 'Attention', 'Veuillez définir au moins un mapping de groupe en mode manuel.');
                return;
            }

            const invalidMappings = manualMappings.filter(
                m => !m.sourceGroupId || !m.targetGroupId || m.sourceGroupId === m.targetGroupId
            );
            if (invalidMappings.length > 0) {
                accept('warn', 'Attention', 'Veuillez compléter tous les mappings et assurer que source et cible sont différents.');
                return;
            }
        }

        setBtnLoading(true);
        console.log('Changing groups for all employees with dates:', horaireDates, 'mode:', switchMode);

        const requestData = {
            dateDebut: horaireDates.dateDebutD,
            dateFin: horaireDates.dateFinD,
            mode: switchMode,
            mappings: switchMode === 'manual' ? manualMappings : undefined
        };

        console.log('Request data:', requestData);

        fetchData(
            requestData,
            'Post',
            `${API_BASE_URL}/horaire-employes/change-groups-all`,
            'changeGroupsAll'
        );
    };

    const confirmDeleteHoraires = () => {
        if (!deleteDates.dateDebutD || !deleteDates.dateFinD) {
            accept('warn', 'Attention', 'Veuillez sélectionner les dates de début et de fin.');
            return;
        }

        if (deleteDates.dateDebutD >= deleteDates.dateFinD) {
            accept('warn', 'Attention', 'La date de début doit être antérieure à la date de fin.');
            return;
        }

        confirmDialog({
            message: `Êtes-vous sûr de vouloir supprimer tous les horaires de la période du ${formatDate(deleteDates.dateDebutD)} au ${formatDate(deleteDates.dateFinD)} pour tous les employés ?`,
            header: 'Confirmation de suppression',
            icon: 'pi pi-exclamation-triangle',
            acceptClassName: 'p-button-danger',
            acceptLabel: 'Supprimer',
            rejectLabel: 'Annuler',
            accept: () => handleDeleteHoraires()
        });
    };

    const handleDeleteHoraires = () => {
        setDeleteBtnLoading(true);

        const requestData = {
            dateDebut: deleteDates.dateDebutD,
            dateFin: deleteDates.dateFinD
        };

        console.log('Deleting horaires with dates:', requestData);

        fetchDeleteData(
            requestData,
            'Delete',
            `${API_BASE_URL}/horaire-employes/delete-by-date-range`,
            'deleteHoraires'
        );
    };

    const handleChangeGroupForSingle = () => {
        if (!matricule.trim()) {
            accept('warn', 'Attention', 'Veuillez entrer un matricule d\'employé.');
            return;
        }

        if (!currentEmployeeData) {
            accept('warn', 'Attention', 'Veuillez d\'abord rechercher l\'employé.');
            return;
        }

        if (!selectedGroupeId) {
            accept('warn', 'Attention', 'Veuillez sélectionner un groupe.');
            return;
        }

        if (!singleEmployeeDates.dateDebutD || !singleEmployeeDates.dateFinD) {
            accept('warn', 'Attention', 'Veuillez sélectionner les dates de début et de fin.');
            return;
        }

        // String comparison works for yyyy-MM-dd format
        if (singleEmployeeDates.dateDebutD >= singleEmployeeDates.dateFinD) {
            accept('warn', 'Attention', 'La date de début doit être antérieure à la date de fin.');
            return;
        }

        setBtnLoading(true);
        console.log('Changing group for single employee:', matricule, singleEmployeeDates, selectedGroupeId);

        const requestData = {
            matriculeId: matricule.trim(),
            dateDebut: singleEmployeeDates.dateDebutD,
            dateFin: singleEmployeeDates.dateFinD,
            groupeId: selectedGroupeId,
            serviceId: currentEmployeeData.horaire?.serviceId || currentEmployeeData.serviceId || ''
        };

        console.log('Single employee request data:', requestData);

        fetchData(
            requestData,
            'Post',
            `${API_BASE_URL}/horaire-employes/change-group-single`,
            'changeGroupSingle'
        );
    };

    const handleAfterApiCall = () => {
        if (error !== null) {
            if (callType === 'changeGroupsAll') {
                accept('warn', 'Erreur', 'Erreur lors du changement des groupes.');
            } else if (callType === 'changeGroupSingle') {
                accept('warn', 'Erreur', 'Erreur lors du changement du groupe pour cet employé.');
            } else if (callType === 'loadCurrentHoraires') {
                accept('warn', 'Erreur', 'Impossible de charger les horaires actuels.');
            }
        }
        setBtnLoading(false);
    };

    const loadCurrentHoraires = () => {
        fetchData(null, 'Get', `${API_BASE_URL}/horaire-employes/latest-all-with-names`, `loadCurrentHoraires`);
    };

    const loadShiftGroups = () => {
        fetchGroupData(null, 'Get', `${API_BASE_URL}/horaire-employes/shift-groups`, `loadShiftGroups`);
    };

    const tableChangeHandle = (e: TabViewTabChangeEvent) => {
        if (e.index === 0) {
            loadCurrentHoraires();
        } else if (e.index === 1) {
            // Clear single employee form when switching to tab
            setMatricule('');
            setCurrentEmployeeData(null);
            setSelectedGroupeId('');
            setSingleEmployeeDates(new HoraireDateRange());
        }
        setActiveIndex(e.index);
    };

    const onGlobalFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        let _filters = { ...filters };
        _filters['global'].value = value;
        setFilters(_filters);
        setGlobalFilterValue(value);
    };

    const onMatriculeFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        let _filters = { ...filters };
        _filters['matriculeId'].value = value || null;
        setFilters(_filters);
        setMatriculeFilterValue(value);
    };

    const clearFilter = () => {
        setGlobalFilterValue('');
        setMatriculeFilterValue('');
        setSelectedFilterGroupe(null);
        let _filters = { ...filters };
        _filters['global'].value = null;
        _filters['matriculeId'].value = null;
        setFilters(_filters);
    };

    const handleFilterGroupeChange = (e: DropdownChangeEvent) => {
        setSelectedFilterGroupe(e.value);
    };

    const formatDate = (date: Date | string): string => {
        if (!date) return '';
        const d = new Date(date);
        return d.toLocaleDateString('fr-FR');
    };

    const getGroupeLabel = (groupeId: string): string => {
        const groupe = shiftGroupes.find(g => g.groupeId === groupeId);
        return groupe ? `${groupe.libelle} (${groupe.heureDebut} - ${groupe.heureFin})` : `Groupe ${groupeId}`;
    };

    const getGroupeNext = (groupeId: string): string => {
        // If in manual mode, use the user-defined mappings
        if (switchMode === 'manual') {
            const mapping = manualMappings.find(m => m.sourceGroupId === groupeId);
            return mapping ? mapping.targetGroupId : groupeId;
        }

        // Default automatic mode rules
        const nextGroup: { [key: string]: string } = {
            '1': '1',  // Deux Gong stays
            '2': '3',  // First Shift → Second Shift
            '3': '2',  // Second Shift → First Shift
            '4': '4',  // First Midmorning stays
            '5': '5'   // Second Midmorning stays
        };
        return nextGroup[groupeId] || groupeId;
    };

    const renderGroupeInfo = (rowData: HoraireEmploye) => {
        const currentGroupe = getGroupeLabel(rowData.groupeId);
        const nextGroupe = getGroupeNext(rowData.groupeId);
        
        return (
            <div>
                <div><strong>Actuel:</strong> {currentGroupe}</div>
                <div style={{ color: '#10b981' }}>
                    <strong>Prochain:</strong> {getGroupeLabel(nextGroupe)}
                </div>
            </div>
        );
    };

    const renderHeader = () => {
        const groupeOptions = [
            { label: 'Tous les groupes', value: null },
            ...shiftGroupes.map(g => ({
                label: `${g.libelle} (${g.heureDebut} - ${g.heureFin})`,
                value: g.groupeId
            }))
        ];

        return (
            <div className="flex justify-content-between align-items-center flex-wrap gap-2">
                <div className="flex align-items-center gap-2">
                    <Button
                        type="button"
                        icon="pi pi-filter-slash"
                        label="Effacer filtres"
                        outlined
                        onClick={clearFilter}
                    />
                    <Dropdown
                        value={selectedFilterGroupe}
                        options={groupeOptions}
                        onChange={handleFilterGroupeChange}
                        placeholder="Filtrer par groupe"
                        className="w-15rem"
                        showClear
                    />
                </div>
                <div className="flex align-items-center gap-2">
                    <span className="p-input-icon-left">
                        <i className="pi pi-id-card" />
                        <InputText
                            value={matriculeFilterValue}
                            onChange={onMatriculeFilterChange}
                            placeholder="Matricule exact"
                            className="w-10rem"
                        />
                    </span>
                    <span className="p-input-icon-left">
                        <i className="pi pi-search" />
                        <InputText
                            value={globalFilterValue}
                            onChange={onGlobalFilterChange}
                            placeholder="Rechercher par nom..."
                            className="w-full"
                        />
                    </span>
                </div>
            </div>
        );
    };

    return (
        <>
            <Toast ref={toast} />
            <ConfirmDialog />
            <TabView onTabChange={tableChangeHandle} activeIndex={activeIndex}>
                <TabPanel header="Pour tous">
                    <div className="mb-4">
                        <h3>Changement de Groupes pour Tous les Employés</h3>
                        <p className="text-600 mb-3">
                            Sélectionnez le mode de changement et les nouvelles dates pour effectuer le changement des groupes.
                        </p>

                        <div className="flex flex-column gap-3 mb-4">
                            <div className="flex align-items-center">
                                <RadioButton
                                    inputId="modeAutomatic"
                                    name="switchMode"
                                    value="automatic"
                                    onChange={(e: RadioButtonChangeEvent) => setSwitchMode(e.value)}
                                    checked={switchMode === 'automatic'}
                                />
                                <label htmlFor="modeAutomatic" className="ml-2 font-semibold">Mode Automatique (règles par défaut)</label>
                            </div>

                            {switchMode === 'automatic' && (
                                <ul className="text-600 ml-4 mt-0">
                                    <li><strong>Deux Gong, First Midmorning, Second Midmorning:</strong> Restent inchangés</li>
                                    <li><strong>First Shift ↔ Second Shift:</strong> S'interchangent</li>
                                </ul>
                            )}

                            <div className="flex align-items-center">
                                <RadioButton
                                    inputId="modeManual"
                                    name="switchMode"
                                    value="manual"
                                    onChange={(e: RadioButtonChangeEvent) => setSwitchMode(e.value)}
                                    checked={switchMode === 'manual'}
                                />
                                <label htmlFor="modeManual" className="ml-2 font-semibold">Mode Manuel (définir les mappings personnalisés)</label>
                            </div>

                            {switchMode === 'manual' && (
                                <ManualMappingForm
                                    mappings={manualMappings}
                                    shiftGroupes={shiftGroupes}
                                    onMappingsChange={setManualMappings}
                                />
                            )}
                        </div>
                    </div>

                    <HoraireDateForm
                        horaireDates={horaireDates}
                        handleCalendarChange={handleCalendarChange}
                    />
                    
                    <div className="card p-fluid mt-3">
                        <div className="formgrid grid">
                            <div className="md:col-offset-6 md:field md:col-6">
                                <Button
                                    icon="pi pi-sync"
                                    label="Changer pour tout le monde"
                                    loading={btnLoading}
                                    onClick={handleChangeGroupsForAll}
                                    severity="success"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="mt-5 p-4 surface-100 border-round">
                        <h4 className="text-red-500 mb-3">
                            <i className="pi pi-trash mr-2"></i>
                            Supprimer les Horaires d'une Semaine
                        </h4>
                        <p className="text-600 mb-3">
                            Sélectionnez les dates exactes pour supprimer tous les horaires correspondants pour tous les employés.
                        </p>

                        <HoraireDateForm
                            horaireDates={deleteDates}
                            handleCalendarChange={handleDeleteCalendarChange}
                        />

                        <div className="card p-fluid mt-3">
                            <div className="formgrid grid">
                                <div className="md:col-offset-6 md:field md:col-6">
                                    <Button
                                        icon="pi pi-trash"
                                        label="Supprimer les horaires"
                                        loading={deleteBtnLoading}
                                        onClick={confirmDeleteHoraires}
                                        severity="danger"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-4">
                        <div className="flex align-items-center gap-3 mb-3">
                            <h4 className="m-0">État Actuel des Horaires</h4>
                            <span className="text-primary font-semibold">
                                ({displayedEmployeeCount} employé{displayedEmployeeCount > 1 ? 's' : ''})
                            </span>
                        </div>
                        <div className='grid'>
                            <div className='col-12'>
                                <div className='card'>
                                    <DataTable
                                        value={filteredHoraires}
                                        header={renderHeader}
                                        filters={filters}
                                        globalFilterFields={['nom', 'prenom', 'serviceId', 'groupeId']}
                                        emptyMessage={"Aucun horaire à afficher"}
                                        paginator
                                        rows={10}
                                        rowsPerPageOptions={[10, 20, 30]}
                                        loading={loading}
                                        onValueChange={(filteredData) => setDisplayedEmployeeCount(filteredData.length)}
                                    >
                                        <Column field="matriculeId" header="Matricule" sortable />
                                        <Column field="nom" header="Nom" sortable />
                                        <Column field="prenom" header="Prénom" sortable />
                                        <Column field="serviceId" header="Service" sortable />
                                        <Column
                                            field="groupeId"
                                            header="Groupe Actuel → Prochain"
                                            body={renderGroupeInfo}
                                            sortable
                                        />
                                        <Column
                                            field="dateDebut"
                                            header="Date Début"
                                            body={(rowData) => formatDate(rowData.dateDebut)}
                                            sortable
                                        />
                                        <Column
                                            field="dateFin"
                                            header="Date Fin"
                                            body={(rowData) => formatDate(rowData.dateFin)}
                                            sortable
                                        />
                                        <Column field="numeroOrdre" header="Numéro Ordre" sortable />
                                    </DataTable>
                                </div>
                            </div>
                        </div>
                    </div>
                </TabPanel>
                
                <TabPanel header="Pour un seul employé">
                    <div className="mb-4">
                        <h3>Changement de Groupe pour un Employé Spécifique</h3>
                        <p className="text-600 mb-3">
                            Recherchez un employé par son matricule et changez son groupe selon les mêmes règles.
                        </p>
                    </div>
                    
                    <SingleEmployeeHoraireForm
                        matricule={matricule}
                        horaireDates={singleEmployeeDates}
                        currentEmployeeData={currentEmployeeData}
                        selectedGroupeId={selectedGroupeId}
                        shiftGroupes={shiftGroupes}
                        searchLoading={searchLoading}
                        handleMatriculeChange={handleMatriculeChange}
                        handleCalendarChange={handleSingleCalendarChange}
                        handleMatriculeBlur={handleMatriculeBlur}
                        handleGroupeChange={handleGroupeChange}
                    />
                    
                    <div className="card p-fluid mt-3">
                        <div className="formgrid grid">
                            <div className="md:col-offset-3 md:field md:col-3">
                                <Button 
                                    icon="pi pi-refresh" 
                                    outlined 
                                    label="Réinitialiser" 
                                    onClick={() => {
                                        setMatricule('');
                                        setCurrentEmployeeData(null);
                                        setSelectedGroupeId('');
                                        setSingleEmployeeDates(new HoraireDateRange());
                                    }}
                                />
                            </div>
                            <div className="md:field md:col-3">
                                <Button
                                    icon={currentEmployeeData && !currentEmployeeData.horaire ? "pi pi-plus" : "pi pi-sync"}
                                    label={currentEmployeeData && !currentEmployeeData.horaire ? "Créer l'horaire" : "Changer le groupe"}
                                    loading={btnLoading}
                                    onClick={handleChangeGroupForSingle}
                                    severity={currentEmployeeData && !currentEmployeeData.horaire ? "success" : "warning"}
                                    disabled={!currentEmployeeData || !selectedGroupeId}
                                />
                            </div>
                        </div>
                    </div>
                </TabPanel>
            </TabView>
        </>
    );
}

export default HoraireEmployeComponent;