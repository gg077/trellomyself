<template>
  <div class="p-2 rounded mb-2 cursor-move"
  :class="{
  'border-2 border-red-500 bg-red-50 bg-opacity-50': isExpired,
  'bg-gray-100': !isExpired
  }"
  >
    <!-- Bovenste rij met titel en knoppen -->
    <div class="flex justify-between items-center cursor-move"
         :style="{ backgroundColor: list.color }">
      <span>{{ list.title }}</span>

      <div class="flex items-center space-x-2">
        <!-- Deadline informatie -->
        <div class="flex items-center space-x-2">
          <input
              type="date"
              :value="list.deadline"
              @input="updateDeadline($event.target.value)"
              class="px-2 py-1 border rounded"
              :class="{
              'border-red-500 text-red-500': isExpired,
              'border-gray-300': !isExpired
            }"
          />
          <span :class="{
            'text-red-500 font-medium': isExpired,
            'text-green-600 font-medium': !isExpired && daysRemaining <= 7,
            'text-gray-600': !isExpired && daysRemaining > 7
          }">
            {{ deadlineText }}
          </span>
        </div>
        <input
            type="color"
            :value="list.color"
            @input="changeColor($event.target.value)"
            class="w-8 h-8 border cursor-pointer"
        />
        <button
            class="text-red-500 hover:text-red-700"
            @click="deleteList"
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
  </div>
</template>

<script>
import { defineComponent, computed } from 'vue';
import { useListStore } from '@/stores/listStore';

export default defineComponent({
  name: 'ListComponent',
  props: {
    list: {
      type: Object,
      required: true,
    },
  },
  emits: ['delete', 'updateColor', 'updateDeadline'],
  setup(props) {
    const listStore = useListStore();

    const daysRemaining = computed(() => {
      if (!props.list.deadline) return null;
      const today = new Date();
      const deadline = new Date(props.list.deadline);
      today.setHours(0, 0, 0, 0);
      deadline.setHours(0, 0, 0, 0);
      const diffTime = deadline - today;
      return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    });

    const isExpired = computed(() => {
      if (!props.list.deadline) return false;
      return daysRemaining.value < 0;
    });

    const deadlineText = computed(() => {
      if (!props.list.deadline) return '';
      if (isExpired.value) {
        const days = Math.abs(daysRemaining.value);
        return `${days} ${days === 1 ? 'dag' : 'dagen'} over tijd`;
      }
      if (daysRemaining.value === 0) return 'Deadline vandaag!';
      if (daysRemaining.value === 1) return 'Nog 1 dag';
      return `Nog ${daysRemaining.value} dagen`;
    });

    const changeColor = (newColor) => {
      listStore.updateListColor(props.list.id, newColor);
    };

    const updateDeadline = (newDeadline) => {
      listStore.updateListDeadline(props.list.id, newDeadline);
    };

    const deleteList = () => {
      listStore.deleteList(props.list.id);
    };

    return {
      deleteList,
      changeColor,
      updateDeadline,
      isExpired,
      daysRemaining,
      deadlineText,
    };
  },
});
</script>

<style scoped>
.deadline-warning {
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% { opacity: 1; }
  50% { opacity: 0.5; }
  100% { opacity: 1; }
}
</style>