import { useEffect, useState } from 'react';
import './App.css';
import NewGame from './components/NewGame';
import PlayPanel from './components/PlayPanel';
import SidePlayerInfo from './components/SidePlayerInfo';
import Map from './components/map/Map';
import { useComponentStates } from './hooks/useComponentState';
import useIP from './hooks/useIp';
import { useElementStore } from './utils/store';

function App() {
  const { set_ip } = useElementStore((state) => state);
  const { playerIds, players } = useComponentStates();

  const [currentPlayerIndex, setCurrentPlayerIndex] = useState<number | null>(
    null
  );

  const { ip, loading } = useIP();
  useEffect(() => {
    if (!loading && ip) {
      set_ip(ip);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ip, loading]);

  useEffect(() => {
    const index = players.findIndex((player) => player.supply !== 0);
    if (index !== -1) {
      setCurrentPlayerIndex(index);
    }
  }, [players]);

  return (
    <>
      <NewGame />
      <Map />
      <div className="absolute top-32 right-0">
        {playerIds.map((entityId, index) => (
          <SidePlayerInfo key={index} index={index} entityId={entityId} />
        ))}
      </div>
      <div className="flex justify-center">
        {playerIds.map((entityId, index) => (
          <PlayPanel key={index} index={index} entityId={entityId} />
        ))}
      </div>
    </>
  );
}

export default App;
