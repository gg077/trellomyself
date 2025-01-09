<template>
  <div id="app">
    <!-- Gebruik van het BoardComponent -->
    <BoardComponent />


  </div>
</template>
<script>
import BoardComponent from './components/BoardComponent.vue';

export default {
  name: 'App',
  components: {
    BoardComponent,

  },
};
</script>
<style>
/* Basis styling voor de applicatie */
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>