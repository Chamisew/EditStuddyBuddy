import React from 'react';
import UserDrawer from '../components/UserDrawer';
import BinCreateForm from '../../client/components/BinCreateForm';

const BinPage = () => {
  return (
    <UserDrawer>
      <BinCreateForm />
    </UserDrawer>
  );
};

export default BinPage;
