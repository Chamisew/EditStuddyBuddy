import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import WmaAuthService from '../../../api/wmaApi';
import { getAllSchedulesInWma } from '../../../api/scheduleApi';
import WmaSchedulesReport from '../schedule/WmaSchedulesReport';

const WmaReportsSchedules = () => {
  const [schedules, setSchedules] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetch = async () => {
      try {
        const wma = await WmaAuthService.getCurrentWmaDetails();
        if (!wma || !wma._id) return;
        const res = await getAllSchedulesInWma(wma._id);
        setSchedules(res || []);
      } catch (err) {
        console.error('Failed to load schedules for reports', err);
      }
    };
    fetch();
  }, []);

  return (
    <div>
      <WmaSchedulesReport schedules={schedules} onClose={() => navigate('/wma/reports')} />
    </div>
  );
};

export default WmaReportsSchedules;
