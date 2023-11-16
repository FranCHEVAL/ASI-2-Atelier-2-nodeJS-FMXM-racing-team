import gameManager from "../service/gameManager.js";

class GameController {
    init(socket, user) {

        // Injection de l'user dans les méthodes

        socket.on('findGame', (name, deckIds, callback) => {
            gameManager.onFindGame(user.id, name, deckIds, callback)
        })

        socket.on('playerAttack', (gameId, cardId, targetPlayerId, targetCardId, callback) => {
            gameManager.onPlayerAttack(gameId, user.id, cardId, targetPlayerId, targetCardId, callback)
        })

        socket.on('endTurn', (gameId, callback) => {
            gameManager.onEndTurn(gameId, user.id, callback)
        })

        socket.on('disconnect', () => {
            gameManager.onPlayerDisconnect(user.id)
        })
    }
}

export default new GameController()