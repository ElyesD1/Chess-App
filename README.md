<div align="center">

# ♔ CHESS APP ♔

### Master the Game with AI-Driven Precision and Elegant Design

[![Last Commit](https://img.shields.io/github/last-commit/ElyesD1/Chess-App?style=for-the-badge&logo=git&logoColor=white&color=d4af76)](https://github.com/ElyesD1/Chess-App/commits/main)
[![Language Count](https://img.shields.io/github/languages/count/ElyesD1/Chess-App?style=for-the-badge&color=8b7355)](https://github.com/ElyesD1/Chess-App)
[![Top Language](https://img.shields.io/github/languages/top/ElyesD1/Chess-App?style=for-the-badge&color=b8956f)](https://github.com/ElyesD1/Chess-App)
[![License](https://img.shields.io/github/license/ElyesD1/Chess-App?style=for-the-badge&color=d4af76)](LICENSE)

</div>

---

## 🎯 Built With

<div align="center">

![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)
![ESLint](https://img.shields.io/badge/ESLint-4B32C3?style=for-the-badge&logo=eslint&logoColor=white)
![npm](https://img.shields.io/badge/npm-CB3837?style=for-the-badge&logo=npm&logoColor=white)

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Screenshots](#-screenshots)
- [Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Usage](#usage)
- [Project Structure](#-project-structure)
- [Technologies](#-technologies)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🌟 Overview

**Chess App** is a sophisticated, web-based chess application that combines elegant design with powerful AI capabilities. Built with React and powered by Stockfish, it delivers an immersive chess experience for players of all skill levels.

Whether you're practicing tactics, playing with friends, or challenging a world-class AI opponent, Chess App provides a seamless, modern interface with intelligent move validation and analysis.

---

## ✨ Features

<table>
<tr>
<td width="50%">

### 🎮 **Game Modes**
- **Practice Mode** - Perfect your skills solo
- **Two Players** - Challenge friends locally  
- **Play Computer** - Face AI opponents (800-3200 ELO)

</td>
<td width="50%">

### 🧠 **AI Intelligence**
- **Stockfish Engine** - World-champion level AI
- **8 Difficulty Levels** - From beginner to master
- **Real-time Analysis** - Position evaluation display

</td>
</tr>
<tr>
<td width="50%">

### 🎨 **User Experience**
- **Elegant UI** - Woody chess theme design
- **Move History** - Complete game notation
- **Piece Promotion** - Interactive selection dialog
- **Responsive Design** - Works on all devices

</td>
<td width="50%">

### ⚡ **Gameplay Features**
- **Legal Move Validation** - Real-time rule enforcement
- **Special Moves** - Castling, en passant support
- **Check Detection** - Visual indicators
- **Takeback/Forward** - Navigate game history

</td>
</tr>
</table>

---

## 📸 Screenshots

<div align="center">

### Welcome Screen
*Elegant welcome overlay guides new players*

### Game Board
*Clean, professional chess board with woody aesthetic*

### Difficulty Selection
*8 carefully calibrated difficulty levels*

### Pawn Promotion
*Interactive piece selection dialog*

</div>

---

## 🚀 Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v16.0 or higher)
- **npm** (v8.0 or higher)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/ElyesD1/Chess-App.git
   ```

2. **Navigate to the project directory**
   ```bash
   cd Chess-App
   ```

3. **Install dependencies**
   ```bash
   npm install
   ```

### Usage

**Development Mode**

Start the development server with hot reload:

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

**Production Build**

Build for production:

```bash
npm run build
```

**Preview Production Build**

Preview the production build locally:

```bash
npm run preview
```

---

## 📁 Project Structure

```
Chess-App/
├── public/                  # Static assets
│   ├── stockfish.js        # Stockfish engine
│   └── stockfishjs/        # Engine variants
├── src/
│   ├── assets/             # Chess piece images
│   ├── components/         # React components
│   │   ├── ChessBoard.jsx  # Main game board
│   │   └── GameSidebar.jsx # Controls & info
│   ├── utils/              # Utility functions
│   │   ├── chessRules.js   # Game logic
│   │   ├── fenConverter.js # FEN/UCI conversion
│   │   └── stockfish.js    # Engine integration
│   ├── App.jsx             # Root component
│   └── main.jsx            # Entry point
├── index.html
├── vite.config.js
└── package.json
```

---

## 🛠️ Technologies

### **Core Framework**
- **React 18** - Modern UI library with hooks
- **Vite** - Lightning-fast build tool

### **Chess Engine**
- **Stockfish 17** - World's strongest open-source chess engine
- **UCI Protocol** - Standard chess engine communication

### **Styling**
- **CSS3** - Custom styling with gradients and animations
- **Responsive Design** - Mobile-first approach

### **Development Tools**
- **ESLint** - Code quality and consistency
- **Git** - Version control

---

## 🎮 How to Play

1. **Start a New Game**
   - Click "New Game" in the sidebar
   - Choose your game mode (Practice, Two Players, or Computer)
   - If playing against computer, select difficulty and color

2. **Make Moves**
   - Click a piece to select it
   - Valid moves are highlighted
   - Click destination square to move
   - For pawn promotion, select your desired piece

3. **Game Controls**
   - **Takeback** - Undo your last move(s)
   - **Forward** - Redo moves after takeback
   - **Restart** - Start fresh with same settings
   - **New Game** - Change mode or settings

---

## 🎯 Difficulty Levels

| Level | Name | ELO Rating | Description |
|-------|------|------------|-------------|
| 1 | Beginner | 800 | New to chess |
| 2 | Casual | 1000 | Learning the game |
| 3 | Intermediate | 1200 | Knows basic tactics |
| 4 | Advanced | 1400 | Experienced player |
| 5 | Strong | 1600 | Club player |
| 6 | Expert | 1800 | Tournament level |
| 7 | Master | 2200 | Very strong |
| 8 | Maximum | 3200 | Full engine power |

---

## 🤝 Contributing

Contributions are welcome! Here's how you can help:

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/AmazingFeature
   ```
3. **Commit your changes**
   ```bash
   git commit -m 'Add some AmazingFeature'
   ```
4. **Push to the branch**
   ```bash
   git push origin feature/AmazingFeature
   ```
5. **Open a Pull Request**

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **Stockfish Team** - For the incredible chess engine
- **React Team** - For the amazing framework
- **Chess.com** - For UI/UX inspiration
- **Lichess** - For difficulty level concepts

---

<div align="center">

### Made with ♔ by [Elyes Darouich](https://github.com/ElyesD1)

**[⬆ Back to Top](#-chess-app-)**

</div>
