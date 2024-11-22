import React from "react";
import BaseIntegrationComponent from "../components/BaseIntegrationComponent";

const CustomAPIIntegration = ({ onSave }) => {
  const fields = [
    { label: "API Key", name: "apiKey" },
    { label: "Header Key", name: "headerKey" },
    { label: "API Endpoint", name: "apiEndpoint" },
  ];

  return (
    <BaseIntegrationComponent
      integrationName="Custom API"
      fields={fields}
      onSave={onSave}
    />
  );
};

export default CustomAPIIntegration;
