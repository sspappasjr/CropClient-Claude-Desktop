/**
 * irrigation-component.js
 * Extracted from mybestdemo/CropClient-Dashboard.html (v1.5) — same localHandlers logic,
 * same date-normalize/no-null/no-duplicate rules, same reset/read-meter/create-next/update
 * bodies. Not rewritten. See MCP-Local-Plan.md.
 *
 * The one seam that changed: the dashboard's handlers read/write vIRR.displayRecords
 * directly (an in-memory JS variable in the browser tab). These handlers read/write
 * through handleDataOperation('read'/'write', 'irrigation', ...) instead — same shape
 * of operation (get the records, mutate, save them back), different storage underneath
 * (a JSON file on the server instead of a page-scoped variable).
 *
 * Usage: const irrigationTools = require('./irrigation-component.js')(handleDataOperation);
 *        irrigationTools.forEach(tool => server.registerTool(tool));
 */

// Same 26 records vIRR/vDOM carry in the dashboard — used to self-seed the server's
// irrigation/irrigation_snapshot tables on first run, so no manual seed step is needed.
const DEFAULT_RECORDS = [
    { id: 7, eventId: 4123147, ranch: "Steve Ranch 1", planting: "Planting 1A", hours: 0, mgrHours: 0, appliedHours: 0, interval: "0 days", scheduledDate: "05/01/26", irrigationMethod: "Sprinkler", recommendedInches: "0", lastUpdatedDate: "7/20/2026, 5:41:25 PM", updatedBy: "CropManage API", isNew: false, isOriginal: true, isUpdated: false, ranchId: 16150, plantingId: 64196, status: 0 },
    { id: 8, eventId: 4126601, ranch: "Steve Ranch 1", planting: "Planting 1A", hours: 2.8, mgrHours: 0.3, appliedHours: 0.3, interval: "0 days", scheduledDate: "05/05/26", irrigationMethod: "Sprinkler", recommendedInches: "0.85", lastUpdatedDate: "7/20/2026, 5:41:25 PM", updatedBy: "CropManage API", isNew: false, isOriginal: true, isUpdated: false, ranchId: 16150, plantingId: 64196, status: 0 },
    { id: 9, eventId: 4126611, ranch: "Steve Ranch 1", planting: "Planting 1A", hours: 0.5, mgrHours: 1.3, appliedHours: 1.3, interval: "0.9 days", scheduledDate: "05/06/26", irrigationMethod: "Sprinkler", recommendedInches: "0.14", lastUpdatedDate: "7/20/2026, 5:41:25 PM", updatedBy: "CropManage API", isNew: false, isOriginal: true, isUpdated: false, ranchId: 16150, plantingId: 64196, status: 0 },
    { id: 10, eventId: 4126613, ranch: "Steve Ranch 1", planting: "Planting 1A", hours: 1.1, mgrHours: 2, appliedHours: 2, interval: "1.3 days", scheduledDate: "05/07/26", irrigationMethod: "Sprinkler", recommendedInches: "0.33", lastUpdatedDate: "7/20/2026, 5:41:25 PM", updatedBy: "CropManage API", isNew: false, isOriginal: true, isUpdated: false, ranchId: 16150, plantingId: 64196, status: 0 },
    { id: 11, eventId: 4126615, ranch: "Steve Ranch 1", planting: "Planting 1A", hours: 2.9, mgrHours: 0.7, appliedHours: 0.7, interval: "0.6 days", scheduledDate: "05/10/26", irrigationMethod: "Sprinkler", recommendedInches: "0.87", lastUpdatedDate: "7/20/2026, 5:41:25 PM", updatedBy: "CropManage API", isNew: false, isOriginal: true, isUpdated: false, ranchId: 16150, plantingId: 64196, status: 0 },
    { id: 12, eventId: 4126621, ranch: "Steve Ranch 1", planting: "Planting 1A", hours: 1.5, mgrHours: 0.8, appliedHours: 0.8, interval: "0.6 days", scheduledDate: "05/11/26", irrigationMethod: "Sprinkler", recommendedInches: "0.45", lastUpdatedDate: "7/20/2026, 5:41:25 PM", updatedBy: "CropManage API", isNew: false, isOriginal: true, isUpdated: false, ranchId: 16150, plantingId: 64196, status: 0 },
    { id: 1, eventId: 3705175, ranch: "Steve Ranch 1", planting: "Planting 1B", hours: 0, mgrHours: 10.2, appliedHours: 11.2, interval: "0 days", scheduledDate: "12/22/25", irrigationMethod: "Sprinkler", recommendedInches: "0", lastUpdatedDate: "7/20/2026, 5:41:25 PM", updatedBy: "CropManage API", isNew: false, isOriginal: true, isUpdated: false, ranchId: 16150, plantingId: 57571, status: 0 },
    { id: 2, eventId: 4123163, ranch: "Steve Ranch 1", planting: "Planting 1B", hours: 0.6, mgrHours: 1.1, appliedHours: 2.1, interval: "0 days", scheduledDate: "12/26/25", irrigationMethod: "Sprinkler", recommendedInches: "0.18", lastUpdatedDate: "7/20/2026, 5:41:25 PM", updatedBy: "CropManage API", isNew: false, isOriginal: true, isUpdated: false, ranchId: 16150, plantingId: 57571, status: 0 },
    { id: 3, eventId: 4123891, ranch: "Steve Ranch 1", planting: "Planting 1B", hours: 0.2, mgrHours: 0.3, appliedHours: 3.3, interval: "2.8 days", scheduledDate: "12/27/25", irrigationMethod: "Sprinkler", recommendedInches: "0.06", lastUpdatedDate: "7/20/2026, 5:41:25 PM", updatedBy: "CropManage API", isNew: false, isOriginal: true, isUpdated: false, ranchId: 16150, plantingId: 57571, status: 0 },
    { id: 4, eventId: 4123893, ranch: "Steve Ranch 1", planting: "Planting 1B", hours: 0.6, mgrHours: 0.5, appliedHours: 1.5, interval: "2.1 days", scheduledDate: "12/30/25", irrigationMethod: "Sprinkler", recommendedInches: "0.18", lastUpdatedDate: "7/20/2026, 5:41:25 PM", updatedBy: "CropManage API", isNew: false, isOriginal: true, isUpdated: false, ranchId: 16150, plantingId: 57571, status: 0 },
    { id: 5, eventId: 4126605, ranch: "Steve Ranch 1", planting: "Planting 1B", hours: 0.3, mgrHours: 0.8, appliedHours: 0.8, interval: "2.1 days", scheduledDate: "01/01/26", irrigationMethod: "Sprinkler", recommendedInches: "0.09", lastUpdatedDate: "7/20/2026, 5:41:25 PM", updatedBy: "CropManage API", isNew: false, isOriginal: true, isUpdated: false, ranchId: 16150, plantingId: 57571, status: 0 },
    { id: 6, eventId: 4126607, ranch: "Steve Ranch 1", planting: "Planting 1B", hours: 0.4, mgrHours: 0.9, appliedHours: 0.9, interval: "2.8 days", scheduledDate: "01/03/26", irrigationMethod: "Sprinkler", recommendedInches: "0.12", lastUpdatedDate: "7/20/2026, 5:41:25 PM", updatedBy: "CropManage API", isNew: false, isOriginal: true, isUpdated: false, ranchId: 16150, plantingId: 57571, status: 0 },
    { id: 13, eventId: 4123815, ranch: "Steve Ranch 2", planting: "Planting 2A", hours: 0, mgrHours: 0, appliedHours: 0, interval: "0 days", scheduledDate: "12/20/25", irrigationMethod: "Sprinkler", recommendedInches: "0", lastUpdatedDate: "7/20/2026, 5:41:25 PM", updatedBy: "CropManage API", isNew: false, isOriginal: true, isUpdated: false, ranchId: 17150, plantingId: 64198, status: 0 },
    { id: 14, eventId: 4123895, ranch: "Steve Ranch 2", planting: "Planting 2A", hours: 0.8, mgrHours: 2.2, appliedHours: 2.5, interval: "-1.0 days", scheduledDate: "12/25/25", irrigationMethod: "Sprinkler", recommendedInches: "0.23", lastUpdatedDate: "7/20/2026, 5:41:25 PM", updatedBy: "CropManage API", isNew: false, isOriginal: true, isUpdated: false, ranchId: 17150, plantingId: 64198, status: 0 },
    { id: 15, eventId: 4123899, ranch: "Steve Ranch 2", planting: "Planting 2A", hours: 1.2, mgrHours: 3, appliedHours: 4, interval: "5.2 days", scheduledDate: "12/30/25", irrigationMethod: "Sprinkler", recommendedInches: "0.35", lastUpdatedDate: "7/20/2026, 5:41:25 PM", updatedBy: "CropManage API", isNew: false, isOriginal: true, isUpdated: false, ranchId: 17150, plantingId: 64198, status: 0 },
    { id: 16, eventId: 4123901, ranch: "Steve Ranch 2", planting: "Planting 2A", hours: 0.8, mgrHours: 4.7, appliedHours: 4.5, interval: "3.4 days", scheduledDate: "01/03/26", irrigationMethod: "Sprinkler", recommendedInches: "0.25", lastUpdatedDate: "7/20/2026, 5:41:25 PM", updatedBy: "CropManage API", isNew: false, isOriginal: true, isUpdated: false, ranchId: 17150, plantingId: 64198, status: 0 },
    { id: 17, eventId: 4126237, ranch: "Steve Ranch 2", planting: "Planting 2A", hours: 0.7, mgrHours: 16, appliedHours: 19.3, interval: "3.9 days", scheduledDate: "01/06/26", irrigationMethod: "Sprinkler", recommendedInches: "0.21", lastUpdatedDate: "7/20/2026, 5:41:25 PM", updatedBy: "CropManage API", isNew: false, isOriginal: true, isUpdated: false, ranchId: 17150, plantingId: 64198, status: 0 },
    { id: 18, eventId: 4126283, ranch: "Steve Ranch 2", planting: "Planting 2A", hours: 0.9, mgrHours: 16.1, appliedHours: 0, interval: "3.4 days", scheduledDate: "01/10/26", irrigationMethod: "Sprinkler", recommendedInches: "0.26", lastUpdatedDate: "7/20/2026, 5:41:25 PM", updatedBy: "CropManage API", isNew: false, isOriginal: true, isUpdated: false, ranchId: 17150, plantingId: 64198, status: 0 },
    { id: 19, eventId: 4126285, ranch: "Steve Ranch 2", planting: "Planting 2A", hours: 0.5, mgrHours: 16.2, appliedHours: 0, interval: "4.3 days", scheduledDate: "01/13/26", irrigationMethod: "Sprinkler", recommendedInches: "0.16", lastUpdatedDate: "7/20/2026, 5:41:25 PM", updatedBy: "CropManage API", isNew: false, isOriginal: true, isUpdated: false, ranchId: 17150, plantingId: 64198, status: 0 },
    { id: 20, eventId: 4123905, ranch: "Steve Ranch 2", planting: "Planting 2B", hours: 0, mgrHours: 1.3, appliedHours: 4, interval: "0 days", scheduledDate: "12/19/25", irrigationMethod: "Sprinkler", recommendedInches: "0", lastUpdatedDate: "7/20/2026, 5:41:25 PM", updatedBy: "CropManage API", isNew: false, isOriginal: true, isUpdated: false, ranchId: 17150, plantingId: 64199, status: 0 },
    { id: 23, eventId: 4123917, ranch: "Steve Ranch 2", planting: "Planting 2B", hours: 0.8, mgrHours: 1.5, appliedHours: 2.1, interval: "-1.0 days", scheduledDate: "12/24/25", irrigationMethod: "Sprinkler", recommendedInches: "0.23", lastUpdatedDate: "7/20/2026, 5:41:25 PM", updatedBy: "CropManage API", isNew: false, isOriginal: true, isUpdated: false, ranchId: 17150, plantingId: 64199, status: 0 },
    { id: 21, eventId: 4123907, ranch: "Steve Ranch 2", planting: "Planting 2B", hours: 0.9, mgrHours: 1, appliedHours: 1.2, interval: "30.9 days", scheduledDate: "12/28/25", irrigationMethod: "Sprinkler", recommendedInches: "0.26", lastUpdatedDate: "7/20/2026, 5:41:25 PM", updatedBy: "CropManage API", isNew: false, isOriginal: true, isUpdated: false, ranchId: 17150, plantingId: 64199, status: 0 },
    { id: 22, eventId: 4123909, ranch: "Steve Ranch 2", planting: "Planting 2B", hours: 1.5, mgrHours: 1.9, appliedHours: 2.9, interval: "21.4 days", scheduledDate: "01/04/26", irrigationMethod: "Sprinkler", recommendedInches: "0.44", lastUpdatedDate: "7/20/2026, 5:41:25 PM", updatedBy: "CropManage API", isNew: false, isOriginal: true, isUpdated: false, ranchId: 17150, plantingId: 64199, status: 0 },
    { id: 24, eventId: 4126269, ranch: "Steve Ranch 2", planting: "Planting 2B", hours: 3.6, mgrHours: 2, appliedHours: 0, interval: "22.5 days", scheduledDate: "01/25/26", irrigationMethod: "Sprinkler", recommendedInches: "1.09", lastUpdatedDate: "7/20/2026, 5:41:25 PM", updatedBy: "CropManage API", isNew: false, isOriginal: true, isUpdated: false, ranchId: 17150, plantingId: 64199, status: 0 },
    { id: 25, eventId: 4126271, ranch: "Steve Ranch 2", planting: "Planting 2B", hours: 6.4, mgrHours: 2.1, appliedHours: 0, interval: "30.4 days", scheduledDate: "02/17/26", irrigationMethod: "Sprinkler", recommendedInches: "1.91", lastUpdatedDate: "7/20/2026, 5:41:25 PM", updatedBy: "CropManage API", isNew: false, isOriginal: true, isUpdated: false, ranchId: 17150, plantingId: 64199, status: 0 },
    { id: 26, eventId: 4126275, ranch: "Steve Ranch 2", planting: "Planting 2B", hours: 13.4, mgrHours: 2.2, appliedHours: 2.3, interval: "21.3 days", scheduledDate: "03/19/26", irrigationMethod: "Sprinkler", recommendedInches: "4.01", lastUpdatedDate: "7/20/2026, 5:41:25 PM", updatedBy: "CropManage API", isNew: false, isOriginal: true, isUpdated: false, ranchId: 17150, plantingId: 64199, status: 0 }
];

// ---- Helpers, extracted verbatim from CropClient-Dashboard.html ----

function parseEventDate(dateStr) {
    const parts = dateStr.split('/');
    const month = parseInt(parts[0]) - 1;
    const day = parseInt(parts[1]);
    const year = parseInt('20' + parts[2]);
    return new Date(year, month, day);
}

function formatDate(date) {
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const year = String(date.getFullYear()).slice(-2);
    return `${month}/${day}/${year}`;
}

function parseAndNormalizeDate(str) {
    if (!str) return null;
    const parts = str.trim().split('/');
    if (parts.length !== 3) return null;
    let [m, d, y] = parts;
    m = parseInt(m, 10);
    d = parseInt(d, 10);
    if (y.length === 4) y = y.slice(-2);
    if (y.length !== 2 || isNaN(m) || isNaN(d) || m < 1 || m > 12 || d < 1 || d > 31) return null;
    const yNum = parseInt(y, 10);
    const check = new Date(2000 + yNum, m - 1, d);
    if (check.getMonth() !== m - 1 || check.getDate() !== d) return null; // e.g. Feb 30 rolled over
    return `${String(m).padStart(2, '0')}/${String(d).padStart(2, '0')}/${y.padStart(2, '0')}`;
}

module.exports = function createIrrigationTools(handleDataOperation) {
    const TABLE = 'irrigation';
    const SNAPSHOT = 'irrigation_snapshot';

    // On first call, if the tables don't exist yet as files, seed both from the same
    // 26 hardcoded records the dashboard's vIRR/vDOM carry — no manual seed step needed.
    async function ensureSeeded() {
        const snap = await handleDataOperation('read', SNAPSHOT, null);
        if (!snap.success) {
            await handleDataOperation('write', SNAPSHOT, DEFAULT_RECORDS);
        }
        const live = await handleDataOperation('read', TABLE, null);
        if (!live.success) {
            await handleDataOperation('write', TABLE, DEFAULT_RECORDS);
        }
    }

    return [
        {
            name: 'reset_table',
            description: 'Resets the irrigation table to the saved snapshot.',
            inputSchema: { type: 'object', properties: {}, required: [] },
            handler: async () => {
                await ensureSeeded();
                const snap = await handleDataOperation('read', SNAPSHOT, null);
                await handleDataOperation('write', TABLE, snap.data);
                return {
                    success: true,
                    statusMessage: `✅ Reset — ${snap.data.length} records restored`,
                    data: snap.data
                };
            }
        },
        {
            name: 'read_meter',
            description: 'Finds the most recent record for a ranch/planting, ready for a meter reading.',
            inputSchema: {
                type: 'object',
                properties: {
                    ranch: { type: 'string' },
                    planting: { type: 'string' }
                },
                required: ['ranch', 'planting']
            },
            handler: async (args) => {
                await ensureSeeded();
                const stored = await handleDataOperation('read', TABLE, null);
                const records = stored.data || [];
                const matching = records.filter(r => r.ranch === args.ranch && r.planting === args.planting);
                if (!matching.length) {
                    return { success: false, statusMessage: `No records for ${args.ranch} / ${args.planting}` };
                }
                matching.sort((a, b) => parseEventDate(a.scheduledDate) - parseEventDate(b.scheduledDate));
                const last = matching[matching.length - 1];
                return {
                    success: true,
                    statusMessage: `✅ Ready for Meter Reading — ${last.scheduledDate}`,
                    data: last
                };
            }
        },
        {
            name: 'create_next_irrigation',
            description: 'Creates the next scheduled irrigation event based on the last record interval.',
            inputSchema: {
                type: 'object',
                properties: {
                    ranch: { type: 'string' },
                    planting: { type: 'string' }
                },
                required: ['ranch', 'planting']
            },
            handler: async (args) => {
                await ensureSeeded();
                const stored = await handleDataOperation('read', TABLE, null);
                const records = stored.data || [];
                const same = records.filter(r => r.ranch === args.ranch && r.planting === args.planting);
                if (!same.length) {
                    return { success: false, statusMessage: `No records for ${args.ranch} / ${args.planting}` };
                }
                same.sort((a, b) => parseEventDate(a.scheduledDate) - parseEventDate(b.scheduledDate));
                const last = same[same.length - 1];
                const nextDate = new Date(parseEventDate(last.scheduledDate));
                const interval = Math.round(parseFloat(last.interval) || 1);
                nextDate.setDate(nextDate.getDate() + interval);
                const tinyAdjust = Math.random() * 0.2 + 0.1;
                const newRecord = {
                    id: Math.max(...records.map(r => r.id)) + 1,
                    ranch: last.ranch, planting: last.planting,
                    hours: Math.max(0.1, parseFloat((last.hours + tinyAdjust).toFixed(1))),
                    mgrHours: parseFloat((last.mgrHours + 0.1).toFixed(1)),
                    appliedHours: 0, interval: last.interval,
                    scheduledDate: formatDate(nextDate),
                    irrigationMethod: last.irrigationMethod,
                    recommendedInches: last.recommendedInches,
                    lastUpdatedDate: new Date().toLocaleString(),
                    updatedBy: 'CropClient System',
                    isNew: true, isOriginal: false, isUpdated: false,
                    ranchId: last.ranchId, plantingId: last.plantingId, status: -1
                };
                records.forEach(r => { r.isNew = false; });
                records.push(newRecord);
                await handleDataOperation('write', TABLE, records);
                return {
                    success: true,
                    statusMessage: `✅ Created Next Irrigation — ${formatDate(nextDate)}`,
                    data: newRecord
                };
            }
        },
        {
            name: 'update_record',
            description: 'Updates an irrigation record by ID with new date, interval, manager hours, and water applied.',
            inputSchema: {
                type: 'object',
                properties: {
                    id: { type: 'number' },
                    scheduledDate: { type: 'string' },
                    interval: { type: 'string' },
                    mgrHours: { type: 'number' },
                    appliedHours: { type: 'number' }
                },
                required: ['id', 'scheduledDate', 'interval', 'mgrHours', 'appliedHours']
            },
            handler: async (args) => {
                await ensureSeeded();
                const stored = await handleDataOperation('read', TABLE, null);
                const records = stored.data || [];
                const rec = records.find(r => r.id === args.id);
                if (!rec) return { success: false, statusMessage: `Record ${args.id} not found` };

                // Data edit rule: no null date on update
                if (!args.scheduledDate || !args.scheduledDate.trim()) {
                    return { success: false, statusMessage: '❌ Date cannot be empty' };
                }

                // Normalize before comparing — a typed "5/12/26" and a stored "05/12/26" are the
                // same day and must be recognized as a duplicate; a malformed date must be rejected
                // outright instead of silently corrupting scheduledDate for every later sort/parse.
                const normalizedDate = parseAndNormalizeDate(args.scheduledDate);
                if (!normalizedDate) {
                    return { success: false, statusMessage: `❌ "${args.scheduledDate}" is not a valid date, use M/D/YY` };
                }

                // Data edit rule: no duplicate date for a planting
                const dup = records.find(r =>
                    r.id !== args.id && r.ranch === rec.ranch && r.planting === rec.planting &&
                    r.scheduledDate === normalizedDate
                );
                if (dup) {
                    return { success: false, statusMessage: `❌ Duplicate date, ${rec.planting} already has a record on ${normalizedDate}` };
                }

                rec.scheduledDate = normalizedDate;
                rec.interval = args.interval;
                rec.mgrHours = parseFloat(args.mgrHours);
                rec.appliedHours = parseFloat(args.appliedHours);
                rec.lastUpdatedDate = new Date().toLocaleString();
                rec.updatedBy = 'Field Worker';
                rec.isUpdated = true;

                await handleDataOperation('write', TABLE, records);
                return {
                    success: true,
                    statusMessage: `✅ Record ${args.id} updated`,
                    data: rec
                };
            }
        }
    ];
};
