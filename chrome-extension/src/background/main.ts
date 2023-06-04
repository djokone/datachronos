import { onMessage, sendMessage } from 'webext-bridge'
import type { Tabs } from 'webextension-polyfill'
let ws = new WebSocket('ws://localhost:5648');

// only on dev mode
if (import.meta.hot) {
  // @ts-expect-error for background HMR
  import('/@vite/client')
  // load latest content script
  import('./contentScriptHMR')
}

browser.runtime.onInstalled.addListener((): void => {
  // eslint-disable-next-line no-console
  console.log('Extension installed')
})

let previousTabId = 0
let historyData = []
browser.history.onVisited.addListener(function(historyItem: any) {
  console.log('visite : ' + historyItem.url)
  console.log(historyItem)
  browser.history.getVisits({url: historyItem.url}).then(function(visits: any) {
    historyData.push({
      historyItem: historyItem,
      visits: visits
    });
    ws.send(JSON.stringify({
      historyItem: historyItem,
      visits: visits
    }));
    // let jsonHistory = JSON.stringify(historyData);
    // TODO: faire quelque chose avec jsonHistory, par exemple le sauvegarder dans le stockage de l'extension ou créer un lien de téléchargement
  });
});

// communication example: send previous tab title from background page
// see shim.d.ts for type declaration
browser.tabs.onActivated.addListener(async({ tabId }) => {
  if (!previousTabId) {
    previousTabId = tabId
    return
  }

  let tab: Tabs.Tab

  try {
    tab = await browser.tabs.get(previousTabId)
    previousTabId = tabId
  }
  catch {
    return
  }

  // eslint-disable-next-line no-console
  console.log('previous tab', tab)
  sendMessage('tab-prev', { title: tab.title }, { context: 'content-script', tabId })
})

onMessage('get-current-tab', async() => {
  try {
    const tab = await browser.tabs.get(previousTabId)
    return {
      title: tab?.title,
    }
  }
  catch {
    return {
      title: undefined,
    }
  }
})
