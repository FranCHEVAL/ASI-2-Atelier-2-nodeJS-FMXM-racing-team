import gameManager from "../service/gameManager.js";

class GameController {
    init(socket, user) {
        socket.on('findGame', gameManager.onFindGame)

        socket.on('playerAttack', gameManager.onPlayerAttack)

        socket.on('endTurn', gameManager.onEndTurn)

        socket.on('disconnect', gameManager.onPlayerDisconnect)
    }
}

export default new GameController()