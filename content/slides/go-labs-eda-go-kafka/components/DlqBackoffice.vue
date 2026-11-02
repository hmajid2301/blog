<script setup lang="ts">
defineProps<{ step: number }>()
</script>

<template>
  <section class="dlq-backoffice" aria-label="Backoffice DLQ replay mockup" :data-replay-state="step >= 2 ? 'published' : step === 1 ? 'confirm' : 'inspect'">
    <header class="app-bar">
      <strong>Operations <span>/ Dead letters</span></strong>
      <span class="mock-label">Mockup</span>
    </header>
    <div class="page-heading">
      <div><small>DISBURSEMENTS</small><h2>Dead-letter queue</h2></div>
      <span class="topic">disbursements.dlq</span>
    </div>
    <div class="workspace">
      <div class="event-list">
        <div class="list-heading"><strong>Events</strong><span>3 records</span></div>
        <div class="event-row selected">
          <div><strong>Collection A</strong><span class="badge" :class="{ queued: step >= 2 }">{{ step >= 2 ? 'Replay queued' : 'Exhausted' }}</span></div>
          <span>Partner bank timeout</span>
          <small>7 attempts · today, 13:51</small>
        </div>
        <div class="event-row">
          <div><strong>Collection B</strong><span class="badge">Permanent</span></div>
          <span>Invalid bank account</span>
          <small>1 attempt · today, 13:42</small>
        </div>
        <div class="event-row">
          <div><strong>Collection C</strong><span class="badge">Exhausted</span></div>
          <span>Partner bank timeout</span>
          <small>7 attempts · today, 13:28</small>
        </div>
        <div class="list-footer">Showing 3 of 3</div>
      </div>
      <div class="event-detail">
        <div class="detail-heading"><strong>Collection A</strong><span class="topic">evt_a17</span></div>
        <div class="metadata"><span>Failure</span><strong>Partner bank timeout</strong><span>Event type</span><strong>collection.completed</strong><span>Record key</span><strong>collection-a</strong></div>
        <div class="payload-label">PAYLOAD</div>
        <div class="payload" aria-label="Event payload">{<br>&nbsp; "event_id": "evt_a17",<br>&nbsp; "collection_id": "collection-a",<br>&nbsp; "status": "completed"<br>}</div>
        <div class="replay-target"><small>REPLAY DESTINATION</small><span>disbursements.retry.5m</span></div>
        <div class="detail-footer"><span>Same event ID &amp; key</span><span class="action" :class="{ queued: step >= 2 }">{{ step >= 2 ? 'Queued ✓' : 'Replay to retry →' }}</span></div>
      </div>
    </div>
    <div v-if="step === 1" class="modal-backdrop">
      <div class="replay-dialog" role="dialog" aria-modal="true" aria-label="Confirm replay">
        <small>REPLAY ONE EVENT</small>
        <h3>Replay Collection A?</h3>
        <div class="dialog-route"><span>disbursements.dlq</span><span>↓</span><strong>disbursements.retry.5m</strong></div>
        <div class="reason"><small>REASON</small><span>Bank recovered · incident INC-204 resolved</span></div>
        <div class="dialog-note">Same event ID &amp; key · new retry budget</div>
        <div class="dialog-actions"><span>Cancel</span><span class="action">Confirm replay →</span></div>
      </div>
    </div>
    <div v-if="step >= 2" class="replay-result" role="status">
      <span class="success-icon">✓</span>
      <div><strong>Published to disbursements.retry.5m</strong><span>Audit #RP-1042 · alex.ops · INC-204 · awaiting processing</span></div>
    </div>
  </section>
</template>

<style scoped>
.dlq-backoffice { position: relative; width: 1100px; height: 590px; overflow: hidden; border: 1px solid #45475a; border-radius: 14px; background: #181825; color: #cdd6f4; text-align: left; font: 18px/1.4 'Poppins', sans-serif; box-shadow: 0 16px 48px #0003; }
.app-bar { height: 58px; padding: 0 28px; display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid #313244; background: #1e1e2e; }
.app-bar strong { font-size: 19px; }
.app-bar strong span, small, .list-heading > span, .metadata > span, .detail-footer > span:first-child, .list-footer { color: #a6adc8; }
.mock-label { border: 1px solid #585b70; border-radius: 6px; padding: 2px 10px; font-size: 15px; color: #a6adc8; }
.page-heading { display: flex; justify-content: space-between; align-items: center; padding: 16px 28px; }
.dlq-backoffice small { display: block; font-size: 14px; letter-spacing: .04em; }
.dlq-backoffice h2 { margin: 3px 0 0; font: 600 28px/1.3 'Poppins', sans-serif; }
.topic { color: #b4befe; font: 16px/1.4 'Noto Sans Mono', monospace; }
.workspace { display: grid; grid-template-columns: 44% 56%; margin: 0 28px; border: 1px solid #45475a; border-radius: 10px; overflow: hidden; }
.event-list { border-right: 1px solid #45475a; background: #1e1e2e; }
.list-heading, .detail-heading { display: flex; align-items: center; justify-content: space-between; padding: 12px 20px; border-bottom: 1px solid #313244; }
.list-heading > span { font-size: 15px; }
.event-row { padding: 16px 20px; border-bottom: 1px solid #313244; }
.event-row > div { display: flex; justify-content: space-between; align-items: center; margin-bottom: 5px; }
.event-row > span { display: block; color: #bac2de; font-size: 16px; }
.event-row small { margin-top: 4px; }
.event-row.selected { background: #89b4fa12; box-shadow: inset 3px 0 #89b4fa; }
.badge { padding: 2px 8px; border-radius: 5px; background: #f38ba814; color: #f38ba8; font-size: 13px; }
.badge.queued { color: #a6e3a1; background: #a6e3a114; }
.list-footer { padding: 13px 20px; font-size: 14px; }
.event-detail { padding-bottom: 10px; }
.metadata { display: grid; grid-template-columns: 118px 1fr; gap: 5px 12px; padding: 10px 20px; font-size: 15px; }
.metadata strong { font-weight: 500; }
.payload-label { margin: 0 20px 6px; color: #a6adc8; font-size: 13px; letter-spacing: .06em; }
.payload { margin: 0 20px; padding: 8px 14px; background: #11111b; border: 1px solid #313244; border-radius: 6px; color: #a6e3a1; font: 15px/1.5 'Noto Sans Mono', monospace; }
.replay-target { margin: 12px 20px; }
.replay-target small { font-size: 12px; }
.replay-target > span { color: #f9e2af; font: 17px/1.5 'Noto Sans Mono', monospace; }
.detail-footer { padding: 0 20px; display: flex; align-items: center; justify-content: space-between; font-size: 13px; }
.action { display: inline-block; padding: 9px 14px; border-radius: 6px; background: #89b4fa; color: #11111b; font-size: 15px; font-weight: 600; }
.action.queued { background: #a6e3a1; }
.modal-backdrop { position: absolute; inset: 58px 0 0; display: grid; place-items: center; background: #11111bd9; }
.replay-dialog { width: 620px; padding: 28px; border: 1px solid #585b70; border-radius: 12px; background: #1e1e2e; box-shadow: 0 18px 50px #0006; }
.dlq-backoffice h3 { margin: 5px 0 22px; font: 600 27px/1.3 'Poppins', sans-serif; }
.dialog-route { display: grid; gap: 5px; padding: 14px 18px; border: 1px solid #45475a; border-radius: 8px; color: #a6adc8; font: 18px/1.4 'Noto Sans Mono', monospace; }
.dialog-route strong { color: #f9e2af; font-weight: 500; }
.reason { display: grid; gap: 5px; margin-top: 20px; font-size: 17px; }
.dialog-note { color: #a6adc8; margin-top: 16px; font-size: 15px; }
.dialog-actions { display: flex; justify-content: flex-end; align-items: center; gap: 24px; margin-top: 24px; font-size: 16px; }
.replay-result { position: absolute; bottom: 18px; left: 175px; right: 28px; display: flex; align-items: center; gap: 16px; padding: 16px 20px; border: 1px solid #a6e3a1; border-radius: 10px; background: #1e2a25; box-shadow: 0 8px 30px #0005; }
.success-icon { font-size: 28px; color: #a6e3a1; }
.replay-result strong { display: block; color: #a6e3a1; font-size: 18px; }
.replay-result div > span { display: block; margin-top: 3px; color: #bac2de; font-size: 14px; }
</style>
