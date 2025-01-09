<template>
  <div class="p-6">
    <!-- Zoekbalk -->
    <div class="mb-6">
      <div class="relative">
        <h1 class="text-3xl font-bold mb-4">Zoeken</h1>
        <input
            type="text"
            v-model="searchQuery"
            placeholder="Zoek in borden op titel of beschrijving..."
            class="w-1/2 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <span
            v-if="searchQuery"
            @click="searchQuery = ''"
            class="absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer text-gray-500 hover:text-gray-700"
        >
          ✕
        </span>
      </div>
    </div>

    <!-- Titel -->
    <h1 class="text-2xl font-bold mb-4">Mijn Borden</h1>

    <!-- Container voor borden -->
    <div>
      <draggable
          v-model="sortedBoards"
          group="boards"
          @start="drag = true"
          @end="onDragEnd"
          item-key="id"
          class="grid grid-cols-3 gap-4"
      >
        <template #item="{ element }">
          <div
              :key="element.id"
              class="board bg-white p-4 shadow rounded flex flex-col relative"
              :data-board-id="element.id"
          >
            <div class="flex items-center justify-between">
              <input
                  type="text"
                  class="border-b-2 focus:outline-none focus:border-blue-500 text-lg font-bold mb-2 w-full"
                  :class="{ 'border-red-500': !element.valid }"
                  :value="element.title"
                  placeholder="Voer een titel in..."
                  @focus="$event.target.select()"
                  @input="updateTitle(element.id, $event.target.value)"
              />
              <button @click="toggleFavorite(element.id)">
                <span v-if="element.isFavorite">⭐</span>
                <span v-else>☆</span>
              </button>
              <button
                  class="text-gray-500 hover:text-gray-700 ml-2"
                  @click="toggleDropdown(element.id)"
              >
                &#x22EE;
              </button>
              <div
                  v-if="boardStore.dropdownOpen === element.id"
                  class="absolute top-12 right-0 bg-white shadow rounded p-2 z-10"
              >
                <button
                    class="text-red-500 hover:text-red-700 flex items-center"
                    @click="deleteBoard(element.id)"
                >
                  <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke-width="1.5"
                      stroke="currentColor"
                      class="w-5 h-5"
                  >
                    <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            </div>
            <p v-if="element.error" class="text-red-500 text-sm mt-1">
              {{ element.error }}
            </p>

            <!-- Beschrijving invoerveld -->
            <div class="mt-2">
              <button
                  class="text-blue-500 hover:text-blue-700"
                  @click="toggleDescriptionEdit(element.id)"
              >
                Beschrijving toevoegen/bewerken
              </button>
              <div v-if="editingDescription === element.id">
                <textarea
                    class="border rounded w-full mt-2 p-2"
                    v-model="element.description"
                    @blur="updateDescription(element.id, element.description)"
                    placeholder="Voeg een beschrijving toe..."
                ></textarea>
              </div>
              <p v-else-if="element.description" class="text-gray-600 mt-2">
                {{ element.description }}
              </p>
            </div>

            <!-- Lijsten met drag-and-drop -->
            <div class="mt-4">
              <h3 class="text-lg font-semibold mb-2">Lijsten</h3>
              <draggable
                  v-model="boardLists[element.id]"
                  :group="{ name: 'lists', pull: true, put: true }"
                  item-key="id"
                  class="space-y-4"
                  @end="onListDragEnd"
              >
                <template #item="{ element: list }">
                  <ListComponent
                      :list="list"
                      :key="list.id"
                      @delete="deleteList"
                      @updateColor="updateListColor"
                      @updateDeadline="updateListDeadline"
                  />
                </template>
              </draggable>

              <div v-if="newListBoardId === element.id" class="mb-2">
                <input
                    type="text"
                    class="border-b-2 focus:outline-none focus:border-blue-500 text-lg w-full"
                    placeholder="Nieuwe lijstnaam..."
                    v-model="newListTitle"
                    @keydown.enter="saveNewList(element.id)"
                    @blur="cancelNewList"
                />
              </div>
              <!-- Dropdown voor het verplaatsen van alle lijsten -->
              <div class="relative inline-block">
                <button
                    class="text-blue-500 hover:text-blue-700 mt-2 mr-2 flex items-center"
                    @click="showMoveAllDropdown = showMoveAllDropdown === element.id ? null : element.id"
                >
                  <svg xmlns="http://www.w3.org/2000/svg"
                       class="h-5 w-5"
                       viewBox="0 0 20 20"
                       fill="currentColor"
                  >
                    <path fill-rule="evenodd"
                          d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                          clip-rule="evenodd"
                    />
                  </svg>
                  <span class="ml-5 text-blue-500 hover:text-blue-700 mt-2"></span>
                </button>

                <!-- Dropdown menu -->
                <div v-if="showMoveAllDropdown === element.id"
                     class="absolute left-0 mt-1 w-48 bg-white rounded-md shadow-lg z-50"
                >
                  <div class="py-1">
                    <template v-for="board in getAvailableBoards(element.id)" :key="board.id">
                      <button
                          @click="moveAllLists(element.id, board.id)"
                          class="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        {{ board.title || 'Naamloos bord' }}
                      </button>
                    </template>
                  </div>
                </div>
              </div>
              <button
                  class="text-blue-500 hover:text-blue-700 mt-2"
                  @click="showNewListInput(element.id)"
              >
                + Nieuwe lijst toevoegen
              </button>
            </div>
          </div>
        </template>
      </draggable>
    </div>

    <button
        class="mt-6 bg-blue-500 text-white px-4 py-2 rounded shadow"
        @click="addBoard"
    >
      + Nieuw Bord
    </button>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue';
import draggable from "vuedraggable";
import { useBoardStore } from '@/stores/boardStore';
import { useListStore } from '@/stores/listStore';
import ListComponent from './ListComponent.vue';

export default {
  name: 'BoardComponent',
  // Register components
  components: {
    ListComponent,
    draggable,
  },
  setup() {
    // Initialize stores and state
    const boardStore = useBoardStore();
    const listStore = useListStore();
    const drag = ref(false);

    // Load lists on component mount
    onMounted(() => {
      listStore.loadLists();
    });

    // State for dropdown menus
    const showMoveAllDropdown = ref(null); // Voor het bijhouden welk bord de dropdown toont
    const searchQuery = ref("");
    const newListBoardId = ref(null);
    const newListTitle = ref('');
    const editingDescription = ref(null);

    // Move all lists between boards
    const moveAllLists = (fromBoardId, toBoardId) => {
      const listsToMove = boardLists.value[fromBoardId] || [];
      listsToMove.forEach(list => {
        listStore.updateListBoardId(list.id, toBoardId);
      });
      showMoveAllDropdown.value = null;
    };

    // Get available boards for moving lists
    const getAvailableBoards = (currentBoardId) => {
      return boardStore.boards.filter(board => board.id !== currentBoardId);
    };



    // Computed property voor lijsten per bord
    const boardLists = computed(() => {
      const lists = {};
      boardStore.boards.forEach(board => {
        lists[board.id] = listStore.getListsByBoard(board.id);
      });
      return lists;
    });

    // Filter boards based on search query
    const filteredBoards = computed(() => {
      if (!searchQuery.value) return boardStore.boards;

      const query = searchQuery.value.toLowerCase();

      return boardStore.boards.filter((board) => {
        const titleMatch = board.title.toLowerCase().includes(query);
        const descriptionMatch = board.description && board.description.toLowerCase().includes(query);
        const lists = listStore.getListsByBoard(board.id);
        const listMatch = lists.some(list =>
            list.title.toLowerCase().includes(query)
        );

        return titleMatch || descriptionMatch || listMatch;
      });
    });

    // Sort boards with favorites first
    const sortedBoards = computed({
      get() {
        const boards = [...filteredBoards.value];
        return boards.sort((a, b) => {
          if (a.isFavorite && !b.isFavorite) return -1;
          if (!a.isFavorite && b.isFavorite) return 1;
          return 0;
        });
      },
      set(value) {
        boardStore.updateBoards(value);
      },
    });

    // Event handlers for drag and drop
    const onDragEnd = () => {
      boardStore.saveBoards();
    };

    const onListDragEnd = (evt) => {
      if (evt.from !== evt.to) {
        const list = evt.item.__draggable_context.element;
        const targetBoard = evt.to.closest('.board');
        const sourceBoard = evt.from.closest('.board');

        if (list && targetBoard && sourceBoard) {
          const targetBoardId = parseInt(targetBoard.dataset.boardId);
          const sourceBoardId = parseInt(sourceBoard.dataset.boardId);

          if (!isNaN(targetBoardId) && !isNaN(sourceBoardId)) {
            console.log('Dragging list:', {
              listId: list.id,
              fromBoard: sourceBoardId,
              toBoard: targetBoardId
            });

            listStore.updateListBoardId(list.id, targetBoardId);

            // Update beide borden
            if (boardLists.value[sourceBoardId]) {
              listStore.reorderLists([...boardLists.value[sourceBoardId]]);
            }
            if (boardLists.value[targetBoardId]) {
              listStore.reorderLists([...boardLists.value[targetBoardId]]);
            }
          }
        }
      }
      listStore.saveLists();
    };

    // Board management methods
    const addBoard = () => boardStore.addBoard();
    const updateTitle = (boardId, newTitle) => boardStore.updateBoardTitle(boardId, newTitle);
    const toggleDropdown = (boardId) => boardStore.toggleDropdown(boardId);
    const toggleFavorite = (boardId) => boardStore.toggleFavorite(boardId);
    const deleteBoard = (boardId) => boardStore.deleteBoard(boardId);
    const updateDescription = (boardId, newDescription) => boardStore.updateBoardDescription(boardId, newDescription);
    const toggleDescriptionEdit = (boardId) => {
      editingDescription.value = editingDescription.value === boardId ? null : boardId;
    };

    // List management methods
    const deleteList = (listId) => listStore.deleteList(listId);
    const updateListColor = (listId, newColor) => listStore.updateListColor(listId, newColor);
    const updateListDeadline = (listId, newDeadline) => listStore.updateListDeadline(listId, newDeadline);

    // New list management methods
    const saveNewList = (boardId) => {
      if (newListTitle.value.trim()) {
        listStore.addList(boardId, newListTitle.value.trim());
      }
      cancelNewList();
    };

    const cancelNewList = () => {
      newListBoardId.value = null;
      newListTitle.value = '';
    };

    const showNewListInput = (boardId) => {
      newListBoardId.value = boardId;
      newListTitle.value = '';
    };

    // Return all methods and computed properties
    return {
      boardStore,
      listStore,
      drag,
      searchQuery,
      sortedBoards,
      boardLists,
      addBoard,
      updateTitle,
      toggleDropdown,
      toggleFavorite,
      deleteBoard,
      updateDescription,
      toggleDescriptionEdit,
      newListBoardId,
      newListTitle,
      editingDescription,
      deleteList,
      updateListColor,
      updateListDeadline,
      saveNewList,
      cancelNewList,
      showNewListInput,
      onDragEnd,
      onListDragEnd,
      showMoveAllDropdown,
      moveAllLists,
      getAvailableBoards,
    };
  },
};
</script>

<style scoped>
.board {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  position: relative;
}
</style>