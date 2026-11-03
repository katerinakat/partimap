import { getClientIp } from 'request-ip';
import StatusCodes from 'http-status-codes';
import { z } from 'zod';
import * as sdb from '~/server/data/sheets';

const paramsSchema = z.object({
	id: z.coerce.number(),
});

// Public endpoint: lets survey respondents (no login) attach a photo to a
// text answer or to a map marker's description, while filling in a survey.
// Reuses the same acceptImage() pipeline as admin image uploads (format
// check, 5MB limit, resize, EXIF stripped on re-encode), but is rate
// limited per IP since there is no auth and no per-submission captcha yet
// at this point in the flow (captcha is only validated on final submit).
export default defineEventHandler(async (event) => {
	const { id } = await getValidatedRouterParams(event, paramsSchema.parse);

	const sheet = await sdb.findById(id);
	if (!sheet) throw createError({ statusCode: StatusCodes.NOT_FOUND });

	const ip = getClientIp(event.node.req) || 'unknown';
	if (isRateLimited('respondent-photo', ip, 30, 10 * 60 * 1000)) {
		throw createError({ statusCode: StatusCodes.TOO_MANY_REQUESTS });
	}

	const url = await acceptImage(event, `respondent-photos/sheet-${sheet.id}`, 1600, 1600);
	return { url };
});
