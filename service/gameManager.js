import { uuid } from 'uuidv4';
import {getIO} from "../socketServer.js";
import ApiCallService from "./ApiCallService.js";
const apiCallService = new ApiCallService();

class GameManager {
    constructor() {
        this.games = [{
            id: '1234',
            players: [{
                id: '1234',
                name: 'Player 1',
                deck: {},
            }, {
                id: '5678',
                name: 'Player 2',
                deck: {},
            }],
            status: 'inProgress',
            currentPlayerId: '1234',

        }]; // Stocke les jeux en cours
    }

    /** ***************************** */
    /** Gestion début / fin de partie */
    /** ***************************** */

    /** On JOIN_GAME **/
    async findGameOrCreate(player1, name, deckIds) {
        for (const game of this.games) {
            if (game.status === 'waiting') {
                console.log('Found a game ' + game.id + ' for player ' + player1);
                const player = await this.createPlayer(player1, name, deckIds);
                game.players.push(player);
                this.startGame(game.id);
                return game;
            }
        }

        // Si on ne trouve pas de game libre ou en créer une
        return this.createGame(player1, name, deckIds);
    }

    async getCards(cardsIds) {
        const cards = {}
        for (const cardId of cardsIds) {
            cards[cardId] = await apiCallService.getCard(cardId);
        }
        return cards
    }

    async createPlayer(playerId, name, deckIds) {
        const cards = await this.getCards(deckIds)
        return {
            id: playerId,
            name: name,
            action: 10,
            deck: cards,
        }
    }

    async createGame(playerId, name, deckIds) {
        // Initialisation d'une nouvelle partie
        const gameId = uuid();
        const player = await this.createPlayer(playerId, name, deckIds)
        this.games[gameId] = {
            id: gameId,
            players: [player],
            currentPlayerId: playerId,
            status: 'waiting', // État de la partie
        };
        console.log('Created a game ' + gameId + ' for player ' + playerId);
        return this.games[gameId];
    }

    startGame(gameId) {
        // Démarrage du jeu
        const game = this.games[gameId];
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
        const game = this.games[gameId];
        if (game) {
            getIO().to(gameId).emit('gameEnded', winnerId);
            delete this.games[gameId]; // Suppression du jeu de la mémoire
        }
    }

    /** ***************************** */
    /**    Gestion des tours de jeu   */
    /** ***************************** */

    beginNewTurn(gameId) {
        // Passe au joueur suivant
        const game = this.games[gameId];
        if (game) {
            const currentPlayerIndex = game.players.findIndex(player => player.id === game.currentPlayerId);
            game.currentPlayerId = game.players[(currentPlayerIndex + 1) % game.players.length].id;

            // TODO: emit BEGIN_TURN
            getIO().to(gameId).emit('beginTurn', game.currentPlayerId);
        }
    }

    /** On PLAY_CARD **/
    attack(gameId, playerId, targetPlayer, cardId, targetCardId) {
        const player = this.games[gameId].players.find(player => player.id === playerId);
        if (player.action < 0) {
            return "Pas assez d'action"
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
        const player = this.games[gameId].players.find(player => player.id === playerId);
        if (player) {
            this.beginNewTurn(gameId);
        }
    }

}

export default GameManager;