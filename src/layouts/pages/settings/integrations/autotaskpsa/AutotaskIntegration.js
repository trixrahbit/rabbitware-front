import React from "react";
import BaseIntegrationComponent from "../components/BaseIntegrationComponent";

const AutotaskIntegration = ({ onSave }) => {
  const fields = [
    { label: "Username", name: "username" },
    { label: "Password", name: "password" },
    { label: "API Endpoint", name: "apiEndpoint" },
  ];

  return (
    <BaseIntegrationComponent
      integrationName="Autotask PSA"
      fields={fields}
      onSave={onSave}
    />
  );
};

export default AutotaskIntegration;
