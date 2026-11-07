<script setup lang="ts">
import { useNav, useSlideContext } from '@slidev/client'
import { computed, unref } from 'vue'

const props = withDefaults(defineProps<{
  filename: string
  directoryLabel?: string
  filetype?: string
  picker?: boolean
  directory?: boolean
  files?: string[]
  selected?: string
}>(), { directoryLabel: '.', picker: false, files: () => [] })
const { $renderContext } = useSlideContext()
const { isPrintMode } = useNav()
const showPicker = computed(() => props.picker && !unref(isPrintMode)
  && ['slide', 'presenter'].includes(unref($renderContext)))
const showDirectory = computed(() => props.directory && !unref(isPrintMode)
  && ['slide', 'presenter'].includes(unref($renderContext)))
const filetypeLabel = computed(() => props.filetype ?? (props.filename.endsWith('.go')
  ? 'go · gopls' : props.filename === 'go.mod' ? 'gomod' : props.filename.split('.').at(-1)))
const selectedIndex = computed(() => Math.max(0, props.files.indexOf(props.selected ?? props.filename)))
// SVG paths keep the illustration independent of Nerd Fonts and font fallback.
const fileIconPath = 'M14 3H6a1 1 0 0 0-1 1v16a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V8Z M14 3v5h5 M9 13h6 M9 17h6'
const folderIconPath = 'M3 7V5a1 1 0 0 1 1-1h5l2 3h9a1 1 0 0 1 1 1v11a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1Z M3 9h18'
</script>

<template>
  <section class="neovim-code" :aria-label="`Neovim-style code view: ${filename}`">
    <header class="buffer-tab">
      <svg class="editor-icon file-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path :d="showDirectory ? folderIconPath : fileIconPath" /></svg>
      {{ showDirectory ? directoryLabel : filename }}
    </header>
    <div v-if="showDirectory" class="directory-view" aria-label="Project directory illustration">
      <div class="directory-path">../</div>
      <div v-for="(file, i) in files" :key="file" class="directory-row" :class="{ active: i === selectedIndex }">
        <span class="gutter">{{ i === selectedIndex ? i + 1 : Math.abs(i - selectedIndex) }}</span>
        <svg class="editor-icon file-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path :d="fileIconPath" /></svg>
        {{ file }}
      </div>
      <div v-for="i in 2" :key="`empty-${i}`" class="empty-line" aria-hidden="true">~</div>
    </div>
    <div v-else class="editor" :class="{ dimmed: showPicker }"><slot /></div>
    <Transition name="picker">
      <div v-if="showPicker" class="file-picker" aria-label="File picker illustration">
        <div class="picker-heading"><span>Files</span></div>
        <div class="search">
          <svg class="editor-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><circle cx="10.5" cy="10.5" r="6.5" /><path d="m16 16 5 5" /></svg>
          <span class="block-cursor" aria-hidden="true"></span><small>{{ files.length }}/{{ files.length }}</small>
        </div>
        <div class="picker-columns">
          <div class="file-list">
            <div class="selection" :style="{ transform: `translateY(${selectedIndex * 38}px)` }"></div>
            <div v-for="file in files" :key="file" class="file-row" :class="{ selected: file === (selected ?? filename) }">
              <svg class="editor-icon file-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path :d="fileIconPath" /></svg>
              {{ file }}
            </div>
          </div>
          <div class="preview"><div class="preview-title">{{ selected ?? filename }}</div><slot name="preview" /></div>
        </div>
      </div>
    </Transition>
    <footer class="statusline"><strong>NORMAL</strong><span>{{ showDirectory ? '[No Name]' : filename }}</span><span class="language">{{ showDirectory ? 'directory' : filetypeLabel }}</span><span>1:1</span><span>Top</span></footer>
  </section>
</template>

<style scoped>
.directory-view { padding: 12px 18px; font-size: 22px; }
.directory-path, .empty-line { color: var(--_journey-muted); padding-left: 44px; line-height: 32px; }
.directory-row { display: flex; align-items: center; gap: 16px; height: 36px; }
.directory-row.active { background: var(--_journey-surface); }
.gutter { width: 28px; text-align: right; color: var(--_journey-muted); font-size: 18px; }
.directory-row.active .gutter { color: var(--_journey-ink); }

.neovim-code { position: relative; height: 360px; overflow: hidden; border: 1px solid var(--_journey-border); border-radius: 9px; background: var(--_journey-paper); color: var(--_journey-ink); font: 22px/1.45 var(--_journey-mono); box-shadow: 0 12px 28px #0002; }
.buffer-tab { display: flex; align-items: center; gap: 12px; width: fit-content; min-width: 190px; padding: 8px 20px; background: var(--_journey-surface); border-top: 2px solid var(--_journey-accent); font-size: 20px; }
.editor-icon { display: block; width: 20px; height: 20px; flex: 0 0 20px; fill: none; stroke: currentColor; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round; }
.file-icon { color: var(--_journey-accent); }
.editor { padding: 18px 16px; transition: opacity .25s ease; }
.editor.dimmed { opacity: .28; }
.neovim-code :deep(.slidev-code-wrapper) { margin: 0; }
.neovim-code :deep(pre), .neovim-code :deep(pre.shiki) { padding: 0 0 0 48px !important; border: 0; background: transparent !important; font-size: 23px !important; line-height: 1.6 !important; box-shadow: none; }
.neovim-code :deep(pre code) { counter-reset: editor-line -1; }
.neovim-code :deep(.line:first-child)::before { content: '1'; opacity: 1; }
.neovim-code :deep(.line) { position: relative; display: inline-block; min-height: 1.6em; width: 100%; }
.neovim-code :deep(.line)::before { counter-increment: editor-line; content: counter(editor-line); position: absolute; right: calc(100% + 15px); color: var(--_journey-muted); opacity: .55; font-size: 18px; }
.editor :deep(.line:first-child) { background: var(--_journey-surface); }
.editor :deep(.line:first-child)::after { content: ''; position: absolute; inset: 0 auto 0 0; width: .6em; background: var(--_journey-accent); opacity: .24; }
.statusline { position: absolute; inset: auto 0 0; display: flex; gap: 18px; align-items: center; background: var(--_journey-surface); font-size: 16px; line-height: 30px; padding-right: 14px; }
.statusline strong { color: var(--_journey-paper); background: var(--_journey-accent); padding: 0 14px; }
.language { margin-left: auto; color: var(--_journey-muted); }
.file-picker { position: absolute; inset: 48px 34px 48px; z-index: 1; background: var(--_journey-paper); border: 1px solid var(--_journey-border); box-shadow: 0 10px 35px #0004; }
.picker-heading { position: absolute; top: -15px; left: 50%; transform: translateX(-50%); font-size: 19px; }
.picker-heading span { padding: 2px 12px; background: var(--_journey-accent); color: var(--_journey-paper); font-weight: 700; }
.search { display: flex; gap: 9px; align-items: center; height: 43px; padding: 0 15px; background: var(--_journey-surface); }
.search small { margin-left: auto; font-size: 16px; color: var(--_journey-muted); }
.block-cursor { height: 22px; width: 10px; background: var(--_journey-ink); }
.picker-columns { display: grid; grid-template-columns: 30% minmax(0, 1fr); gap: 18px; padding: 20px 14px 10px; }
.file-list { position: relative; font-size: 18px; }
.file-row { position: relative; display: flex; align-items: center; gap: 10px; height: 38px; padding-left: 8px; }
.file-row.selected { color: var(--_journey-accent); }
.selection { position: absolute; inset: 0 0 auto; height: 38px; background: var(--_journey-surface); border-left: 2px solid var(--_journey-accent); transition: transform .4s cubic-bezier(.22, 1, .36, 1); }
.preview { position: relative; min-width: 0; padding-top: 19px; border-left: 1px solid var(--_journey-border); padding-left: 12px; }
.preview-title { position: absolute; top: -12px; left: 50%; transform: translateX(-50%); padding: 0 8px; background: var(--_journey-accent-soft); color: var(--_journey-ink); font-size: 17px; }
.preview :deep(pre), .preview :deep(pre.shiki) { font-size: 20px !important; }
.picker-enter-active, .picker-leave-active { transition: opacity .3s ease, transform .3s cubic-bezier(.22, 1, .36, 1); }
.picker-enter-from, .picker-leave-to { opacity: 0; transform: translateY(10px) scale(.98); }
@media (prefers-reduced-motion: reduce), print {
  .editor, .selection, .picker-enter-active, .picker-leave-active { transition: none; }
}
</style>
