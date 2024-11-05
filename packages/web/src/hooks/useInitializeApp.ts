import { useNavigate, useLocation } from 'react-router-dom';
import { useInitializeApp as useInitializeAppCore } from '@menu-planner/core';

export function useInitializeApp() {
  const navigate = useNavigate();
  const location = useLocation();
  
  useInitializeAppCore(navigate, location);
}