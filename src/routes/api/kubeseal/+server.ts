import { json } from '@sveltejs/kit';
import { exec } from 'child_process';

export async function POST({ request }) {
	const requestData = JSON.parse(await request.text());
	let secret = requestData.secret;
	let pem = requestData.pem;

	// Execute kubeseal command
	const kubesealCmd = `bash -c 'echo -e "${secret}" | kubeseal --cert <(echo -e "${pem}") --format=json'`;

	const sealedSecretData = await new Promise((resolve, reject) => {
		exec(kubesealCmd, (error, stdout, stderr) => {
			if (error) {
				console.error(`Error: ${error.message}`);
				reject(error);
			}
			if (stderr) {
				console.error(`Stderr: ${stderr}`);
				reject(stderr);
			}
			resolve(stdout);
		});
	});
	return json({ sealed: sealedSecretData });
}
