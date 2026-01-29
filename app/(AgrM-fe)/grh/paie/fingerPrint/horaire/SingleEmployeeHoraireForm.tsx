'use client';

import { Calendar, CalendarChangeEvent } from "primereact/calendar";
import { InputText } from "primereact/inputtext";
import { Dropdown, DropdownChangeEvent } from "primereact/dropdown";
import { HoraireDateRange, EmployeeWithHoraire, ShiftGroupe } from "./HoraireEmploye";

interface SingleEmployeeHoraireFormProps {
    matricule: string;
    horaireDates: HoraireDateRange;
    currentEmployeeData: EmployeeWithHoraire | null;
    selectedGroupeId: string;
    shiftGroupes: ShiftGroupe[];
    searchLoading: boolean;
    handleMatriculeChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    handleCalendarChange: (e: CalendarChangeEvent) => void;
    handleMatriculeBlur: (matricule: string) => void;
    handleGroupeChange: (e: DropdownChangeEvent) => void;
}

const SingleEmployeeHoraireForm: React.FC<SingleEmployeeHoraireFormProps> = ({ 
    matricule, 
    horaireDates, 
    currentEmployeeData, 
    selectedGroupeId,
    shiftGroupes,
    searchLoading,
    handleMatriculeChange, 
    handleCalendarChange,
    handleMatriculeBlur,
    handleGroupeChange
}) => {

    const getGroupeLabel = (groupeId: string): string => {
        const groupe = shiftGroupes.find(g => g.groupeId === groupeId);
        return groupe ? `${groupe.libelle} (${groupe.heureDebut} - ${groupe.heureFin})` : `Groupe ${groupeId}`;
    };

    const getGroupeDescription = (groupeId: string): string => {
        const groupe = shiftGroupes.find(g => g.groupeId === groupeId);
        return groupe ? `Horaires: ${groupe.heureDebut} - ${groupe.heureFin}` : '';
    };

    const formatDate = (date: Date | string): string => {
        if (!date) return '';
        const d = new Date(date);
        return d.toLocaleDateString('fr-FR');
    };

    // Create dropdown options from ShiftGroupe data
    const groupeOptions = shiftGroupes.map(groupe => ({
        label: `${groupe.libelle} (${groupe.heureDebut} - ${groupe.heureFin})`,
        value: groupe.groupeId
    }));

    return (
        <div className="card p-fluid">
            <div className="formgrid grid">
                <div className="field col-12 md:col-3">
                    <label htmlFor="matricule">Matricule Employé *</label>
                    <InputText
                        id="matricule"
                        name="matricule"
                        value={matricule}
                        onChange={handleMatriculeChange}
                        onBlur={(e) => {
                            if (e.target.value.trim()) {
                                handleMatriculeBlur(e.target.value.trim());
                            }
                        }}
                        placeholder="Entrez le matricule"
                        className={searchLoading ? 'p-inputtext-loading' : ''}
                    />
                    {searchLoading && (
                        <small className="text-primary">
                            <i className="pi pi-spin pi-spinner mr-1"></i>
                            Recherche en cours...
                        </small>
                    )}
                </div>

                <div className="field col-12 md:col-3">
                    <label htmlFor="groupeId">Nouveau Groupe *</label>
                    <Dropdown
                        id="groupeId"
                        name="groupeId"
                        value={selectedGroupeId}
                        options={groupeOptions}
                        optionLabel="label"
                        optionValue="value"
                        onChange={handleGroupeChange}
                        placeholder="Sélectionner un groupe"
                        disabled={!currentEmployeeData}
                    />
                </div>

                <div className="field col-12 md:col-3">
                    <label htmlFor="dateDebutD">Date Début *</label>
                    <Calendar
                        id="dateDebutD"
                        name="dateDebutD"
                        value={horaireDates.dateDebutD}
                        onChange={handleCalendarChange}
                        showIcon
                        dateFormat="dd/mm/yy"
                        placeholder="Sélectionnez la date de début"
                    />
                </div>

                <div className="field col-12 md:col-3">
                    <label htmlFor="dateFinD">Date Fin *</label>
                    <Calendar
                        id="dateFinD"
                        name="dateFinD"
                        value={horaireDates.dateFinD}
                        onChange={handleCalendarChange}
                        showIcon
                        dateFormat="dd/mm/yy"
                        placeholder="Sélectionnez la date de fin"
                    />
                </div>
            </div>

            {currentEmployeeData && (
                <div className="mt-4">
                    <h4>Informations de l'Employé</h4>
                    
                    {/* Employee Personal Information */}
                    <div className="card bg-blue-50 p-3 mb-3">
                        <h5 className="text-blue-800 mb-2">
                            <i className="pi pi-user mr-2"></i>
                            Informations Personnelles
                        </h5>
                        <div className="grid">
                            <div className="col-12 md:col-4">
                                <p><strong>Matricule:</strong> {currentEmployeeData.horaire.matriculeId}</p>
                            </div>
                            <div className="col-12 md:col-4">
                                <p><strong>Nom:</strong> {currentEmployeeData.nom}</p>
                            </div>
                            <div className="col-12 md:col-4">
                                <p><strong>Prénom:</strong> {currentEmployeeData.prenom}</p>
                            </div>
                        </div>
                    </div>

                    <div className="grid">
                        <div className="col-12 md:col-6">
                            <div className="card bg-orange-50 p-3">
                                <h5 className="text-orange-800 mb-2">
                                    <i className="pi pi-clock mr-2"></i>
                                    Horaire Actuel
                                </h5>
                                <p><strong>Service:</strong> {currentEmployeeData.horaire.serviceId}</p>
                                <p><strong>Groupe Actuel:</strong> {getGroupeLabel(currentEmployeeData.horaire.groupeId)}</p>
                                <p><strong>Période Actuelle:</strong> {formatDate(currentEmployeeData.horaire.dateDebut)} - {formatDate(currentEmployeeData.horaire.dateFin)}</p>
                                <p><strong>Numéro Ordre:</strong> {currentEmployeeData.horaire.numeroOrdre}</p>
                            </div>
                        </div>
                        <div className="col-12 md:col-6">
                            <div className="card bg-green-50 p-3">
                                <h5 className="text-green-800 mb-2">
                                    <i className="pi pi-arrow-right mr-2"></i>
                                    Nouveau Horaire
                                </h5>
                                <p><strong>Service:</strong> {currentEmployeeData.horaire.serviceId}</p>
                                <p><strong>Nouveau Groupe:</strong> 
                                    <span className="text-green-700 font-bold">
                                        {selectedGroupeId ? getGroupeLabel(selectedGroupeId) : 'Sélectionnez un groupe'}
                                    </span>
                                </p>
                                <p><strong>Nouvelle Période:</strong>
                                    {horaireDates.dateDebutD && horaireDates.dateFinD ?
                                        `${horaireDates.dateDebutD.toLocaleDateString('fr-FR')} - ${horaireDates.dateFinD.toLocaleDateString('fr-FR')}` :
                                        'Sélectionnez les dates'
                                    }
                                </p>
                                <p><strong>Nouveau Numéro Ordre:</strong> <span className="text-green-700">Sera généré automatiquement</span></p>
                            </div>
                        </div>
                    </div>

                    {/* Group Selection Information */}
                    {selectedGroupeId && (
                        <div className="card bg-yellow-50 p-3 mt-3">
                            <h6 className="text-yellow-800 mb-2">
                                <i className="pi pi-info-circle mr-2"></i>
                                Information sur le Groupe Sélectionné
                            </h6>
                            <p className="text-yellow-700">
                                <strong>{getGroupeLabel(selectedGroupeId)}:</strong> {getGroupeDescription(selectedGroupeId)}
                            </p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default SingleEmployeeHoraireForm;