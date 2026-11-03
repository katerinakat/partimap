<script setup lang="ts">
const photoUrl = defineModel<string | null | undefined>();

const props = defineProps<{
	sheetId: number;
}>();

const { t } = useI18n();

const pickedFile = ref<File | null>();
const uploading = ref(false);
const uploadFailed = ref(false);

watch(pickedFile, async (file) => {
	if (!file) return;
	uploadFailed.value = false;

	if (file.size > 5 * 1024 * 1024) {
		uploadFailed.value = true;
		pickedFile.value = null;
		return;
	}

	uploading.value = true;
	try {
		const formData = new FormData();
		formData.append('image', file);
		const { url } = await $fetch<{ url: string }>(
			`/api/sheet/${props.sheetId}/respondent-photo`,
			{
				method: 'PUT',
				body: formData,
			},
		);
		photoUrl.value = url;
	} catch {
		uploadFailed.value = true;
	} finally {
		uploading.value = false;
		pickedFile.value = null;
	}
});

function removePhoto() {
	photoUrl.value = null;
}
</script>

<template>
	<div class="respondent-photo-input mt-2">
		<div
			v-if="photoUrl"
			class="d-flex align-items-center gap-2"
		>
			<img
				:src="photoUrl"
				class="rounded"
				style="height: 64px; width: 64px; object-fit: cover"
			/>
			<b-button
				size="sm"
				variant="outline-danger"
				@click="removePhoto"
			>
				<i class="fas fa-fw fa-trash" />
				{{ t('imageUpload.remove') }}
			</b-button>
		</div>
		<template v-else>
			<ImageFileInput
				v-model="pickedFile"
				:state="uploadFailed ? false : null"
			/>
			<b-spinner
				v-if="uploading"
				small
				class="mt-1"
			/>
			<div class="small text-muted mt-1">
				{{ t('imageUpload.maxFileSize') }}
			</div>
		</template>
	</div>
</template>
