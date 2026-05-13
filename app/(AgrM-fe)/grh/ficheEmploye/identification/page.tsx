'use client';

import { useEffect, useRef, useState } from "react";
import { GrhRensIdentification } from "./GrhRensIdentification";
import useConsumApi from "../../../../../hooks/fetchData/useConsumApi";
import { TabPanel, TabView, TabViewTabChangeEvent } from "primereact/tabview";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { Column } from "primereact/column";
import { DataTable } from "primereact/datatable";
import GrhRensIdentificationForm from "./GrhRensIdentificationForm";
import { Toast } from 'primereact/toast';
import { Dialog } from 'primereact/dialog';
import { DropdownChangeEvent } from "primereact/dropdown";
import { CalendarChangeEvent } from "primereact/calendar";
import { Situation } from "../../settings/situation/Situation";
import { Banque } from "../../settings/banque/Banque";
import { Pays } from "../../settings/pays/Pays";
import { Province } from "../../settings/province/Province";
import { Commune } from "../../settings/commune/Commune";
import { Colline } from "../../settings/colline/Colline";
import { API_BASE_URL } from '@/utils/apiConfig';
import { useAuthorities } from "../../../../../hooks/useAuthorities";

const GrhRensIdentificationComponent = () => {
    // const baseUrl = "http://10.100.27.47:8080";
    const baseUrl = `${API_BASE_URL}`;
    const { hasAuthority, hasAnyAuthority } = useAuthorities();

    // Authority checks for tab visibility
    const canViewNouveauTab = hasAuthority('RH_MANAGER');
    const canViewConsultationTab = hasAnyAuthority(['RH_MANAGER', 'RH_OPERATEUR_SAISIE']);

    const [employee, setEmployee] = useState<GrhRensIdentification>(new GrhRensIdentification());
    const [employeeEdit, setEmployeeEdit] = useState<GrhRensIdentification>(new GrhRensIdentification());
    const [editEmployeeDialog, setEditEmployeeDialog] = useState(false);
    const [employees, setEmployees] = useState<GrhRensIdentification[]>([]);
    const [filteredEmployees, setFilteredEmployees] = useState<GrhRensIdentification[]>([]);
    const [activeIndex, setActiveIndex] = useState(0);
    const [btnLoading, setBtnLoading] = useState<boolean>(false);
    const [searchLoading, setSearchLoading] = useState<boolean>(false);
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [searchMatricule, setSearchMatricule] = useState<string>('');
    const [photoPreview, setPhotoPreview] = useState<string>('');
    const [photoFile, setPhotoFile] = useState<File | null>(null);
    const [photoPreviewEdit, setPhotoPreviewEdit] = useState<string>('');
    const [photoFileEdit, setPhotoFileEdit] = useState<File | null>(null);

    const { data, loading, error, fetchData, callType } = useConsumApi('');
    const { data: searchData, loading: searchApiLoading, error: searchError, fetchData: fetchSearchData, callType: searchCallType } = useConsumApi('');
    const { data: situationData, loading: situationsLoading, error: situationError, fetchData: fetchSituations, callType: situationCallType } = useConsumApi('');
    const { data: paysData, loading: paysLoading, error: paysError, fetchData: fetchPays, callType: paysCallType } = useConsumApi('');
    const { data: banqueData, loading: banqueLoading, error: banqueError, fetchData: fetchBanques, callType: banqueCallType } = useConsumApi('');
    const { data: searchEmployeeData, loading: searchEmployeeLoading, error: searchEmployeeError, fetchData: fetchSearchEmployee, callType: searchEmployeeCallType } = useConsumApi('');
    const { data: provinceData, loading: provinceLoading, error: provinceError, fetchData: fetchProvinces, callType: provinceCallType } = useConsumApi('');
    const { data: communeData, loading: communeLoading, error: communeError, fetchData: fetchCommunes, callType: communeCallType } = useConsumApi('');
    const { data: collineData, loading: collineLoading, error: collineError, fetchData: fetchCollines, callType: collineCallType } = useConsumApi('');

    const toast = useRef<Toast>(null);
    const lastSearchDataRef = useRef<any>(null);
    const lastSearchErrorRef = useRef<any>(null);

    // State for dropdown options
    const [situations, setSituations] = useState<Situation[]>([]);
    const [pays, setPays] = useState<Pays[]>([]);
    const [banques, setBanques] = useState<Banque[]>([]);
    const [provinces, setProvinces] = useState<Province[]>([]);
    const [allCommunes, setAllCommunes] = useState<Commune[]>([]); // All communes from API
    const [communes, setCommunes] = useState<Commune[]>([]); // Filtered communes based on province
    const [allCollines, setAllCollines] = useState<Colline[]>([]); // All collines from API
    const [collines, setCollines] = useState<Colline[]>([]); // Filtered collines based on commune

    // Selected options
    const [selectedSituation, setSelectedSituation] = useState<Situation | null>(null);
    const [selectedPays, setSelectedPays] = useState<Pays | null>(null);
    const [selectedBanque, setSelectedBanque] = useState<Banque | null>(null);
    const [selectedBanque1, setSelectedBanque1] = useState<Banque | null>(null);
    const [selectedProvince, setSelectedProvince] = useState<Province | null>(null);
    const [selectedCommune, setSelectedCommune] = useState<Commune | null>(null);
    const [selectedColline, setSelectedColline] = useState<Colline | null>(null);

    const accept = (sever: 'success' | 'info' | 'warn' | 'error', summa: string, det: string) => {
        toast.current?.show({
            severity: sever,
            summary: summa,
            detail: det,
            life: 3000
        });
    };

    useEffect(() => {
        loadAllSituations();
        loadAllPays();
        loadAllBanques();
        loadAllProvinces();
        loadAllCommunes();
        loadAllCollines();

        // If user only has Consultation tab access, load employee list on mount
        if (!canViewNouveauTab && canViewConsultationTab) {
            loadAllData();
        }
    }, []);

    useEffect(() => {
        if (data) {
            if (callType === 'loadEmployees') {
                setEmployees(Array.isArray(data) ? data : [data]);
                setFilteredEmployees(Array.isArray(data) ? data : [data]);
            }
        }

        if (searchData && searchCallType === 'searchByMatricule') {
            // Populate form with found employee data
            if (searchData) {
                const foundEmployee = searchData as GrhRensIdentification;

                // Convert year string to Date for Calendar component
                if (foundEmployee.dateNaissance) {
                    const year = parseInt(foundEmployee.dateNaissance);
                    if (!isNaN(year)) {
                        foundEmployee.dateNaissanceTemp = new Date(year, 0, 1); // January 1st of that year
                    }
                }

                // Convert dateSituation string to Date object if it exists
                if (foundEmployee.dateSituation && typeof foundEmployee.dateSituation === 'string') {
                    foundEmployee.dateSituation = new Date(foundEmployee.dateSituation);
                }

                setEmployee(foundEmployee);

                // Load and set photo preview
                setPhotoPreview(`${baseUrl}/api/grh/employees/photo/${foundEmployee.matriculeId}`);

                // Set selected dropdown values
                const situation = situations.find(s => s.situationId === foundEmployee.situationId);
                if (situation) setSelectedSituation(situation);

                const country = pays.find(p => p.paysId === foundEmployee.paysId);
                if (country) setSelectedPays(country);

                const banque = banques.find(b => b.codeBanque === foundEmployee.codeBanque);
                if (banque) setSelectedBanque(banque);

                const banque1 = banques.find(b => b.codeBanque === foundEmployee.codeBanque1);
                if (banque1) setSelectedBanque1(banque1);

                // Set cascading location selections if collineId exists
                if (foundEmployee.collineId) {
                    const colline = allCollines.find(col => col.collineId === foundEmployee.collineId);
                    if (colline) {
                        setSelectedColline(colline);

                        // Find and set the commune
                        const commune = allCommunes.find(c => c.communeId === colline.communeId);
                        if (commune) {
                            setSelectedCommune(commune);

                            // Filter collines for this commune
                            const filteredCollines = allCollines.filter(col => col.communeId === commune.communeId);
                            setCollines(filteredCollines);

                            // Find and set the province
                            const province = provinces.find(p => p.provinceId === commune.provinceId);
                            if (province) {
                                setSelectedProvince(province);

                                // Filter communes for this province
                                const filteredCommunes = allCommunes.filter(c => c.provinceId === province.provinceId);
                                setCommunes(filteredCommunes);
                            }
                        }
                    }
                }

                accept('info', 'Employé trouvé', 'Les données de l\'employé ont été chargées.');
            }
            setSearchLoading(false);
        }

        if (searchError && searchCallType === 'searchByMatricule') {
            accept('warn', 'Employé non trouvé', 'Aucun employé trouvé avec ce matricule.');
            setSearchLoading(false);
        }

        if (searchEmployeeData && searchEmployeeCallType === 'searchEmployees') {
            // Only show toast if this is new search data
            if (lastSearchDataRef.current !== searchEmployeeData) {
                lastSearchDataRef.current = searchEmployeeData;
                const searchResults = Array.isArray(searchEmployeeData) ? searchEmployeeData : [searchEmployeeData];
                setFilteredEmployees(searchResults);
                if (searchResults.length === 0) {
                    accept('info', 'Recherche', 'Aucun employé trouvé avec ce nom ou prénom.');
                } else {
                    accept('success', 'Recherche', `${searchResults.length} employé(s) trouvé(s).`);
                }
            } else {
                // Still update the filtered employees without showing toast
                const searchResults = Array.isArray(searchEmployeeData) ? searchEmployeeData : [searchEmployeeData];
                setFilteredEmployees(searchResults);
            }
        }

        if (searchEmployeeError && searchEmployeeCallType === 'searchEmployees') {
            // Only show toast if this is a new error
            if (lastSearchErrorRef.current !== searchEmployeeError) {
                lastSearchErrorRef.current = searchEmployeeError;
                accept('warn', 'Erreur de recherche', 'Erreur lors de la recherche des employés.');
            }
            setFilteredEmployees([]);
        }

        if (situationData && situationCallType === 'loadSituations') {
            setSituations(Array.isArray(situationData) ? situationData : [situationData]);
        }

        if (paysData && paysCallType === 'loadPays') {
            setPays(Array.isArray(paysData) ? paysData : [paysData]);
        }

        if (banqueData && banqueCallType === 'loadBanques') {
            setBanques(Array.isArray(banqueData) ? banqueData : [banqueData]);
        }

        if (provinceData && provinceCallType === 'loadProvinces') {
            setProvinces(Array.isArray(provinceData) ? provinceData : [provinceData]);
        }

        if (communeData && communeCallType === 'loadCommunes') {
            setAllCommunes(Array.isArray(communeData) ? communeData : [communeData]);
        }

        if (collineData && collineCallType === 'loadCollines') {
            setAllCollines(Array.isArray(collineData) ? collineData : [collineData]);
        }

        handleAfterApiCall(activeIndex);
    }, [data, searchData, searchError, searchEmployeeData, searchEmployeeError, situationData, paysData, banqueData, provinceData, communeData, collineData]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setEmployee((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleChangeEdit = (e: React.ChangeEvent<HTMLInputElement>) => {
        setEmployeeEdit((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleCalendarChange = (e: CalendarChangeEvent) => {
        setEmployee((prev) => ({ ...prev, [e.target.name as string]: e.value as Date }));
    };

    const handleCalendarChangeEdit = (e: CalendarChangeEvent) => {
        setEmployeeEdit((prev) => ({ ...prev, [e.target.name as string]: e.value as Date }));
    };

    const handlePhotoSelect = (file: File) => {
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const photoUrl = reader.result as string;
                setPhotoPreview(photoUrl);
                setPhotoFile(file);
            };
            reader.readAsDataURL(file);
        }
    };

    const handlePhotoRemove = () => {
        setPhotoPreview('');
        setPhotoFile(null);
    };

    const handlePhotoSelectEdit = (file: File) => {
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const photoUrl = reader.result as string;
                setPhotoPreviewEdit(photoUrl);
                setPhotoFileEdit(file);
            };
            reader.readAsDataURL(file);
        }
    };

    const handlePhotoRemoveEdit = () => {
        setPhotoPreviewEdit('');
        setPhotoFileEdit(null);
    };

    // Update the handleMatriculeBlur function to load photo
    const handleMatriculeBlur = (matriculeId: string) => {
        if (matriculeId.trim() === '') return;

        setSearchLoading(true);
        console.log('Searching for employee with matricule:', matriculeId);
        fetchSearchData(null, 'Get', baseUrl + '/api/grh/employees/matricule/' + matriculeId, 'searchByMatricule');
    };

    const handleDateNaissanceBlur = (date: Date | null) => {
        if (date) {
            const birthYear = date.getFullYear();
            const retirementYear = birthYear + 60;

            if (!editEmployeeDialog) {
                setEmployee((prev) => ({
                    ...prev,
                    dateNaissance: birthYear.toString(), // Store only the year
                    anneeRetraite: retirementYear.toString()
                }));
            } else {
                setEmployeeEdit((prev) => ({
                    ...prev,
                    dateNaissance: birthYear.toString(), // Store only the year
                    anneeRetraite: retirementYear.toString()
                }));
            }
        }
    };

    // const handleMatriculeBlur = (matriculeId: string) => {
    //     if (matriculeId.trim() === '') return;

    //     setSearchLoading(true);
    //     console.log('Searching for employee with matricule:', matriculeId);
    //     fetchSearchData(null, 'Get', baseUrl + '/api/grh/employees/matricule/' + matriculeId, 'searchByMatricule');
    // };

    const handleSearchEmployees = (searchValue: string) => {
        if (searchValue.trim() === '') {
            // If search is empty, show all employees
            setFilteredEmployees(employees);
            return;
        }

        console.log('Searching employees by name:', searchValue);
        fetchSearchEmployee(null, 'Get', baseUrl + '/api/grh/employees/search/name-prenom?term=' + encodeURIComponent(searchValue.trim()), 'searchEmployees');
    };

    const handleSearchByMatricule = (matricule: string) => {
        if (matricule.trim() === '') {
            // If search is empty, show all employees
            setFilteredEmployees(employees);
            return;
        }

        console.log('Searching employees by matricule:', matricule);
        fetchSearchEmployee(null, 'Get', baseUrl + '/api/grh/employees/search/matricule?matricule=' + encodeURIComponent(matricule.trim()), 'searchEmployees');
    };

    const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setSearchTerm(value);

        // Debounce search - you might want to add a proper debounce here
        const timeoutId = setTimeout(() => {
            handleSearchEmployees(value);
        }, 300);

        return () => clearTimeout(timeoutId);
    };

    const handleMatriculeSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setSearchMatricule(value);

        // Debounce search
        const timeoutId = setTimeout(() => {
            handleSearchByMatricule(value);
        }, 300);

        return () => clearTimeout(timeoutId);
    };

    // const handleSubmit = () => {
    //     setBtnLoading(true);
    //     console.log('Data sent to the backend:', employee);
    //     fetchData(employee, 'Post', baseUrl + '/grh/employees/new', 'createEmployee');
    // };

    const handleSubmit = async () => {
        // Validate form before submission - check one field at a time
        if (!employee.matriculeId || employee.matriculeId.trim() === '') {
            accept('warn', 'Attention', 'Le matricule est obligatoire');
            return;
        }
        if (!employee.nom || employee.nom.trim() === '') {
            accept('warn', 'Attention', 'Le nom est obligatoire');
            return;
        }
        if (!employee.prenom || employee.prenom.trim() === '') {
            accept('warn', 'Attention', 'Le prénom est obligatoire');
            return;
        }
        if (!employee.sexe || employee.sexe.trim() === '') {
            accept('warn', 'Attention', 'Le genre est obligatoire');
            return;
        }
        if (!employee.dateNaissance || employee.dateNaissance.trim() === '') {
            accept('warn', 'Attention', 'La date de naissance est obligatoire');
            return;
        }
        if (!employee.paysId || employee.paysId.trim() === '') {
            accept('warn', 'Attention', 'Le pays de naissance est obligatoire');
            return;
        }
        if (!employee.collineId || employee.collineId.trim() === '') {
            accept('warn', 'Attention', 'La colline de naissance est obligatoire');
            return;
        }
        if (!employee.situationId || employee.situationId.trim() === '') {
            accept('warn', 'Attention', 'La situation est obligatoire');
            return;
        }
         if (!employee.cin || employee.cin.trim() === '') {
            accept('warn', 'Attention', 'La CNI (Carte Nationale d\'Identité) est obligatoire');
            return;
        }

        setBtnLoading(true);

        try {
            // Prepare employee data - remove temporary fields
            const { dateNaissanceTemp, ...employeeData } = employee;

            // First save employee data (photo field will be ignored by backend due to @JsonIgnore)
            const response = await fetch(`${baseUrl}/api/grh/employees/new`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(employeeData)
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText || 'Failed to save employee');
            }

            // Then upload photo if exists
            if (photoFile) {
                const formData = new FormData();
                formData.append('file', photoFile);

                const photoResponse = await fetch(
                    `${baseUrl}/api/grh/employees/photo/upload/${employee.matriculeId}`,
                    {
                        method: 'POST',
                        body: formData
                    }
                );

                if (!photoResponse.ok) {
                    console.error('Failed to upload photo');
                    accept('warn', 'Attention', 'Employé enregistré mais échec du téléchargement de la photo.');
                } else {
                    accept('success', 'Succès', 'L\'employé et la photo ont été enregistrés avec succès.');
                }
            } else {
                accept('success', 'Succès', 'L\'employé a été enregistré avec succès.');
            }

            setEmployee(new GrhRensIdentification());
            setPhotoPreview('');
            setPhotoFile(null);
            setSelectedSituation(null);
            setSelectedPays(null);
            setSelectedBanque(null);
            setSelectedBanque1(null);
            setSelectedProvince(null);
            setSelectedCommune(null);
            setSelectedColline(null);
        } catch (error) {
            console.error('Error saving employee:', error);
            accept('error', 'Erreur', error instanceof Error ? error.message : 'L\'enregistrement a échoué.');
        } finally {
            setBtnLoading(false);
        }
    };

    const handleSubmitEdit = async () => {
        // Validate form before submission - check one field at a time
        if (!employeeEdit.matriculeId || employeeEdit.matriculeId.trim() === '') {
            accept('warn', 'Attention', 'Le matricule est obligatoire');
            return;
        }
        if (!employeeEdit.nom || employeeEdit.nom.trim() === '') {
            accept('warn', 'Attention', 'Le nom est obligatoire');
            return;
        }
        if (!employeeEdit.prenom || employeeEdit.prenom.trim() === '') {
            accept('warn', 'Attention', 'Le prénom est obligatoire');
            return;
        }
        if (!employeeEdit.sexe || employeeEdit.sexe.trim() === '') {
            accept('warn', 'Attention', 'Le genre est obligatoire');
            return;
        }
        if (!employeeEdit.dateNaissance || employeeEdit.dateNaissance.trim() === '') {
            accept('warn', 'Attention', 'La date de naissance est obligatoire');
            return;
        }
        if (!employeeEdit.paysId || employeeEdit.paysId.trim() === '') {
            accept('warn', 'Attention', 'Le pays de naissance est obligatoire');
            return;
        }
        if (!employeeEdit.cin || employeeEdit.cin.trim() === '') {
            accept('warn', 'Attention', 'La CNI (Carte Nationale d\'Identité) est obligatoire');
            return;
        }
        if (!employeeEdit.situationId || employeeEdit.situationId.trim() === '') {
            accept('warn', 'Attention', 'La situation est obligatoire');
            return;
        }

        setBtnLoading(true);

        try {
            // Prepare employee data - remove temporary fields
            const { dateNaissanceTemp, ...employeeData } = employeeEdit;

            // Update employee data
            const response = await fetch(`${baseUrl}/api/grh/employees/update/${employeeEdit.matriculeId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(employeeData)
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText || 'Failed to update employee');
            }

            // Upload photo if changed
            if (photoFileEdit) {
                const formData = new FormData();
                formData.append('file', photoFileEdit);

                const photoResponse = await fetch(
                    `${baseUrl}/api/grh/employees/photo/upload/${employeeEdit.matriculeId}`,
                    {
                        method: 'POST',
                        body: formData
                    }
                );

                if (!photoResponse.ok) {
                    console.error('Failed to upload photo');
                    accept('warn', 'Attention', 'Employé modifié mais échec du téléchargement de la photo.');
                } else {
                    accept('success', 'Succès', 'L\'employé et la photo ont été modifiés avec succès.');
                }
            } else {
                accept('success', 'Succès', 'L\'employé a été modifié avec succès.');
            }

            // Close dialog and refresh list
            setEditEmployeeDialog(false);
            setEmployeeEdit(new GrhRensIdentification());
            setPhotoPreviewEdit('');
            setPhotoFileEdit(null);

            // Reload the employee list
            loadAllData();
        } catch (error) {
            console.error('Error updating employee:', error);
            accept('error', 'Erreur', error instanceof Error ? error.message : 'La mise à jour a échoué.');
        } finally {
            setBtnLoading(false);
        }
    };

    const handleAfterApiCall = (chosenTab: number) => {
        if (error !== null && chosenTab === 0) {
            if (callType !== 'updateEmployee')
                accept('warn', 'A votre attention', 'L\'enregistrement n\'a pas été effectué.');
            else if (callType === 'updateEmployee')
                accept('warn', 'A votre attention', 'La mise à jour n\'a pas été effectuée.');
        }
        else if (error !== null && chosenTab === 1)
            accept('warn', 'A votre attention', 'Impossible de charger la liste des employés.');
        else if (data !== null && error === null) {
            if (callType === 'createEmployee') {
                setEmployee(new GrhRensIdentification());
                accept('info', 'OK', 'L\'enregistrement a été effectué avec succès.');
            } else if (callType === 'updateEmployee') {
                accept('info', 'OK', 'La modification a été effectuée avec succès.');
                setEmployeeEdit(new GrhRensIdentification());
                setEditEmployeeDialog(false);
                loadAllData();
            }
        }
        setBtnLoading(false);
    };

    const clearFilterEmployee = () => {
        setSearchTerm('');
        setSearchMatricule('');
        setFilteredEmployees(employees);
    };

    const loadEmployeeToEdit = (data: GrhRensIdentification) => {
        if (data) {
            // Convert year string to Date for Calendar component
            if (data.dateNaissance) {
                const year = parseInt(data.dateNaissance);
                if (!isNaN(year)) {
                    data.dateNaissanceTemp = new Date(year, 0, 1); // January 1st of that year
                }
            }

            // Convert dateSituation string to Date object if it exists
            if (data.dateSituation && typeof data.dateSituation === 'string') {
                data.dateSituation = new Date(data.dateSituation);
            }

            setEditEmployeeDialog(true);
            setEmployeeEdit(data);

            // Load photo preview for edit mode
            setPhotoPreviewEdit(`${baseUrl}/api/grh/employees/photo/${data.matriculeId}`);

            // Set selected dropdown values for edit mode
            const situation = situations.find(s => s.situationId === data.situationId);
            if (situation) setSelectedSituation(situation);

            const country = pays.find(p => p.paysId === data.paysId);
            if (country) setSelectedPays(country);

            const banque = banques.find(b => b.codeBanque === data.codeBanque);
            if (banque) setSelectedBanque(banque);

            const banque1 = banques.find(b => b.codeBanque === data.codeBanque1);
            if (banque1) setSelectedBanque1(banque1);

            // Set cascading location selections if collineId exists
            if (data.collineId) {
                const colline = allCollines.find(col => col.collineId === data.collineId);
                if (colline) {
                    setSelectedColline(colline);

                    // Find and set the commune
                    const commune = allCommunes.find(c => c.communeId === colline.communeId);
                    if (commune) {
                        setSelectedCommune(commune);

                        // Filter collines for this commune
                        const filteredCollines = allCollines.filter(col => col.communeId === commune.communeId);
                        setCollines(filteredCollines);

                        // Find and set the province
                        const province = provinces.find(p => p.provinceId === commune.provinceId);
                        if (province) {
                            setSelectedProvince(province);

                            // Filter communes for this province
                            const filteredCommunes = allCommunes.filter(c => c.provinceId === province.provinceId);
                            setCommunes(filteredCommunes);
                        }
                    }
                }
            }
        }
    };

    const optionButtons = (data: any, options: any): React.ReactNode => {
        return (
            <div className='flex flex-wrap gap-2'>
                <Button icon="pi pi-pencil" onClick={() => loadEmployeeToEdit(data)} raised severity='warning' />
                {/* <Button icon="pi pi-trash" raised severity='danger' /> */}
            </div>
        );
    };

    const loadAllData = () => {
        fetchData(null, 'Get', baseUrl + '/api/grh/employees/findall', 'loadEmployees');
    };

    const loadAllSituations = () => {
        fetchSituations(null, 'Get', baseUrl + '/situations/findall', 'loadSituations');
    };

    const loadAllPays = () => {
        fetchPays(null, 'Get', baseUrl + '/pays/findall', 'loadPays');
    };

    const loadAllBanques = () => {
        fetchBanques(null, 'Get', baseUrl + '/banques/findall', 'loadBanques');
    };

    const loadAllProvinces = () => {
        fetchProvinces(null, 'Get', baseUrl + '/provinces/findall', 'loadProvinces');
    };

    const loadAllCommunes = () => {
        fetchCommunes(null, 'Get', baseUrl + '/communes/findall', 'loadCommunes');
    };

    const loadAllCollines = () => {
        fetchCollines(null, 'Get', baseUrl + '/collines/findall', 'loadCollines');
    };

    const tableChangeHandle = (e: TabViewTabChangeEvent) => {
        // Determine the actual tab based on which tabs are visible
        // If only Consultation is visible, it's at index 0
        // If both are visible, Consultation is at index 1
        const isConsultationTab = canViewNouveauTab ? e.index === 1 : e.index === 0;

        if (isConsultationTab) {
            loadAllData();
        } else {
            setEmployee(new GrhRensIdentification());
        }
        setActiveIndex(e.index);
    };

    const onDropdownSelect = (e: DropdownChangeEvent) => {
        const fieldName = e.target.name;
        const value = e.target.value;

        if (fieldName === 'situationId') {
            const situation = situations.find(s => s.situationId === value);
            if (!editEmployeeDialog) {
                setEmployee((prev) => ({ ...prev, [fieldName]: value }));
                setSelectedSituation(situation || null);
            } else {
                setEmployeeEdit((prev) => ({ ...prev, [fieldName]: value }));
                setSelectedSituation(situation || null);
            }
        } else if (fieldName === 'paysId') {
            const country = pays.find(p => p.paysId === value);
            if (!editEmployeeDialog) {
                setEmployee((prev) => ({ ...prev, [fieldName]: value }));
                setSelectedPays(country || null);
            } else {
                setEmployeeEdit((prev) => ({ ...prev, [fieldName]: value }));
                setSelectedPays(country || null);
            }
        } else if (fieldName === 'codeBanque') {
            const banque = banques.find(b => b.codeBanque === value);
            if (!editEmployeeDialog) {
                setEmployee((prev) => ({ ...prev, [fieldName]: value }));
                setSelectedBanque(banque || null);
            } else {
                setEmployeeEdit((prev) => ({ ...prev, [fieldName]: value }));
                setSelectedBanque(banque || null);
            }
        } else if (fieldName === 'codeBanque1') {
            const banque = banques.find(b => b.codeBanque === value);
            if (!editEmployeeDialog) {
                setEmployee((prev) => ({ ...prev, [fieldName]: value }));
                setSelectedBanque1(banque || null);
            } else {
                setEmployeeEdit((prev) => ({ ...prev, [fieldName]: value }));
                setSelectedBanque1(banque || null);
            }
        } else if (fieldName === 'provinceId') {
            // Handle province selection - filter communes and reset commune/colline
            const province = provinces.find(p => p.provinceId === value);
            setSelectedProvince(province || null);

            // Filter communes based on selected province
            const filteredCommunes = allCommunes.filter(c => c.provinceId === value);
            setCommunes(filteredCommunes);

            // Reset commune and colline selections
            setSelectedCommune(null);
            setSelectedColline(null);
            setCollines([]);

            if (!editEmployeeDialog) {
                setEmployee((prev) => ({ ...prev, communeId: '', collineId: '' }));
            } else {
                setEmployeeEdit((prev) => ({ ...prev, communeId: '', collineId: '' }));
            }
        } else if (fieldName === 'communeId') {
            // Handle commune selection - filter collines and reset colline
            const commune = communes.find(c => c.communeId === value);
            setSelectedCommune(commune || null);

            // Filter collines based on selected commune
            const filteredCollines = allCollines.filter(col => col.communeId === value);
            setCollines(filteredCollines);

            // Reset colline selection
            setSelectedColline(null);

            if (!editEmployeeDialog) {
                setEmployee((prev) => ({ ...prev, collineId: '' }));
            } else {
                setEmployeeEdit((prev) => ({ ...prev, collineId: '' }));
            }
        } else if (fieldName === 'collineId') {
            // Handle colline selection - save to employee
            const colline = collines.find(col => col.collineId === value);
            setSelectedColline(colline || null);

            if (!editEmployeeDialog) {
                setEmployee((prev) => ({ ...prev, [fieldName]: value }));
            } else {
                setEmployeeEdit((prev) => ({ ...prev, [fieldName]: value }));
            }
        } else {
            // Handle other dropdown fields like sexe
            if (!editEmployeeDialog) {
                setEmployee((prev) => ({ ...prev, [fieldName]: value }));
            } else {
                setEmployeeEdit((prev) => ({ ...prev, [fieldName]: value }));
            }
        }
    };

    const renderSearch = () => {
        return (
            <div className="flex justify-content-between align-items-center flex-wrap gap-2">
                <Button type="button" icon="pi pi-refresh" label="Réinitialiser" outlined onClick={clearFilterEmployee} />
                <div className="flex gap-2 flex-wrap">
                    <span className="p-input-icon-left">
                        <i className="pi pi-search" />
                        <InputText
                            placeholder="Recherche par Nom ou Prénom"
                            value={searchTerm}
                            onChange={handleSearchInputChange}
                        />
                    </span>
                    <span className="p-input-icon-left">
                        <i className="pi pi-id-card" />
                        <InputText
                            placeholder="Recherche par Matricule"
                            value={searchMatricule}
                            onChange={handleMatriculeSearchChange}
                        />
                    </span>
                </div>
            </div>
        );
    };

    const getSexeLabel = (sexe: string) => {
        return sexe === 'M' ? 'Masculin' : sexe === 'F' ? 'Féminin' : sexe;
    };

    const getSituationLabel = (situationId: string) => {
        const situation = situations.find(s => s.situationId === situationId);
        return situation ? situation.libelle : situationId;
    };

    const getPaysLabel = (paysId: string) => {
        const country = pays.find(p => p.paysId === paysId);
        return country ? country.nomPays : paysId;
    };

    const getBanqueLabel = (codeBanque: string) => {
        const banque = banques.find(b => b.codeBanque === codeBanque);
        return banque ? banque.libelleBanque : codeBanque;
    };

    return (
        <>
            <Toast ref={toast} />
            <Dialog
                header="Modifier Employé"
                visible={editEmployeeDialog}
                style={{ width: '80vw' }}
                modal
                onHide={() => setEditEmployeeDialog(false)}
            >
                <GrhRensIdentificationForm
                    employee={employeeEdit}
                    situations={situations}
                    pays={pays}
                    banques={banques}
                    provinces={provinces}
                    communes={communes}
                    collines={collines}
                    selectedSituation={selectedSituation}
                    selectedPays={selectedPays}
                    selectedBanque={selectedBanque}
                    selectedBanque1={selectedBanque1}
                    selectedProvince={selectedProvince}
                    selectedCommune={selectedCommune}
                    selectedColline={selectedColline}
                    handleChange={handleChangeEdit}
                    handleDropDownSelect={onDropdownSelect}
                    handleCalendarChange={handleCalendarChangeEdit}
                    handleDateNaissanceBlur={handleDateNaissanceBlur}
                    handlePhotoSelect={handlePhotoSelectEdit}
                    handlePhotoRemove={handlePhotoRemoveEdit}
                    photoPreview={photoPreviewEdit}
                    isEditMode={true}
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
                {canViewNouveauTab && (
                    <TabPanel header="Nouveau">
                        <GrhRensIdentificationForm
                            employee={employee}
                            situations={situations}
                            pays={pays}
                            banques={banques}
                            provinces={provinces}
                            communes={communes}
                            collines={collines}
                            selectedSituation={selectedSituation}
                            selectedPays={selectedPays}
                            selectedBanque={selectedBanque}
                            selectedBanque1={selectedBanque1}
                            selectedProvince={selectedProvince}
                            selectedCommune={selectedCommune}
                            selectedColline={selectedColline}
                            handleChange={handleChange}
                            handleDropDownSelect={onDropdownSelect}
                            handleCalendarChange={handleCalendarChange}
                            handleMatriculeBlur={handleMatriculeBlur}
                            handleDateNaissanceBlur={handleDateNaissanceBlur}
                            handlePhotoSelect={handlePhotoSelect}
                            handlePhotoRemove={handlePhotoRemove}
                            photoPreview={photoPreview}
                            isEditMode={false}
                        />
                        <div className="card p-fluid">
                            <div className="formgrid grid">
                                <div className="md:col-offset-3 md:field md:col-3">
                                    <Button
                                        icon="pi pi-refresh"
                                        outlined
                                        label="Réinitialiser"
                                        onClick={() => setEmployee(new GrhRensIdentification())}
                                    />
                                </div>
                                <div className="md:field md:col-3">
                                    <Button
                                        icon="pi pi-check"
                                        label="Enregistrer"
                                        loading={btnLoading || searchLoading}
                                        onClick={handleSubmit}
                                    />
                                </div>
                            </div>
                        </div>
                    </TabPanel>
                )}
                {canViewConsultationTab && (
                    <TabPanel header="Consultation">
                        <div className='grid'>
                            <div className='col-12'>
                                <div className='card'>
                                    <DataTable
                                        value={filteredEmployees}
                                        header={renderSearch}
                                        emptyMessage={"Pas d'employés à afficher"}
                                        paginator
                                        rows={10}
                                        rowsPerPageOptions={[10, 20, 30]}
                                    >
                                        <Column field="matriculeId" header="Matricule" sortable />
                                        <Column field="nom" header="Nom" sortable />
                                        <Column field="prenom" header="Prénom" sortable />
                                        <Column
                                            field="sexe"
                                            header="Sexe"
                                            body={(rowData) => getSexeLabel(rowData.sexe)}
                                            sortable
                                        />
                                        <Column
                                            field="situationId"
                                            header="Situation"
                                            body={(rowData) => getSituationLabel(rowData.situationId)}
                                            sortable
                                        />
                                        <Column
                                            field="paysId"
                                            header="Pays"
                                            body={(rowData) => getPaysLabel(rowData.paysId)}
                                            sortable
                                        />
                                        <Column field="cin" header="CIN" sortable />
                                        <Column field="numINSS" header="INSS" sortable />
                                        <Column header="Options" body={optionButtons} />
                                    </DataTable>
                                </div>
                            </div>
                        </div>
                    </TabPanel>
                )}
            </TabView>
        </>
    );
};

export default GrhRensIdentificationComponent;