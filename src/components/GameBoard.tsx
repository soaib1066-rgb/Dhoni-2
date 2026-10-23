import React from 'react';
import { motion } from 'motion/react';
import { BoardTile, Player } from '../types/game';
import { formatBanglaTaka, toBanglaNumber } from '../utils/banglaFormatter';
import { Flag, Lock, Sparkles, Receipt, Train, Plane, Zap, Compass, Building2 } from 'lucide-react';

interface GameBoardProps {
  tiles: BoardTile[];
  players: Player[];
  activePlayerIndex: number;
  children?: React.ReactNode;
}

// 6x6 perimeter coordinates for 20 tiles in clockwise order
const TILE_POSITIONS: Record<number, { row: number; col: number }> = {
  // Top row (col 0 to 5)
  0: { row: 1, col: 1 },
  1: { row: 1, col: 2 },
  2: { row: 1, col: 3 },
  3: { row: 1, col: 4 },
  4: { row: 1, col: 5 },
  5: { row: 1, col: 6 },
  // Right col (row 2 to 5)
  6: { row: 2, col: 6 },
  7: { row: 3, col: 6 },
  8: { row: 4, col: 6 },
  9: { row: 5, col: 6 },
  // Bottom row (col 6 down to 1)
  10: { row: 6, col: 6 },
  11: { row: 6, col: 5 },
  12: { row: 6, col: 4 },
  13: { row: 6, col: 3 },
  14: { row: 6, col: 2 },
  15: { row: 6, col: 1 },
  // Left col (row 5 down to 2)
  16: { row: 5, col: 1 },
  17: { row: 4, col: 1 },
  18: { row: 3, col: 1 },
  19: { row: 2, col: 1 },
};

export const GameBoard: React.FC<GameBoardProps> = ({
  tiles,
  players,
  activePlayerIndex,
  children,
}) => {
  const getTileIcon = (tile: BoardTile) => {
    switch (tile.type) {
      case 'start':
        return <Flag className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400" />;
      case 'jail':
        return <Lock className="w-4 h-4 sm:w-5 sm:h-5 text-rose-400" />;
      case 'chance':
        return <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400" />;
      case 'tax':
        return <Receipt className="w-4 h-4 sm:w-5 sm:h-5 text-orange-400" />;
      default:
        if (tile.iconName === 'train') return <Train className="w-4 h-4 text-sky-400" />;
        if (tile.iconName === 'plane') return <Plane className="w-4 h-4 text-sky-400" />;
        if (tile.iconName === 'zap') return <Zap className="w-4 h-4 text-yellow-400" />;
        if (tile.iconName === 'compass') return <Compass className="w-4 h-4 text-indigo-400" />;
        return <Building2 className="w-3.5 h-3.5 text-slate-400" />;
    }
  };

  const getTileColorHeader = (tile: BoardTile) => {
    if (tile.type === 'start') return 'bg-emerald-600';
    if (tile.type === 'jail') return 'bg-rose-700';
    if (tile.type === 'chance') return 'bg-amber-600';
    if (tile.type === 'tax') return 'bg-orange-600';

    switch (tile.group) {
      case 'city_a':
        return 'bg-purple-600';
      case 'city_b':
        return 'bg-teal-600';
      case 'city_c':
        return 'bg-blue-600';
      case 'transport':
        return 'bg-indigo-600';
      case 'special':
        return 'bg-amber-700';
      default:
        return 'bg-slate-600';
    }
  };

  return (
    <div className="relative w-full max-w-[720px] aspect-square mx-auto p-2 sm:p-3 bg-gradient-to-br from-slate-900 via-emerald-950/60 to-slate-900 rounded-3xl border-2 border-emerald-500/30 shadow-2xl shadow-black/80 flex flex-col justify-between">
      {/* 6x6 CSS Grid */}
      <div className="grid grid-cols-6 grid-rows-6 w-full h-full gap-1 sm:gap-1.5 relative">
        {tiles.map((tile) => {
          const pos = TILE_POSITIONS[tile.id];
          const isCorner = tile.type === 'start' || tile.type === 'jail' || tile.type === 'chance' || tile.type === 'tax';
          
          // Players on this tile
          const playersHere = players.filter(
            (p) => !p.isBankrupt && p.currentPosition === tile.id
          );

          // Find owner if property
          const owner = tile.ownerId ? players.find((p) => p.id === tile.ownerId) : null;

          return (
            <div
              key={tile.id}
              style={{
                gridRowStart: pos.row,
                gridColumnStart: pos.col,
              }}
              className={`relative rounded-xl overflow-hidden flex flex-col justify-between border transition-all duration-300 select-none ${
                isCorner
                  ? 'bg-slate-800/90 border-slate-600/60 shadow-inner'
                  : 'bg-slate-800/70 hover:bg-slate-800/90 border-slate-700/50'
              }`}
            >
              {/* Tile top color strip or owner flag */}
              <div
                className={`h-2 sm:h-2.5 w-full ${getTileColorHeader(tile)} flex items-center justify-end px-1`}
              >
                {owner && (
                  <div
                    className="w-2 h-2 rounded-full border border-white/60 shadow"
                    style={{ backgroundColor: owner.hexColor }}
                    title={`মালিক: ${owner.name}`}
                  />
                )}
              </div>

              {/* Tile Content */}
              <div className="flex-1 flex flex-col items-center justify-center p-0.5 sm:p-1 text-center min-h-0">
                <div className="mb-0.5">{getTileIcon(tile)}</div>
                <div className="font-semibold text-[10px] sm:text-xs leading-tight line-clamp-1 text-slate-100">
                  {tile.name}
                </div>
                {tile.cost > 0 && (
                  <div className="text-[9px] sm:text-[10px] font-bold text-amber-300 tabular-nums">
                    {formatBanglaTaka(tile.cost)}
                  </div>
                )}
                {tile.type === 'start' && (
                  <div className="text-[8px] sm:text-[9px] text-emerald-300 font-medium">
                    +৳২,০০০
                  </div>
                )}
                {tile.type === 'tax' && (
                  <div className="text-[8px] sm:text-[9px] text-orange-300 font-medium">
                    -৳১,০০০
                  </div>
                )}
              </div>

              {/* Owner Rent indicator */}
              {owner && (
                <div className="bg-slate-900/90 text-[8px] sm:text-[9px] text-emerald-300 font-semibold text-center py-0.5 border-t border-slate-700/50">
                  ভাড়া: {formatBanglaTaka(tile.rent)}
                </div>
              )}

              {/* Player tokens on this tile */}
              <div className="absolute inset-x-0 bottom-1 flex items-center justify-center gap-0.5 sm:gap-1 px-1 z-10 pointer-events-none">
                {playersHere.map((player) => (
                  <motion.div
                    key={player.id}
                    layoutId={`player-token-${player.id}`}
                    initial={{ scale: 0.6 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 350, damping: 25 }}
                    className="w-4 h-4 sm:w-5 sm:h-5 rounded-full border-2 border-white shadow-lg flex items-center justify-center text-[9px] sm:text-[10px] font-black text-white"
                    style={{ backgroundColor: player.hexColor }}
                    title={player.name}
                  >
                    {player.name.charAt(0)}
                  </motion.div>
                ))}
              </div>
            </div>
          );
        })}

        {/* Center 4x4 area for Dashboard / Controls / Prompts */}
        <div
          style={{
            gridRow: '2 / span 4',
            gridColumn: '2 / span 4',
          }}
          className="relative rounded-2xl bg-slate-950/80 border border-emerald-500/20 backdrop-blur-md p-3 sm:p-5 flex flex-col items-center justify-between shadow-2xl overflow-hidden"
        >
          {children}
        </div>
      </div>
    </div>
  );
};
