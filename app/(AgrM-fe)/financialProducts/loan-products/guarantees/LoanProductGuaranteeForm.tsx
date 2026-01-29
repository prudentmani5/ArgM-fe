"use client";
import React, { useEffect, useState } from "react";
import { Dialog } from "primereact/dialog";
import { InputNumber } from "primereact/inputnumber";
import { InputTextarea } from "primereact/inputtextarea";
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
}

const LoanProductGuaranteeForm: React.FC<LoanProductGuaranteeFormProps> = ({
  visible,
  onHide,
  loanProductGuarantee,
  onSave,
  productId,
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
        route: "/api/financial-products/reference/guarantee-types/findall",
        method: "GET",
      });

      if (response?.data) {
        setGuaranteeTypes(response.data);
      }
    } catch (error) {
      console.error("Error loading guarantee types:", error);
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
          label="Cancel / Annuler"
          icon="pi pi-times"
          className="p-button-text"
          onClick={onHide}
        />
        <Button
          label="Save / Enregistrer"
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
          ? "Edit Loan Product Guarantee / Modifier Garantie de Produit"
          : "New Loan Product Guarantee / Nouvelle Garantie de Produit"
      }
      modal
      className="p-fluid"
      footer={renderDialogFooter()}
      onHide={onHide}
    >
      <div className="p-fluid">
        {/* Section 1: Guarantee Configuration */}
        <Divider>
          <span className="p-tag">Guarantee Configuration / Configuration de Garantie</span>
        </Divider>

        <div className="field grid">
          <label htmlFor="guaranteeTypeId" className="col-12 mb-2 md:col-3 md:mb-0">
            Guarantee Type / Type de Garantie *
          </label>
          <div className="col-12 md:col-9">
            <Dropdown
              id="guaranteeTypeId"
              value={formData.guaranteeTypeId}
              options={guaranteeTypes}
              onChange={(e) => handleChange("guaranteeTypeId", e.value)}
              optionLabel="typeName"
              optionValue="id"
              placeholder="Select / Sélectionner"
              className={submitted && !formData.guaranteeTypeId ? "p-invalid" : ""}
            />
            {submitted && !formData.guaranteeTypeId && (
              <small className="p-error">
                Guarantee type is required / Type de garantie requis
              </small>
            )}
          </div>
        </div>

        <div className="field grid">
          <label className="col-12 mb-2 md:col-3 md:mb-0">
            Is Required / Est Requis
          </label>
          <div className="col-12 md:col-9">
            <Checkbox
              inputId="isRequired"
              checked={formData.isRequired}
              onChange={(e) => handleChange("isRequired", e.checked)}
            />
          </div>
        </div>

        {/* Section 2: Value Configuration */}
        <Divider>
          <span className="p-tag">Value Configuration / Configuration de Valeur</span>
        </Divider>

        <div className="field grid">
          <label htmlFor="minValue" className="col-12 mb-2 md:col-3 md:mb-0">
            Minimum Value / Valeur Minimum
          </label>
          <div className="col-12 md:col-9">
            <InputNumber
              id="minValue"
              value={formData.minValue || 0}
              onValueChange={(e) => handleChange("minValue", e.value || 0)}
              mode="currency"
              currency="BIF"
              locale="fr-BI"
            />
          </div>
        </div>

        <div className="field grid">
          <label htmlFor="maxValue" className="col-12 mb-2 md:col-3 md:mb-0">
            Maximum Value / Valeur Maximum
          </label>
          <div className="col-12 md:col-9">
            <InputNumber
              id="maxValue"
              value={formData.maxValue || 0}
              onValueChange={(e) => handleChange("maxValue", e.value || 0)}
              mode="currency"
              currency="BIF"
              locale="fr-BI"
            />
          </div>
        </div>

        {/* Section 3: Description */}
        <Divider>
          <span className="p-tag">Description</span>
        </Divider>

        <div className="field grid">
          <label htmlFor="description" className="col-12 mb-2 md:col-3 md:mb-0">
            Description (EN)
          </label>
          <div className="col-12 md:col-9">
            <InputTextarea
              id="description"
              value={formData.description || ""}
              onChange={(e) => handleChange("description", e.target.value)}
              rows={3}
            />
          </div>
        </div>

        <div className="field grid">
          <label htmlFor="descriptionFr" className="col-12 mb-2 md:col-3 md:mb-0">
            Description (FR)
          </label>
          <div className="col-12 md:col-9">
            <InputTextarea
              id="descriptionFr"
              value={formData.descriptionFr || ""}
              onChange={(e) => handleChange("descriptionFr", e.target.value)}
              rows={3}
            />
          </div>
        </div>
      </div>
    </Dialog>
  );
};

export default LoanProductGuaranteeForm;
