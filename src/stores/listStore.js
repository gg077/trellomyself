import { defineStore } from 'pinia';
import { v4 as uuidv4 } from 'uuid';  // v4 is meestal beter voor dit gebruik dan v1

export const useListStore = defineStore('listStore', {
    state: () => ({
        lists: [],
    }),
    actions: {
        addList(boardId, listTitle) {
            const newList = {
                id: uuidv4(),  // Gebruik UUID in plaats van incrementele ID
                boardId,
                title: listTitle,
                color: '#ffffff',
                deadline: null,
                isExpired: false,
                cards: [],
            };

            this.lists.push(newList);
            this.saveLists();
        },

        // We hebben lastListId en lastCardId niet meer nodig
        // Verwijder alle referenties naar deze variabelen

        addCard(listId, cardTitle) {
            const list = this.lists.find(list => list.id === listId);
            if (list) {
                list.cards.push({
                    id: uuidv4(),  // Ook UUID voor cards
                    title: cardTitle,
                    deadline: null,
                    isExpired: false,
                });
                this.saveLists();
            }
        },

        updateCards(listId, newCards) {
            const list = this.lists.find(list => list.id === listId);
            if (list) {
                list.cards = newCards;
                this.saveLists();
            }
        },

        updateListBoardId(listId, newBoardId) {
            const list = this.lists.find(list => list.id === listId);
            if (list) {
                const oldBoardId = list.boardId;
                list.boardId = newBoardId;

                // Haal alle lijsten op voor het oude en nieuwe bord
                const oldBoardLists = this.lists.filter(l => l.boardId === oldBoardId);
                const newBoardLists = this.lists.filter(l => l.boardId === newBoardId && l.id !== listId);

                // Update de volledige lijstarray met de juiste volgorde
                this.lists = [
                    ...this.lists.filter(l => l.boardId !== oldBoardId && l.boardId !== newBoardId),
                    ...oldBoardLists,
                    ...newBoardLists,
                    list
                ];

                this.saveLists();

                // Log voor debugging
                console.log('List moved:', {
                    listId,
                    fromBoard: oldBoardId,
                    toBoard: newBoardId,
                    totalLists: this.lists.length
                });
            }
        },

        updateListDeadline(listId, newDeadline) {
            const list = this.lists.find((list) => list.id === listId);
            if (list) {
                list.deadline = newDeadline;
                // Check of de deadline is verlopen
                list.isExpired = newDeadline ? new Date(newDeadline) < new Date() : false;
                this.saveLists();
            }
        },

        // Controleer dagelijks of deadlines zijn verstreken
        checkAllDeadlines() {
            this.lists.forEach((list) => {
                if (list.deadline) {
                    list.isExpired = new Date(list.deadline) < new Date();
                }
                list.cards.forEach((card) => {
                    if (card.deadline) {
                        card.isExpired = new Date(card.deadline) < new Date();
                    }
                });
            });
            this.saveLists();
        },

        // Werk de kleur van een lijst bij
        updateListColor(listId, newColor) {
            const list = this.lists.find((list) => list.id === listId);
            if (list) {
                list.color = newColor;
                this.saveLists();
            }
        },

        // Verwijder een lijst op basis van de lijst-id
        deleteList(listId) {
            const listToDelete = this.lists.find(list => list.id === listId);
            if (listToDelete) {
                const boardId = listToDelete.boardId;

                // Verwijder de lijst
                this.lists = this.lists.filter(list => list.id !== listId);

                // Update de volgorde van de overgebleven lijsten in hetzelfde bord
                const boardLists = this.lists.filter(list => list.boardId === boardId);
                this.lists = [
                    ...this.lists.filter(list => list.boardId !== boardId),
                    ...boardLists
                ];

                this.saveLists();

                // Log voor debugging
                console.log('List deleted:', {
                    listId,
                    boardId,
                    remainingLists: this.lists.length
                });
            }
        },

        reorderLists(newLists) {
            // Update de volgorde van de lijsten
            if (newLists && newLists.length > 0) {
                this.lists = [
                    ...this.lists.filter(list => !newLists.find(nl => nl.id === list.id)),
                    ...newLists
                ];
                this.saveLists();
            }
        },

        // Verwijder een kaart op basis van de kaart-id
        deleteCard(listId, cardId) {
            const list = this.lists.find((list) => list.id === listId);
            if (list) {
                list.cards = list.cards.filter((card) => card.id !== cardId);
                this.saveLists();
            }
        },

        // Haal alle lijsten op die gekoppeld zijn aan een specifiek bord
        getListsByBoard(boardId) {
            return this.lists.filter((list) => list.boardId === boardId);
        },

        // Sla lijsten op in localStorage
        saveLists() {
            try {
                localStorage.setItem('lists', JSON.stringify(this.lists));
            } catch (error) {
                console.error('Fout bij het opslaan van lijsten:', error);
            }
        },

        // Laad lijsten vanuit localStorage
        loadLists() {
            try {
                const storedLists = localStorage.getItem('lists');
                if (storedLists) {
                    const parsedLists = JSON.parse(storedLists);
                    this.lists = parsedLists.map(list => ({
                        id: list.id,
                        boardId: list.boardId,
                        title: list.title,
                        color: list.color || '#ffffff',
                        deadline: list.deadline || null,
                        isExpired: list.isExpired || false,
                        cards: list.cards || []
                    }));
                }
            } catch (error) {
                console.error('Fout bij het laden van lijsten:', error);
                this.lists = [];
            }
        },
    },
});