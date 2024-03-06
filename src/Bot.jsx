const uciWorker = (file, actions) => () => {
  const worker = new Worker(file);

  let resolver = null;

  worker.addEventListener("message", (e) => {
    const move = e.data.match(/^bestmove\s([a-h][1-8])([a-h][1-8])/);
    if (move && resolver) {
      resolver({ from: move[1], to: move[2] });
      resolver = null;
    }
  });

  return (fen) =>
    new Promise((resolve, reject) => {
      if (resolver) {
        reject("Pending move is present");
        return;
      }

      resolver = resolve;
      worker.postMessage(`position fen ${fen}`);
      actions.forEach((action) => worker.postMessage(action));
    });
};

const Bots = {
  "nmrugg/stockfish (l:1,d:10)": uciWorker("stockfish.js-10.0.2/stockfish.js", [
    "setoption name Skill Level value 1",
    "go depth 10",
  ]),
};

export default Bots;
