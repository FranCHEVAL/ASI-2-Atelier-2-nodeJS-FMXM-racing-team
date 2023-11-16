import { uuid } from 'uuidv4';
import {getIO} from "../socketServer.js";
import ApiCallService from "./ApiCallService.js";
const apiCallService = new ApiCallService();

class GameService {
    constructor() {
        this.games = new Map(); // Stocke les jeux en cours
    }

    /** ***************************** */
    /**     Gestion des evenements    */
    /** ***************************** */

    onFindGame(playerId, name, deckIds, callback) {
        this.findGameOrCreate(playerId, name, deckIds, socket.id).then((game) => {
            socket.join(game.id);
            callback({ status: 'ok', game: game });
            this.checkIfGameNeedToStart(game.id);
        });
    }

    onPlayerAttack(gameId, playerId, cardId, targetPlayerId, targetCardId, callback) {
        try {
            this.attack(gameId, playerId, cardId, targetCardId)
            callback({ status: 'ok' });
        } catch (e) {
            callback({ status: 'error', message: e.message });
        }
    }

    onEndTurn(gameId, playerId, callback) {
        try {
            this.endTurn(gameId, playerId)
            callback({status: 'ok'});
        } catch (e) {
            callback({status: 'error', message: e.message});
        }
    }

    onPlayerDisconnect(playerId) {
        for (const game of this.games.values()) {
            const player1 = game.players.find(player => player.id === playerId);
            if (player1) {
                this.endGame(game.id, game.players.find(player => player.id !== player1.id).id);
            }
        }
    }

    /** ***************************** */
    /** Gestion début / fin de partie */
    /** ***************************** */

    /** On JOIN_GAME **/
    async findGameOrCreate(player1, name, deckIds, socketId) {
        for (const game of this.games.values()) {
            if (game.players.find(player => player.id === player1)) {
                console.log('Le joueur ' + player1 + ' est déjà dans une partie');
                return game;
            }
            if (game.status === 'waiting') {
                console.log('Found a game ' + game.id + ' for player ' + player1);
                const player = await this.createPlayer(player1, name, deckIds, socketId);
                game.players.push(player);
                return game;
            }
        }

        // Si on ne trouve pas de game libre ou en créer une
        return this.createGame(player1, name, deckIds);
    }

    checkPlayerAlreadyInGame(player1) {
        for (const game of this.games.values()) {
                const player = game.players.find(player => player.id === player1);
                if (player) {
                    return game;
                }
        }
        return undefined;
    }

    async getCards(cardsIds) {
        const cards = {}
        for (const cardId of cardsIds) {
            cards[cardId] = await apiCallService.getCard(cardId);
        }
        return cards
    }

    async createPlayer(playerId, name, deckIds, socketId) {
        const cards = await this.getCards(deckIds)
        return {
            id: playerId,
            name: name,
            action: 10,
            deck: cards,
            socketId: socketId
        }
    }

    async createGame(playerId, name, deckIds, socketId) {
        // Initialisation d'une nouvelle partie
        const gameId = uuid();
        const player = await this.createPlayer(playerId, name, deckIds, socketId)
        this.games.set(gameId, {
            id: gameId,
            players: [player],
            currentPlayerId: playerId,
            status: 'waiting', // État de la partie
        });
        console.log('Created a game ' + gameId + ' for player ' + playerId);
        return this.games.get(gameId);
    }

    checkIfGameNeedToStart(gameId) {
        // Vérifie si le jeu peut démarrer
        const game = this.games.get(gameId);
        if (game && game.players.length === 2) {
            this.startGame(gameId);
        }
    }

    startGame(gameId) {
        // Démarrage du jeu
        const game = this.games.get(gameId);
        if (game) {
            game.status = 'started';
            // Attribution random du joueur qui commence
            game.currentPlayerId = game.players.at(Math.floor(Math.random() * game.players.length)).id;
            // TODO : emit START_GAME
            getIO().to(gameId).emit('startGame', game);
            this.beginNewTurn(gameId)
        }
    }

    endGame(gameId, winnerId) {
        // Fin de la partie
        const game = this.games.get(gameId)
        if (game) {
            getIO().to(gameId).emit('gameEnded', winnerId);
            this.games.delete(gameId); // Suppression du jeu de la mémoire
        }
    }

    /** ***************************** */
    /**    Gestion des tours de jeu   */
    /** ***************************** */

    beginNewTurn(gameId) {
        // Passe au joueur suivant
        const game = this.games.get(gameId);
        if (game) {
            const currentPlayerIndex = game.players.findIndex(player => player.id === game.currentPlayerId);
            game.currentPlayerId = game.players[(currentPlayerIndex + 1) % game.players.length].id;

            // TODO: emit BEGIN_TURN
            getIO().to(gameId).emit('beginTurn', game.currentPlayerId);
        }
    }

    /** On PLAY_CARD **/
    attack(gameId, playerId, targetPlayer, cardId, targetCardId) {
        const game = this.games.get(gameId)
        const player = game.players.find(player => player.id === playerId);
        if (player.action < 0) {
           throw new Error("Pas assez d'action")
        }
        if (playerId !== game.currentPlayerId) {
            throw new Error("Ce n'est pas votre tour")
        }
        const card = player.deck[cardId];
        const targetCard = targetPlayer.deck[targetCardId];
        if (card && targetCard) {
            if (card.attack > targetCard.defense) {
                // Si l'attaque est supérieure à la défense alors on l'attaque
                if (targetCard.hp > card.attack - targetCard.defense) {
                    targetCard.hp -= card.attack - targetCard.defense;
                } else {
                    // La carte est morte on la supprime
                    delete targetPlayer.deck[targetCardId];
                }
            }
            player.action--;

            // TODO: Emit ATTACK && UPDATE_PLAYER Attention à gérer l'update des cartes du joueur
            getIO().emit('attack', { gameId, playerId, cardId, targetCardId });
            getIO().emit('updatePlayer', { gameId, playerId, player });

            if(targetPlayer.deck.length === 0){
                this.endGame(gameId, playerId);
            }
        }
    }

    /** On END_TURN **/
    endTurn(gameId, playerId) {
        const player = this.games.get(gameId).players.find(player => player.id === playerId);
        if (player) {
            this.beginNewTurn(gameId);
        }
    }
}
export default new GameService();