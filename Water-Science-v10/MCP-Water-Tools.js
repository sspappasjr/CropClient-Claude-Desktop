
        // @@@@ BEGIN MCP-Water-Tools @@@@

        // ========================================
        // FENCE: vIRR — hardcoded, independent of vDOM
        // Same shape as vDOM. Only IRR_receive() may write vIRR.*
        // ========================================

        let vIRR = {
            originalRecords: [
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
            ],
            displayRecords: [],
            SelectedRecord: null,
            SelectedRanch: null,
            SelectedPlanting: null,
            Result: { TokenName: null, Success: null, Record: null, Error: null, Value: null, Message: null }
        };

        // ========================================
        // FENCE: the junction — one flag, one function
        // 'harness' = offline, direct local call, no network
        // 'local'   = APIServer4.0.js on localhost:3101
        // 'production' = live server (not wired yet)
        // ========================================

        function isOffline() { return mcpMode === 'offline'; }

        // The data_operation table name — hardcoded for now, becomes the logged-in user's name
        // later. Shared by loadOnStartup/saveTable/restoreTable so they all agree on it.
        let SOURCE_TABLE = 'steve';

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

        // Validates and normalizes a typed date to the app's own M/D/YY convention (zero-padded,
        // 2-digit year — matching what parseEventDate/formatDate/the hardcoded records all use),
        // regardless of whether the user typed "5/12/26", "05/12/2026", or similar. Returns null
        // for anything that isn't a real calendar date, so string-equality checks (duplicate-date)
        // stay reliable no matter how the date was entered.
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

        // Mirrors APIServer4.0.js's tool handlers, run locally instead of over the wire.
        const localHandlers = {
            reset_table: function(params) {
                vIRR.displayRecords = JSON.parse(JSON.stringify(vIRR.originalRecords));
                return {
                    success: true,
                    statusMessage: `✅ Reset — ${vIRR.displayRecords.length} records restored`,
                    data: JSON.parse(JSON.stringify(vIRR.displayRecords))
                };
            },
            read_meter: function(params) {
                const matching = vIRR.displayRecords.filter(r =>
                    r.ranch === params.ranch && r.planting === params.planting
                );
                if (!matching.length) {
                    return { success: false, statusMessage: `No records for ${params.ranch} / ${params.planting}` };
                }
                matching.sort((a, b) => parseEventDate(a.scheduledDate) - parseEventDate(b.scheduledDate));
                const last = matching[matching.length - 1];
                return {
                    success: true,
                    statusMessage: `✅ Ready for Meter Reading — ${last.scheduledDate}`,
                    data: JSON.parse(JSON.stringify(last))
                };
            },
            create_next_irrigation: function(params) {
                const records = vIRR.displayRecords;
                const same = records.filter(r => r.ranch === params.ranch && r.planting === params.planting);
                if (!same.length) {
                    return { success: false, statusMessage: `No records for ${params.ranch} / ${params.planting}` };
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
                // Persists into vIRR.displayRecords itself now — a standalone
                // MCP caller (no browser wrapper) needs this record to actually
                // stick, so the next call can see it too.
                records.forEach(r => { r.isNew = false; });
                records.push(newRecord);
                records.sort((a, b) => {
                    if (a.ranch < b.ranch) return -1;
                    if (a.ranch > b.ranch) return 1;
                    if (a.planting < b.planting) return -1;
                    if (a.planting > b.planting) return 1;
                    return parseEventDate(a.scheduledDate) - parseEventDate(b.scheduledDate);
                });

                // Returns just the new record — matches APIServer4.0.js's create_next_irrigation
                // contract exactly (irrigCreateNext returns { data: newRecord }, not the whole list).
                return {
                    success: true,
                    statusMessage: `✅ Created Next Irrigation — ${formatDate(nextDate)}`,
                    data: JSON.parse(JSON.stringify(newRecord))
                };
            },
            update_record: function(params) {
                const records = vIRR.displayRecords;
                const rec = records.find(r => r.id === params.id);
                if (!rec) return { success: false, statusMessage: `Record ${params.id} not found` };

                // Data edit rule: no null date on update
                if (!params.scheduledDate || !params.scheduledDate.trim()) {
                    return { success: false, statusMessage: '❌ Date cannot be empty' };
                }

                // Normalize before comparing — a typed "5/12/26" and a stored "05/12/26" are the
                // same day and must be recognized as a duplicate; a malformed date must be rejected
                // outright instead of silently corrupting scheduledDate for every later sort/parse.
                const normalizedDate = parseAndNormalizeDate(params.scheduledDate);
                if (!normalizedDate) {
                    return { success: false, statusMessage: `❌ "${params.scheduledDate}" is not a valid date, use M/D/YY` };
                }

                // Data edit rule: no duplicate date for a planting
                const dup = records.find(r =>
                    r.id !== params.id &&
                    r.ranch === rec.ranch &&
                    r.planting === rec.planting &&
                    r.scheduledDate === normalizedDate
                );
                if (dup) {
                    return { success: false, statusMessage: `❌ Duplicate date, ${rec.planting} already has a record on ${normalizedDate}` };
                }

                rec.scheduledDate   = normalizedDate;
                rec.interval        = params.interval;
                rec.mgrHours        = parseFloat(params.mgrHours);
                rec.appliedHours    = parseFloat(params.appliedHours);
                rec.lastUpdatedDate = new Date().toLocaleString();
                rec.updatedBy       = 'Field Worker';
                rec.isUpdated       = true;
                rec.status          = -1; // queued — not yet synced to CropManage, same as create_next_irrigation

                return {
                    success: true,
                    statusMessage: `✅ Record ${params.id} updated`,
                    data: JSON.parse(JSON.stringify(rec))
                };
            },
            // Offline mode has no server-side files at all — same shape as the real
            // data_operation tool's "file not found" response, so callers don't need
            // to special-case offline separately from "the file just isn't there yet."
            data_operation: function(params) {
                return { success: false, statusMessage: 'Not available offline', fileNotFound: true };
            }
        };

        async function runToken(toolName, args) {
            const target = mcpMode === 'online' ? 'online' : 'local';
            const staged = mcpEngineStaging(target, toolName, args);
            // data_operation (save/restore) is the database tool — always routes
            // to the server, any mode. CRUD (reset_table/read_meter/
            // create_next_irrigation/update_record) uses the normal dual path:
            // offline → local browser handlers, local/online → real MCP server.
            if (isOffline() && toolName !== 'data_operation') {
                return localHandlers[toolName](staged.params);
            }
            return mcpEngineSend(staged);
        }

        // Only IRR_receive() may write vIRR.* — whole vDOM object crosses in, already a JSON
        // copy from the call site, so taking it directly creates no live link back to vDOM.
        function IRR_receive(domState) {
            vIRR = domState;

            // vIRR sets its own legacy variables from what it just received —
            // not from assuming shared scope with vDOM's side — so
            // testCreateNext/testReadMeter/updateRecord keep working off fresh state.
            irrigationData = JSON.parse(JSON.stringify(vIRR.originalRecords));
            displayRecords = JSON.parse(JSON.stringify(vIRR.displayRecords));
            selectedRecord = vIRR.SelectedRecord;
        }

        // ========================================
        // EXTERNAL SOURCE FUNNEL — vIRR is the single controller for every
        // irrigation data source (SQL, Mongo, API, demo) — all of it is just
        // JSON once it crosses the boundary. This is the one entry point any
        // external source uses to hand vIRR its finished 11-field APIdetail
        // array (recordID/ranch/planting/scheduledDate/hours/interval/
        // mgrHours/appliedHours/ranchId/plantingId/status). vIRR adds the
        // bookkeeping fields, becomes vIRR.displayRecords, crosses to vDOM
        // the same DOM_receive() way CRUD always has — one funnel, one path,
        // regardless of source.
        // ========================================

        // Pure receiver — IRR_getDisplayRecords does no building at all. The
        // caller hands over an already-finished DisplayRecords array (field
        // mapping + bookkeeping already done on the caller's own side); this
        // just receives it into vIRR, same pattern as IRR_receive/DOM_receive.
        function IRR_getDisplayRecords(finishedRecords) {
            vIRR.displayRecords = finishedRecords;
            vIRR.SelectedRecord = vIRR.displayRecords[0] || null;
            vIRR.SelectedRanch    = vIRR.SelectedRecord ? vIRR.SelectedRecord.ranch : null;
            vIRR.SelectedPlanting = vIRR.SelectedRecord ? vIRR.SelectedRecord.planting : null;
            vIRR.Result = {
                TokenName: 'load_into_displayRecords',
                Success: true,
                Record: null,
                Error: null,
                Value: null,
                Message: `✅ ${vIRR.displayRecords.length} records received`
            };
            DOM_receive(JSON.parse(JSON.stringify(vIRR)));
        }

        // ========================================
        // DATA STORAGE (legacy — still used by Create/Meter/Update this pass)
        // ========================================

        const originalData = JSON.parse(JSON.stringify(vIRR.originalRecords));

        let irrigationData = JSON.parse(JSON.stringify(originalData));
        let displayRecords = [];
        let selectedRecord = null;

        // ========================================
        // RESET TABLE — routed through the fence
        // ========================================

        async function resetTable() {
            const result = await runToken('reset_table', {});

            if (!result.success) {
                showResult(`❌ Reset failed: ${result.error || result.statusMessage}`);
                return;
            }

            // vIRR folds the token result into its own state.
            // SelectedRecord is its own field — tokens set it directly, never via Result.
            vIRR.displayRecords = JSON.parse(JSON.stringify(result.data));
            vIRR.SelectedRecord = vIRR.displayRecords[0] || null;
            vIRR.SelectedRanch    = vIRR.SelectedRecord ? vIRR.SelectedRecord.ranch : null;
            vIRR.SelectedPlanting = vIRR.SelectedRecord ? vIRR.SelectedRecord.planting : null;
            // Result is command-log-only — TokenName/Success/Message for display, nothing operational.
            vIRR.Result = {
                TokenName: 'reset_table',
                Success: true,
                Record: null,
                Error: null,
                Value: null,
                Message: result.statusMessage
            };

            // vIRR passes its WHOLE state across the fence to vDOM
            DOM_receive(JSON.parse(JSON.stringify(vIRR)));

            // reset_table always means "back to demo/snapshot data" — regardless of how it was
            // triggered (startup fallback or a manual Reset click) — so the label always follows.
            setDataSourceLabel('Demo Irrigations');
        }

        // ========================================
        // STARTUP — try live CropManage-sourced data (steve.json on the server) first,
        // fall back to the normal seeded reset when it's not there (offline mode, or
        // the file just hasn't been saved yet).
        // ========================================

        // Reads SOURCE_TABLE back into the grid. Used both by the Restore button and by startup
        // (loadOnStartup silently falls back to resetTable() on failure; a manual Restore click
        // shows the error instead — the user asked for their data back, not a silent swap).
        async function restoreTable() {
            const result = await runToken('data_operation', { action: 'read', table: SOURCE_TABLE });

            if (!result || !result.success || !Array.isArray(result.data) || result.data.length === 0) {
                showResult(`❌ Restore failed: ${(result && (result.error || result.statusMessage)) || 'no saved data found'}`);
                return false;
            }

            vIRR.displayRecords = JSON.parse(JSON.stringify(result.data));
            // Saved order isn't guaranteed — sort the same way resetTable's
            // seed data already comes pre-sorted, so restore never shows a
            // different row order than a fresh reset would.
            vIRR.displayRecords.sort((a, b) => {
                if (a.ranch < b.ranch) return -1;
                if (a.ranch > b.ranch) return 1;
                if (a.planting < b.planting) return -1;
                if (a.planting > b.planting) return 1;
                return parseEventDate(a.scheduledDate) - parseEventDate(b.scheduledDate);
            });
            vIRR.SelectedRecord = vIRR.displayRecords[0] || null;
            vIRR.SelectedRanch    = vIRR.SelectedRecord ? vIRR.SelectedRecord.ranch : null;
            vIRR.SelectedPlanting = vIRR.SelectedRecord ? vIRR.SelectedRecord.planting : null;
            vIRR.Result = {
                TokenName: 'data_operation',
                Success: true,
                Record: null,
                Error: null,
                Value: null,
                Message: `✅ Restored ${vIRR.displayRecords.length} records from ${SOURCE_TABLE}.json`
            };
            DOM_receive(JSON.parse(JSON.stringify(vIRR)));
            setDataSourceLabel(SOURCE_TABLE.charAt(0).toUpperCase() + SOURCE_TABLE.slice(1) + ' Irrigations');
            return true;
        }

        // Writes the current grid, as-is, to SOURCE_TABLE.
        async function saveTable() {
            const result = await runToken('data_operation', {
                action: 'write',
                table: SOURCE_TABLE,
                data: vIRR.displayRecords
            });

            if (!result || !result.success) {
                showResult(`❌ Save failed: ${(result && (result.error || result.statusMessage)) || 'unknown error'}`);
                return;
            }

            showResult(`✅ Saved ${vIRR.displayRecords.length} records to ${SOURCE_TABLE}.json`);
        }

        async function loadOnStartup() {
            // MCP mode (local/online) only sees the server's own in-memory
            // list — nothing populates it except an actual reset_table call.
            // Restoring from disk only ever updated the browser's own copy,
            // so if restore succeeded, the server's list stayed empty forever
            // and every CRUD call after startup failed with "no records for
            // X/Y". Seeding it here, unconditionally, fixes that at the root.
            await runToken('reset_table', {});
            const ok = await restoreTable();
            if (!ok) resetTable(); // No SOURCE_TABLE data (offline mode, or it doesn't exist yet) — normal startup.
        }

        // ========================================
        // CREATE NEXT IRRIGATION (CORE TOOL #1) — untouched this pass
        // ========================================

        async function testCreateNext() {
            if (!vIRR.SelectedRecord) {
                showResult('ERROR: No record selected. Click a row first.');
                return;
            }

            const result = await runToken('create_next_irrigation', {
                ranch: vIRR.SelectedRecord.ranch,
                planting: vIRR.SelectedRecord.planting
            });

            if (!result.success) {
                showResult(`❌ ${result.statusMessage || result.error}`);
                return;
            }

            // vIRR folds the new record into its own displayRecords — the handler returns just the
            // new record (matching the real server tool's contract), so the token function is the one
            // that merges it in, same for offline or online.
            vIRR.displayRecords.forEach(r => { r.isNew = false; });
            vIRR.displayRecords.push(result.data);
            vIRR.displayRecords.sort((a, b) => {
                if (a.ranch < b.ranch) return -1;
                if (a.ranch > b.ranch) return 1;
                if (a.planting < b.planting) return -1;
                if (a.planting > b.planting) return 1;
                return parseEventDate(a.scheduledDate) - parseEventDate(b.scheduledDate);
            });
            vIRR.SelectedRecord   = result.data;
            vIRR.SelectedRanch    = result.data.ranch;
            vIRR.SelectedPlanting = result.data.planting;
            vIRR.Result = {
                TokenName: 'create_next_irrigation',
                Success: true,
                Record: null,
                Error: null,
                Value: null,
                Message: result.statusMessage
            };

            // vIRR passes its WHOLE state across the fence to vDOM
            DOM_receive(JSON.parse(JSON.stringify(vIRR)));
        }

        // ========================================
        // READ METER (CORE TOOL #2) — routed through the fence
        // ========================================

        async function testReadMeter() {
            if (!vIRR.SelectedRecord) {
                showResult('ERROR: No record selected. Click a row first.');
                return;
            }

            const result = await runToken('read_meter', {
                ranch: vIRR.SelectedRecord.ranch,
                planting: vIRR.SelectedRecord.planting
            });

            if (!result.success) {
                showResult(`❌ ${result.statusMessage || result.error}`);
                return;
            }

            // vIRR folds the token result into its own state — displayRecords stays vIRR's own,
            // never patched in from the legacy standalone variable, so vIRR is whole and
            // self-consistent before it crosses the fence (same discipline as testCreateNext).
            vIRR.SelectedRecord = JSON.parse(JSON.stringify(result.data));
            vIRR.SelectedRanch    = vIRR.SelectedRecord.ranch;
            vIRR.SelectedPlanting = vIRR.SelectedRecord.planting;
            // Result is command-log-only — TokenName/Success/Message for display, nothing operational.
            vIRR.Result = {
                TokenName: 'read_meter',
                Success: true,
                Record: null,
                Error: null,
                Value: null,
                Message: result.statusMessage
            };

            // vIRR passes its WHOLE state across the fence to vDOM
            DOM_receive(JSON.parse(JSON.stringify(vIRR)));
        }

        // ========================================
        // UPDATE RECORD (SAVE CHANGES) — routed through the fence
        // ========================================

        async function updateRecord() {
            if (!vIRR.SelectedRecord) {
                showResult('ERROR: No record selected. Click a row first.');
                return;
            }

            const newDate         = document.getElementById('formDate').value;
            const newManagerHours = parseFloat(document.getElementById('formManagerHours').value);
            const newWaterApplied = parseFloat(document.getElementById('formWaterApplied').value);

            if (isNaN(newManagerHours) || isNaN(newWaterApplied)) {
                showResult('ERROR: Please enter valid numbers for Manager Hours and Water Applied.');
                return;
            }

            const result = await runToken('update_record', {
                id: vIRR.SelectedRecord.id,
                scheduledDate: newDate,
                interval: vIRR.SelectedRecord.interval,
                mgrHours: newManagerHours,
                appliedHours: newWaterApplied
            });

            if (!result.success) {
                showResult(result.statusMessage || result.error);
                return;
            }

            // Offline mode mutates vIRR.displayRecords in place (same array, by reference), so this
            // is a no-op there. Local/online mode mutates the server's copy only — the client's
            // displayRecords never hears about it otherwise — so replace it explicitly, same either way.
            const idx = vIRR.displayRecords.findIndex(r => r.id === result.data.id);
            if (idx !== -1) vIRR.displayRecords[idx] = result.data;

            vIRR.SelectedRecord   = result.data;
            vIRR.SelectedRanch    = result.data.ranch;
            vIRR.SelectedPlanting = result.data.planting;
            vIRR.Result = {
                TokenName: 'update_record',
                Success: true,
                Record: null,
                Error: null,
                Value: null,
                Message: result.statusMessage
            };

            // vIRR passes its WHOLE state across the fence to vDOM
            DOM_receive(JSON.parse(JSON.stringify(vIRR)));
        }

        // ========================================
        // MCP TOOLS — server-side injection point. localHandlers' four
        // in-memory tokens, wrapped for registration. data_operation is
        // deliberately NOT exported here — the server already has its own,
        // wired to real disk I/O (jsonFileTools). Exporting a second one
        // under the same name would collide with it.
        // ========================================

        const irrigationMcpTools = [
            {
                name: 'reset_table',
                description: 'Reset the irrigation grid to its original seeded records.',
                inputSchema: { type: 'object', properties: {}, required: [] },
                handler: async () => localHandlers.reset_table({})
            },
            {
                name: 'read_meter',
                description: 'Find the most recent record for a ranch/planting and prepare it for a meter reading.',
                inputSchema: {
                    type: 'object',
                    properties: { ranch: { type: 'string' }, planting: { type: 'string' } },
                    required: ['ranch', 'planting']
                },
                handler: async (args) => localHandlers.read_meter(args)
            },
            {
                name: 'create_next_irrigation',
                description: 'Calculate and create the next irrigation record for a ranch/planting.',
                inputSchema: {
                    type: 'object',
                    properties: { ranch: { type: 'string' }, planting: { type: 'string' } },
                    required: ['ranch', 'planting']
                },
                handler: async (args) => localHandlers.create_next_irrigation(args)
            },
            {
                name: 'update_record',
                description: 'Update an existing irrigation record\'s date/interval/hours.',
                inputSchema: {
                    type: 'object',
                    properties: {
                        id: { type: 'number' },
                        scheduledDate: { type: 'string' },
                        interval: { type: 'string' },
                        mgrHours: { type: 'number' },
                        appliedHours: { type: 'number' }
                    },
                    required: ['id', 'scheduledDate']
                },
                handler: async (args) => localHandlers.update_record(args)
            }
        ];

        if (typeof module !== 'undefined' && module.exports) {
            module.exports = () => irrigationMcpTools;
        }

        // @@@@ END MCP-Water-Tools @@@@