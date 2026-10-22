import { json } from '@sveltejs/kit';
import { spawn } from 'child_process';
import { X509Certificate } from 'crypto';
import { mkdtemp, rm, writeFile } from 'fs/promises';
import { tmpdir } from 'os';
import { join } from 'path';
import yaml from 'js-yaml';
import type { RequestHandler } from './$types';

const MAX_INPUT_LENGTH = 64 * 1024;
const KUBESEAL_TIMEOUT_MS = 10_000;

// Kubernetes naming rules: names are DNS subdomains, namespaces are DNS labels
const DNS_SUBDOMAIN = /^[a-z0-9]([-a-z0-9.]{0,251}[a-z0-9])?$/;
const DNS_LABEL = /^[a-z0-9]([-a-z0-9]{0,61}[a-z0-9])?$/;
const DATA_KEY = /^[-._a-zA-Z0-9]{1,253}$/;
const BASE64 = /^[A-Za-z0-9+/]*={0,2}$/;
const SECRET_TYPES = [
	'Opaque',
	'kubernetes.io/tls',
	'kubernetes.io/basic-auth',
	'kubernetes.io/ssh-auth',
	'kubernetes.io/dockerconfigjson'
];

type Secret = {
	apiVersion: 'v1';
	kind: 'Secret';
	metadata: { name: string; namespace: string };
	type: string;
	data: Record<string, string>;
};

function isRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === 'object' && value !== null && !Array.isArray(value);
}

// Parses the submitted YAML and rebuilds it as a plain v1 Secret, so only the
// fields checked here ever reach kubeseal.
function toSecret(secretYaml: string): Secret {
	let doc: unknown;
	try {
		doc = yaml.load(secretYaml);
	} catch {
		throw new Error('Secret is not valid YAML (only one document is allowed)');
	}
	if (!isRecord(doc) || doc.apiVersion !== 'v1' || doc.kind !== 'Secret') {
		throw new Error('Input must be a single Kubernetes v1 Secret');
	}

	const { metadata, type = 'Opaque', data } = doc;
	if (!isRecord(metadata)) throw new Error('Secret is missing metadata');
	const { name, namespace } = metadata;
	if (typeof name !== 'string' || !DNS_SUBDOMAIN.test(name)) {
		throw new Error('Secret name must be lowercase letters, digits, "-" or "."');
	}
	if (typeof namespace !== 'string' || !DNS_LABEL.test(namespace)) {
		throw new Error('Namespace must be lowercase letters, digits or "-"');
	}
	if (typeof type !== 'string' || !SECRET_TYPES.includes(type)) {
		throw new Error('Unsupported secret type');
	}

	if (!isRecord(data) || Object.keys(data).length === 0) {
		throw new Error('Secret must have at least one data item');
	}
	for (const [key, value] of Object.entries(data)) {
		if (!DATA_KEY.test(key)) throw new Error(`Invalid data key: ${key}`);
		if (typeof value !== 'string' || value.length % 4 !== 0 || !BASE64.test(value)) {
			throw new Error(`Value for ${key} must be base64-encoded`);
		}
	}

	return {
		apiVersion: 'v1',
		kind: 'Secret',
		metadata: { name, namespace },
		type,
		data: data as Record<string, string>
	};
}

// Returns Node's re-encoded PEM, never the raw upload
function toCertPem(pem: string): string {
	let cert: X509Certificate;
	try {
		cert = new X509Certificate(pem);
	} catch {
		throw new Error('Encryption key must be a PEM-encoded certificate');
	}
	if (cert.publicKey.asymmetricKeyType !== 'rsa') {
		throw new Error('Encryption key must be an RSA certificate');
	}
	if (new Date(cert.validTo) < new Date()) {
		throw new Error(`Certificate expired on ${cert.validTo}`);
	}
	return cert.toString();
}

function runKubeseal(secretJson: string, certPath: string): Promise<string> {
	return new Promise((resolve, reject) => {
		const proc = spawn('kubeseal', ['--cert', certPath, '--format', 'json'], {
			timeout: KUBESEAL_TIMEOUT_MS
		});
		let stdout = '';
		let stderr = '';
		proc.stdout.on('data', (chunk) => (stdout += chunk));
		proc.stderr.on('data', (chunk) => (stderr += chunk));
		proc.stdin.on('error', () => {});
		proc.on('error', reject);
		proc.on('close', (code, signal) => {
			if (code === 0) resolve(stdout);
			else reject(new Error(stderr.trim() || `kubeseal exited (${signal ?? code})`));
		});
		proc.stdin.end(secretJson);
	});
}

export const POST: RequestHandler = async ({ request }) => {
	const body = await request.json().catch(() => null);
	if (!isRecord(body) || typeof body.secret !== 'string' || typeof body.pem !== 'string') {
		return json({ error: 'Request must include secret and pem strings' }, { status: 400 });
	}
	if (body.secret.length > MAX_INPUT_LENGTH || body.pem.length > MAX_INPUT_LENGTH) {
		return json({ error: 'Input too large' }, { status: 413 });
	}

	let secret: Secret;
	let certPem: string;
	try {
		secret = toSecret(body.secret);
		certPem = toCertPem(body.pem);
	} catch (err) {
		return json({ error: (err as Error).message }, { status: 400 });
	}

	const dir = await mkdtemp(join(tmpdir(), 'kubeseal-'));
	try {
		const certPath = join(dir, 'cert.pem');
		await writeFile(certPath, certPem, { mode: 0o600 });
		const sealed = await runKubeseal(JSON.stringify(secret), certPath);
		if (JSON.parse(sealed).kind !== 'SealedSecret') {
			throw new Error('kubeseal returned unexpected output');
		}
		return json({ sealed });
	} catch (err) {
		console.error('kubeseal failed:', err);
		return json({ error: 'Sealing failed. Check the certificate and secret.' }, { status: 500 });
	} finally {
		await rm(dir, { recursive: true, force: true });
	}
};
