"use client";
import React, { useEffect, useState } from "react";
import { Dialog } from "primereact/dialog";
import { InputNumber } from "primereact/inputnumber";
import { Dropdown } from "primereact/dropdown";
import { Checkbox } from "primereact/checkbox";
import { Button } from "primereact/button";
import { Divider } from "primereact/divider";
import { LoanApprovalWorkflow } from "./LoanApprovalWorkflow";
import useConsumApi from "@/hooks/fetchData/useConsumApi";

interface LoanApprovalWorkflowFormProps {
  visible: boolean;
  onHide: () => void;
  loanApprovalWorkflow: LoanApprovalWorkflow | null;
  onSave: (loanApprovalWorkflow: LoanApprovalWorkflow) => void;
  productId: number;
}

const LoanApprovalWorkflowForm: React.FC<LoanApprovalWorkflowFormProps> = ({
  visible,
  onHide,
  loanApprovalWorkflow,
  onSave,
  productId,
}) => {
  const [formData, setFormData] = useState<LoanApprovalWorkflow>(new LoanApprovalWorkflow());
  const [submitted, setSubmitted] = useState(false);
  const [approvalLevels, setApprovalLevels] = useState<any[]>([]);

  const { processRequest: loadApprovalLevels } = useConsumApi();

  useEffect(() => {
    if (loanApprovalWorkflow) {
      setFormData({ ...loanApprovalWorkflow });
    } else {
      const newWorkflow = new LoanApprovalWorkflow();
      newWorkflow.productId = productId;
      setFormData(newWorkflow);
    }
    setSubmitted(false);
  }, [loanApprovalWorkflow, visible, productId]);

  useEffect(() => {
    loadApprovalLevelsData();
  }, []);

  const loadApprovalLevelsData = async () => {
    try {
      const response = await loadApprovalLevels({
        route: "/api/financial-products/reference/approval-levels/findall",
        method: "GET",
      });

      if (response?.data) {
        setApprovalLevels(response.data);
      }
    } catch (error) {
      console.error("Erreur lors du chargement des niveaux d'approbation:", error);
    }
  };

  const handleChange = (field: keyof LoanApprovalWorkflow, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
    setSubmitted(true);

    if (!formData.approvalLevelId || !formData.sequenceOrder) {
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
        loanApprovalWorkflow?.id
          ? "Modifier Flux d'Approbation"
          : "Nouveau Flux d'Approbation"
      }
      modal
      className="p-fluid"
      footer={renderDialogFooter()}
      onHide={onHide}
    >
      <div className="p-fluid">
        {/* Section 1: Configuration du Flux */}
        <Divider>
          <span className="p-tag">Configuration du Flux</span>
        </Divider>

        <div className="field grid">
          <label htmlFor="approvalLevelId" className="col-12 mb-2 md:col-3 md:mb-0">
            Niveau d&apos;Approbation *
          </label>
          <div className="col-12 md:col-9">
            <Dropdown
              id="approvalLevelId"
              value={formData.approvalLevelId}
              options={approvalLevels}
              onChange={(e) => handleChange("approvalLevelId", e.value)}
              optionLabel="nameFr"
              optionValue="id"
              placeholder="Sélectionner"
              className={submitted && !formData.approvalLevelId ? "p-invalid" : ""}
            />
            {submitted && !formData.approvalLevelId && (
              <small className="p-error">Niveau d&apos;approbation requis</small>
            )}
          </div>
        </div>

        <div className="field grid">
          <label htmlFor="sequenceOrder" className="col-12 mb-2 md:col-3 md:mb-0">
            Ordre de Séquence *
          </label>
          <div className="col-12 md:col-9">
            <InputNumber
              id="sequenceOrder"
              value={formData.sequenceOrder}
              onValueChange={(e) => handleChange("sequenceOrder", e.value || 1)}
              min={1}
              className={submitted && !formData.sequenceOrder ? "p-invalid" : ""}
            />
            {submitted && !formData.sequenceOrder && (
              <small className="p-error">Ordre de séquence requis</small>
            )}
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

        {/* Section 2: Plage de Montant */}
        <Divider>
          <span className="p-tag">Plage de Montant du Prêt</span>
        </Divider>

        <div className="field grid">
          <label htmlFor="minLoanAmount" className="col-12 mb-2 md:col-3 md:mb-0">
            Montant Minimum
          </label>
          <div className="col-12 md:col-9">
            <InputNumber
              id="minLoanAmount"
              value={formData.minLoanAmount || 0}
              onValueChange={(e) => handleChange("minLoanAmount", e.value || 0)}
              mode="currency"
              currency="BIF"
              locale="fr-BI"
            />
          </div>
        </div>

        <div className="field grid">
          <label htmlFor="maxLoanAmount" className="col-12 mb-2 md:col-3 md:mb-0">
            Montant Maximum
          </label>
          <div className="col-12 md:col-9">
            <InputNumber
              id="maxLoanAmount"
              value={formData.maxLoanAmount || 0}
              onValueChange={(e) => handleChange("maxLoanAmount", e.value || 0)}
              mode="currency"
              currency="BIF"
              locale="fr-BI"
            />
          </div>
        </div>
      </div>
    </Dialog>
  );
};

export default LoanApprovalWorkflowForm;
