<script setup lang="ts">
import site from '~/data/site.json'
const { t } = useContent()
const fields = reactive({ name: '', email: '', phone: '', subject: '', message: '' })
const draft = ref('')
const prepare = () => {
 const body = `${fields.name.trim()}\n${fields.email.trim()}\n${fields.phone.trim()}\n\n${fields.message.trim()}`
 draft.value = `mailto:${site.emails[0]!.address}?subject=${encodeURIComponent(fields.subject.trim())}&body=${encodeURIComponent(body)}`
}
watch(fields, () => { draft.value = '' })
</script>
<template><section class="div-contactus3"><div class="wrapper"><h2>{{ t.feedback }}</h2><p class="form-privacy">{{ t.privacy }}</p><form class="feedback-draft" @submit.prevent="prepare"><label>{{ t.name }} *<input v-model="fields.name" name="name" autocomplete="name" required maxlength="100"></label><label>{{ t.email }} *<input v-model="fields.email" name="email" type="email" autocomplete="email" required maxlength="254"></label><label>{{ t.phone }}<input v-model="fields.phone" name="phone" type="tel" autocomplete="tel" maxlength="40"></label><label>{{ t.subject }} *<input v-model="fields.subject" name="subject" required maxlength="160"></label><label class="full-field">{{ t.message }} *<textarea v-model="fields.message" name="message" required maxlength="3000" rows="6"></textarea></label><button class="btn" type="submit">{{ t.prepare }}</button></form><div v-if="draft" class="draft-result" role="status"><p>{{ t.draftNotice }}</p><p>{{ t.sendTo }}: {{ site.emails[0]!.address }}</p><a class="btn" :href="draft">{{ t.openMail }}</a></div></div></section></template>
