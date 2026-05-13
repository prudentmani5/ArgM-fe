import { Button } from 'primereact/button';
import { Dropdown, DropdownChangeEvent } from 'primereact/dropdown';
import { GroupMapping, ShiftGroupe } from './HoraireEmploye';

interface ManualMappingFormProps {
    mappings: GroupMapping[];
    shiftGroupes: ShiftGroupe[];
    onMappingsChange: (mappings: GroupMapping[]) => void;
}

function ManualMappingForm({ mappings, shiftGroupes, onMappingsChange }: ManualMappingFormProps) {

    const groupeOptions = shiftGroupes.map(g => ({
        label: `${g.libelle} (${g.heureDebut} - ${g.heureFin})`,
        value: g.groupeId
    }));

    const getAvailableSourceGroups = (currentIndex: number) => {
        const usedSources = mappings
            .filter((_, idx) => idx !== currentIndex)
            .map(m => m.sourceGroupId);
        return groupeOptions.filter(opt => !usedSources.includes(opt.value));
    };

    const handleSourceChange = (index: number, e: DropdownChangeEvent) => {
        const newMappings = [...mappings];
        newMappings[index] = { ...newMappings[index], sourceGroupId: e.value };
        onMappingsChange(newMappings);
    };

    const handleTargetChange = (index: number, e: DropdownChangeEvent) => {
        const newMappings = [...mappings];
        newMappings[index] = { ...newMappings[index], targetGroupId: e.value };
        onMappingsChange(newMappings);
    };

    const addMapping = () => {
        onMappingsChange([...mappings, { sourceGroupId: '', targetGroupId: '' }]);
    };

    const removeMapping = (index: number) => {
        const newMappings = mappings.filter((_, idx) => idx !== index);
        onMappingsChange(newMappings);
    };

    const isValidMapping = (mapping: GroupMapping): boolean => {
        return mapping.sourceGroupId !== '' &&
               mapping.targetGroupId !== '' &&
               mapping.sourceGroupId !== mapping.targetGroupId;
    };

    return (
        <div className="surface-100 border-round p-3 mt-3">
            <h5 className="mt-0 mb-3">Mappings de groupes personnalisés:</h5>

            {mappings.length === 0 && (
                <p className="text-600 text-sm mb-3">
                    Aucun mapping défini. Cliquez sur "Ajouter un mapping" pour commencer.
                </p>
            )}

            {mappings.map((mapping, index) => (
                <div key={index} className="flex align-items-center gap-2 mb-2">
                    <Dropdown
                        value={mapping.sourceGroupId}
                        options={getAvailableSourceGroups(index)}
                        onChange={(e) => handleSourceChange(index, e)}
                        placeholder="Groupe source"
                        className="w-12rem"
                    />
                    <i className="pi pi-arrow-right text-primary"></i>
                    <Dropdown
                        value={mapping.targetGroupId}
                        options={groupeOptions}
                        onChange={(e) => handleTargetChange(index, e)}
                        placeholder="Groupe cible"
                        className="w-12rem"
                    />
                    <Button
                        icon="pi pi-trash"
                        severity="danger"
                        outlined
                        size="small"
                        onClick={() => removeMapping(index)}
                        tooltip="Supprimer ce mapping"
                    />
                    {mapping.sourceGroupId && mapping.targetGroupId &&
                     mapping.sourceGroupId === mapping.targetGroupId && (
                        <span className="text-red-500 text-sm ml-2">
                            Source et cible identiques
                        </span>
                    )}
                </div>
            ))}

            <Button
                icon="pi pi-plus"
                label="Ajouter un mapping"
                outlined
                size="small"
                onClick={addMapping}
                className="mt-2"
                disabled={shiftGroupes.length === 0 || mappings.length >= shiftGroupes.length}
            />

            <p className="text-600 text-sm mt-3 mb-0">
                <i className="pi pi-info-circle mr-1"></i>
                Seuls les employés des groupes sources spécifiés seront modifiés.
            </p>
        </div>
    );
}

export default ManualMappingForm;
