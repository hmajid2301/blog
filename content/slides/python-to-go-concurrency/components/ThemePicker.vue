<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useNav } from '@slidev/client'
import { themePresets } from '../../slidev-shared/theme-presets'
import '../../slidev-shared/styles/theme-preview.css'

const nav = useNav()
const enabled = ref(false)
const selected = ref('original')

function applyTheme() {
  const theme = themePresets.find(theme => theme.id === selected.value)
  const root = document.documentElement
  if (theme) root.dataset.talkTheme = theme.id
  else delete root.dataset.talkTheme
  root.classList.toggle('dark', theme?.dark ?? true)
  root.style.colorScheme = theme?.dark === false ? 'light' : 'dark'
  const url = new URL(location.href)
  if (theme) url.searchParams.set('theme', theme.id)
  else url.searchParams.delete('theme')
  history.replaceState(history.state, '', url)
}

onMounted(() => {
  const params = new URLSearchParams(location.search)
  enabled.value = params.get('themes') === '1'
  if (!enabled.value) return
  const requested = params.get('theme')
  selected.value = themePresets.some(theme => theme.id === requested) ? requested! : 'original'
  applyTheme()
})
</script>

<template>
  <aside v-if="enabled" class="theme-picker" aria-label="Theme preview controls" @click.stop @keydown.stop>
    <label>
      Theme
      <select v-model="selected" aria-label="Presentation theme" @change="applyTheme">
        <option value="original">Original · Kafka style</option>
        <option v-for="theme in themePresets" :key="theme.id" :value="theme.id">{{ theme.name }}</option>
      </select>
    </label>
    <button type="button" @click="nav.go(nav.currentPage.value, 0)">Replay slide</button>
    <button type="button" @click="nav.go(3, 0)">Click reveals</button>
    <button type="button" @click="nav.go(15, 0)">Diagram</button>
    <button type="button" @click="nav.go(nav.total.value - 3, 0)">Animation lab</button>
    <span>← / → navigate · theme changes keep your step</span>
  </aside>
</template>

<style scoped>
.theme-picker { position:fixed; top:8px; left:16px; right:16px; z-index:100; display:flex; align-items:center; gap:8px; flex-wrap:wrap; padding:8px 12px; background:#f4f3ef; color:#20313a; border:1px solid #68777c; border-radius:6px; font:14px/1.4 'DM Sans',sans-serif; box-shadow:0 2px 12px #0002; }
label { display:flex; align-items:center; gap:8px; font-weight:700; }
select,button { font:inherit; color:inherit; background:white; border:1px solid #68777c; border-radius:3px; padding:5px 8px; }
button { cursor:pointer; }
button:focus-visible,select:focus-visible { outline:3px solid #007d97; outline-offset:2px; }
span { color:#526168; margin-left:auto; font-size:12px; }
@media print { .theme-picker { display:none; } }
</style>
