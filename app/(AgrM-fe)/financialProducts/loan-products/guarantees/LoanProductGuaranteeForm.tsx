"use client";
import React, { useEffect, useState } from "react";
import { Dialog } from "primereact/dialog";
import { InputNumber } from "primereact/inputnumber";
import { Dropdown } from "primereact/dropdown";
import { Checkbox } from "primereact/checkbox";
import { Button } from "primereact/button";
import { Divider } from "primereact/divider";
import { LoanProductGuarantee } from "./LoanProductGuarantee";
import useConsumApi from "@/hooks/fetchData/useConsumApi";

interface LoanProductGuaranteeFormProps {
  visible: boolean;
  onHide: () => void;
  loanProductGuarantee: LoanProductGuarantee | null;
  onSave: (loanProductGuarantee: LoanProductGuarantee) => void;
  productId: number;
  internalAccounts: any[];
}

const LoanProductGuaranteeForm: React.FC<LoanProductGuaranteeFormProps> = ({
  visible,
  onHide,
  loanProductGuarantee,
  onSave,
  productId,
  internalAccounts,
}) => {
  const [formData, setFormData] = useState<LoanProductGuarantee>(new LoanProductGuarantee());
  const [submitted, setSubmitted] = useState(false);
  const [guaranteeTypes, setGuaranteeTypes] = useState<any[]>([]);

  const { processRequest: loadGuaranteeTypes } = useConsumApi();

  useEffect(() => {
    if (loanProductGuarantee) {
      setFormData({ ...loanProductGuarantee });
    } else {
      const newGuarantee = new LoanProductGuarantee();
      newGuarantee.productId = productId;
      setFormData(newGuarantee);
    }
    setSubmitted(false);
  }, [loanProductGuarantee, visible, productId]);

  useEffect(() => {
    loadGuaranteeTypesData();
  }, []);

  const loadGuaranteeTypesData = async () => {
    try {
      const response = await loadGuaranteeTypes({
        route: "/api/financial-products/reference/loan-guarantee-types/findall",
        method: "GET",
      });

      if (response?.data) {
        setGuaranteeTypes(response.data);
      }
    } catch (error) {
      console.error("Erreur lors du chargement des types de garantie:", error);
    }
  };

  const handleChange = (field: keyof LoanProductGuarantee, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
    setSubmitted(true);

    if (!formData.guaranteeTypeId) {
      return;
    }

    onSave(formData);
  };

  const renderDialogFooter = () => {
    return (
      <div>
        <Button
          label="Annuler"
          icon="pi pi-times"
          className="p-button-text"
          onClick={onHide}
        />
        <Button
          label="Enregistrer"
          icon="pi pi-check"
          onClick={handleSubmit}
        />
      </div>
    );
  };

  return (
    <Dialog
      visible={visible}
      style={{ width: "50vw" }}
      header={
        loanProductGuarantee?.id
          ? "Modifier Garantie de Produit"
          : "Nouvelle Garantie de Produit"
      }
      modal
      className="p-fluid"
      footer={renderDialogFooter()}
      onHide={onHide}
    >
      <div className="p-fluid">
        {/* Section 1: Configuration de Garantie */}
        <Divider>
          <span className="p-tag">Configuration de Garantie</span>
        </Divider>

        <div className="field grid">
          <label htmlFor="guaranteeTypeId" className="col-12 mb-2 md:col-3 md:mb-0">
            Type de Garantie *
          </label>
          <div className="col-12 md:col-9">
            <Dropdown
              id="guaranteeTypeId"
              value={formData.guaranteeTypeId}
              options={guaranteeTypes}
              onChange={(e) => handleChange("guaranteeTypeId", e.value)}
              optionLabel="nameFr"
              optionValue="id"
              placeholder="Sélectionner"
              className={submitted && !formData.guaranteeTypeId ? "p-invalid" : ""}
            />
            {submitted && !formData.guaranteeTypeId && (
              <small className="p-error">Type de garantie requis</small>
            )}
          </div>
        </div>

        <div className="field grid">
          <label htmlFor="minCoveragePercentage" className="col-12 mb-2 md:col-3 md:mb-0">
            Pourcentage de Couverture Minimum
          </label>
          <div className="col-12 md:col-9">
            <InputNumber
              id="minCoveragePercentage"
              value={formData.minCoveragePercentage || 0}
              onValueChange={(e) => handleChange("minCoveragePercentage", e.value || 0)}
              suffix="%"
              min={0}
              max={100}
            />
          </div>
        </div>

        <div className="field grid">
          <label htmlFor="internalAccountId" className="col-12 mb-2 md:col-3 md:mb-0">
            Compte Interne
          </label>
          <div className="col-12 md:col-9">
            <Dropdown
              id="internalAccountId"
              value={formData.internalAccountId || null}
              options={internalAccounts}
              onChange={(e) => handleChange("internalAccountId", e.value)}
              optionLabel="libelle"
              optionValue="accountId"
              placeholder="Sélectionner un compte interne"
              filter
              filterPlaceholder="Rechercher..."
              showClear
              itemTemplate={(option) => (
                <div className="flex align-items-center gap-2">
                  <span className="font-mono text-xs text-500">{option.codeCompte}</span>
                  <span>{option.libelle}</span>
                </div>
              )}
            />
          </div>
        </div>

        <div className="field grid">
          <label className="col-12 mb-2 md:col-3 md:mb-0">
            Obligatoire
          </label>
          <div className="col-12 md:col-9">
            <Checkbox
              inputId="isMandatory"
              checked={formData.isMandatory}
              onChange={(e) => handleChange("isMandatory", e.checked)}
            />
          </div>
        </div>

        <div className="field grid">
          <label className="col-12 mb-2 md:col-3 md:mb-0">
            Actif
          </label>
          <div className="col-12 md:col-9">
            <Checkbox
              inputId="isActive"
              checked={formData.isActive}
              onChange={(e) => handleChange("isActive", e.checked)}
            />
          </div>
        </div>
      </div>
    </Dialog>
  );
};

export default LoanProductGuaranteeForm;
