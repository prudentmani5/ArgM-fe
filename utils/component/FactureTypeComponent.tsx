'use client';

import { Dropdown, DropdownChangeEvent } from 'primereact/dropdown';
import { FactureType } from '../../types/constantClass';

interface FactureTypeProps {
    selectedFactureType: FactureType | undefined;
    factureTypes: FactureType [],
    onchangeFactureTypeHandler: (e: DropdownChangeEvent) => void,
    componentId: string;
}

const FactureTypeCompo: React.FC<FactureTypeProps> = ({ selectedFactureType, factureTypes, onchangeFactureTypeHandler, componentId }) => {

    
    return <>
        <Dropdown id={componentId} options={factureTypes} optionLabel="label" placeholder="Choisir le type de facture" optionValue="typeId"
                  value={selectedFactureType?.typeId} onChange={onchangeFactureTypeHandler}></Dropdown>
    </>;
};

export default FactureTypeCompo;