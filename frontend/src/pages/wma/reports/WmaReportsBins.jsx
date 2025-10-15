import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllBinsForWma, getUrgentBinsForWma } from '../../../api/binApi';
import WmaBinsReport from '../bins/WmaBinsReport';
import WmaAuthService from '../../../api/wmaApi';

const WmaReportsBins = () => {
  const [bins, setBins] = useState([]);
  const [urgent, setUrgent] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetch = async () => {
      try {
        const wma = await WmaAuthService.getCurrentWmaDetails();
        if (!wma || !wma._id) return;
        const all = await getAllBinsForWma();
        const urg = await getUrgentBinsForWma();
        setBins(all || []);
        setUrgent(urg || []);
      } catch (err) {
        console.error('Failed to load bins for reports', err);
      }
    };
    fetch();
  }, []);

  return (
    <div>
      <WmaBinsReport bins={bins} urgent={urgent} onClose={() => navigate('/wma/reports')} />
    </div>
  );
};

export default WmaReportsBins;
