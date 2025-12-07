#!/usr/bin/env node
// Set Vercel environment variables and trigger a redeploy (uses native fetch, Node 18+)
// Usage example:
// VERCEL_TOKEN=xxxxx node ./scripts/vercel-set-env-and-redeploy.js \
//   --project mortals-backend \
//   --repo BraamaKamara/mortals-backend \
//   --branch clean-init-main \
//   --env FRONTEND_URL=https://mortals-dashboard.vercel.app/ \
//   --env CLIENT_URL=https://mortals-dashboard.vercel.app/ \
//   --env STRIPE_SUCCESS_URL=https://mortals-dashboard.vercel.app/stripe-success \
//   --target production

const [,, ...rawArgs] = process.argv;

function parseArgs(args) {
  const out = { env: [], target: 'production' };
  let i = 0;
  while (i < args.length) {
    const a = args[i];
    if (a === '--project') { out.project = args[i+1]; i += 2; }
    else if (a === '--repo') { out.repo = args[i+1]; i += 2; }
    else if (a === '--branch') { out.branch = args[i+1]; i += 2; }
    else if (a === '--env') { out.env.push(args[i+1]); i += 2; }
    else if (a === '--target') { out.target = args[i+1]; i += 2; }
    else { i++; }
  }
  return out;
}

const args = parseArgs(rawArgs);
const VERCEL_TOKEN = process.env.VERCEL_TOKEN || process.env.VERCEL_API_TOKEN;
if (!VERCEL_TOKEN) {
  console.error('Error: set VERCEL_TOKEN environment variable or VERCEL_API_TOKEN');
  process.exit(1);
}
if (!args.project || !args.repo || !args.branch) {
  console.error('Usage: --project <project-name> --repo <owner/repo> --branch <branch> --env KEY=VALUE [--env KEY2=VALUE2] [--target production]');
  process.exit(1);
}

const API_BASE = 'https://api.vercel.com';

async function api(path, opts = {}) {
  const url = API_BASE + path;
  const res = await fetch(url, {
    method: opts.method || 'GET',
    headers: Object.assign({
      'Authorization': `Bearer ${VERCEL_TOKEN}`,
      'Content-Type': 'application/json'
    }, opts.headers || {}),
    body: opts.body ? JSON.stringify(opts.body) : undefined,
  });
  const text = await res.text();
  let body;
  try { body = text ? JSON.parse(text) : {}; } catch (e) { body = text; }
  if (!res.ok) {
    const err = new Error(`Vercel API ${res.status} ${res.statusText}: ${JSON.stringify(body)}`);
    err.status = res.status;
    err.body = body;
    throw err;
  }
  return body;
}

function parseEnvAssignments(list) {
  return list.map(s => {
    const idx = s.indexOf('=');
    if (idx === -1) throw new Error('Invalid --env entry: ' + s);
    return { key: s.slice(0, idx), value: s.slice(idx+1) };
  });
}

async function upsertEnv(project, key, value, target) {
  // List envs and delete existing key for the same target, then create a new one
  let listRaw;
  try {
    listRaw = await api(`/v9/projects/${encodeURIComponent(project)}/env`);
  } catch (err) {
    throw new Error(`Failed to list envs for project ${project}: ${err.message || err}`);
  }

  // API may return an array or an object with an `envs` array. Normalize to array.
  let list = [];
  if (Array.isArray(listRaw)) list = listRaw;
  else if (listRaw && Array.isArray(listRaw.envs)) list = listRaw.envs;
  else if (listRaw && listRaw.error) throw new Error(`Vercel API error when listing envs: ${JSON.stringify(listRaw)}`);
  else list = [];

  const matches = (list || []).filter(e => e.key === key && (e.target || []).includes(target));

  // If an env exists for the same key+target, update it instead of creating a new one.
  if (matches.length > 0) {
    for (const m of matches) {
      const id = m.uid || m.id || m.envId || m.environmentId;
      if (!id) {
        console.warn('Found matching env but could not determine its id, skipping update:', m);
        continue;
      }
      try {
        const patchBody = { value, type: 'encrypted' };
        await api(`/v9/projects/${encodeURIComponent(project)}/env/${id}`, { method: 'PATCH', body: patchBody });
        console.log(`Updated existing env ${key} (id=${id}) for target ${target}`);
      } catch (e) {
        console.warn('Warning updating env:', e.message || e);
      }
    }
    return { updated: true };
  }

  // No existing env for the same key+target, create it.
  const payload = {
    key,
    value,
    target: [target],
    type: 'encrypted'
  };
  try {
    const created = await api(`/v9/projects/${encodeURIComponent(project)}/env`, { method: 'POST', body: payload });
    console.log(`Created env ${key} for target ${target}`);
    return created;
  } catch (err) {
    // If the API reports ENV_ALREADY_EXISTS despite our check, try to find and patch the existing var.
    if (err.body && err.body.error && err.body.error.code === 'ENV_ALREADY_EXISTS') {
      const existing = (list || []).find(e => e.key === key && (e.target || []).includes(target));
      const id = existing && (existing.uid || existing.id || existing.envId || existing.environmentId);
      if (id) {
        await api(`/v9/projects/${encodeURIComponent(project)}/env/${id}`, { method: 'PATCH', body: { value, type: 'encrypted' } });
        console.log(`Patched existing env ${key} (id=${id}) after race condition.`);
        return { patched: true };
      }
    }
    throw err;
  }
}

async function triggerRedeploy(project, repo, branch) {
  // Trigger a git-based deployment for the project's repo & branch
  const payload = {
    name: project,
    gitSource: {
      type: 'github',
      repoId: repo,
      ref: branch
    }
  };
  const resp = await api('/v13/deployments', { method: 'POST', body: payload });
  console.log('Redeploy started. Deployment ID:', resp.id);
  return resp;
}

async function waitForDeploymentReady(deployId, timeoutMs = 5 * 60 * 1000) {
  const start = Date.now();
  while (true) {
    const info = await api(`/v13/deployments/${deployId}`);
    if (info.state === 'READY' || info.readyState === 'READY') return info;
    if (info.state === 'ERROR' || info.readyState === 'ERROR') throw new Error('Deployment failed: ' + JSON.stringify(info));
    if (Date.now() - start > timeoutMs) throw new Error('Timeout waiting for deployment');
    await new Promise(r => setTimeout(r, 3000));
    process.stdout.write('.');
  }
}

(async function main(){
  try {
    const envs = parseEnvAssignments(args.env || []);
    for (const e of envs) {
      await upsertEnv(args.project, e.key, e.value, args.target);
    }
    console.log('All env vars upserted. Triggering redeploy...');
    const dep = await triggerRedeploy(args.project, args.repo, args.branch);
    const info = await waitForDeploymentReady(dep.id);
    console.log('\nDeployment ready:');
    console.log('URL:', info.url || info.cname || info.deploymentUrl || 'unknown');
  } catch (err) {
    console.error('Error:', err.message || err);
    if (err.body) console.error('Details:', JSON.stringify(err.body));
    process.exit(1);
  }
})();
