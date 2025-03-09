import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from 'context/AuthContext';
import MDBox from 'components/MDBox';
import ComplexStatisticsCard from 'examples/Cards/StatisticsCards/ComplexStatisticsCard';

const StatCard = () => {
  const [stats, setStats] = useState({
    totalOrganizations: 0,
    percentageChange: 0,
  });
  const { authToken, currentOrg } = useAuth();

  useEffect(() => {
    const fetchOrgStats = async () => {
      if (!currentOrg?.id) return;

      try {
        const response = await axios.get(`https://app.webitservices.com/api/${currentOrg.id}/stats`, {
          headers: { Authorization: `Bearer ${authToken}` },
        });
        setStats({
          totalOrganizations: response.data.currentCount,
          percentageChange: response.data.percentageChange,
        });
      } catch (error) {
        console.error("Failed to fetch organization statistics", error);
      }
    };

    fetchOrgStats();
  }, [authToken, currentOrg?.id]);

  return (
    <MDBox mb={1.5}>
      <ComplexStatisticsCard
        icon="leaderboard"
        title="Total Organizations"
        count={stats.totalOrganizations.toString()}
        percentage={{
          color: "success",
          amount: `${stats.percentageChange.toFixed(2)}%`,
          label: "than last month",
        }}
      />
    </MDBox>
  );
};

export default StatCard;
