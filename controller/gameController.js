import gameManager from "../service/gameManager.js";

class GameController {
    init(socket) {
        socket.on('findGame', gameManager.onFindGame)

        socket.on('playerAttack', gameManager.onPlayerAttack)

        socket.on('endTurn', gameManager.onEndTurn)
    }
}

export default new GameController()