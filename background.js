// Still Becoming — Background Service Worker

chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name.startsWith('letter_')) {
    const letterId = alarm.name.replace('letter_', '');
    const data = await chrome.storage.local.get('letters');
    const letters = data.letters || [];
    const letter = letters.find(l => l.id === letterId);
    if (letter) {
      chrome.notifications.create({
        type: 'basic',
        iconUrl: 'icons/icon128.png',
        title: 'A letter has arrived ✉️',
        message: `"${letter.title}" is ready to be opened.`,
        priority: 2
      });
      // Mark as unlocked
      const updated = letters.map(l =>
        l.id === letterId ? { ...l, status: 'unlocked' } : l
      );
      await chrome.storage.local.set({ letters: updated });
    }
  }
});

// Schedule alarms for all pending letters on startup
chrome.runtime.onStartup.addListener(scheduleAlarms);
chrome.runtime.onInstalled.addListener(scheduleAlarms);

async function scheduleAlarms() {
  const data = await chrome.storage.local.get('letters');
  const letters = data.letters || [];
  letters.forEach(letter => {
    if (letter.status === 'sealed') {
      const unlockTime = new Date(letter.unlockDate).getTime();
      if (unlockTime > Date.now()) {
        chrome.alarms.create(`letter_${letter.id}`, { when: unlockTime });
      }
    }
  });
}
