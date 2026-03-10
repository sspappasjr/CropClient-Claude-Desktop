# PageBuilder Validator Integration Plan

## Purpose
Add validation/co-signing to PageBuilder's injection process for bulletproof marker preservation and change control audit trail.

## Code to Add to PageBuilder-BreadcrumbGrid.html

### 1. Validation State (Add after line 291)
```javascript
// Validation tracking
const validationState = {
    preValid: false,
    postValid: false,
    auditLog: []
};
```

### 2. Pre-Injection Validator Function (Add before injectComponents)
```javascript
function validateBeforeInjection() {
    const issues = [];
    const timestamp = new Date().toISOString();
    
    // Check 1: Template loaded
    if (!breadcrumbs.templateContent) {
        issues.push('ERROR: No template loaded');
    }
    
    // Check 2: Markers found
    if (breadcrumbs.markers.length === 0) {
        issues.push('WARNING: No injection markers found in template');
    }
    
    // Check 3: Components loaded for each marker
    breadcrumbs.markers.forEach(marker => {
        if (!marker.loaded && !components[marker.name]) {
            issues.push(`WARNING: Component not loaded for ${marker.name}`);
        }
    });
    
    // Check 4: Marker syntax validation
    breadcrumbs.markers.forEach(marker => {
        const expectedPattern = /^<!-- @@@@@@ INJECT: \w+ @@@@@@ -->$/;
        if (!expectedPattern.test(marker.marker.trim())) {
            issues.push(`ERROR: Invalid marker syntax for ${marker.name}`);
        }
    });
    
    const valid = !issues.some(i => i.startsWith('ERROR'));
    
    validationState.preValid = valid;
    validationState.auditLog.push({
        timestamp,
        phase: 'PRE-INJECTION',
        valid,
        issues: issues.length > 0 ? issues : ['All checks passed']
    });
    
    return { valid, issues };
}
```

### 3. Post-Injection Validator Function (Add before injectComponents)
```javascript
function validateAfterInjection() {
    const issues = [];
    const timestamp = new Date().toISOString();
    const injectedComponents = [];
    
    // Check 1: All BEGIN markers still present
    breadcrumbs.markers.forEach(marker => {
        if (!finalHTML.includes(marker.marker)) {
            issues.push(`ERROR: BEGIN marker missing for ${marker.name}`);
        } else {
            // Check 2: Corresponding END marker present
            const endMarker = `<!-- @@@@@@ END INJECT: ${marker.name} @@@@@@ -->`;
            if (!finalHTML.includes(endMarker)) {
                issues.push(`ERROR: END marker missing for ${marker.name}`);
            } else {
                injectedComponents.push(marker.name);
            }
        }
    });
    
    // Check 3: No orphaned END markers
    const endMarkerPattern = /<!-- @@@@@@ END INJECT: (\w+) @@@@@@ -->/g;
    const endMatches = [...finalHTML.matchAll(endMarkerPattern)];
    endMatches.forEach(match => {
        const markerName = match[1];
        const hasBeginMarker = breadcrumbs.markers.some(m => m.name === markerName);
        if (!hasBeginMarker) {
            issues.push(`ERROR: Orphaned END marker for ${markerName}`);
        }
    });
    
    const valid = issues.length === 0;
    
    validationState.postValid = valid;
    validationState.auditLog.push({
        timestamp,
        phase: 'POST-INJECTION',
        valid,
        components: injectedComponents,
        issues: issues.length > 0 ? issues : ['All markers preserved correctly']
    });
    
    return { 
        valid, 
        issues,
        components: injectedComponents,
        auditLog: validationState.auditLog
    };
}
```

### 4. Audit Report Display Function (Add before injectComponents)
```javascript
function displayAuditReport(report) {
    // Create audit panel if doesn't exist
    let auditPanel = document.getElementById('auditPanel');
    if (!auditPanel) {
        auditPanel = document.createElement('div');
        auditPanel.id = 'auditPanel';
        auditPanel.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            width: 400px;
            max-height: 300px;
            overflow-y: auto;
            background: white;
            border: 2px solid ${report.valid ? '#4CAF50' : '#f44336'};
            border-radius: 8px;
            padding: 15px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.3);
            z-index: 1000;
        `;
        document.body.appendChild(auditPanel);
    }
    
    const statusIcon = report.valid ? '✅' : '❌';
    const statusColor = report.valid ? '#4CAF50' : '#f44336';
    
    let html = `
        <div style="border-bottom: 2px solid ${statusColor}; padding-bottom: 10px; margin-bottom: 10px;">
            <h3 style="margin: 0; color: ${statusColor};">
                ${statusIcon} Injection Validation
            </h3>
        </div>
    `;
    
    // Show validation log
    report.auditLog.forEach(entry => {
        const phaseIcon = entry.valid ? '✅' : '⚠️';
        html += `
            <div style="margin: 10px 0; padding: 10px; background: #f5f5f5; border-radius: 4px;">
                <div style="font-weight: bold;">${phaseIcon} ${entry.phase}</div>
                <div style="font-size: 0.85em; color: #666;">${entry.timestamp}</div>
                <ul style="margin: 5px 0; padding-left: 20px;">
                    ${entry.issues.map(i => `<li style="color: ${i.startsWith('ERROR') ? '#f44336' : '#666'};">${i}</li>`).join('')}
                </ul>
            </div>
        `;
    });
    
    // Show injected components
    if (report.components && report.components.length > 0) {
        html += `
            <div style="margin-top: 10px; padding-top: 10px; border-top: 1px solid #ddd;">
                <strong>Injected Components:</strong>
                <ul style="margin: 5px 0; padding-left: 20px;">
                    ${report.components.map(c => `<li>${c}</li>`).join('')}
                </ul>
            </div>
        `;
    }
    
    // Close button
    html += `
        <button onclick="document.getElementById('auditPanel').remove()" 
                style="margin-top: 10px; padding: 8px 15px; background: #2196F3; color: white; 
                       border: none; border-radius: 4px; cursor: pointer; width: 100%;">
            Close Report
        </button>
    `;
    
    auditPanel.innerHTML = html;
}
```

### 5. Updated injectComponents Function (Replace existing)
```javascript
function injectComponents() {
    // STEP 1: PRE-INJECTION VALIDATION
    const preCheck = validateBeforeInjection();
    if (!preCheck.valid) {
        displayAuditReport({ 
            valid: false, 
            auditLog: validationState.auditLog,
            components: []
        });
        alert('Pre-injection validation failed. Check audit report for details.');
        return;
    }
    
    // STEP 2: PERFORM INJECTION
    finalHTML = breadcrumbs.templateContent;

    // MARKER-PRESERVING INJECTION
    breadcrumbs.markers.forEach(marker => {
        const componentContent = components[marker.name] || '<p>Component not loaded</p>';
        
        const endMarker = `<!-- @@@@@@ END INJECT: ${marker.name} @@@@@@ -->`;
        const alreadyInjected = finalHTML.includes(endMarker);
        
        if (alreadyInjected) {
            // RE-INJECTION
            const escapedBeginMarker = marker.marker.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            const escapedEndMarker = endMarker.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            const blockRegex = new RegExp(
                `${escapedBeginMarker}[\\s\\S]*?${escapedEndMarker}`,
                'g'
            );
            const replacement = `${marker.marker}\n${componentContent}\n${endMarker}`;
            finalHTML = finalHTML.replace(blockRegex, replacement);
        } else {
            // FIRST INJECTION
            const replacement = `${marker.marker}\n${componentContent}\n${endMarker}`;
            finalHTML = finalHTML.replace(marker.marker, replacement);
        }
    });
    
    // STEP 3: POST-INJECTION VALIDATION
    const postCheck = validateAfterInjection();
    
    // STEP 4: DISPLAY AUDIT REPORT
    displayAuditReport(postCheck);
    
    // STEP 5: PREVIEW ONLY IF VALID
    if (postCheck.valid) {
        const blob = new Blob([finalHTML], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        previewFrame.src = url;
        saveBtn.disabled = false;
    } else {
        alert('Post-injection validation failed. Markers may be corrupted. Check audit report.');
        saveBtn.disabled = true;
    }
}
```

## Integration Steps for Next Session

1. **Backup current PageBuilder-BreadcrumbGrid.html**
2. **Add validation state** after line 291
3. **Add three validation functions** before `injectComponents()` (around line 467)
4. **Replace injectComponents()** function with updated version
5. **Test flow:**
   - Load template → Pre-validation runs
   - Upload components → Grid updates
   - Click Inject → Both validations run
   - Audit panel appears → Shows results
   - Preview shows if valid → Save enabled if valid
6. **Test re-injection:**
   - Save file from first injection
   - Load saved file as template
   - Upload NEW components
   - Click Inject again
   - Verify markers preserved
   - Check audit trail shows both injections

## Expected Behavior

**First Injection:**
- Pre-validation: ✅ All checks pass
- Injection: Components wrapped with BEGIN/END markers
- Post-validation: ✅ All markers present
- Audit panel: Shows success with timestamp
- Preview: Displays injected content
- Save: Enabled

**Re-Injection:**
- Pre-validation: ✅ Detects existing END markers
- Injection: Replaces content blocks, preserves markers
- Post-validation: ✅ All markers still intact
- Audit panel: Shows both injection events
- Preview: Shows updated content
- Save: Enabled

**Failed Validation:**
- Missing markers: ❌ Pre-validation fails
- Corrupted markers: ❌ Post-validation fails
- Audit panel: Shows specific errors
- Preview: Blocked
- Save: Disabled

## Change Control Benefits

1. **Audit Trail**: Every injection logged with timestamp
2. **Validation**: Co-signed by automated validator
3. **Traceability**: See exactly what was injected when
4. **Safety**: Prevents corrupted injections from being saved
5. **Compliance**: Documentation for regulatory requirements
