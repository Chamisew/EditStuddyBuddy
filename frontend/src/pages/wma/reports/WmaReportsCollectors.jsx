import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import WmaAuthService from '../../../api/wmaApi';
import { getAllCollectorsInWma } from '../../../api/collectorApi';
import WmaCollectorsReport from './WmaCollectorsReport';

const WmaReportsCollectors = () => {
  const [collectors, setCollectors] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetch = async () => {
      try {
        const wma = await WmaAuthService.getCurrentWmaDetails();
        if (!wma || !wma._id) return;
        const res = await getAllCollectorsInWma(wma._id);
        setCollectors(res || []);
      } catch (err) {
        console.error('Failed to load collectors for reports', err);
      }
    };
    fetch();
  }, []);

  return (
    <div>
      <WmaCollectorsReport collectors={collectors} onClose={() => navigate('/wma/reports')} />
    </div>
  );
};

export default WmaReportsCollectors;
