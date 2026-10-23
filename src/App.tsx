import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GameBoard } from './components/GameBoard';
import { CenterDashboard } from './components/CenterDashboard';
import { PlayerCard } from './components/PlayerCard';
import { PropertyModal } from './components/PropertyModal';
import { ChanceCardModal } from './components/ChanceCardModal';
import { JailModal } from './components/JailModal';
import { WinnerModal } from './components/WinnerModal';
import { HomeScreen } from './components/HomeScreen';
import { RulesModal } from './components/RulesModal';
import { AndroidExportModal } from './components/AndroidExportModal';
import { GameState, Player, BoardTile, ChanceCard, GameLog } from './types/game';
import {
  INITIAL_BOARD_TILES,
  CHANCE_CARDS,
  START_BALANCE,
  START_PASS_BONUS,
  TAX_AMOUNT,
  JAIL_FINE,
} from './data/boardTiles';
import { sound } from './utils/audio';
import { formatBanglaTaka, toBanglaNumber } from './utils/banglaFormatter';
import { Smartphone, BookOpen, Volume2, VolumeX, ArrowLeft } from 'lucide-react';

const STORAGE_KEY = 'dhonihobar_game_state_v1';

export default function App() {
  const [inGame, setInGame] = useState<boolean>(false);
  const [hasSavedGame, setHasSavedGame] = useState<boolean>(false);
  const [rulesOpen, setRulesOpen] = useState<boolean>(false);
  const [androidExportOpen, setAndroidExportOpen] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  // Main Game State
  const [gameState, setGameState] = useState<GameState>({
    players: [],
    tiles: INITIAL_BOARD_TILES,
    currentPlayerIndex: 0,
    lastDiceRoll: null,
    isRolling: false,
    isMoving: false,
    gameStatus: 'idle',
    winnerId: null,
    pendingPurchase: null,
    activeChanceCard: null,
    activeJailChoice: false,
    gameMode: null,
    turnCount: 1,
    logs: [],
    soundEnabled: true,
  });

  const stateRef = useRef(gameState);
  stateRef.current = gameState;

  // Check saved game in localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.players && parsed.players.length > 0 && parsed.gameStatus === 'playing') {
          setHasSavedGame(true);
        }
      }
    } catch {
      // ignore storage errors
    }
  }, []);

  // Sync sound setting
  const toggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    sound.enabled = next;
    setGameState((prev) => ({ ...prev, soundEnabled: next }));
  };

  // Helper to add game log
  const addLog = useCallback((text: string, type: GameLog['type'] = 'info', playerId?: string) => {
    const newLog: GameLog = {
      id: Math.random().toString(36).substring(2, 9),
      timestamp: Date.now(),
      text,
      type,
      playerId,
    };
    setGameState((prev) => ({
      ...prev,
      logs: [...prev.logs.slice(-25), newLog],
    }));
  }, []);

  // Save game state to localStorage
  const saveGameState = useCallback((stateToSave: GameState) => {
    if (stateToSave.gameStatus === 'playing') {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(stateToSave));
        setHasSavedGame(true);
      } catch {
        // ignore storage errors
      }
    }
  }, []);

  // Initialize Bot Game (Human vs AI)
  const startBotGame = () => {
    const players: Player[] = [
      {
        id: 'p1',
        name: 'আপনি (খেলোয়াড় ১)',
        color: 'red',
        hexColor: '#EF4444',
        balance: START_BALANCE,
        currentPosition: 0,
        ownedProperties: [],
        inJail: false,
        jailTurnsRemaining: 0,
        isBankrupt: false,
        isAI: false,
      },
      {
        id: 'p2',
        name: 'এআই রোবট (AI)',
        color: 'blue',
        hexColor: '#3B82F6',
        balance: START_BALANCE,
        currentPosition: 0,
        ownedProperties: [],
        inJail: false,
        jailTurnsRemaining: 0,
        isBankrupt: false,
        isAI: true,
      },
    ];

    const freshTiles = INITIAL_BOARD_TILES.map((t) => ({ ...t, ownerId: undefined }));
    const initialLogs: GameLog[] = [
      {
        id: 'init-1',
        timestamp: Date.now(),
        text: 'খেলা শুরু হলো! প্রতি খেলোয়াড়ের মূলধন ৳১৫,০০০।',
        type: 'info',
      },
      {
        id: 'init-2',
        timestamp: Date.now(),
        text: 'আপনার পালা — ছক্কা ঘুরিয়ে ঘুঁটি চালুন।',
        type: 'info',
      },
    ];

    const newState: GameState = {
      players,
      tiles: freshTiles,
      currentPlayerIndex: 0,
      lastDiceRoll: null,
      isRolling: false,
      isMoving: false,
      gameStatus: 'playing',
      winnerId: null,
      pendingPurchase: null,
      activeChanceCard: null,
      activeJailChoice: false,
      gameMode: 'bot',
      turnCount: 1,
      logs: initialLogs,
      soundEnabled,
    };

    setGameState(newState);
    setInGame(true);
    saveGameState(newState);
  };

  // Initialize Multiplayer Game (2-4 players)
  const startMultiplayerGame = (count: number) => {
    const meta: { name: string; color: Player['color']; hex: string }[] = [
      { name: 'রাকিব (লাল)', color: 'red', hex: '#EF4444' },
      { name: 'সাকিব (নীল)', color: 'blue', hex: '#3B82F6' },
      { name: 'আসিফ (সবুজ)', color: 'green', hex: '#10B981' },
      { name: 'তানভীর (হলুদ)', color: 'yellow', hex: '#F59E0B' },
    ];

    const players: Player[] = meta.slice(0, count).map((m, idx) => ({
      id: `p${idx + 1}`,
      name: m.name,
      color: m.color,
      hexColor: m.hex,
      balance: START_BALANCE,
      currentPosition: 0,
      ownedProperties: [],
      inJail: false,
      jailTurnsRemaining: 0,
      isBankrupt: false,
      isAI: false,
    }));

    const freshTiles = INITIAL_BOARD_TILES.map((t) => ({ ...t, ownerId: undefined }));
    const initialLogs: GameLog[] = [
      {
        id: 'init-1',
        timestamp: Date.now(),
        text: `${toBanglaNumber(count)} জন খেলোয়াড়ের খেলা শুরু হলো!`,
        type: 'info',
      },
    ];

    const newState: GameState = {
      players,
      tiles: freshTiles,
      currentPlayerIndex: 0,
      lastDiceRoll: null,
      isRolling: false,
      isMoving: false,
      gameStatus: 'playing',
      winnerId: null,
      pendingPurchase: null,
      activeChanceCard: null,
      activeJailChoice: false,
      gameMode: 'multiplayer',
      turnCount: 1,
      logs: initialLogs,
      soundEnabled,
    };

    setGameState(newState);
    setInGame(true);
    saveGameState(newState);
  };

  // Resume saved game
  const resumeGame = () => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        setGameState(parsed);
        setInGame(true);
      }
    } catch {
      // ignore
    }
  };

  // Check victory condition
  const checkVictory = useCallback((currentPlayers: Player[]): Player | null => {
    const active = currentPlayers.filter((p) => !p.isBankrupt);
    if (active.length === 1) {
      return active[0];
    }
    return null;
  }, []);

  // Handle player bankruptcy
  const handleBankruptcy = useCallback((playerIndex: number) => {
    sound.playCashOut();
    setGameState((prev) => {
      const updatedPlayers = [...prev.players];
      const bankruptPlayer = { ...updatedPlayers[playerIndex], isBankrupt: true, balance: 0 };
      updatedPlayers[playerIndex] = bankruptPlayer;

      // Release all owned properties
      const updatedTiles = prev.tiles.map((t) =>
        t.ownerId === bankruptPlayer.id ? { ...t, ownerId: undefined } : t
      );

      const winner = checkVictory(updatedPlayers);
      if (winner) {
        sound.playVictory();
        return {
          ...prev,
          players: updatedPlayers,
          tiles: updatedTiles,
          gameStatus: 'game_over',
          winnerId: winner.id,
          logs: [
            ...prev.logs,
            {
              id: Math.random().toString(),
              timestamp: Date.now(),
              text: `${bankruptPlayer.name} দেউলিয়া হয়ে খেলা থেকে বিদায় নিলেন!`,
              type: 'info',
            },
            {
              id: Math.random().toString(),
              timestamp: Date.now(),
              text: `অভিনন্দন! ${winner.name} বিজয়ী হলেন!`,
              type: 'info',
            },
          ],
        };
      }

      return {
        ...prev,
        players: updatedPlayers,
        tiles: updatedTiles,
        logs: [
          ...prev.logs,
          {
            id: Math.random().toString(),
            timestamp: Date.now(),
            text: `${bankruptPlayer.name} দেউলিয়া হয়ে খেলা থেকে বিদায় নিলেন!`,
            type: 'info',
          },
        ],
      };
    });
  }, [checkVictory]);

  // Advance turn to next non-bankrupt player
  const advanceTurn = useCallback(() => {
    setGameState((prev) => {
      if (prev.gameStatus === 'game_over') return prev;

      let nextIndex = (prev.currentPlayerIndex + 1) % prev.players.length;
      let loops = 0;
      while (prev.players[nextIndex].isBankrupt && loops < prev.players.length) {
        nextIndex = (nextIndex + 1) % prev.players.length;
        loops++;
      }

      const nextPlayer = prev.players[nextIndex];
      const nextLogs: GameLog[] = [
        ...prev.logs,
        {
          id: Math.random().toString(),
          timestamp: Date.now(),
          text: `${nextPlayer.name}-এর পালা শুরু হলো।`,
          type: 'info',
          playerId: nextPlayer.id,
        },
      ];

      const nextState: GameState = {
        ...prev,
        currentPlayerIndex: nextIndex,
        isRolling: false,
        isMoving: false,
        pendingPurchase: null,
        activeChanceCard: null,
        activeJailChoice: false,
        turnCount: prev.turnCount + 1,
        logs: nextLogs,
      };

      saveGameState(nextState);
      return nextState;
    });
  }, [saveGameState]);

  // Execute landing actions for tile
  const handleTileLanding = useCallback((playerIndex: number, tileId: number) => {
    const currentState = stateRef.current;
    const player = currentState.players[playerIndex];
    const tile = currentState.tiles[tileId];

    // Case 1: Start tile
    if (tile.type === 'start') {
      addLog(`${player.name} শুরু ঘরে অবস্থান করছেন।`, 'info', player.id);
      advanceTurn();
      return;
    }

    // Case 2: Jail tile
    if (tile.type === 'jail') {
      sound.playJailClang();
      setGameState((prev) => {
        const updated = [...prev.players];
        updated[playerIndex] = {
          ...updated[playerIndex],
          inJail: true,
          jailTurnsRemaining: 1,
        };
        return {
          ...prev,
          players: updated,
          logs: [
            ...prev.logs,
            {
              id: Math.random().toString(),
              timestamp: Date.now(),
              text: `${player.name} জেলখানায় আটক হলেন!`,
              type: 'jail',
              playerId: player.id,
            },
          ],
        };
      });
      advanceTurn();
      return;
    }

    // Case 3: Tax tile
    if (tile.type === 'tax') {
      sound.playCashOut();
      const newBal = player.balance - TAX_AMOUNT;
      if (newBal < 0) {
        addLog(`${player.name} করের ৳১,০০০ পরিশোধ করতে ব্যর্থ হয়েছেন।`, 'cash_out', player.id);
        handleBankruptcy(playerIndex);
        advanceTurn();
        return;
      }

      setGameState((prev) => {
        const updated = [...prev.players];
        updated[playerIndex] = {
          ...updated[playerIndex],
          balance: newBal,
        };
        return {
          ...prev,
          players: updated,
          logs: [
            ...prev.logs,
            {
              id: Math.random().toString(),
              timestamp: Date.now(),
              text: `${player.name} পৌর কর বাবদ ৳১,০০০ সরকারি কোষাগারে জমা দিলেন।`,
              type: 'cash_out',
              playerId: player.id,
            },
          ],
        };
      });
      advanceTurn();
      return;
    }

    // Case 4: Chance card tile
    if (tile.type === 'chance') {
      sound.playChance();
      const randomCard = CHANCE_CARDS[Math.floor(Math.random() * CHANCE_CARDS.length)];
      if (player.isAI) {
        // AI handles chance immediately
        executeChanceCard(playerIndex, randomCard);
      } else {
        setGameState((prev) => ({
          ...prev,
          activeChanceCard: randomCard,
        }));
      }
      return;
    }

    // Case 5: Property tile (Cities, Transports, Utilities)
    if (tile.type === 'property') {
      // Unowned property
      if (!tile.ownerId) {
        if (player.isAI) {
          // AI decision: if affordable with comfortable buffer, buy!
          if (player.balance >= tile.cost) {
            // AI buys
            setTimeout(() => {
              buyProperty(playerIndex, tile.id);
            }, 800);
          } else {
            // AI passes
            addLog(`এআই রোবট পর্যাপ্ত টাকা না থাকায় ${tile.name} কেনা থেকে বিরত থাকল।`, 'info', player.id);
            advanceTurn();
          }
        } else {
          // Human player: open purchase dialog
          setGameState((prev) => ({
            ...prev,
            pendingPurchase: tile,
          }));
        }
        return;
      }

      // Owned by current player
      if (tile.ownerId === player.id) {
        addLog(`${player.name} নিজের সম্পত্তি ${tile.name}-এ বিশ্রাম নিচ্ছেন।`, 'info', player.id);
        advanceTurn();
        return;
      }

      // Owned by another player: Pay rent!
      const ownerIndex = currentState.players.findIndex((p) => p.id === tile.ownerId);
      if (ownerIndex !== -1) {
        const owner = currentState.players[ownerIndex];
        sound.playCashOut();

        if (player.balance < tile.rent) {
          addLog(
            `${player.name} ${owner.name}-কে নির্ধারিত ভাড়া ${formatBanglaTaka(tile.rent)} দিতে ব্যর্থ হয়েছেন!`,
            'cash_out',
            player.id
          );
          // Transfer whatever is left to owner
          setGameState((prev) => {
            const updated = [...prev.players];
            updated[ownerIndex] = {
              ...updated[ownerIndex],
              balance: updated[ownerIndex].balance + Math.max(0, player.balance),
            };
            return { ...prev, players: updated };
          });
          handleBankruptcy(playerIndex);
          advanceTurn();
          return;
        }

        // Normal rent transfer
        setGameState((prev) => {
          const updated = [...prev.players];
          updated[playerIndex] = {
            ...updated[playerIndex],
            balance: updated[playerIndex].balance - tile.rent,
          };
          updated[ownerIndex] = {
            ...updated[ownerIndex],
            balance: updated[ownerIndex].balance + tile.rent,
          };

          return {
            ...prev,
            players: updated,
            logs: [
              ...prev.logs,
              {
                id: Math.random().toString(),
                timestamp: Date.now(),
                text: `${player.name} ${owner.name}-এর জমিতে আসায় ${formatBanglaTaka(tile.rent)} ভাড়া পরিশোধ করলেন।`,
                type: 'cash_out',
                playerId: player.id,
              },
            ],
          };
        });
        advanceTurn();
        return;
      }
    }

    advanceTurn();
  }, [addLog, advanceTurn, handleBankruptcy]);

  // Execute Chance Card Effect
  const executeChanceCard = useCallback((playerIndex: number, card: ChanceCard) => {
    const currentState = stateRef.current;
    const player = currentState.players[playerIndex];

    let newBalance = player.balance + card.amountEffect;
    let targetPos = player.currentPosition;
    let bonusGiven = false;

    if (card.amountEffect > 0) {
      sound.playCashIn();
    } else if (card.amountEffect < 0) {
      sound.playCashOut();
    }

    if (newBalance < 0) {
      addLog(`${player.name} জরিমানা পরিশোধ করতে না পেরে দেউলিয়া হলেন!`, 'cash_out', player.id);
      setGameState((prev) => ({ ...prev, activeChanceCard: null }));
      handleBankruptcy(playerIndex);
      advanceTurn();
      return;
    }

    if (card.moveEffect === 'start') {
      targetPos = 0;
      sound.playCashIn();
      newBalance += START_PASS_BONUS;
      bonusGiven = true;
    } else if (card.moveEffect === 'jail') {
      targetPos = 5;
    } else if (typeof card.moveEffect === 'number') {
      // Check if passing start
      if (card.moveEffect < player.currentPosition) {
        newBalance += START_PASS_BONUS;
        bonusGiven = true;
        sound.playCashIn();
      }
      targetPos = card.moveEffect;
    }

    setGameState((prev) => {
      const updated = [...prev.players];
      updated[playerIndex] = {
        ...updated[playerIndex],
        balance: newBalance,
        currentPosition: targetPos,
        inJail: card.moveEffect === 'jail' ? true : updated[playerIndex].inJail,
        jailTurnsRemaining: card.moveEffect === 'jail' ? 1 : updated[playerIndex].jailTurnsRemaining,
      };

      const effectLog = card.amountEffect !== 0
        ? card.amountEffect > 0
          ? `${formatBanglaTaka(card.amountEffect)} লাভ পেলেন!`
          : `${formatBanglaTaka(card.amountEffect)} জরিমানা দিলেন।`
        : '';

      const bonusLog = bonusGiven ? ' এবং শুরু অতিক্রম করায় ৳২,০০০ বোনাস পেলেন!' : '';

      return {
        ...prev,
        players: updated,
        activeChanceCard: null,
        logs: [
          ...prev.logs,
          {
            id: Math.random().toString(),
            timestamp: Date.now(),
            text: `ভাগ্য পরীক্ষা: ${player.name} "${card.title}" গ্রহণ করেছেন। ${effectLog}${bonusLog}`,
            type: card.amountEffect >= 0 ? 'cash_in' : 'cash_out',
            playerId: player.id,
          },
        ],
      };
    });

    advanceTurn();
  }, [addLog, advanceTurn, handleBankruptcy]);

  // Buy Property Handler
  const buyProperty = useCallback((playerIndex: number, propertyId: number) => {
    sound.playCashIn();
    setGameState((prev) => {
      const updatedPlayers = [...prev.players];
      const buyer = updatedPlayers[playerIndex];
      const property = prev.tiles.find((t) => t.id === propertyId);

      if (!property || buyer.balance < property.cost) {
        return prev;
      }

      // Deduct balance and add to owned list
      updatedPlayers[playerIndex] = {
        ...buyer,
        balance: buyer.balance - property.cost,
        ownedProperties: [...buyer.ownedProperties, property.id],
      };

      // Set owner on tile
      const updatedTiles = prev.tiles.map((t) =>
        t.id === propertyId ? { ...t, ownerId: buyer.id } : t
      );

      return {
        ...prev,
        players: updatedPlayers,
        tiles: updatedTiles,
        pendingPurchase: null,
        logs: [
          ...prev.logs,
          {
            id: Math.random().toString(),
            timestamp: Date.now(),
            text: `${buyer.name} ${formatBanglaTaka(property.cost)}-এ "${property.name}" কিনে নিলেন!`,
            type: 'cash_in',
            playerId: buyer.id,
          },
        ],
      };
    });

    advanceTurn();
  }, [advanceTurn]);

  // Pass Property Handler
  const passProperty = useCallback(() => {
    const currentState = stateRef.current;
    const player = currentState.players[currentState.currentPlayerIndex];
    addLog(`${player.name} জমি কেনা থেকে বিরত রইলেন।`, 'info', player.id);
    setGameState((prev) => ({ ...prev, pendingPurchase: null }));
    advanceTurn();
  }, [addLog, advanceTurn]);

  // Jail Decisions
  const payJailFine = useCallback((playerIndex: number) => {
    sound.playCashOut();
    setGameState((prev) => {
      const updated = [...prev.players];
      const p = updated[playerIndex];
      if (p.balance < JAIL_FINE) return prev;

      updated[playerIndex] = {
        ...p,
        balance: p.balance - JAIL_FINE,
        inJail: false,
        jailTurnsRemaining: 0,
      };

      return {
        ...prev,
        players: updated,
        activeJailChoice: false,
        logs: [
          ...prev.logs,
          {
            id: Math.random().toString(),
            timestamp: Date.now(),
            text: `${p.name} ৳১,০০০ জরিমানা দিয়ে জেল থেকে মুক্তি পেলেন!`,
            type: 'cash_out',
            playerId: p.id,
          },
        ],
      };
    });
  }, []);

  const waitJailTurn = useCallback((playerIndex: number) => {
    setGameState((prev) => {
      const updated = [...prev.players];
      const p = updated[playerIndex];
      updated[playerIndex] = {
        ...p,
        inJail: false,
        jailTurnsRemaining: 0,
      };

      return {
        ...prev,
        players: updated,
        activeJailChoice: false,
        logs: [
          ...prev.logs,
          {
            id: Math.random().toString(),
            timestamp: Date.now(),
            text: `${p.name} ১ টার্ন বিরতি দিয়ে জেল থেকে মুক্তি পেলেন।`,
            type: 'info',
            playerId: p.id,
          },
        ],
      };
    });
    advanceTurn();
  }, [advanceTurn]);

  // Dice Roll and Movement Step Animation
  const rollDice = useCallback(() => {
    const currentState = stateRef.current;
    if (currentState.isRolling || currentState.isMoving || currentState.pendingPurchase || currentState.activeChanceCard) {
      return;
    }

    const playerIndex = currentState.currentPlayerIndex;
    const player = currentState.players[playerIndex];

    // If in jail, handle choice first
    if (player.inJail) {
      if (player.isAI) {
        if (player.balance >= JAIL_FINE * 2) {
          payJailFine(playerIndex);
        } else {
          waitJailTurn(playerIndex);
          return;
        }
      } else {
        setGameState((prev) => ({ ...prev, activeJailChoice: true }));
        return;
      }
    }

    sound.playDiceRoll();
    setGameState((prev) => ({ ...prev, isRolling: true }));

    // Roll duration
    setTimeout(() => {
      const rollValue = Math.floor(Math.random() * 6) + 1;
      sound.playDiceRoll();

      setGameState((prev) => ({
        ...prev,
        lastDiceRoll: rollValue,
        isRolling: false,
        isMoving: true,
        logs: [
          ...prev.logs,
          {
            id: Math.random().toString(),
            timestamp: Date.now(),
            text: `${player.name} ছক্কায় ${toBanglaNumber(rollValue)} তুললেন!`,
            type: 'dice',
            playerId: player.id,
          },
        ],
      }));

      // Step-by-step movement animation
      let currentStep = 0;
      let startBonusCollected = false;
      let tempPos = player.currentPosition;

      const stepInterval = setInterval(() => {
        currentStep++;
        const prevPos = tempPos;
        tempPos = (tempPos + 1) % 20;

        // Check if passed Start (tile 0)
        if (tempPos === 0 || (prevPos > tempPos && !startBonusCollected)) {
          startBonusCollected = true;
          sound.playCashIn();
        } else {
          sound.playStep();
        }

        // Update player position on board
        setGameState((prev) => {
          const updated = [...prev.players];
          const curPlayer = updated[playerIndex];
          const newBalance = startBonusCollected && curPlayer.currentPosition !== tempPos
            ? curPlayer.balance + START_PASS_BONUS
            : curPlayer.balance;

          updated[playerIndex] = {
            ...curPlayer,
            currentPosition: tempPos,
            balance: newBalance,
          };

          return {
            ...prev,
            players: updated,
            logs: startBonusCollected && curPlayer.currentPosition !== tempPos
              ? [
                  ...prev.logs,
                  {
                    id: Math.random().toString(),
                    timestamp: Date.now(),
                    text: `${curPlayer.name} শুরু ঘর অতিক্রম করায় ৳২,০০০ বোনাস পেলেন!`,
                    type: 'cash_in',
                    playerId: curPlayer.id,
                  },
                ]
              : prev.logs,
          };
        });

        // When reached final destination tile
        if (currentStep >= rollValue) {
          clearInterval(stepInterval);
          setGameState((prev) => ({ ...prev, isMoving: false }));

          // Execute tile logic
          setTimeout(() => {
            handleTileLanding(playerIndex, tempPos);
          }, 350);
        }
      }, 220);
    }, 700);
  }, [handleTileLanding, payJailFine, waitJailTurn]);

  // AI Turn Auto-Player Loop with ~1s delay
  useEffect(() => {
    if (!inGame || gameState.gameStatus !== 'playing') return;

    const currentPlayer = gameState.players[gameState.currentPlayerIndex];
    if (
      currentPlayer &&
      currentPlayer.isAI &&
      !currentPlayer.isBankrupt &&
      !gameState.isRolling &&
      !gameState.isMoving &&
      !gameState.pendingPurchase &&
      !gameState.activeChanceCard &&
      !gameState.activeJailChoice
    ) {
      const timer = setTimeout(() => {
        rollDice();
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [
    inGame,
    gameState.currentPlayerIndex,
    gameState.players,
    gameState.gameStatus,
    gameState.isRolling,
    gameState.isMoving,
    gameState.pendingPurchase,
    gameState.activeChanceCard,
    gameState.activeJailChoice,
    rollDice,
  ]);

  // Restart / Reset
  const handleResetGame = () => {
    if (confirm('আপনি কি সত্যিই বর্তমান খেলা বন্ধ করে নতুন খেলা শুরু করতে চান?')) {
      localStorage.removeItem(STORAGE_KEY);
      setHasSavedGame(false);
      setInGame(false);
    }
  };

  const handlePlayAgain = () => {
    if (gameState.gameMode === 'bot') {
      startBotGame();
    } else {
      startMultiplayerGame(gameState.players.length);
    }
  };

  const handleGoHome = () => {
    setInGame(false);
  };

  const activePlayer = gameState.players[gameState.currentPlayerIndex] || gameState.players[0];
  const winnerPlayer = gameState.winnerId
    ? gameState.players.find((p) => p.id === gameState.winnerId) || null
    : null;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-['Hind_Siliguri',sans-serif]">
      {/* If not in game, show Home Screen */}
      {!inGame ? (
        <HomeScreen
          hasSavedGame={hasSavedGame}
          onResumeGame={resumeGame}
          onStartBotGame={startBotGame}
          onStartMultiplayerGame={startMultiplayerGame}
          onOpenRules={() => setRulesOpen(true)}
          onOpenAndroidExport={() => setAndroidExportOpen(true)}
          soundEnabled={soundEnabled}
          onToggleSound={toggleSound}
        />
      ) : (
        /* Active Game Playfield */
        <div className="flex-1 flex flex-col justify-between max-w-6xl w-full mx-auto p-2 sm:p-4">
          {/* Top Bar Navigation */}
          <header className="flex items-center justify-between gap-4 py-2 px-1 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleGoHome}
                className="p-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 transition-colors"
                title="হোম মেনু"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-base sm:text-lg font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-amber-300">
                  ধনী হবার মজার খেলা
                </h1>
                <div className="text-[10px] text-slate-400">
                  {gameState.gameMode === 'bot' ? 'বট মোড' : 'মাল্টিপ্লেয়ার মোড'} · টার্ন {toBanglaNumber(gameState.turnCount)}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={toggleSound}
                className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white transition-colors"
              >
                {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4 text-rose-400" />}
              </button>
              <button
                type="button"
                onClick={() => setRulesOpen(true)}
                className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white transition-colors"
                title="নিয়মাবলী"
              >
                <BookOpen className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setAndroidExportOpen(true)}
                className="px-3 py-1.5 rounded-xl bg-emerald-950 border border-emerald-500/40 text-emerald-300 hover:bg-emerald-900 text-xs font-semibold flex items-center gap-1.5"
                title="Android APK কোড ও বিল্ড"
              >
                <Smartphone className="w-4 h-4 text-emerald-400" />
                <span className="hidden sm:inline">Android APK</span>
              </button>
            </div>
          </header>

          {/* Main Layout: Board + Player Hud Grid */}
          <main className="flex-1 flex flex-col lg:flex-row items-center justify-center gap-4 sm:gap-6 py-2 sm:py-4">
            {/* Left/Top: 2D Game Board */}
            <div className="w-full max-w-[620px] shrink-0">
              <GameBoard
                tiles={gameState.tiles}
                players={gameState.players}
                activePlayerIndex={gameState.currentPlayerIndex}
              >
                <CenterDashboard
                  activePlayer={activePlayer}
                  lastDiceRoll={gameState.lastDiceRoll}
                  isRolling={gameState.isRolling}
                  isMoving={gameState.isMoving}
                  onRollDice={rollDice}
                  logs={gameState.logs}
                  soundEnabled={soundEnabled}
                  onToggleSound={toggleSound}
                  onOpenRules={() => setRulesOpen(true)}
                  onOpenAndroidExport={() => setAndroidExportOpen(true)}
                  onResetGame={handleResetGame}
                />
              </GameBoard>
            </div>

            {/* Right/Bottom: Players HUD & Event Feed */}
            <div className="w-full lg:max-w-xs flex flex-col gap-3">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider px-1">
                খেলোয়াড়দের তথ্য
              </div>
              <div className="grid grid-cols-2 lg:grid-cols-1 gap-2">
                {gameState.players.map((p, idx) => (
                  <PlayerCard
                    key={p.id}
                    player={p}
                    isActive={idx === gameState.currentPlayerIndex}
                  />
                ))}
              </div>

              {/* Event Feed Activity Log */}
              <div className="mt-2 bg-slate-900/80 rounded-2xl p-3 border border-slate-800 flex flex-col gap-2 max-h-48 overflow-y-auto">
                <div className="text-[11px] font-bold text-slate-400 flex items-center justify-between">
                  <span>খেলার বিবরণী (Log)</span>
                  <span className="text-[10px] text-slate-500">সাম্প্রতিক চাল</span>
                </div>
                <div className="flex flex-col gap-1.5 text-xs">
                  {gameState.logs.slice(-6).map((log) => (
                    <div
                      key={log.id}
                      className="p-1.5 rounded-lg bg-slate-950/60 border border-slate-800/80 text-slate-300 leading-snug"
                    >
                      {log.text}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </main>
        </div>
      )}

      {/* Modals */}
      <PropertyModal
        property={gameState.pendingPurchase}
        player={activePlayer}
        onBuy={() => {
          if (gameState.pendingPurchase) {
            buyProperty(gameState.currentPlayerIndex, gameState.pendingPurchase.id);
          }
        }}
        onPass={passProperty}
      />

      <ChanceCardModal
        card={gameState.activeChanceCard}
        player={activePlayer}
        onConfirm={() => {
          if (gameState.activeChanceCard) {
            executeChanceCard(gameState.currentPlayerIndex, gameState.activeChanceCard);
          }
        }}
      />

      <JailModal
        player={gameState.activeJailChoice ? activePlayer : null}
        onPayFine={() => payJailFine(gameState.currentPlayerIndex)}
        onWaitTurn={() => waitJailTurn(gameState.currentPlayerIndex)}
      />

      <WinnerModal
        winner={winnerPlayer}
        onPlayAgain={handlePlayAgain}
        onGoHome={handleGoHome}
      />

      <RulesModal
        isOpen={rulesOpen}
        onClose={() => setRulesOpen(false)}
      />

      <AndroidExportModal
        isOpen={androidExportOpen}
        onClose={() => setAndroidExportOpen(false)}
      />
    </div>
  );
}
