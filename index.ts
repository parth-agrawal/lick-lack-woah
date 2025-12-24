import * as readline from "readline";

type Move = [number, Mark];
type Mark = "L" | "W";
type Cell = Mark | "-";
type Board = [Cell, Cell, Cell, Cell, Cell, Cell, Cell, Cell, Cell];
type Game = {
  board: Board;
  userMark: Mark;
  aiMark: Mark;
};

const printBoard = (board: Board) => {
  console.log(board.slice(0, 3));
  console.log(board.slice(3, 6));
  console.log(board.slice(6));
};

const checkWin = (board: Board): Mark | "draw" | null => {
  const winningCombos = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];
  for (const combo of winningCombos) {
    const [a, b, c] = combo;
    if (board[a] !== "-" && board[a] === board[b] && board[a] === board[c]) {
      return board[a];
    }
  }
  if (!board.includes("-")) return "draw";
  return null;
};

const updateBoard = (move: Move, board: Board) => {
  const newBoard: Board = [...board];
  newBoard[move[0]] = move[1];
  return newBoard;
};

const calcAiMove = (game: Game): Move => {
  const emptyIndices = new Array<number>();
  game.board.map((cell, index) => {
    if (cell === "-") {
      emptyIndices.push(index);
    }
  });
  const randEmptyIndex =
    emptyIndices[Math.round(Math.random() * emptyIndices.length - 1)];
  console.log("AI move:");
  return [randEmptyIndex, game.aiMark];
};

const calcUserMove = (game: Game, input: string): Move | null => {
  try {
    input.trim();
    const inputArr = input.split(",");
    const x = Number(inputArr[0]);
    const y = Number(inputArr[1]);

    if (x < 0 || x > 2) {
      console.error("x-coord out of range");
      return null;
    }
    if (y < 0 || y > 2) {
      console.error("y-coord out of range");
      return null;
    }

    const cellIndex = x + 3 * y;

    if (game.board[cellIndex] == "L" || game.board[cellIndex] == "W") {
      console.error("That position is taken.");
      return null;
    } else if (game.board[cellIndex] != "-") {
      console.error("Invalid input.");
      return null;
    }
    return [cellIndex, game.userMark];
  } catch (_) {
    console.error(
      "Invalid input. Enter your move as a 0-indexed coordinate pair with no parens, like 0,1:"
    );
    return null;
  }
};

const askUserMove = async (game: Game): Promise<Move> => {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  let userMove: Move | null = null;
  while (!userMove) {
    userMove = await new Promise<Move | null>((resolve) => {
      rl.question(
        `Enter a coordinate pair for your ${game.userMark}. Example: 0,1 > `,
        (input) => {
          const move = calcUserMove(game, input);
          if (move) {
            console.log(`Your move:`);
            rl.close();
            resolve(move);
          } else {
            resolve(null);
          }
        }
      );
    });
  }

  return userMove;
};

const getPlayerMove = async (game: Game, mark: Mark): Promise<Move> => {
  if (mark == "W") {
    return game.userMark == "W" ? await askUserMove(game) : calcAiMove(game);
  }
  return game.userMark == "L" ? await askUserMove(game) : calcAiMove(game);
};

const main = async () => {
  console.log(
    "Welcome to Lick-Lack-Woah! Race against a computer to lick the right sequence of acid tabs. You know the rules."
  );
  const rand = Math.round(Math.random() * 1);
  const userMark: Mark = rand ? "W" : "L";
  const aiMark: Mark = userMark === "L" ? "W" : "L";
  let game: Game = {
    board: ["-", "-", "-", "-", "-", "-", "-", "-", "-"],
    userMark,
    aiMark,
  };
  printBoard(game.board);

  console.log(`You are: ${userMark}`);

  while (true) {
    const wMove = await getPlayerMove(game, "W");
    game = { ...game, board: updateBoard(wMove, game.board) };
    printBoard(game.board);
    if (checkWin(game.board)) break;
    const lMove = await getPlayerMove(game, "L");
    game = { ...game, board: updateBoard(lMove, game.board) };
    printBoard(game.board);
    if (checkWin(game.board)) break;
  }

  const result = checkWin(game.board);
  if (result == "draw") {
    console.log("Draw! Try again.");
  } else {
    console.log(`${result} is the winner! Good game.`);
  }
};

main();
