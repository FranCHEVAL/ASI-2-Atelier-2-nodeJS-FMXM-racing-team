class GameSession {

    constructor() {
        this.cardList = new Map();
    }

    addCard(userId, card) {
        if (!this.cardList.has(userId)) {
            this.cardList.set(userId, []);
        }
        this.cardList.get(userId).push(card);
    }

    getCardList(userId) {
        return this.cardList.get(userId);
    }

    getCard(userId, cardId) {
        return this.cardList.get(userId).find(card => card.id === cardId);
    }

    removeCard(userId, cardId) {
        const cardList = this.cardList.get(userId);
        const cardIndex = cardList.findIndex(card => card.id === cardId);
        cardList.splice(cardIndex, 1);
    }

    removeCardList(userId) {
        this.cardList.delete(userId);
    }

    getCardListSize(userId) {
        return this.cardList.get(userId).length;
    }

}
