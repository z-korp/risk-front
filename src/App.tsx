import { useEffect, useState } from 'react';
import './App.css';
import NewGame from './components/NewGame';
import PlayPanel from './components/PlayPanel';
import SidePlayerInfo from './components/SidePlayerInfo';
import Map from './components/map/Map';
import { TooltipProvider } from './components/ui/tooltip';
import { useComponentStates } from './hooks/useComponentState';
import useIP from './hooks/useIp';
import { useElementStore } from './utils/store';
import FortifyPanel from './components/map/FortifyPanel';

function App() {
  const { set_ip } = useElementStore((state) => state);
  const { playerIds, players } = useComponentStates();

  const { ip, loading } = useIP();
  useEffect(() => {
    if (!loading && ip) {
      set_ip(ip);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ip, loading]);

  const { current_state } = useElementStore((state) => state);

  const isFortifyPanelVisible = current_state === 3 || current_state === 2;
  return (
    <TooltipProvider>
      <NewGame />
      <div className="flex">
        {isFortifyPanelVisible && (
          <div className="w-1/6 mr-8">
            <FortifyPanel />
          </div>
        )}

        <div className={`w-${isFortifyPanelVisible ? '3/4' : 'full'} pr-4`}>
          <Map />
        </div>
      </div>
      <div className="absolute top-24 right-0 flex gap-6 flex-col">
        {playerIds.map((entityId, index) => (
          <SidePlayerInfo key={index} index={index} entityId={entityId} />
        ))}
      </div>
      <div className="flex justify-center">
        {playerIds.map((entityId, index) => (
          <PlayPanel key={index} index={index} entityId={entityId} />
        ))}
      </div>
    </TooltipProvider>
  );
}

export default App;
