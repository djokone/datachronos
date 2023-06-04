<template>
  <main class="py-5 px-4 w-[300px] text-center text-gray-700">
    <Logo />
    <div>Popup</div>
    <p class="mt-2 opacity-50">
      This is the popup de ouf
    </p>
    <button class="mt-2 btn" @click="openOptionsPage">
      Open Options
    </button>
    <button class="mt-2 btn" @click="sendMessage">
      send
    </button>
    <div class="mt-2">
      <span class="opacity-50">Storage:</span> {{ storageDemo }}
    </div>
  </main>
</template>

<script>
import { storageDemo } from '~/logic/storage'

export default {
  name: 'Popup',
  components: {
    Logo: () => import('~/components/Logo.vue'),
  },
  data() {
    return {
      socket: null,
      storageDemo,
    }
  },
  created() {
    this.startWebsocket()
  },
  methods: {
    startWebsocket () {
      this.socket = new WebSocket('ws://localhost:5648')

      this.socket.addEventListener('open', function (event) {
        this.socket.send('Hello from Chrome extension!')
      })

      this.socket.addEventListener('message', function (event) {
        console.log('Message from server: ', event.data)
      })
    },
    openOptionsPage,
    sendMessage () {
      console.log('sendMessage')
      const data = {
        historyItem: {url: "test.com"}
      };
      this.socket.send(JSON.stringify(data))
    }
  },
}

function openOptionsPage() {
  browser.runtime.openOptionsPage()
}
</script>
