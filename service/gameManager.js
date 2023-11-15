const { v4: uuidv4 } = require('uuid');

const apiCallService = require('./ApiCallService');

class GameManager {
    constructor() {
        this.games = [{
            id: '1234',
            players: [{
                id: '1234',
                selectedCard: [1, 2, 5],
                deck: {},
            }, {
                id: '5678',
                selectedCard: [1, 2, 5],
                deck: {},
            }],
            status: 'waiting',
            currentPlayerId: '1234',

        }]; // Stocke les jeux en cours
    }

    /** ***************************** */
    /** Gestion début / fin de partie */
    /** ***************************** */

    /** On JOIN_GAME **/
    findGameOrCreate(player1) {
        for (const game of this.games) {
            if (game.status === 'waiting') {
                game.players.push(player1);
                return game;
            }
        }

        // Si on ne trouve pas de game libre ou en créer une
        return this.createGame(player1);
    }

    /** On SELECT_CARDS **/
    selectCards(gameId, playerId, cardIds) {
        // Sélection des cartes
        const game = this.games[gameId];
        if (game) {
            const player = game.players.find(player => player.id === playerId);
            if (player) {
                player.selectedCard = cardIds;
            }
            this.checkIfAllPlayersHaveSelectedCards(gameId);
        }
    }

    checkIfAllPlayersHaveSelectedCards(gameId) {
        // Vérifie si tous les joueurs ont sélectionné leurs cartes
        const game = this.games[gameId];
        if (game) {
            if (game.players.every(player => player.selectedCard)) {
                this.initGame(gameId).then(r =>
                    this.startGame(gameId)
                );
            }
        }
    }

    async initGame(gameId) {
        // Charge les informations des cartes
        const game = this.games[gameId];
        if (game) {
            for (const player of game.players) {
                for (const cardId of player.selectedCard) {
                    const card = await apiCallService.getCard(cardId);
                    player.deck[cardId] = card;
                }
            }
        }
    }

    createPlayer(playerId) {
        return {
            id: playerId,
            action: 10,
            selectedCard: null,
            deck: {},
        }
    }

    createGame(playerId) {
        // Initialisation d'une nouvelle partie
        const gameId = uuidv4()
        this.games[gameId] = {
            id: gameId,
            players: [this.createPlayer(playerId)],
            currentPlayerId: playerId,
            status: 'waiting', // État de la partie
        };
        return this.games[gameId];
    }

    havePlayersSelected(gameId) {
        // Vérifie si les joueurs ont sélectionné leurs cartes
        const game = this.games[gameId];
        if (game) {
            return game.players.every(player => player.selectedCard);
        }
        return false;
    }

    startGame(gameId) {
        // Démarrage du jeu
        const game = this.games[gameId];
        if (game) {
            game.status = 'started';
            // Attribution random du joueur qui commence
            game.currentPlayerId = Math.floor(Math.random() * game.players.length);
            // TODO : emit START_GAME
        }
    }

    endGame(gameId) {
        // Terminaison de la partie
        const game = this.games[gameId];
        if (game) {
            // Logique de fin de partie
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
            const currentPlayerIndex = game.players.findIndex(player => player.id === game.currentPlayer.id);
            game.currentPlayer = (currentPlayerIndex + 1) % game.players.length;

            // TODO: emit BEGIN_TURN
        }
    }

    /** On PLAY_CARD **/
    attack(gameId, playerId, cardId, targetCardId) {
        const player = this.games[gameId].players.find(player => player.id === playerId);
        if (player.action > 0) {
            const card = player.deck[cardId];
            const targetCard = player.deck[targetCardId];
            if (card && targetCard) {
                targetCard.hp -= card.attack - targetCard.defense;
                player.action--;

                // TODO: Emit ATTACK && UPDATE_PLAYER
            }
        }
    }

    /** On END_TURN **/
    endTurn(gameId, playerId) {
        const player = this.games[gameId].players.find(player => player.id === playerId);
        if (player) {
            // player.action = 10;
            this.beginNewTurn(gameId);
        }
    }

}

module.exports = GameManager;