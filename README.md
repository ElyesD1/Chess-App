# Chess Playground

A modern, fully-functional chess application built with React and Vite, featuring Stockfish engine integration for AI gameplay.

## Features

- ✨ **Complete Chess Rules Implementation**
  - All piece movements (Pawn, Rook, Knight, Bishop, Queen, King)
  - Special moves: Castling, En Passant, Pawn Promotion
  - Check, Checkmate, and Stalemate detection
  - Move validation and legal move highlighting

- 🎮 **Multiple Game Modes**
  - Play against yourself (practice mode)
  - Play against a friend (local multiplayer)
  - Play against Stockfish AI (computer opponent)

- 🎨 **Modern UI Design**
  - Classic wooden chess board aesthetic
  - Responsive sidebar with game controls
  - Move history tracker
  - Real-time game status updates
  - Board flipping for black pieces

- 🤖 **Stockfish Integration**
  - Play against one of the strongest chess engines
  - Choose your color (White or Black)
  - Board automatically flips when playing as Black

## Installation

1. Clone the repository:
```bash
git clone https://github.com/ElyesD1/Chess-App.git
cd Chess-App
```

2. Install dependencies:
```bash
npm install
```

3. (Optional) Install Stockfish engine:
```bash
brew install stockfish
```

4. Run the development server:
```bash
npm run dev
```

## How to Play

1. **New Game**: Click "New Game" to start
2. **Select Mode**: Choose between:
   - Play against yourself
   - Play against a friend
   - Play against computer (Stockfish)
3. **Choose Color** (Computer mode): Select White or Black
4. **Make Moves**: Click a piece to see valid moves (green dots), click destination to move
5. **Game Controls**: Use "Restart Game" to reset the current game

## Technologies

- React 18
- Vite
- Stockfish Chess Engine
- CSS3 (Custom styling)

## Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## License

MIT

## Author

Elyes Darouich
