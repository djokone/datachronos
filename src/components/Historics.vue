<script>

export default {
  name: "Histories",
  mounted() {
    // ipcRenderer.on('message', (event, message) => {
    //   console.log('icp render message', message);
    // });
    window.electron.on('message', (event, message) => {
      console.log('message', message)
      this.histories.push(JSON.parse(message))
      console.log(this.histories)
    })
    window.electron.on('ws', (event, message) => {
      console.log('message', message)
      this.ws = message
      console.log(this.histories)
    })
  },
  data () {
    return {
      ws: '',
      histories: []
    }
  },
}
</script>

<template>
  <div>
    <h1>Historics</h1>
    <span>
      {{ws}}
    </span>
    <ul>
      <li v-for="(v, key) in histories">{{v.historyItem.url}}</li>
    </ul>
  </div>

</template>

<style scoped>

</style>