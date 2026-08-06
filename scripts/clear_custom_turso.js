/**
 * SkillPedia Turso Edge Database Custom Skill Purge Script
 * Deletes all stale CUSTOM- test records from Turso Edge DB cloud table.
 */

const https = require('https');

const TURSO_URL = 'skillpedia-atulgrover.aws-ap-south-1.turso.io';
const TURSO_TOKEN = 'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3ODU5MjcxNTMsImlkIjoiMDE5ZmQxOGQtNDcwMS03YTUzLWI4MGQtNGNjZjJmNDllOTNhIiwia2lkIjoiZFBTbnBRUkFmRktDbDZZdzRtLUtxazNuQkdwYTJjS25nZWRqVUdZMkJzOCIsInJpZCI6IjkwYmQ0MDlkLTczYmItNDcxZS04NzVjLTlhNGU5NzdjYjBkMiJ9.odehl15I8NbH9ow10Y4CTTyjLaxxXjgBLQG3eAOM05ySOZ4n1iq8ckO0KDhvsaWLwwsUTiR1Ar_zK-Hhmg4RBw';

async function clearCustomSkills() {
  console.log('🧹 Purging stale CUSTOM- skill records from Turso Edge Database cloud...');

  const payload = JSON.stringify({
    requests: [
      {
        type: 'execute',
        stmt: {
          sql: "DELETE FROM curricula WHERE type = 'custom_ai' OR id LIKE 'CUSTOM-%';"
        }
      }
    ]
  });

  const req = https.request({
    hostname: TURSO_URL,
    path: '/v2/pipeline',
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${TURSO_TOKEN}`,
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(payload)
    }
  }, res => {
    let body = '';
    res.on('data', c => body += c);
    res.on('end', () => {
      console.log('✅ Purge complete response:', body);
    });
  });

  req.on('error', err => console.error('❌ Purge failed:', err));
  req.write(payload);
  req.end();
}

clearCustomSkills();
