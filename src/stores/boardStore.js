import { defineStore } from 'pinia';

export const useBoardStore = defineStore('boardStore', {
    state: () => {
        let storedBoards = [];

        try {
            storedBoards = JSON.parse(localStorage.getItem('boards')) || [];

            // Als er geen borden zijn, maak het eerste bord aan en sla het op
            if (storedBoards.length === 0) {
                const firstBoard = {
                    id: 1,
                    title: 'Eerste Bord',
                    valid: true,
                    error: '',
                    isFavorite: false,
                    description: ''
                };
                storedBoards = [firstBoard];
                localStorage.setItem('boards', JSON.stringify(storedBoards));
            }
        } catch (error) {
            console.error('Fout bij het parsen van boards uit localStorage:', error);
            // Als er een error is, maak het eerste bord aan
            storedBoards = [{
                id: 1,
                title: 'Eerste Bord',
                valid: true,
                error: '',
                isFavorite: false,
                description: ''
            }];
            localStorage.setItem('boards', JSON.stringify(storedBoards));
        }

        return {
            boards: storedBoards,
            dropdownOpen: null
        };
    },

    getters: {
        getHighestBoardId() {
            if (this.boards.length === 0) return 0;
            return Math.max(...this.boards.map(board => board.id));
        },

        getBoardCount() {
            return this.boards.length;
        }
    },

    actions: {
        addBoard() {
            const newId = this.getNextBoardId();
            const newBoard = {
                id: newId,
                title: '',
                valid: true,
                error: '',
                isFavorite: false,
                description: "",
            };

            this.boards.push(newBoard);
            this.saveBoards();

            return newId; // Return the new ID for potential use
        },

        getNextBoardId() {
            return this.getHighestBoardId + 1;
        },

        deleteBoard(boardId) {
            const boardIndex = this.boards.findIndex(board => board.id === boardId);
            if (boardIndex !== -1) {
                this.boards = this.boards.filter((board) => board.id !== boardId);
                this.saveBoards();

                // Als alle borden zijn verwijderd, maak een nieuw eerste bord aan
                if (this.boards.length === 0) {
                    const firstBoard = {
                        id: 1,
                        title: 'Eerste Bord',
                        valid: true,
                        error: '',
                        isFavorite: false,
                        description: ''
                    };
                    this.boards = [firstBoard];
                    this.saveBoards();
                }
            }
        },

        updateBoardDescription(boardId, newDescription) {
            const board = this.boards.find((board) => board.id === boardId);
            if (board) {
                board.description = newDescription.trim();
                this.saveBoards();
            }
        },

        updateBoardTitle(boardId, newTitle) {
            const board = this.boards.find((board) => board.id === boardId);
            if (board) {
                board.title = newTitle.trim();
                board.valid = this.validateTitle(newTitle);
                board.error = board.valid ? '' : 'Titel mag niet leeg zijn.';
                this.saveBoards();
            }
        },

        toggleDropdown(boardId) {
            this.dropdownOpen = this.dropdownOpen === boardId ? null : boardId;
        },

        toggleFavorite(boardId) {
            const board = this.boards.find((board) => board.id === boardId);
            if (board) {
                board.isFavorite = !board.isFavorite;
                this.saveBoards();
            }
        },

        validateTitle(title) {
            return title.trim().length > 0;
        },

        saveBoards() {
            try {
                localStorage.setItem('boards', JSON.stringify(this.boards));
            } catch (error) {
                console.error('Fout bij het opslaan van data naar localStorage:', error);
            }
        },

        updateBoards(newBoards) {
            if (Array.isArray(newBoards)) {
                this.boards = newBoards;
                this.saveBoards();
            }
        },

        // Helper functie om een board op ID te vinden
        findBoardById(boardId) {
            return this.boards.find(board => board.id === boardId);
        }
    },
});