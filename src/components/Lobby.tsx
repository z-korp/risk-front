import GameState from '@/utils/gamestate';
import { useElementStore } from '@/utils/store';
import { Button } from './ui/button';
import { useEffect } from 'react';
import { removeLeadingZeros } from '@/utils/sanitizer';
import { useDojo } from '@/dojo/useDojo';
import { useToast } from './ui/use-toast';
import { useGetPlayersForGame } from '@/hooks/useGetPlayersForGame';
import { useGame } from '@/hooks/useGame';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from './ui/table';
import { useMe } from '@/hooks/useMe';
import { FaCrown } from 'react-icons/fa';
import { Player } from '@/utils/types';

const Lobby: React.FC = () => {
  const {
    setup: {
      client: { host },
    },
    account: { account },
  } = useDojo();
  const { toast } = useToast();

  const { set_game_state, set_game_id, game_id } = useElementStore((state) => state);

  const game = useGame();

  const { players } = useGetPlayersForGame(game_id);
  const { me } = useMe();

  useEffect(() => {
    if (me) {
      if (players.findIndex((player) => player.address === me.address) === -1) {
        set_game_state(GameState.MainMenu);
      }
    }
  }, [players]);

  useEffect(() => {
    if (game && Number(game.seed.toString(16)) !== 0) {
      // Game has started
      set_game_state(GameState.Game);
    }
  }, [game?.seed]);

  const isHost = (host: string, address: string) => {
    return host === removeLeadingZeros(address);
  };

  const startGame = async () => {
    if (game_id === undefined) {
      console.error('Game id not defined');
      toast({
        variant: 'destructive',
        description: <code className="text-white text-xs">{'Game id not defined'}</code>,
      });
      return;
    }
    try {
      await host.start(account, game_id);
    } catch (error: any) {
      toast({
        variant: 'destructive',
        description: <code className="text-white text-xs">{error.message}</code>,
      });
    }
  };

  const leaveGame = async (game_id: number) => {
    try {
      if (isHost(game.host, account.address)) {
        await host.delete_game(account, game.id);
      } else {
        await host.leave(account, game_id);
      }

      set_game_id(0);
      set_game_state(GameState.MainMenu);
    } catch (error: any) {
      toast({
        variant: 'destructive',
        description: <code className="text-white text-xs">{error.message}</code>,
      });
    }
  };

  const kickPlayer = async (player_index: number) => {
    try {
      await host.kick(account, game_id, player_index);
    } catch (error: any) {
      toast({
        variant: 'destructive',
        description: <code className="text-white text-xs">{error.message}</code>,
      });
    }
  };

  const transferHost = async (player_index: number) => {
    try {
      await host.transfer(account, game_id, player_index);
    } catch (error: any) {
      toast({
        variant: 'destructive',
        description: <code className="text-white text-xs">{error.message}</code>,
      });
    }
  };

  if (!game || !me || !players) {
    return;
  }

  return (
    <div className="vt323-font">
      <div className="flex gap-3 mb-2 items-center">
        <Button
          onClick={async () => {
            if (game.id !== undefined) {
              await leaveGame(game.id);
            }
          }}
        >
          Back
        </Button>
        Lobby
        <h2>Game id: {game.id}</h2>
        <p>Players: {players.length}/6</p>
        {isHost(game.host, account.address) && <Button onClick={startGame}>Start</Button>}
      </div>
      <div className="flex flex-col justify-center items-center gap-6">
        <div className="w-96 rounded-lg uppercase text-white text-4xl bg-stone-500">Zconqueror</div>
        <div className="bg-stone-500 p-10 rounded-lg">
          {players.length !== 0 && (
            <Table className="text-lg">
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead className="w-full">Address</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="rounded-lg">
                {players.map((player: Player) => (
                  <TableRow key={player.address}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {isHost(game.host, player.address) && <FaCrown />}
                        {player.name}
                      </div>
                    </TableCell>
                    <TableCell>
                      {
                        <div className="flex gap-8 items-center">
                          <span>{player.address} </span>{' '}
                          <div className="flex gap-6">
                            {isHost(game.host, me.address) && player.address !== me.address && (
                              <>
                                <Button
                                  size="sm"
                                  variant="secondary"
                                  className="hover:bg-red-600 hover:text-white drop-shadow-lg hover:transform hover:-translate-y-1 transition-transform ease-in-out"
                                  onClick={async () => {
                                    await kickPlayer(player.index);
                                  }}
                                >
                                  Kick
                                </Button>
                                <Button
                                  size="sm"
                                  variant="tertiary"
                                  className="hover:bg-green-600 drop-shadow-lg hover:transform hover:-translate-y-1 transition-transform ease-in-out"
                                  onClick={async () => {
                                    await transferHost(player.index);
                                  }}
                                >
                                  Give Host
                                </Button>
                              </>
                            )}
                          </div>
                        </div>
                      }
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
        <h1 className="mt-4 text-white text-6xl">
          Waiting for the game to start
          <span className="inline-block animate-jump delay-100">.</span>
          <span className="inline-block animate-jump delay-200">.</span>
          <span className="inline-block animate-jump delay-300">.</span>
        </h1>
      </div>
    </div>
  );
};

export default Lobby;
