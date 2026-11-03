<script setup lang="ts">
import type { Question } from '~/server/data/surveyAnswers';

const props = defineProps<{
	q: Question;
	name: string;
	sheetId: number;
}>();

// When q.allowPhoto is on, the answer is stored as { text, photo }
// instead of a plain string, so an attached photo travels along with
// the submission. Plain text questions keep the old string shape.
const answer = defineModel<string | { text?: string; photo?: string | null } | undefined>();

const text = computed<string>({
	get: () => {
		if (!props.q.allowPhoto) return (answer.value as string) || '';
		return (answer.value as { text?: string })?.text || '';
	},
	set: (newText) => {
		if (!props.q.allowPhoto) {
			answer.value = newText;
			return;
		}
		answer.value = { ...(answer.value as object), text: newText };
	},
});

const photo = computed<string | null>({
	get: () => (answer.value as { photo?: string | null })?.photo || null,
	set: (newPhoto) => {
		answer.value = { ...(answer.value as object), photo: newPhoto };
	},
});
</script>

<template>
	<div>
		<b-form-input
			v-if="!q.multiline"
			v-model.trim="text"
			:name="name"
			:required="q.required"
		/>
		<MultilineTextInput
			v-else
			v-model="text"
			:name="name"
			:required="!!q.required"
		/>
		<RespondentPhotoInput
			v-if="q.allowPhoto"
			v-model="photo"
			:sheet-id="sheetId"
		/>
	</div>
</template>
